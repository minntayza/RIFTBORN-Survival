import {NINJA_SKIN_KEY} from './ninja-cosmetics';
import {cosmeticColor,equippedSkin,equippedWeaponSkin} from './cosmetics';
import {tankGuardHalfAngle} from './tank-skill-fx';
import {samuraiStormLaunch} from './samurai-skill-fx';
import {CONNECTED_ARMS} from './connected-arms';
import {TANK_WEAPONS_ATLAS} from './tank-weapons';
import {TANK_ATLAS} from './tank-art';
import {GUNNER_ATLAS} from './gunner-art';
import {GUNNER_WEAPONS_ATLAS,isGunnerWeapon} from './gunner-weapons';
import {gunnerWeaponPose} from './gunner-motion';
import {SAMURAI_WEAPONS_ATLAS} from './samurai-weapons';
import {SAMURAI_ATLAS} from './samurai-art';
import {LEADER_ATLAS} from './cute-robot-leaders';
import {ROBOT_ATLAS} from './cute-robots';
import {rosterSpawn} from './enemy-roster';
import {COMMAND_ATLAS} from './cute-command';
import {HORDE_ATLAS,OFFICER_ATLAS} from './cute-horde';
import {decodedImages,rememberImageSource} from './texture-cache';
import {NINJA_ATTACK_ATLAS,NINJA_WEAPONS_ATLAS} from './ninja-attack-art';
import {CUTE_ATLAS} from './cute-trio';
import {bossAction,type BossAction} from './boss-motion';
import {bossMarks,type BossMark} from './boss-skills';
import {spawnFaction,robotStats,robotProtection,enemyFaction,enemyName,ROBOTS,ROBOT_ROLES,type EnemyFaction} from './robot-enemies';
import {crowdSeparation,isRigZombie} from './zombie-rig';
import {ZOMBIE_ATLASES} from './zombie-sprites';
import {RobotMapArt} from './robot-map-art';
import {robotPropsNear,reactorBlend,type RobotOrigin} from './robot-map';
import {drawSupply,drawBeacon,drawMagnet} from './supply-art';
import {drawHealSupply} from './heal-supply';
import {mapObstaclesNear,parkBlend,separateWrecks,wreckSteering,type Wreck} from './map-ground';
import {assistedAim,escapeDirection,routedSpawn,buildSynergies,COMBAT_CACHE_KILLS} from './combat-feel';
import {HERO_IDENTITIES,encounterRhythm,weaponMilestone} from './run-design';
import {CARD_EVOLUTIONS} from './card-evolutions';
import {WEAPON_EFFECTS,weaponPose,meleeContact,isGun} from './weapon-effects';
import { seededRandom, earnedWaveGold, type RunOptions } from './retention';
import {UPGRADES} from './upgrades';
import { rollReward, waveEvent, type RewardId, type EvolutionId } from './progression';
import type { TouchState } from './touch';
import { ArenaVisuals } from './visuals';
import Phaser from 'phaser';
import { BALANCE, HEROES, WEAPONS, ENEMIES, type HeroId, type WeaponId, type EnemyId } from './config';
import { wavePlan, scaling, damageValue, cooldownValue, type Spawn } from './waves';
import type { Save } from './save';
import { AudioManager } from './audio';
export type RunStats = {
    wave: number;
    time: number;
    kills: number;
    gold: number;
    dealt: number;
    taken: number;
    combo: number;
    elites: number;
};
type Enemy = {
    skillAge:number;
    skillWindup:number;
    skillAction?:BossAction;
    squad:number;
    active: boolean;
    x: number;
    y: number;
    hp: number;
    max: number;
    type: EnemyId;
    faction:EnemyFaction;
    r: number;
    speed: number;
    slow:number;
    stagger:number;
    burn:number;
    commandTime:number;
    shotKick:number;
    chargeTime:number;
    chargeHit:boolean;
    damage: number;
    flash: number;
    attack: number;
    telegraph: number;
    targetX: number;
    targetY: number;
    bleed: number;
    touched: boolean;
    mod: number;
    phase: number;
    threshold: number;
};
type Bullet = {
    active: boolean;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    damage: number;
    hostile: boolean;
    pierce: number;
    explosive: boolean;
    last: boolean;
    hit: Set<Enemy>;
    kind:'round'|'wind'|'phantom';
    reflected:boolean;
    piercingRound:boolean;
    bounces:number;
    source:string;
};
type Drop = {
    active: boolean;
    x: number;
    y: number;
    value: number;
    gold: boolean;
    vacuum?: boolean;
};
type Particle = {
    active: boolean;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    max: number;
    color: number;
    size: number;
};
export class ArenaScene extends Phaser.Scene {
    gfx!: Phaser.GameObjects.Graphics;
    warningGfx!:Phaser.GameObjects.Graphics;
    impactCount=0;
    bossMarks:(BossMark&{remaining:number;owner:Enemy;fired:boolean})[]=[];
    markBoss(e:Enemy){
        e.skillAction=bossAction(e.type,e.phase);e.skillAge=0;e.skillWindup=e.type==='shooterBoss'?.9:1.15;
        this.bossMarks.push(...bossMarks(e.type as 'boss'|'shooterBoss'|'commander',e.phase,e.faction,e.x,e.y,e.targetX,e.targetY).map(mark=>({...mark,remaining:mark.delay,owner:e,fired:false})));
    }

    visuals!: ArenaVisuals;
    swing = 0;
    attackSequence=0;
    pendingStrikes:{delay:number;weapon:WeaponId;damage:number;range:number;arc:number;echo:boolean}[]=[];
    touch?: TouchState;
    get attacking(){return true;}
    floor!: Phaser.GameObjects.Graphics;
    groundTiles:Phaser.GameObjects.Image[]=[];
    parkTiles:Phaser.GameObjects.Image[]=[];
    wreckImages:Phaser.GameObjects.Image[]=[];
    mapCars:Wreck[]=[];
    robotArt:RobotMapArt|undefined;
    onLoading?:(progress:number)=>void;
    onArenaReady?:()=>void;
    onLoadingError?:()=>void;
    preload(){
        const ninjaSkin=this.hero==='ninja'?equippedSkin(this.save,this.hero):undefined,ninjaWeapon=WEAPONS[this.weapon].hero==='ninja'?equippedWeaponSkin(this.save,this.weapon):undefined;
        if(ninjaSkin)this.load.image(NINJA_SKIN_KEY,ninjaSkin);
        if(ninjaWeapon)this.load.image('ninja-cosmetic-weapons',ninjaWeapon);

        const assets=[
            [CONNECTED_ARMS.key,CONNECTED_ARMS.url],[TANK_WEAPONS_ATLAS.key,TANK_WEAPONS_ATLAS.url],[TANK_ATLAS.key,TANK_ATLAS.url],[GUNNER_ATLAS.key,this.hero==='gunner'?equippedSkin(this.save,this.hero)||GUNNER_ATLAS.url:GUNNER_ATLAS.url],[GUNNER_WEAPONS_ATLAS.key,this.hero==='gunner'?equippedWeaponSkin(this.save,this.weapon)||GUNNER_WEAPONS_ATLAS.url:GUNNER_WEAPONS_ATLAS.url],
            [SAMURAI_WEAPONS_ATLAS.key,this.hero==='samurai'?equippedWeaponSkin(this.save,this.weapon)||SAMURAI_WEAPONS_ATLAS.url:SAMURAI_WEAPONS_ATLAS.url],
            [SAMURAI_ATLAS.key,this.hero==='samurai'?equippedSkin(this.save,this.hero)||SAMURAI_ATLAS.url:SAMURAI_ATLAS.url],
            [LEADER_ATLAS.key,LEADER_ATLAS.url],
            [ROBOT_ATLAS.key,ROBOT_ATLAS.url],
            [COMMAND_ATLAS.key,COMMAND_ATLAS.url],
            [HORDE_ATLAS.key,HORDE_ATLAS.url],[OFFICER_ATLAS.key,OFFICER_ATLAS.url],
            [NINJA_WEAPONS_ATLAS.key,NINJA_WEAPONS_ATLAS.url],[NINJA_ATTACK_ATLAS.key,NINJA_ATTACK_ATLAS.url],[CUTE_ATLAS.key,CUTE_ATLAS.url],
            ...['robot-factory-ground','robot-garden-ground','robot-factory-props','robot-garden-props'].map(key=>[key,`/assets/maps/${key}.png`]),
            ['park-ground','/assets/maps/park-cartoon.png'],['city-asphalt','/assets/maps/city-asphalt-cartoon.png'],['city-wreck','/assets/maps/wreck-sedan-cartoon.png']
        ];
        this.load.on('progress',(progress:number)=>this.onLoading?.(progress));
        this.load.on('loaderror',()=>this.onLoadingError?.());
        const assetUrls=new Map(assets.map(([key,url])=>[key,url]));
        if(ninjaSkin)assetUrls.set(NINJA_SKIN_KEY,ninjaSkin);
        if(ninjaWeapon)assetUrls.set('ninja-cosmetic-weapons',ninjaWeapon);
        this.load.on('filecomplete',(key:string,type:string,image:HTMLImageElement)=>{const url=assetUrls.get(key);if(type==='image'&&url){rememberImageSource(image,url);decodedImages.set(url,image);}});
        for(const [key,url] of assets){const image=decodedImages.get(url);if(image){rememberImageSource(image,url);this.textures.addImage(key,image);}else this.load.image(key,url);}
    }
    moveOnGround(x:number,y:number,dx:number,dy:number,r:number){
        if(!this.mapCars.length)return {x:x+dx,y:y+dy};
        // Substeps prevent dash and knockback from crossing a thin chassis.
        const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/12));
        for(let i=0;i<steps;i++){const p=separateWrecks(x+dx/steps,y+dy/steps,r,this.mapCars);x=p.x;y=p.y;}
        return {x,y};
    }

    keys!: Record<string, Phaser.Input.Keyboard.Key>;
    audio: AudioManager;
    save: Save;
    hero: HeroId;
    weapon: WeaponId;
    onChoice: (wave: boolean) => void;
    onEnd: () => void;
    onPause: () => void;
    x = 600;
    y = 380;
    angle = 0;
    hp = 100;
    maxHp = 100;
    xp = 0;
    level = 1;
    xpNeed = 18;
    stamina = 100;
    ammo = 12;
    reload = 0;
    reloadDuration=1.2;
    attack = 0;
    ability = 0;
    invuln = 0;
    private invulnFromBite=false;
    private biteCooldowns=new WeakMap<Enemy,number>();
    private smokeBombReadyAt=0;
    dash = 0;
    dashX = 0;
    dashY = 0;
    counter = 0;
    blockCharge = 0;
    honour = 0;
    momentum = 0;
    combo = 0;
    comboTime = 0;
    waveTime = 0;
    elapsed = 0;
    spawnIndex = 0;
    plan: Spawn[] = [];
    levels: Record<string, number> = {};
    stats: RunStats = { wave: 1, time: 0, kills: 0, gold: 0, dealt: 0, taken: 0, combo: 0, elites: 0 };
    waveStats = { kills: 0, gold: 0, damage: 0, time: 0 };
    paused = false;
    ended = false;
    waiting = false;
    countdown = 0;
    lastHud = 0;
    tick = 0;
    clone = 0;
    rerolls = 1;
    waveWard = false;
    strongStop = 0;
    options:RunOptions={mode:'endless',build:'assault',technique:'standard'};
    random:()=>number=Math.random;
    cardRandom:()=>number=Math.random;
    victory=false;
    objectives=0;
    waveObjectives=0;
    earned={combat:0,perfect:0,objective:0,goal:0};
    zoneSpawnClock=0;
    bossDefeated=false;
    lastCause='The horde';
    damageFeedback={time:0,angle:0,value:0,label:''};
    hpChanges:{id:number;delta:number;until:number}[]=[];
    hpChangeSequence=0;
    showHpChange(delta:number){
        if(!delta)return;
        const now=this.time.now;
        this.hpChanges=this.hpChanges.filter(change=>change.until>now);
        this.hpChanges.push({id:++this.hpChangeSequence,delta,until:now+850});
    }
    heal(amount:number){const before=this.hp;this.hp=Math.min(this.maxHp,this.hp+amount);this.showHpChange(this.hp-before);}

    hitConfirm={time:0,x:0,y:0,crit:false};
    combatNotice={time:0,label:''};
    combatCaches=new Set<number>();
    escapeAngle=0;escapeClock=0;spawnPulse=0;
    synergyClock=0;
    get synergies(){return buildSynergies(this.hero,this.levels,this.evolution);}
    hasSynergy(id:string){return this.synergies.some(s=>s.id===id&&s.active);}
    notifyCombat(label:string){this.combatNotice={time:2.5,label};}

    get finiteRun(){return this.options.mode!=='endless';}
    awakened:EvolutionId|undefined;
    fullEvolution=false;
    earlyAwakened=false;
    get earlyPower(){return this.earlyAwakened&&this.stats.wave<=10;}
    get earlyTechnique(){return ({ninja:"Shadow Edge · +5% critical chance",samurai:"Tempered Edge · +12% weapon damage",gunner:"Hot Chamber · +10% fire rate",tank:"Iron Impact · +20% knockback"})[this.hero];}
    get evolutionDue(){return !!weaponMilestone(this.stats.wave,!!this.awakened,this.fullEvolution);}
    identityCharge=0;
    openingShots=0;
    identitySequence=-1;
    identityProcs=0;
    damageSources:Record<string,number>={};
    get identity(){return HERO_IDENTITIES[this.hero];}
    get evolutionStage(){return this.fullEvolution?2:this.awakened?1:0;}
    landmark:{kind:'cache'|'beacon'|'patrol';x:number;y:number;progress:number;done:boolean;guards:Enemy[]}|undefined;
    get recovery(){return this.waveTime>=12&&this.waveTime<15||this.waveTime>=26&&this.waveTime<29;}

    meta(id:string){return this.options.mode==='daily'?0:(this.save.permanent[id]||0);}
    objectiveComplete(label:string){this.objectives++;this.waveObjectives++;this.banner(label,0xd8ba85);}
    cardEvolutions:Record<string,boolean>={};
    pendingEchoes:{delay:number;x:number;y:number;angle:number;damage:number}[]=[];
    speedCharge=0;speedBurst=0;lifePulse=0;vacuumClock=0;elementClock=0;
    enemyBursts:{enemy:Enemy;delay:number;angle:number;damage:number}[]=[];
    reinforcementMarks:{x:number;y:number;life:number}[]=[];
    firePatches:{x:number;y:number;life:number}[]=[];
    evolved(id:string){return !!this.cardEvolutions[id];}
    reveal(title:string,color=0xc5a5e1){this.banner('✦ '+title.toUpperCase(),color);this.impactRing(this.x,this.y,145,color);this.burst(this.x,this.y,color,32);}
    overdrive=0;
    coveringClock=0;
    decoy:{x:number;y:number;life:number;angle:number}|undefined;
    boostDamage = 0;
    boostSpeed = 0;
    rewardShield = 0;
    pendingReward: RewardId | undefined;
    evolution: Record<EvolutionId,number> = {reach:0,power:0,tempo:0};
    eventName = 'Survival';
    supplies: {x:number;y:number;active:boolean}[] = [];
    zone = {x:0,y:0,progress:0,done:false};
    huntTarget: Enemy | undefined;
    hazardClock = 0;
    hazard: {x:number;y:number;time:number} | undefined;
    rewardPool(){return rollReward(this.hp,this.maxHp);}
    grantGold(n:number){this.stats.gold+=n;this.waveStats.gold+=n;this.save.gold+=n;}
    grantReward(id:RewardId){
        if(id==='heal')this.heal(this.maxHp*.25);
        if(id==='gold')this.grantGold(40+this.stats.wave*8);
        if(id==='shield')this.rewardShield=3;
        if(id==='damage'||id==='speed')this.pendingReward=id;
        this.audio.play('buy');
    }
    evolve(id:EvolutionId){
        if(!this.evolutionDue)return;
        if(this.awakened){id=this.awakened;this.fullEvolution=true;this.evolution[id]=2;}else{this.awakened=id;this.evolution[id]=1;}
        this.save.archive[`weapon:${this.weapon}:${id}`]=2;
        this.audio.play('level');this.reveal(`${id==='reach'?'LIGHTNING':id==='power'?'WILDFIRE':'PHANTOM'} · ${this.fullEvolution?'FULL EVOLUTION':'AWAKENING'}`);
    }
    createLandmark(){
        const kind=(['cache','beacon','patrol'] as const)[(this.stats.wave-1)%3],angle=this.random()*Math.PI*2;
        const desiredX=this.x+Math.cos(angle)*420,desiredY=this.y+Math.sin(angle)*420;
        const {x,y}=this.clearGroundPoint(desiredX,desiredY,65);
        this.landmark={kind,x,y,progress:0,done:false,guards:[]};
    }
    updateLandmark(dt:number){
        const l=this.landmark;if(!l||l.done)return;const distance=Math.hypot(l.x-this.x,l.y-this.y);
        if(l.progress===0&&distance<280){l.progress=.01;if(l.kind!=='beacon')for(let i=0;i<(l.kind==='patrol'?1:3);i++){const e=this.spawn(l.kind==='patrol'?'elite':'basic');if(e){e.x=l.x+Math.cos(i*2.1)*55;e.y=l.y+Math.sin(i*2.1)*55;l.guards.push(e);}}if(l.kind!=='beacon'&&l.guards.length===0){l.progress=0;return;}}
        if(l.progress<=0)return;
        if(l.kind==='beacon'){if(distance<95)l.progress+=dt;if(l.progress<6)return;}
        else if(l.guards.some(e=>e.active)||distance>65)return;
        l.done=true;this.grantGold(90+this.stats.wave*12);
        if(l.kind==='cache')this.heal(this.maxHp*.2);
        if(l.kind==='beacon')this.xp+=Math.ceil(this.xpNeed*.6);
        if(l.kind==='patrol')this.rewardShield=Math.max(1,this.rewardShield);
        this.objectiveComplete(l.kind==='cache'?'HEALING SUPPLY · HEAL + GOLD':l.kind==='beacon'?'BEACON SECURED · XP + GOLD':'ELITE PATROL · SHIELD + GOLD');
        this.impactRing(l.x,l.y,100,0xa9c4b0);
    }
    updateEvent(dt:number){
        this.updateLandmark(dt);
        for(const c of this.supplies)if(c.active&&Math.hypot(c.x-this.x,c.y-this.y)<35){c.active=false;this.heal(this.maxHp*.15);this.grantGold(80+this.stats.wave*10);this.objectiveComplete('SUPPLY SECURED · HEAL + GOLD');}
        if(this.eventName==='Elite hunt'&&this.huntTarget&&!this.huntTarget.active){this.huntTarget=undefined;this.grantGold(250+this.stats.wave*15);this.objectiveComplete('ELITE BOUNTY CLAIMED');}
        if(this.eventName==='Hold the zone'&&!this.zone.done&&Math.hypot(this.x-this.zone.x,this.y-this.zone.y)<140){this.zone.progress+=dt;this.zoneSpawnClock-=dt;if(this.zoneSpawnClock<=0){this.zoneSpawnClock=5;this.spawn('runner');this.spawn('basic');}if(this.zone.progress>=20){this.zone.done=true;this.grantGold(300+this.stats.wave*15);this.rewardShield=3;this.objectiveComplete('ZONE SECURED · SHIELD + GOLD');}}
        if(this.stats.wave>10&&!this.recovery){this.hazardClock-=dt;if(this.hazardClock<=0){this.hazardClock=12;this.hazard={x:this.x+Math.cos(this.angle)*75,y:this.y+Math.sin(this.angle)*75,time:3};}if(this.hazard){this.hazard.time-=dt;if(this.hazard.time<1&&Math.hypot(this.x-this.hazard.x,this.y-this.hazard.y)<65)this.hurt(8,undefined,Math.atan2(this.hazard.y-this.y,this.hazard.x-this.x));if(this.hazard.time<=0)this.hazard=undefined;}}
    }
    enemies: Enemy[] = [];
    bullets: Bullet[] = [];
    drops: Drop[] = [];
    bossMagnet: {x:number;y:number;active:boolean;born:number}|undefined;
    collectBossMagnet(){
        if(!this.bossMagnet?.active)return;
        this.bossMagnet.active=false;
        for(const d of this.drops)if(d.active)d.vacuum=true;
        this.notifyCombat("XP & gold collected");this.audio.play("buy");
    }
    particles: Particle[] = [];
    numbers: {
        text: Phaser.GameObjects.Text;
        life: number;
    }[] = [];
    grid = new Map<string, Enemy[]>();
    dashHits = new Set<Enemy>();
    constructor(save: Save, audio: AudioManager, choice: (wave: boolean) => void, end: () => void, pause: () => void, options?:RunOptions) { super('arena'); this.save = save; this.audio = audio; this.hero = save.hero; this.weapon = save.weapon; this.onChoice = choice; this.onEnd = end; this.onPause = pause; if(options){this.options=options;this.hero=options.hero||save.hero;this.weapon=options.weapon||save.weapon;} if(this.options.seed!==undefined){this.random=seededRandom(this.options.seed);this.cardRandom=seededRandom(this.options.seed^0x85ebca6b);}this.options.technique='standard'; }
    create() { this.robotArt=new RobotMapArt(this);const park=this.textures.get('park-ground'),pw=Math.floor(park.getSourceImage().width/5),ph=Math.floor(park.getSourceImage().height/5);for(let y=0;y<5;y++)for(let x=0;x<5;x++)park.add(`${x}-${y}`,0,x*pw,y*ph,pw,ph); this.textures.get('city-wreck').add('chassis',0,150,18,810,1395); this.floor = this.add.graphics().setDepth(-4); this.gfx = this.add.graphics();this.warningGfx=this.add.graphics().setDepth(6); this.drawFloor(); this.visuals = new ArenaVisuals(this,this.hero==='samurai'&&!!equippedSkin(this.save,this.hero),this.hero==='ninja'&&!!equippedSkin(this.save,this.hero),this.hero==='gunner'&&!!equippedSkin(this.save,this.hero)); this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,ESC,M,ONE,TWO,THREE') as typeof this.keys; this.input.keyboard!.on('keydown-ESC', () => this.onPause()); this.input.keyboard!.on('keydown-M', () => { this.save.settings.sound = !this.save.settings.sound; this.audio.sound = this.save.settings.sound; }); this.input.keyboard!.addCapture(['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE']); const h = HEROES[this.hero]; this.maxHp = h.hp * (1 + this.meta('health') * .05); if(this.options.build==='guard')this.maxHp*=1.15;this.hp = this.maxHp; this.rerolls = 1 + this.meta('reroll'); this.ammo=this.maxAmmo;this.applyMapView(); this.startWave();this.events.once('postupdate',()=>this.onArenaReady?.()); }
    applyMapView(){this.cameras.main.setZoom(1.05/(this.save.settings.mapView||1));this.cameras.main.centerOn(this.x,this.y);}
    floorTheme = 0;
    robotOrigin:RobotOrigin|undefined;
    get robotSector(){if(this.stats.wave<=10||!this.robotOrigin)return '';const blend=reactorBlend(this.x,this.y,this.robotOrigin);return blend<.25?'ROBOT FACTORY':blend>.75?'REACTOR GARDENS':'SERVICE PASSAGE';}
    clearGroundPoint(x:number,y:number,r:number){const obstacles=this.stats.wave>10?robotPropsNear(x,y,this.robotOrigin||{x:this.x,y:this.y}):mapObstaclesNear(x,y);return separateWrecks(x,y,r,obstacles);}
    floorLabels: Phaser.GameObjects.Text[] = [];
    drawFloor() {
        this.floor.clear();for(const l of this.floorLabels)l.destroy();this.floorLabels=[];
        this.floorTheme=this.stats.wave>10?1:0;
        if(this.floorTheme&&!this.robotOrigin)this.robotOrigin={x:this.x,y:this.y};
    }
    drawWorld(){
        const g=this.floor,robot=this.stats.wave>10,camera=this.cameras.main;
        const width=camera.width/camera.zoom,height=camera.height/camera.zoom;
        const view={x:this.x-width/2,y:this.y-height/2,right:this.x+width/2,bottom:this.y+height/2,width,height};
        g.clear();
        if(!robot)this.robotArt?.hide();
        let tileIndex=0;
        if(!robot)for(let row=Math.floor(view.y/640)-1;row<=Math.ceil(view.bottom/640)+1;row++)for(let col=Math.floor(view.x/640)-1;col<=Math.ceil(view.right/640)+1;col++){
            let tile=this.groundTiles[tileIndex];if(!tile){tile=this.add.image(0,0,'city-asphalt').setOrigin(0).setDepth(-5);this.groundTiles.push(tile);}
            tile.setVisible(true).setPosition(col*640,row*640).setDisplaySize(641,641).setFlip(col%2!==0,row%2!==0);tileIndex++;
        }
        for(let i=tileIndex;i<this.groundTiles.length;i++)this.groundTiles[i].setVisible(false);
        let parkIndex=0;
        if(!robot)for(let row=Math.floor(view.y/128)-1;row<=Math.ceil(view.bottom/128)+1;row++)for(let col=Math.floor(view.x/128)-1;col<=Math.ceil(view.right/128)+1;col++){
            const alpha=parkBlend(col*128+64,row*128+64);if(alpha===0)continue;
            let tile=this.parkTiles[parkIndex];if(!tile){tile=this.add.image(0,0,'park-ground').setOrigin(0).setDepth(-4.5);this.parkTiles.push(tile);}
            const flipX=Math.floor(col/5)%2!==0,flipY=Math.floor(row/5)%2!==0,cx=((col%5)+5)%5,cy=((row%5)+5)%5,fx=flipX?4-cx:cx,fy=flipY?4-cy:cy;
            tile.setVisible(true).setTexture('park-ground',`${fx}-${fy}`).setPosition(col*128,row*128).setDisplaySize(129,129).setFlip(flipX,flipY).setAlpha(alpha);parkIndex++;
        }
        for(let i=parkIndex;i<this.parkTiles.length;i++)this.parkTiles[i].setVisible(false);
        if(robot){
            const origin=this.robotOrigin??(this.robotOrigin={x:this.x,y:this.y});
            const props=robotPropsNear(this.x,this.y,origin,Math.max(view.width,view.height)+200);
            this.mapCars=props;this.robotArt?.render(view,origin,props);
            for(const image of this.wreckImages)image.setVisible(false);
            return;
        }
        this.mapCars=robot?[]:mapObstaclesNear(this.x,this.y,Math.max(view.width,view.height)+200);
        const size=robot?192:640;
        if(robot){g.fillStyle(0x202b35);g.fillRect(view.x-100,view.y-100,view.width+200,view.height+200);}
        for(let row=Math.floor(view.y/size)-1;row<=Math.ceil(view.bottom/size)+1;row++)for(let col=Math.floor(view.x/size)-1;col<=Math.ceil(view.right/size)+1;col++){
            const x=col*size,y=row*size;
            if(robot){g.fillStyle((row+col)%2?0x26333d:0x293640);g.fillRoundedRect(x+3,y+3,size-6,size-6,5);g.lineStyle(2,0x0d1821,.8);g.strokeRoundedRect(x+3,y+3,size-6,size-6,5);g.fillStyle(0x52616b,.65);for(const xx of [12,size-12])for(const yy of [12,size-12])g.fillCircle(x+xx,y+yy,2);if(row%3===0){g.fillStyle(0x56a7ae,.4);g.fillRect(x+32,y+8,80,3);}if(col%4===0&&row%3===1){g.fillStyle(0xb39c5e,.35);for(let i=0;i<4;i++)g.fillRect(x+24+i*15,y+70,7,36);}}
            else{
                const city=1-parkBlend(x+320,y+320);
                // Road details fade geographically as concrete gives way to grass.
                g.fillStyle(0xc3bda0,.24*city);for(let i=0;i<4;i++)g.fillRect(x+75+i*140,y+310,65,4);
                g.fillStyle(0x79827b,.14*city);g.fillRoundedRect(x+380,y+75,105,70,10);
                g.fillStyle(0x161f25,.7*city);g.fillRoundedRect(x+55,y+64,38,22,3);g.lineStyle(2,0x525c5b,.65*city);for(let i=0;i<5;i++)g.lineBetween(x+60+i*6,y+68,x+60+i*6,y+82);
            }
        }
        let carIndex=0;
        this.mapCars.forEach(c=>{
            if(c.kind){
                g.fillStyle(0x101c20,.32);g.fillEllipse(c.x+3,c.y+8,c.halfW*2+10,c.halfH*2+8);
                g.lineStyle(3,0x17252a,1);
                if(c.kind==='log'){g.fillStyle(0x655342);g.fillRoundedRect(c.x-42,c.y-14,84,28,9);g.strokeRoundedRect(c.x-42,c.y-14,84,28,9);g.lineStyle(2,0x423e35);g.lineBetween(c.x-26,c.y-5,c.x+27,c.y-5);g.lineBetween(c.x-20,c.y+5,c.x+22,c.y+5);g.fillStyle(0x879063);g.fillRoundedRect(c.x-18,c.y-13,31,7,3);}
                else{g.fillStyle(0x645342);g.fillRoundedRect(c.x-20,c.y-20,40,40,10);g.strokeRoundedRect(c.x-20,c.y-20,40,40,10);g.fillStyle(0x968568);g.fillEllipse(c.x,c.y-5,31,22);g.lineStyle(2,0x655845);g.strokeEllipse(c.x,c.y-5,19,12);}
                return;
            }
            const i=carIndex++;
            let image=this.wreckImages[i];if(!image){image=this.add.image(c.x,c.y,'city-wreck','chassis').setDepth(-1);this.wreckImages.push(image);}
            image.setVisible(true).setPosition(c.x,c.y).setDisplaySize(70,142).setRotation(c.horizontal?Math.PI/2:0).setTint([0xffffff,0xc5bb9e,0xa8b9c8][c.variant]);
            g.fillStyle(0x071016,.35);g.fillRoundedRect(c.x-c.halfW-3,c.y-c.halfH+4,c.halfW*2+6,c.halfH*2+4,10);
            g.lineStyle(2,0x526348,.8);for(let j=0;j<5;j++){const xx=c.x-c.halfW-5+j*4,yy=c.y+c.halfH;g.lineBetween(xx,yy,xx-3,yy-8-j%2*4);}
        });
        for(let i=carIndex;i<this.wreckImages.length;i++)this.wreckImages[i].setVisible(false);
    }

    u(id: string) { return this.levels[id] || 0; }
    get count() {
        let n = 0;
        for (const e of this.enemies)
            if (e.active)
                n++;
        return n;
    }
    get maxAmmo() { return (this.weapon === 'shotgun' ? 6 : this.weapon==='smg'?28:12) + this.u('magazine') * 4; }
    startWave() { this.bossMarks=[];if(this.floorTheme !== (this.stats.wave>10?1:0)){this.drawFloor();this.cameras.main.fadeIn(900,15,8,12);} this.boostDamage=this.pendingReward==='damage'?15:0;this.boostSpeed=this.pendingReward==='speed'?15:0;this.pendingReward=undefined;this.eventName=waveEvent(this.stats.wave);if(this.stats.wave<=10)this.eventName=({2:'Supply rush',4:'Hold the zone',6:'Elite hunt',8:'Supply rush',10:'Boss encounter'} as Record<number,string>)[this.stats.wave]||'Survival';this.waveObjectives=0;this.zoneSpawnClock=5;this.bossDefeated=false;this.supplies=[];this.huntTarget=undefined;this.zone={x:this.x+180,y:this.y,progress:0,done:false};this.hazard=undefined;this.hazardClock=8;
        if(this.eventName==='Supply rush')this.supplies=Array.from({length:3},(_,i)=>{const x=this.x+Math.cos(i*2.1)*260,y=this.y+Math.sin(i*2.1)*260;return {...this.clearGroundPoint(x,y,65),active:true};});
        this.createLandmark();this.waveTime = 0; this.spawnIndex = 0; this.plan = wavePlan(this.stats.wave,this.random); this.waveStats = { kills: 0, gold: 0, damage: 0, time: 0 }; this.waiting = false;if(this.evolved('ward'))this.rewardShield=Math.max(this.rewardShield,3); this.waveWard = !!this.u('ward'); if(this.eventName==='Elite hunt'){this.spawn('elite');this.huntTarget=this.enemies.find(e=>e.active&&e.type==='elite');} this.audio.play('wave'); this.banner(`WAVE ${String(this.stats.wave).padStart(2, '0')} · ${this.eventName.toUpperCase()}`, 0x9eefae); }
    banner(message: string, color = 0xffffff) { const t = this.add.text(this.cameras.main.width/2, 125, message, { fontFamily: 'monospace', fontSize: Math.min(26,Math.max(13,this.cameras.main.width/32))+'px', color: '#' + color.toString(16).padStart(6, '0'), fontStyle: 'bold' }).setOrigin(.5).setScrollFactor(0); this.tweens.add({ targets: t, alpha: 0, y: 100, delay: 1400, duration: 600, onComplete: () => t.destroy() }); }
    spawnSerial=0;
    spawn(type: EnemyId, side = Math.floor(this.random() * 4), offset = this.random(), factionOverride?:EnemyFaction) {
        const serial=this.spawnSerial++,faction=factionOverride??spawnFaction(this.stats.wave,serial,type);
        if(rosterSpawn(type,faction)===undefined)return;
        if(this.count>=BALANCE.maxEnemies){if(['boss','shooterBoss','commander'].includes(type)){const replace=this.enemies.filter(e=>e.active&&['basic','runner'].includes(e.type)).sort((a,b)=>Math.hypot(b.x-this.x,b.y-this.y)-Math.hypot(a.x-this.x,a.y-this.y))[0];if(!replace)return;replace.active=false;}else return;}
        const d = ENEMIES[type], s = scaling(this.stats.wave), robot=faction==='robot'?robotStats(type):{health:1,damage:1,speed:1};
        let e = this.enemies.find(e => !e.active);
        if (!e) {
            e = {} as Enemy;
            this.enemies.push(e);
        }
        const view=this.cameras.main.worldView; const halfW=view.width/2||600,halfH=view.height/2||380; const x=side===0?this.x-halfW-70:side===1?this.x+halfW+70:this.x-halfW+view.width*offset,y=side===2?this.y-halfH-70:side===3?this.y+halfH+70:this.y-halfH+view.height*offset;
        Object.assign(e, { active: true, skillAge:99,skillWindup:1.15,skillAction:undefined,squad:Math.floor(serial/8), x, y, hp: d.hp * s.health*robot.health, max: d.hp * s.health*robot.health, type, faction, r: d.radius, speed: d.speed * s.speed*robot.speed, slow:0, stagger:0, burn:0, commandTime:0, shotKick:0, chargeTime:0, chargeHit:false, damage: d.damage * s.damage*robot.damage, flash: 0, attack: type === 'boss' ? 3 : 2, telegraph: 0, targetX: x, targetY: y, bleed: 0, touched: false, mod: Math.floor(this.random() * 5), phase: 0, threshold: 0 });
        if (['elite','boss','brute','shooterBoss','commander'].includes(type)) {
            this.burst(x, y, 0xef6879, 22);
            this.audio.play(type === 'boss' ? 'boss' : 'elite');
            if(type!=='brute')this.banner('⚠ '+enemyName(type,faction).toUpperCase(), 0xff8b94);
        }
        return e;
    }
    particle(x: number, y: number, color: number, speed = 80, size = 3, life = .4) {
        let p = this.particles.find(p => !p.active);
        if (!p) {
            if (this.particles.length >= 450)
                return;
            p = {} as Particle;
            this.particles.push(p);
        }
        const a = Math.random() * Math.PI * 2;
        Object.assign(p, { active: true, x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life, max: life, color, size });
    }
    burst(x: number, y: number, color: number, n = 7) {
        for (let i = 0; i < (this.stats.wave<=10&&this.enemies.filter(e=>e.active).length>22?Math.min(n,3):n); i++)
            this.particle(x, y, color, 50 + Math.random() * 130);
    }
    number(x: number, y: number, value: number, crit = false) {
        const nearby=this.numbers.find(n=>n.life>.35&&Math.hypot(n.text.x-(x-8),n.text.y-(y-20))<32);
        if(nearby){nearby.text.setText(String(Number(nearby.text.text)+Math.round(value)));if(crit)nearby.text.setColor('#ffd87d');return;}
        if(this.numbers.filter(n=>n.life>0).length>=(crit?20:14))return;
        let n = this.numbers.find(n => n.life <= 0);
        if (!n) {
            if (this.numbers.length > 45)
                return;
            n = { text: this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '14px', fontStyle: 'bold' }).setDepth(10), life: 0 };
            this.numbers.push(n);
        }
        n.life = .65;
        n.text.setPosition(x - 8, y - 20).setText(String(Math.round(value))).setColor(crit ? '#ffd87d' : '#dcece3').setFontSize(crit ? 21 : 14).setAlpha(1).setVisible(true);
    }
    hit(e: Enemy, base: number, knock = 20, bullet = false,elemental=true) {
        if (!e.active)
            return;
        const crit = this.random() < .05 + (this.earlyPower&&this.hero==='ninja'?.05:0) + this.u('crit') * .07, raw = damageValue(base, HEROES[this.hero].damage * (1 + this.u('damage') * .12 + this.meta('damage') * .05 + this.honour * .05 + (this.options.build==='assault'?.1:0) + (this.boostDamage>0?.4:0) + (this.earlyPower&&this.hero==='samurai'?.12:0)), crit, bullet && e.type === 'armoured');
        const d=Math.max(1,Math.round((crit&&this.evolved('crit')?raw*1.2:raw)*robotProtection(e,this.enemies)));
        const contactX=e.x,contactY=e.y;
        e.hp -= d;
        const actual=Math.min(d,Math.max(0,e.hp+d));
        this.stats.dealt += actual;
        const source=elemental?WEAPONS[this.weapon].name:'Evolution & follow-ups';this.damageSources[source]=(this.damageSources[source]||0)+actual;
        if(elemental&&this.hero==='samurai'&&this.identitySequence!==this.attackSequence){this.identitySequence=this.attackSequence;this.identityCharge=Math.min(100,this.identityCharge+20);}

        this.hitConfirm={time:.2,x:contactX,y:contactY,crit};
        if(crit)this.visuals.criticalHit(contactX,contactY,this.elapsed);
        e.flash = .12;
        const boss=['boss','shooterBoss','commander'].includes(e.type);
        const heavy=!bullet&&['nodachi','hammer','shield','spiked'].includes(this.weapon);e.stagger=boss?0:Math.max(e.stagger||0,heavy?.22:bullet?.035:.08);
        const a = Math.atan2(e.y - this.y, e.x - this.x);
        if(!boss){const p=this.moveOnGround(e.x,e.y,Math.cos(a)*knock*.65*(this.earlyPower&&this.hero==='tank'?1.2:1),Math.sin(a)*knock*.65*(this.earlyPower&&this.hero==='tank'?1.2:1),e.r);e.x=p.x;e.y=p.y;}
        if (this.u('bleed')){
            if(this.hero==='samurai'&&e.bleed<=0)this.visuals.samuraiSkills.oath(contactX,contactY,this.elapsed,this.u('bleed'));
            e.bleed = 3;
        }
        this.number(e.x, e.y, d, crit);
        this.burst(e.x, e.y, crit ? 0xd7b36f : 0x9bad88, crit ? 7 : 3);
        if(!bullet&&this.u('damage')&&this.impactCount<18){
            const keen=this.add.graphics().setPosition(contactX,contactY).setDepth(5);
            for(let i=0;i<3;i++){const a=this.angle+(i-1)*.8,len=7+Math.min(5,this.u('damage'));
                keen.lineStyle(1.5,i===1?0xfff0d1:0xffab64,.9);keen.lineBetween(Math.cos(a)*3,Math.sin(a)*3,Math.cos(a)*len,Math.sin(a)*len);}
            this.tweens.add({targets:keen,alpha:0,duration:100,onComplete:()=>keen.destroy()});
        }
        if(this.impactCount++<18){
        const impact=this.add.graphics().setPosition(contactX,contactY).setRotation(this.angle).setDepth(5),id=this.weapon,color=WEAPON_EFFECTS[id].color;
        impact.lineStyle(3,0x17232a,.9);
        if(id==='shield'||id==='spiked'){impact.strokeCircle(0,0,12);impact.lineStyle(2,color,.85);impact.strokeCircle(0,0,9);if(id==='spiked')for(let i=-1;i<=1;i++)impact.lineBetween(3,i*6,12,i*6);}
        else if(id==='kama'){impact.lineStyle(3,color,.8);impact.beginPath();impact.arc(0,0,12,-1.6,1.1);impact.strokePath();impact.lineBetween(5,10,-4,4);}
        else if(id==='hammer'){for(let i=0;i<5;i++){const a=i*1.3;impact.lineBetween(0,0,Math.cos(a)*18,Math.sin(a)*18);}}
        else if(id==='cursed'){impact.lineStyle(2,color,.85);impact.strokePoints([{x:-14,y:-9},{x:-3,y:-2},{x:-7,y:3},{x:9,y:8},{x:15,y:15}],false);}
        else if(id==='dual'){impact.lineStyle(2,color,.9);impact.lineBetween(-13,-10,13,10);impact.lineBetween(-13,10,13,-10);}
        else if(['pistols','smg','shotgun'].includes(id)){impact.lineStyle(2,color,.85);const n=id==='shotgun'?5:id==='pistols'?3:2;for(let i=0;i<n;i++){const a=i*2.1;impact.lineBetween(Math.cos(a)*3,Math.sin(a)*3,Math.cos(a)*10,Math.sin(a)*10);}}
        else{impact.lineStyle(id==='nodachi'?4:2,color,.85);impact.lineBetween(-12,id==='naginata'?-18:-10,12,id==='naginata'?18:10);}
        this.tweens.add({targets:impact,alpha:0,duration:id==='hammer'?230:130,onComplete:()=>impact.destroy()});
        }
        this.audio.play(crit ? 'critical' : !bullet&&this.u('damage') ? 'keen-hit' : 'hit');
        if (crit && this.save.settings.shake)
            this.cameras.main.shake(55, .002);
        if (!bullet && (heavy||crit))
            this.strongStop = .025;
        if(bullet&&this.evolved('pierce')){const spark=this.add.graphics().setDepth(5);spark.lineStyle(2,0x9fbfe6,.8);spark.strokePoints([{x:contactX-12,y:contactY-4},{x:contactX,y:contactY+6},{x:contactX+9,y:contactY-9}],false);this.tweens.add({targets:spark,alpha:0,duration:160,onComplete:()=>spark.destroy()});}
        if(elemental){if(this.evolution.power)e.burn=this.evolution.power>=2?3:1.2;
            if(this.hero==='tank'&&this.identityCharge>=100){this.identityCharge=0;this.identityProcs++;this.visuals.tankSkills.slam(contactX,contactY,105,1,this.elapsed,'charge');for(const target of this.enemies)if(target.active&&target!==e&&Math.hypot(target.x-contactX,target.y-contactY)<105)this.hit(target,base*.5,20,false,false);}
            if(this.evolution.reach&&this.elementClock<=0){this.elementClock=this.evolution.reach>=2?.18:.8;let x=e.x,y=e.y;const visited=new Set([e]);for(let i=0;i<(this.evolution.reach>=2?3:1);i++){const target=this.enemies.filter(n=>n.active&&!visited.has(n)&&Math.hypot(n.x-x,n.y-y)<190).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];if(!target)break;visited.add(target);const bolt=this.add.graphics().setDepth(5);bolt.lineStyle(3,0x19263b,.9);bolt.lineBetween(x,y,target.x,target.y);bolt.lineStyle(1.5,0x9dbdd8,.9);bolt.strokePoints([{x,y},{x:(x+target.x)/2+9,y:(y+target.y)/2-8},{x:target.x,y:target.y}],false);this.tweens.add({targets:bolt,alpha:0,duration:180,onComplete:()=>bolt.destroy()});this.hit(target,base*.35,0,bullet,false);x=target.x;y=target.y;}}
        }
        if (e.hp <= 0&&e.active)this.kill(e);
    }
    kill(e: Enemy) {
        this.bossMarks=this.bossMarks.filter(mark=>mark.owner!==e);
        this.visuals.death(e, this.elapsed);
        e.active = false;
        if(this.landmark)this.landmark.guards=this.landmark.guards.filter(guard=>guard!==e);
        if(this.evolved('bleed')&&e.bleed>0)this.heal(2);
        if((this.evolved('fire')||this.evolution.power>=2)&&(e.burn>0||Math.hypot(e.x-this.x,e.y-this.y)<110)){if(this.firePatches.length>=20)this.firePatches.shift();this.firePatches.push({x:e.x,y:e.y,life:3});}
        if(this.evolved('regen')&&['elite','boss','shooterBoss','commander'].includes(e.type)){this.lifePulse=5;this.impactRing(this.x,this.y,65,0x8fbe9a);}
        this.stats.kills++;
        if(e===this.huntTarget){this.huntTarget=undefined;this.grantGold(250+this.stats.wave*15);this.objectiveComplete('ELITE BOUNTY CLAIMED');}
        if(['shooterBoss','commander'].includes(e.type)){this.grantGold(400+this.stats.wave*20);this.heal(this.maxHp*.15);this.objectiveComplete('MINI-BOSS DEFEATED · GOLD + RECOVERY');}
        if(e.type==='boss'){if(this.stats.wave===10&&!this.bossMagnet){const p=this.stats.wave<=10?separateWrecks(e.x,e.y,45,mapObstaclesNear(e.x,e.y)):{x:e.x,y:e.y};this.bossMagnet={...p,active:true,born:this.elapsed};}this.bossDefeated=true;if(this.stats.wave===10&&this.finiteRun){for(const enemy of this.enemies)if(enemy!==e)enemy.active=false;this.spawnIndex=this.plan.length;this.pendingStrikes=[];this.pendingEchoes=[];for(const bullet of this.bullets)if(bullet.hostile)bullet.active=false;}this.grantGold(300+this.stats.wave*20);this.heal(this.maxHp*.2);this.banner('BOSS DEFEATED · RECOVERY + GOLD',0xd8ba85);}
        this.waveStats.kills++;
        this.combo = this.comboTime > 0 ? this.combo + 1 : 1;
        this.comboTime = 4;
        this.stats.combo = Math.max(this.stats.combo, this.combo);
        if (this.hero === 'ninja' && this.combo % 5 === 0)
            this.momentum = 3;
        if (this.u('clone') && this.stats.kills % 10 === 0)
            this.clone = this.evolved('clone')?10:5;
        if (['elite','boss','shooterBoss','commander'].includes(e.type)) {
            this.stats.elites++;
            if (this.hero === 'samurai' && !e.touched)
                this.honour = Math.min(5, this.honour + 1);
            this.rerolls++;
        }
        if (this.dash > 0){

            if(this.hasSynergy('shadow')&&this.synergyClock<=0){this.synergyClock=.4;this.clone=Math.min(8,Math.max(2,this.clone)+1);this.notifyCombat('SHADOW HARVEST · SHADOW EXTENDED');const ghost=this.add.image(e.x,e.y,`hero-${this.hero}-0`).setDisplaySize(78,78).setRotation(this.angle).setTint(0xa79ac5).setAlpha(.5).setDepth(2);this.tweens.add({targets:ghost,alpha:0,duration:650,onComplete:()=>ghost.destroy()});}
        }
        if(COMBAT_CACHE_KILLS.includes(this.stats.kills)&&!this.combatCaches.has(this.stats.kills)){this.combatCaches.add(this.stats.kills);this.xp+=Math.ceil(this.xpNeed*.45);this.notifyCombat(`${this.stats.kills} KILLS · COMBAT CACHE · +XP`);this.impactRing(this.x,this.y,55,0xb4c8a3);this.audio.play('buy');}

        if(this.stats.kills%5===0){if(this.evolved('damage')){this.impactRing(this.x,this.y,95,0xb898b9);for(const n of this.enemies)if(n.active&&Math.hypot(n.x-this.x,n.y-this.y)<95)this.hit(n,15,0,false,false);}if(this.evolved('magazine')){const before=this.ammo;this.ammo=Math.min(this.maxAmmo,this.ammo+2);if(this.hero==='gunner'&&this.ammo>before)this.visuals.gunnerSkills.refill(this.x,this.y,this.elapsed);}}

        this.burst(e.x,e.y,e.faction==='robot'?parseInt(ROBOTS[ROBOT_ROLES[e.type]].color.slice(1),16):ENEMIES[e.type].color,14);
        this.drop(e.x, e.y, ENEMIES[e.type].xp, false);
        if (this.random() < BALANCE.goldChance || ['elite','brute','boss','shooterBoss','commander'].includes(e.type))
            this.drop(e.x + 8, e.y, ENEMIES[e.type].gold, true);
        if (e.type === 'elite' && e.mod === 3)
            for (let i = 0; i < 3; i++)
                this.spawn('runner', Math.floor(this.random() * 4));
        this.audio.play('death');
    }
    drop(x: number, y: number, value: number, gold: boolean) {
        let d = this.drops.find(d => !d.active);
        if (!d) {
            if (this.drops.length >= 700) {
                const old = this.drops.find(d => d.gold === gold);
                if (old) {
                    old.value += value;
                    return;
                }
            }
            d = {} as Drop;
            this.drops.push(d);
        }
        Object.assign(d, { active: true, x, y, value, gold, vacuum:false });
    }
    shoot(x: number, y: number, a: number, damage: number, hostile = false, pierce = 0, explosive = false, last = false, kind:'round'|'wind'|'phantom'='round',source='Poison shot') {
        let b = this.bullets.find(b => !b.active);
        if (!b) {
            if (this.bullets.length >= 260)
                return;
            b = { hit: new Set() } as Bullet;
            this.bullets.push(b);
        }
        b.hit.clear();
        Object.assign(b, { active: true, x, y, vx: Math.cos(a) * (hostile ? 180 : kind==='wind'?460:650), vy: Math.sin(a) * (hostile ? 180 : kind==='wind'?460:650), damage, hostile, pierce, explosive, last, kind, source, reflected:false,piercingRound:!hostile&&pierce>0,bounces:0,life: hostile ? 5 : 1 });
        return b;
    }
    windSlash(damage:number,origin={x:this.x,y:this.y}){const launch=this.hero==='samurai'?samuraiStormLaunch(this.x,this.y,this.angle):origin;this.shoot(launch.x,launch.y,this.angle,damage,false,4,false,false,'wind');if(this.hero==='samurai')this.audio.play('storm-blade');}
    impactRing(x:number,y:number,radius:number,color=0xa58d73){
        const ring=this.add.graphics().setPosition(x,y).setDepth(4);ring.lineStyle(7,0x182029,.9);ring.strokeCircle(0,0,radius);ring.lineStyle(3,color,.9);ring.strokeCircle(0,0,radius);for(let i=0;i<6;i++){const a=i*Math.PI/3;ring.lineBetween(Math.cos(a)*radius*.55,Math.sin(a)*radius*.55,Math.cos(a+.15)*radius*.85,Math.sin(a+.15)*radius*.85);}ring.setScale(.3);this.tweens.add({targets:ring,scaleX:1,scaleY:1,alpha:0,duration:320,onComplete:()=>ring.destroy()});
    }
    slash(base: number, range: number, arc: number, a = this.angle, visual=true) {
        for (const e of this.enemies) {
            if (e.active && Math.hypot(e.x - this.x, e.y - this.y) < range + e.r && Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(e.y - this.y, e.x - this.x) - a)) < arc / 2)
                this.hit(e, base, WEAPONS[this.weapon].knock);
        }
        if(!visual)return;
        const g = this.add.graphics().setDepth(4);
        g.lineStyle(14,0x111a22,.9);g.beginPath();g.arc(this.x,this.y,range*.8,a-arc/2,a+arc/2);g.strokePath();
        g.lineStyle(this.hero === 'tank' ? 15 : this.weapon === 'cursed' ? 9 : 7, this.weapon === 'cursed' ? 0xff557a : HEROES[this.hero].color, .7);
        g.beginPath();
        g.arc(this.x, this.y, range * .8, a - arc / 2, a + arc / 2);
        g.strokePath();
        g.lineStyle(3, 0xaabcb8, .9);
        g.beginPath();
        g.arc(this.x, this.y, range * .84, a - arc / 2, a + arc / 2);
        g.strokePath();
        this.tweens.add({ targets: g, alpha: 0, duration: 140, onComplete: () => g.destroy() });
    }
    basicAttack() {
        const w = WEAPONS[this.weapon];
        this.attack = cooldownValue(w.cooldown, HEROES[this.hero].rate * (this.earlyPower&&this.hero==='gunner'?1.1:1) * (1 + (this.momentum > 0 ? .1 * Math.min(3, Math.floor(this.combo / 5)) : 0))*(1+this.evolution.tempo*.1)*(this.overdrive>0?1.6:1));

        if (this.hero === 'gunner') {
            if (this.reload > 0)
                return;
            if (this.ammo <= 0) {
                this.reloadDuration=this.reload = 1.2 * (1 - this.u('reload') * .2);this.audio.play('reload-swish');
                return;
            }
            this.attackSequence++;this.swing=WEAPON_EFFECTS[this.weapon].duration;this.audio.play(this.weapon);
            this.ammo--;
            const last = this.ammo === 0;
            const muzzle=isGunnerWeapon(this.weapon)?gunnerWeaponPose(this.weapon,this.x,this.y,this.angle,0,true,this.weapon==='pistols'&&this.attackSequence%2===1):weaponPose(this.weapon,this.x,this.y,this.angle,0,true,this.attackSequence,false);
            this.burst(muzzle.tip.x,muzzle.tip.y,WEAPON_EFFECTS[this.weapon].color,this.weapon==='shotgun'?7:2);
            this.particle(muzzle.grip.x,muzzle.grip.y,0xb19770,70,2,.22);
            this.visuals.gunnerSkills.muzzle(muzzle.tip.x,muzzle.tip.y,this.angle,this.elapsed,last&&this.u('explosive')?0xffaa87:this.u('pierce')?0x9de8f5:0xffdfa2);

            const n = this.weapon === 'shotgun' ? 5 : 1;
            for (let i = 0; i < n; i++)
                this.shoot(muzzle.tip.x, muzzle.tip.y, this.angle + (i - (n - 1) / 2) * .12, w.damage * (this.openingShots>0?1.35:1) * (last ? 2 : 1), false, this.u('pierce') +(this.evolution.reach>=2?4:0)+ (last ? 3 : 0), this.evolution.power>=2 || (last && !!this.u('explosive')), last);
            if(this.openingShots>0)this.openingShots--;
            if(this.evolution.tempo>=2||this.evolution.tempo===1&&this.attackSequence%3===0)this.pendingEchoes.push({delay:.16,x:muzzle.tip.x,y:muzzle.tip.y,angle:this.angle,damage:w.damage*.35});
            if (!this.ammo){
                this.reloadDuration=this.reload = 1.2 * (1 - this.u('reload') * .2);this.audio.play('reload-swish');
            }
        }
        else {
            this.attackSequence++;this.swing=WEAPON_EFFECTS[this.weapon].duration;this.audio.play(this.weapon);
            const range=w.range*(1+this.u('range')*.25),arc=w.arc*(1+this.u('wide')*.25);
            this.pendingStrikes.push({delay:this.swing*.55,weapon:this.weapon,damage:w.damage*(1+(this.weapon==='hammer'?0:this.u('spikes')*.3)),range,arc,echo:false});
            if(this.evolved('double'))this.pendingStrikes.push({delay:this.swing*.55+.22,weapon:this.weapon,damage:w.damage*.5,range,arc,echo:true});
            if(this.evolution.tempo>=2||this.evolution.tempo===1&&this.attackSequence%3===0)this.pendingStrikes.push({delay:this.swing*.55+.18,weapon:this.weapon,damage:w.damage*.35,range,arc,echo:true});
            if(this.u('double'))this.pendingStrikes.push({delay:this.swing*.55+.11,weapon:this.weapon,damage:w.damage*.6,range,arc,echo:true});
        }
    }
    resolveStrike(strike:{weapon:WeaponId;damage:number;range:number;arc:number;echo:boolean}){
        this.visuals.meleeReward(this.hero,strike.weapon,this.x,this.y,this.angle,this.attackSequence,
            strike.range/WEAPONS[strike.weapon].range,strike.arc/WEAPONS[strike.weapon].arc,this.u('damage'),this.u('wide'),strike.echo,this.elapsed);
        if(strike.echo)this.audio.play('echo-slash');
        else if(this.u('wide'))this.audio.play('crescent-cut');
        const identityReady=this.identityCharge>=100;let connected=false;
        const pose=weaponPose(strike.weapon,this.x,this.y,this.angle,.55,true,this.attackSequence,false,false,strike.range/WEAPONS[strike.weapon].range,strike.arc/WEAPONS[strike.weapon].arc,this.hero==='tank'?'tank':this.hero==='samurai'?'samurai':this.hero==='ninja');
        for(const e of this.enemies)if(e.active&&meleeContact(strike.weapon,this.x,this.y,this.angle,e,e.r,this.attackSequence,strike.range/WEAPONS[strike.weapon].range,strike.arc/WEAPONS[strike.weapon].arc,this.hero==='samurai'?'samurai':this.hero==='tank'?'tank':this.hero==='ninja')){connected=true;this.hit(e,strike.damage,WEAPONS[strike.weapon].knock);}
        if(!strike.echo&&connected&&identityReady&&this.hero==='ninja'){this.identityCharge=0;this.identityProcs++;this.pendingStrikes.push({...strike,damage:strike.damage*.45,delay:.15,echo:true});}
        if(strike.echo){const ghost=this.add.image(pose.grip.x,pose.grip.y,this.hero==='tank'?`tank-${strike.weapon}`:`weapon-${strike.weapon}`).setOrigin(pose.originX,pose.originY).setDisplaySize(pose.size,pose.thickness).setRotation(pose.rotation).setFlipY(pose.flipY).setTint(0xb6a1d7).setAlpha(.45).setDepth(4);this.tweens.add({targets:ghost,alpha:0,duration:220,onComplete:()=>ghost.destroy()});}
        const g=this.add.graphics().setDepth(4),tip=pose.tip,id=strike.weapon,color=WEAPON_EFFECTS[id].color;
        if(this.hero==='tank'){
            if(id==='hammer')for(const e of this.enemies)if(e.active&&Math.hypot(e.x-tip.x,e.y-tip.y)<75+e.r)this.hit(e,strike.damage*.25,12);
            this.visuals.tankSkills.bash(tip.x,tip.y,this.angle,this.u('spikes'),id==='hammer',this.elapsed);
            if(connected)this.audio.play(id==='hammer'?'tank-thump':'tank-bonk');
        }else if(id==='hammer'){
            for(const e of this.enemies)if(e.active&&Math.hypot(e.x-tip.x,e.y-tip.y)<75+e.r)this.hit(e,strike.damage*.25,12);
            this.impactRing(tip.x,tip.y,70,color);for(let i=0;i<5;i++){const a=i*1.3;g.lineStyle(2,0x172128,.8);g.lineBetween(tip.x,tip.y,tip.x+Math.cos(a)*34,tip.y+Math.sin(a)*34);}this.audio.play('hammer');
        }else if(id==='shield'||id==='spiked'){
            g.lineStyle(4,color,.8);g.beginPath();g.arc(tip.x,tip.y,id==='spiked'?25:20,this.angle-1.1,this.angle+1.1);g.strokePath();if(id==='spiked')this.burst(tip.x,tip.y,color,5);
        }else if(id==='nodachi'){g.lineStyle(3,color,.8);g.lineBetween(tip.x-12,tip.y-10,tip.x+12,tip.y+10);this.burst(tip.x,tip.y,color,3);}
        else if(strike.echo){g.lineStyle(2,color,.6);g.beginPath();g.arc(pose.grip.x,pose.grip.y,Math.hypot(tip.x-pose.grip.x,tip.y-pose.grip.y),this.angle-.7,this.angle+.7);g.strokePath();}
        this.tweens.add({targets:g,alpha:0,duration:id==='hammer'?350:140,onComplete:()=>g.destroy()});
        if(!strike.echo&&this.hero==='samurai'&&identityReady){this.identityCharge=0;this.identityProcs++;this.windSlash(WEAPONS[id].damage*.7,tip);}
        if(!strike.echo){if(this.hero==='samurai'&&this.u('dragon-slash')&&this.attackSequence%3===0){const level=this.u('dragon-slash'),reach=235+level*20+(this.evolved('dragon-slash')?70:0);this.dash=Math.max(this.dash,.16);this.invuln=Math.max(this.invuln,.16);this.dashX=Math.cos(this.angle);this.dashY=Math.sin(this.angle);for(const e of this.enemies){const dx=e.x-this.x,dy=e.y-this.y,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx);if(e.active&&d<reach+e.r&&Math.abs(Phaser.Math.Angle.Wrap(a-this.angle))<.62){this.hit(e,WEAPONS[id].damage*(.6+level*.25),WEAPONS[id].knock);e.burn=Math.max(e.burn,1.4+level*.45+(this.evolved('dragon-slash')?1.2:0));if(this.evolved('dragon-slash'))this.hit(e,WEAPONS[id].damage*.4,0);}}this.visuals.samuraiSkills.dragon(this.x,this.y,this.angle,reach,level+(this.evolved('dragon-slash')?1:0),this.elapsed);this.audio.play('dragon-slash');}if(this.attackSequence%3===0&&(this.evolved('wide')||this.evolved('spikes'))){this.slash(strike.damage*.4,strike.range,Math.PI*2,this.angle,this.hero!=='tank');if(this.hero==='tank')this.visuals.tankSkills.slam(this.x,this.y,strike.range,this.u('spikes'),this.elapsed,'crown');else this.impactRing(this.x,this.y,strike.range,0xb8abd1);}if(this.evolution.reach>=2)this.windSlash(WEAPONS[id].damage*(.5+this.evolution.reach*.2),tip);if(this.u('wind')){this.windSlash(WEAPONS[id].damage*.6,tip);if(this.evolved('wind')){const a=this.angle;this.angle+=.2;this.windSlash(WEAPONS[id].damage*.6,tip);this.angle=a;}}if(this.evolution.power>=2){for(const e of this.enemies)if(e.active&&Math.hypot(e.x-tip.x,e.y-tip.y)<105+e.r)this.hit(e,WEAPONS[id].damage*.25*this.evolution.power,12);this.impactRing(tip.x,tip.y,105);}}
        if(this.hero==='tank'&&this.blockCharge>=100){this.blockCharge=0;this.slash(WEAPONS[id].damage*2,170,Math.PI*2,this.angle,false);this.visuals.tankSkills.slam(this.x,this.y,170,1,this.elapsed,'charge');}
    }
    activate(dx:number,dy:number){
        if(this.ability>0||this.paused||this.ended)return;
        this.invulnFromBite=false;
        this.ability=cooldownValue(HEROES[this.hero].cooldown,1,this.u('cooldown')*.15)*(this.options.build==='mobility'?.9:1);
        this.dash=0;this.counter=0;
        if(this.hero==='samurai'){this.counter=.6+this.u('counter')*.3;this.audio.play('lotus-guard');return;}
        if(this.hero==='gunner'){this.ammo=this.maxAmmo;this.reload=0;this.overdrive=3;this.coveringClock=0;this.attack=0;this.audio.play('overdrive');this.banner('OVERDRIVE · RAPID FIRE',0xb7ad8d);return;}
        if(this.hero==='tank'){
            const range=155,duration=2;
            this.slash(WEAPONS[this.weapon].damage*1.6*(1+this.u('rush')*.25),range,Math.PI*2,this.angle,false);this.visuals.tankSkills.slam(this.x,this.y,range,this.u('rush'),this.elapsed);this.audio.play('tank-slam');
            if(this.hasSynergy('aftershock')){if(this.firePatches.length>=20)this.firePatches.shift();this.firePatches.push({x:this.x,y:this.y,life:3});this.notifyCombat('BURNING AFTERSHOCK · GROUND IGNITED');}
            for(const e of this.enemies)if(e.active&&Math.hypot(e.x-this.x,e.y-this.y)<range+e.r)e.slow=duration;
            this.invuln=.25;return;
        }
        const a=dx||dy?Math.atan2(dy,dx):this.angle;
        this.dash=.35;this.invuln=this.dash;this.dashX=Math.cos(a);this.dashY=Math.sin(a);this.dashHits.clear();this.audio.play('moon-dash');
    }
    hurt(value: number, e?: Enemy, a = 0,source='Desert hazard',bite=false) {
        if(bite&&e&&(this.biteCooldowns.get(e)||0)>this.time.now)return;
        if (this.invuln > 0 && !(bite&&e&&this.invulnFromBite))
            return;
        this.invulnFromBite=false;
        if(this.rewardShield>0){this.damageFeedback={time:.5,angle:a,value:0,label:'SHIELD BLOCK'};this.rewardShield--;this.invuln=.4;this.burst(this.x,this.y,0x92acb9,8);return;}
        if (this.counter > 0) {
            this.counter = 0;
            this.invuln = .5;
            if(this.hasSynergy('reversal')){const incoming=this.bullets.filter(b=>b.active&&b.hostile&&Math.hypot(b.x-this.x,b.y-this.y)<180).slice(0,5);const shots=incoming.map(b=>({angle:Math.atan2(-b.vy,-b.vx),damage:b.damage}));for(const b of incoming)b.active=false;const pose=weaponPose(this.weapon,this.x,this.y,a,0,false);for(const shot of shots)this.shoot(pose.grip.x,pose.grip.y,shot.angle,shot.damage*1.5,false,1,false,false,'round','Steel Reversal');if(shots.length)this.notifyCombat(`STEEL REVERSAL · ${shots.length} SHOTS RETURNED`);}

            const counterRadius=210;
            this.visuals.samuraiSkills.counter(this.x,this.y,counterRadius,this.u('counter'),this.elapsed);
            this.slash(WEAPONS[this.weapon].damage * 2.5*(this.evolved('counter')?1.25:1),counterRadius,Math.PI*2,this.angle,false);

            this.audio.play('lotus-counter');
            this.banner('PERFECT COUNTER', 0xffc399);
            return;
        }
        if (this.waveWard) {
            this.damageFeedback={time:.5,angle:a,value:0,label:'WARD BLOCK'};this.waveWard = false;
            this.burst(this.x, this.y, 0x9cafff, 18);
            return;
        }
        if (this.hero === 'tank' && this.weapon!=='hammer' && this.attacking && this.stamina > 0 && Math.abs(Phaser.Math.Angle.Wrap(a - this.angle)) < tankGuardHalfAngle(this.u('block'))) {
            this.visuals.tankSkills.block(this.x+Math.cos(a)*30,this.y+Math.sin(a)*30,a,this.elapsed);this.audio.play('tank-block');
            this.blockCharge += value;
            this.stamina = Math.max(0, this.stamina - value * .8);

            value *= this.evolved('block')?.1:.2;
            this.audio.play('hit');
        }
        if(e){if(this.enemies.some(c=>c.active&&c.type==='commander'&&c.commandTime>0&&Math.hypot(c.x-e.x,c.y-e.y)<220))value*=1.15;e.touched=true;}
        value *= 1 - this.meta('defense') * .05;
        if(e)a=Math.atan2(e.y-this.y,e.x-this.x);
        if(this.hero==='ninja'&&this.u('smoke')&&this.time.now>=this.smokeBombReadyAt){const level=this.u('smoke'),radius=145+level*28;this.smokeBombReadyAt=this.time.now+Math.max(4200,9000-level*1500);for(const enemy of this.enemies)if(enemy.active&&Math.hypot(enemy.x-this.x,enemy.y-this.y)<radius)enemy.slow=Math.max(enemy.slow,1.5+level*.5+(this.evolved('smoke')?1:0));if(this.evolved('smoke'))this.rewardShield=Math.max(this.rewardShield,1);this.invuln=Math.max(this.invuln,.35);this.visuals.smokeBomb(this.x,this.y,radius,level,this.evolved('smoke'),this.elapsed);this.audio.play('smoke-bloom');this.notifyCombat('SMOKE BOMB · ENEMIES DAZED');}
        this.lastCause=e?enemyName(e.type,e.faction):source;
        this.damageFeedback={time:.65,angle:a,value:Math.round(value),label:this.lastCause};
        this.showHpChange(-Math.min(this.hp,value));
        this.hp -= value;
        this.stats.taken += value;
        this.waveStats.damage += value;
        this.invuln = BALANCE.invulnerability;
        this.invulnFromBite=bite;
        if(bite&&e)this.biteCooldowns.set(e,this.time.now+900);
        this.audio.play('hurt');
        this.burst(this.x, this.y, 0xff718a, 12);
        if (this.save.settings.shake)
            this.cameras.main.shake(110, .004);
        if (this.hp <= 0) {
            this.hp = 0;
            this.ended = true;
            this.stats.time = this.elapsed;
            this.onEnd();
        }
    }
    apply(id: string) {
        if(id.startsWith('evolve:')){const base=id.slice(7),card=UPGRADES.find(u=>u.id===base);if(!card||!CARD_EVOLUTIONS[base]||this.stats.wave<=10||this.u(base)<card.max||this.evolved(base))return;this.cardEvolutions[base]=true;this.save.archive[`card:${base}`]=2;
            if(['health','wide','crit','magnet','regen','damage','cooldown','range','bleed','counter','magazine','pierce','reload','stamina','block','spikes','rush'].includes(base))this.levels[base]++;
            if(base==='health'){this.maxHp*=1.15;this.heal(this.maxHp*.35);}this.reveal(CARD_EVOLUTIONS[base].name);this.audio.play('level');this.paused=false;return;
        }
        this.levels[id] = (this.levels[id] || 0) + 1;
        if (id === 'health') {
            this.maxHp *= 1.15;
            this.heal(this.maxHp * .15);
        }
        if (id === 'heal')
            this.heal(30);
        this.audio.play('level');
        this.paused = false;
    }
    finishWave() {
        if(this.waiting||this.ended)return;
        if(this.stats.wave===10&&this.bossMagnet){
            if(this.bossMagnet.active){if(this.elapsed-this.bossMagnet.born<6)return;this.collectBossMagnet();return;}
            if(this.drops.some(d=>d.active&&d.vacuum))return;
        }
        if(this.finiteRun&&this.stats.wave===10&&(!this.bossDefeated||this.enemies.some(e=>e.active&&e.type==='boss')))return;
        this.earned=earnedWaveGold(this.stats.wave,this.waveStats.kills,this.waveStats.damage,this.waveObjectives);
        const earnedGold=this.earned.combat+this.earned.perfect+this.earned.objective;this.grantGold(earnedGold);
        this.banner(`WAVE CLEAR · +${earnedGold} EARNED GOLD`,0xd8ba85);
        if(this.stats.wave===5&&!this.earlyAwakened){this.earlyAwakened=true;this.reveal(this.earlyTechnique);}
        if(this.stats.wave>10&&[3,6,8].includes(this.stats.wave)&&(this.earned.combat>0||this.waveObjectives>0)){this.xp+=this.xpNeed;this.notifyCombat('COMBAT MILESTONE · BONUS LEVEL-UP');}

        if(this.finiteRun&&this.stats.wave===10){this.victory=true;this.ended=true;this.paused=true;this.stats.time=this.elapsed;this.onEnd();return;}
        this.pendingStrikes=[];this.pendingEchoes=[];this.swing=0;
        this.waiting = true;
        this.paused = true;
        this.waveStats.time = this.waveTime;
        if (this.waveTime < 45) {
            const bonus = Math.round(this.waveStats.gold * .15);
            this.stats.gold += bonus;
            this.save.gold += bonus;
            this.waveStats.gold += bonus;
        }
        if (this.waveStats.damage === 0)
            this.rerolls++;
        this.heal(this.maxHp * .08);
        this.audio.play('clear');
        this.onChoice(true);
    }
    nextWave() { for(const e of this.enemies)if(e.active&&!['boss','shooterBoss','commander'].includes(e.type))e.slow=Math.max(e.slow,2);this.waiting = true; this.paused = false; this.countdown = encounterRhythm(this.stats.wave).recovery; }
    update(_time: number, ms: number) {
        if (this.paused || this.ended)
            return;
        const dt = Math.min(ms / 1000, .04);
        if (this.strongStop > 0) {
            this.strongStop -= dt;
            return;
        }
        if (this.countdown > 0) {
            this.countdown -= dt;
            let dx=this.touch?.enabled?this.touch.x:Number(this.keys.D.isDown||this.keys.RIGHT.isDown)-Number(this.keys.A.isDown||this.keys.LEFT.isDown),dy=this.touch?.enabled?this.touch.y:Number(this.keys.S.isDown||this.keys.DOWN.isDown)-Number(this.keys.W.isDown||this.keys.UP.isDown);
            const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}if(length>0){this.angle=Math.atan2(dy,dx);const p=this.moveOnGround(this.x,this.y,dx*HEROES[this.hero].speed*dt,dy*HEROES[this.hero].speed*dt,17);this.x=p.x;this.y=p.y;}
            this.ability=Math.max(0,this.ability-dt);this.updateDrops(dt);
            this.render();
            if (this.countdown <= 0) {
                this.stats.wave++;
                this.startWave();
            }
            return;
        }
        this.impactCount=0;
        this.hitConfirm.time=Math.max(0,this.hitConfirm.time-dt);this.combatNotice.time=Math.max(0,this.combatNotice.time-dt);this.synergyClock=Math.max(0,this.synergyClock-dt);this.spawnPulse-=dt;this.escapeClock-=dt;
        if(this.escapeClock<=0){this.escapeClock=5;this.escapeAngle=escapeDirection(this.x,this.y,this.enemies,this.angle);}
        this.elementClock=Math.max(0,this.elementClock-dt);this.speedBurst=Math.max(0,this.speedBurst-dt);this.lifePulse=Math.max(0,this.lifePulse-dt);this.vacuumClock-=dt;
        this.reinforcementMarks=this.reinforcementMarks.filter(m=>(m.life-=dt)>0);
        this.firePatches=this.firePatches.filter(p=>(p.life-=dt)>0);
        if(this.evolved('magnet')&&this.vacuumClock<=0){this.vacuumClock=5;this.impactRing(this.x,this.y,220,0x8fb9bd);for(const d of this.drops)if(d.active&&Math.hypot(d.x-this.x,d.y-this.y)<220){d.x=this.x;d.y=this.y;}}
        this.damageFeedback.time=Math.max(0,this.damageFeedback.time-dt);
        this.boostDamage=Math.max(0,this.boostDamage-dt);this.boostSpeed=Math.max(0,this.boostSpeed-dt);this.updateEvent(dt);if(this.ended)return;
        this.overdrive=Math.max(0,this.overdrive-dt);
        if(this.decoy){this.decoy.life-=dt;if(this.decoy.life<=0)this.decoy=undefined;}
        this.coveringClock-=dt;
        this.waveTime += dt;
        this.elapsed += dt;
        this.tick += dt;
        this.attack -= dt;
        this.swing = Math.max(0, this.swing - dt);
        this.ability = Math.max(0, this.ability - dt);
        this.invuln = Math.max(0, this.invuln - dt);
        if(this.invuln<=0)this.invulnFromBite=false;
        this.counter = Math.max(0, this.counter - dt);
        this.momentum -= dt;
        this.comboTime -= dt;
        this.clone -= dt;
        if (this.comboTime <= 0)
            this.combo = 0;
        const blocking = this.hero === 'tank' && this.weapon!=='hammer' && this.attacking && this.stamina > 0;
        this.stamina = Math.min(100 * (1 + this.u('stamina') * .4), this.stamina + (blocking ? -2 : this.evolved('stamina')?30:20) * dt);
        if (this.reload > 0) {
            this.reload -= dt;
            if (this.reload <= 0){this.ammo=this.maxAmmo;if(this.hero==='gunner'){this.openingShots=3;this.identityProcs++;this.visuals.gunnerSkills.refill(this.x,this.y,this.elapsed);this.audio.play('reload-pop');}if(this.evolved('reload'))this.speedBurst=1.5;}
        }
        const k = this.keys;
        let dx = Number(k.D.isDown || k.RIGHT.isDown) - Number(k.A.isDown || k.LEFT.isDown), dy = Number(k.S.isDown || k.DOWN.isDown) - Number(k.W.isDown || k.UP.isDown);
        if(this.touch?.enabled){dx=this.touch.x;dy=this.touch.y;}
        const len = Math.hypot(dx, dy);
        if(this.hero==='ninja'&&len>.2)this.identityCharge=Math.min(100,this.identityCharge+dt*100/3);
        if(this.hero==='tank'&&this.enemies.some(e=>e.active&&Math.hypot(e.x-this.x,e.y-this.y)<165))this.identityCharge=Math.min(100,this.identityCharge+dt*25);

        if(this.evolved('speed')){this.speedCharge=len>0?this.speedCharge+dt:0;if(this.speedCharge>=3){this.speedCharge=0;this.speedBurst=2;this.impactRing(this.x,this.y,50,0xa6a1d1);}}
        if (len && !this.touch?.enabled) {
            dx /= len;
            dy /= len;
        }
        if(this.touch?.enabled){
            const desired=len>0?Math.atan2(dy,dx):this.angle;
            if(this.swing<=0||isGun(this.weapon))this.angle=this.save.settings.aimAssist?assistedAim(this.x,this.y,desired,isGun(this.weapon)?480:WEAPONS[this.weapon].range*(1+this.u('range')*.25)+35,this.enemies):desired;
        }else this.angle = Math.atan2(this.input.activePointer.worldY - this.y, this.input.activePointer.worldX - this.x);
        if (Phaser.Input.Keyboard.JustDown(k.SPACE))
            this.activate(dx, dy);
        if (this.dash > 0) {
            this.dash -= dt;
            dx = this.dashX;
            dy = this.dashY;
            for (const e of this.enemies)
                if (e.active && !this.dashHits.has(e) && Math.hypot(e.x - this.x, e.y - this.y) < 65) {
                    this.dashHits.add(e);
                    this.hit(e, WEAPONS[this.weapon].damage * 1.4, 55);
                }
            if (this.u('trail'))
                this.slash(this.evolved('trail')?16:8,this.evolved('trail')?110:80,Math.PI*2,this.angle,this.hero!=='ninja');
            this.particle(this.x, this.y, HEROES[this.hero].color, 10, 8, .3);

            if (this.dash <= 0 && this.u('rush'))
                this.slash(110, 190, Math.PI * 2);
        }
        const speed = this.dash > 0 ? 650 : HEROES[this.hero].speed * (1 + this.u('speed') * .08 + this.meta('speed') * .05 + (this.momentum > 0 ? .1 : 0) + (this.boostSpeed>0?.25:0)+(this.speedBurst>0?.3:0)+(this.options.build==='mobility'?.08:0)) * (blocking ? .55 : 1);
        {const p=this.moveOnGround(this.x,this.y,dx*speed*dt,dy*speed*dt,17);this.x=p.x;this.y=p.y;}
        const targetInReach=this.enemies.some(e=>e.active&&Math.hypot(e.x-this.x,e.y-this.y)<(isGun(this.weapon)?520:WEAPONS[this.weapon].range*(1+this.u('range')*.25)+e.r+25));
        if (this.attack <= 0&&targetInReach)this.basicAttack();
        // Major encounters must not be stuck behind a deferred ordinary pack.
        for(let i=this.spawnIndex;i<this.plan.length&&this.plan[i].time<=this.waveTime;i++){const pack=this.plan[i];if(pack.count>0&&['boss','shooterBoss','commander'].includes(pack.type)){this.spawn(pack.type);pack.count--;}}
        const localCrowd=this.enemies.filter(e=>e.active&&Math.hypot(e.x-this.x,e.y-this.y)<240).length;
        if(this.spawnPulse<=0)while(this.spawnIndex<this.plan.length&&this.plan[this.spawnIndex].time<=this.waveTime){
            if(this.plan[this.spawnIndex].count<=0){this.spawnIndex++;continue;}
            const pack=this.plan[this.spawnIndex],major=['boss','shooterBoss','commander'].includes(pack.type);
            if(!major&&localCrowd>=18){this.spawnPulse=.5;break;}
            const amount=Math.min(pack.count,major?1:4),side=Math.floor(this.random()*4),center=this.random();
            for(let i=0;i<amount;i++){const requested=pack.formation===3?(side+i%2*2)%4:side,offset=Phaser.Math.Clamp(center+(i-amount/2)*.075,.05,.95),route=major?{side:requested,offset}:routedSpawn(requested,offset,this.cameras.main.worldView.width,this.cameras.main.worldView.height,this.escapeAngle);this.spawn(pack.type,route.side,route.offset);}
            pack.count-=amount;if(pack.count<=0)this.spawnIndex++;this.spawnPulse=.18;break;
        }
        for(const strike of this.pendingStrikes)strike.delay-=dt;
        for(const echo of this.pendingEchoes)echo.delay-=dt;const echoes=this.pendingEchoes.filter(e=>e.delay<=0);this.pendingEchoes=this.pendingEchoes.filter(e=>e.delay>0);for(const e of echoes)this.shoot(e.x,e.y,e.angle,e.damage,false,1,false,false,'phantom');
        const ready=this.pendingStrikes.filter(s=>s.delay<=0);this.pendingStrikes=this.pendingStrikes.filter(s=>s.delay>0);for(const strike of ready)this.resolveStrike(strike);
        this.updateEnemies(dt);
        this.updateBullets(dt);
        this.updateDrops(dt);
        if (this.tick >= 1) {
            this.tick = 0;
            this.heal(this.u('regen')*(this.lifePulse>0?3:1));
            if (this.u('fire'))
                this.slash(9 * this.u('fire'), 100, Math.PI * 2);
            if (this.clone > 0){this.visuals.phantomStrike(this.elapsed);this.slash(this.evolved('clone')?52:35, 170, Math.PI * 2);}
        }
        if (this.u('orbit')) {
            for(const offset of this.evolved('orbit')?[0,Math.PI]:[0]){const a = this.elapsed * 3+offset, ox = this.x + Math.cos(a) * 95, oy = this.y + Math.sin(a) * 95;
            for (const e of this.enemies)
                if (e.active && e.flash <= 0 && Math.hypot(e.x - ox, e.y - oy) < e.r + 12)
                    this.hit(e, 12 * this.u('orbit'), 4);}
        }
        for (const p of this.particles)
            if (p.active) {
                p.life -= dt;
                if (p.life <= 0)
                    p.active = false;
                else {
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                }
            }
        for (const n of this.numbers)
            if (n.life > 0) {
                n.life -= dt;
                n.text.y -= dt * 35;
                n.text.setAlpha(Math.max(0, n.life / .65));
                if (n.life <= 0)
                    n.text.setVisible(false);
            }
        if (!this.paused && (this.waveTime >= 50 || (this.waveTime >= 40 && this.count === 0)))
            this.finishWave();
        this.render();
    }
    updateEnemies(dt: number) {
        for(const mark of this.bossMarks){
            mark.remaining-=dt;
            if(!mark.fired&&mark.remaining<=0&&mark.owner.active){
                mark.fired=true;
                if(mark.damage&&Math.hypot(this.x-mark.x,this.y-mark.y)<mark.radius+17)this.hurt(mark.owner.damage*mark.damage,mark.owner,Math.atan2(this.y-mark.y,this.x-mark.x),mark.style==='reactor'?'Reactor cross':mark.style==='mortar'?'Mortar barrage':'Grave rupture');
                this.impactRing(mark.x,mark.y,mark.radius,mark.color);
                this.burst(mark.x,mark.y,mark.color,mark.style==='rally'?16:22);
            }
        }
        this.bossMarks=this.bossMarks.filter(mark=>mark.owner.active&&mark.remaining>-.55);

        for(const shot of this.enemyBursts)shot.delay-=dt;const readyShots=this.enemyBursts.filter(s=>s.delay<=0);this.enemyBursts=this.enemyBursts.filter(s=>s.delay>0&&s.enemy.active&&s.enemy.type==='shooterBoss');for(const s of readyShots)if(s.enemy.active&&s.enemy.type==='shooterBoss'){this.shoot(s.enemy.x,s.enemy.y,s.angle,s.damage,true,0,false,false,'round',s.enemy.faction==='robot'?'Pulse Overseer':'Siege Gunner');s.enemy.shotKick=.12;}
        this.grid.clear();const commanders=this.enemies.filter(e=>e.active&&e.type==='commander'&&e.commandTime>0);
        for (const e of this.enemies)
            if (e.active) {
                const key = `${Math.floor(e.x / 64)},${Math.floor(e.y / 64)}`;
                let cell = this.grid.get(key);
                if (!cell) {
                    cell = [];
                    this.grid.set(key, cell);
                }
                cell.push(e);
            }
        for (const e of this.enemies) {
            if (!e.active)
                continue;
            e.skillAge+=dt;
            e.shotKick=Math.max(0,e.shotKick-dt);
            e.commandTime=Math.max(0,e.commandTime-dt);
            e.burn=Math.max(0,e.burn-dt);if(e.burn>0){e.hp-=16*dt;if(e.hp<=0){this.kill(e);continue;}}
            if(this.firePatches.some(p=>Math.hypot(p.x-e.x,p.y-e.y)<45)){e.hp-=18*dt;if(e.hp<=0){this.kill(e);continue;}}
            e.flash -= dt;
            if(e.stagger>0){e.stagger=Math.max(0,e.stagger-dt);continue;}
            e.attack -= dt;
            if(e.type==='boss'&&e.chargeTime>0){
                const oldX=e.x,oldY=e.y,remaining=e.chargeTime,step=Math.min(dt,remaining),ratio=step/remaining;
                {const p=this.moveOnGround(e.x,e.y,(e.targetX-e.x)*ratio,(e.targetY-e.y)*ratio,e.r);e.x=p.x;e.y=p.y;}e.chargeTime=Math.max(0,remaining-dt);
                const vx=e.x-oldX,vy=e.y-oldY,length=vx*vx+vy*vy,t=length?Phaser.Math.Clamp(((this.x-oldX)*vx+(this.y-oldY)*vy)/length,0,1):0;
                if(!e.chargeHit&&Math.hypot(this.x-oldX-vx*t,this.y-oldY-vy*t)<70){e.chargeHit=true;this.hurt(e.damage,e,Math.atan2(vy,vx));}
                this.particle(oldX,oldY,0xb19a79,45,5,.35);
                if(e.chargeTime===0){this.impactRing(e.x,e.y,55,0xb19a79);this.burst(e.x,e.y,0xb19a79,10);}
                continue;
            }
            if(e.skillAction&&e.telegraph<=0&&e.skillAge>=e.skillWindup&&e.skillAge<e.skillWindup+.65)continue;
            const view=this.cameras.main.worldView;
            if(e.type!=='boss'&&Math.hypot(e.x-this.x,e.y-this.y)>Math.max(view.width,view.height)*2.5){const direction=Math.atan2(e.y-this.y,e.x-this.x),radius=Math.hypot(view.width/2,view.height/2)+100;e.x=this.x+Math.cos(direction)*radius;e.y=this.y+Math.sin(direction)*radius;}
            const dx = this.x - e.x, dy = this.y - e.y, d = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx);
            e.slow=Math.max(0,e.slow-dt);let speed=e.speed*(e.slow>0?.5:1),moveAngle=a;if(e.type!=='commander'&&commanders.some(c=>c.faction===e.faction&&(e.faction==='zombie'||c.squad===e.squad)&&Math.hypot(c.x-e.x,c.y-e.y)<220))speed*=1.3;
            if(e.faction==='robot'&&e.type==='runner'&&d>100){
                // Scouts approach a point ahead of the rider, then commit to the chase.
                const lead=Math.min(110,d*.3),side=e.mod%2?1:-1;
                moveAngle=Math.atan2(dy+Math.cos(a)*lead*side,dx-Math.sin(a)*lead*side);
            }
            if(this.decoy&&['basic','runner','armoured','elite'].includes(e.type)&&Math.hypot(e.x-this.decoy.x,e.y-this.decoy.y)<260){moveAngle=Math.atan2(this.decoy.y-e.y,this.decoy.x-e.x);if(Math.hypot(e.x-this.decoy.x,e.y-this.decoy.y)<e.r+10)speed=0;}
            if (e.type === 'elite') {
                if (e.mod === 0)
                    speed *= 1.5;
                if (e.mod === 1 && d < 90 && this.tick < dt)
                    this.hurt(5, e, a + Math.PI);
                if (e.mod === 2)
                    e.hp = Math.min(e.max, e.hp + 8 * dt);
                if (e.mod === 4 && e.hp < e.max * .3)
                    speed *= 1.8;
            }
            if (e.bleed > 0) {
                e.bleed -= dt;
                e.hp -= this.u('bleed') * 5 * dt;
                if (e.hp <= 0) {
                    this.kill(e);
                    continue;
                }
            }
            if (e.telegraph > 0) {
                e.telegraph -= dt;
                if (e.telegraph <= 0) {
                    if ((e.type === 'spitter'||e.type==='bioScreer'))
                        this.shoot(e.x,e.y,Math.atan2(e.targetY-e.y,e.targetX-e.x),e.damage,true,0,false,false,'round',e.faction==='robot'?'Pulse shot':'Spitter');
                    else if(e.type==='rifle'){
                        e.shotKick=.16;this.shoot(e.x,e.y,Math.atan2(e.targetY-e.y,e.targetX-e.x),e.damage,true,0,false,false,'round',e.faction==='robot'?'Pulse shot':'Rifle shot');const shot=this.bullets.find(b=>b.active&&b.hostile&&b.x===e.x&&b.y===e.y);if(shot){shot.vx*=1.5;shot.vy*=1.5;shot.life=3;}this.burst(e.x,e.y,0xb2ac88,4);
                    }
                    else if(e.type==='shooterBoss'){
                        e.shotKick=.2;const aim=Math.atan2(e.targetY-e.y,e.targetX-e.x);if(e.phase%3===2){this.impactRing(e.x,e.y,65,e.faction==='robot'?0x79e4ed:0xd7a579);}else if(e.phase%2===0){this.shoot(e.x,e.y,aim,e.damage,true,0,false,false,'round',e.faction==='robot'?'Pulse Overseer':'Siege Gunner');this.enemyBursts.push({enemy:e,delay:.13,angle:aim-.035,damage:e.damage},{enemy:e,delay:.26,angle:aim+.035,damage:e.damage});}else for(const offset of [-.5,-.25,0,.25,.5])this.shoot(e.x,e.y,aim+offset,e.damage,true,0,false,false,'round',e.faction==='robot'?'Pulse Overseer':'Siege Gunner');this.burst(e.x,e.y,0xc6af89,8);e.phase++;
                    }
                    else if(e.type==='commander'){
                        e.commandTime=4;for(let i=0;i<4;i++){const view=this.cameras.main.worldView;const x=i===0?view.x+20:i===1?view.right-20:this.x,y=i===2?view.y+30:i===3?view.bottom-30:this.y;this.reinforcementMarks.push({x,y,life:1.2});this.spawn(i%2?'runner':'basic',i%4,.25+i*.15,e.faction);}this.impactRing(e.x,e.y,220,0xa0b9d4);e.phase++;
                    }
                    else if(e.type==='cleaver'||e.type==='spear'){
                        const spear=e.type==='spear',reach=spear?155:110,arc=spear?.45:1.9,aim=Math.atan2(e.targetY-e.y,e.targetX-e.x);
                        if(d<reach&&Math.abs(Phaser.Math.Angle.Wrap(a-aim))<arc/2)this.hurt(e.damage,e,a+Math.PI);
                        const strike=this.add.graphics().setDepth(4);strike.lineStyle(spear?3:7,spear?0x9cbfc2:0xb29a7c,.9);
                        if(spear){const thrust=this.add.graphics().setPosition(e.x,e.y).setRotation(aim).setDepth(4);thrust.lineStyle(5,0x8f7855,.95);thrust.lineBetween(24,0,reach-15,0);thrust.fillStyle(0xadc2c3);thrust.fillPoints([{x:reach,y:0},{x:reach-20,y:-7},{x:reach-13,y:0},{x:reach-20,y:7}],true);thrust.setScale(.55,1);this.tweens.add({targets:thrust,scaleX:1,alpha:0,duration:180,onComplete:()=>thrust.destroy()});strike.lineBetween(e.x,e.y,e.x+Math.cos(aim)*reach,e.y+Math.sin(aim)*reach);const tip={x:e.x+Math.cos(aim)*reach,y:e.y+Math.sin(aim)*reach};strike.lineBetween(tip.x-Math.cos(aim-.5)*12,tip.y-Math.sin(aim-.5)*12,tip.x,tip.y);strike.lineBetween(tip.x-Math.cos(aim+.5)*12,tip.y-Math.sin(aim+.5)*12,tip.x,tip.y);}
                        else{strike.beginPath();strike.arc(e.x,e.y,reach*.8,aim-arc/2,aim+arc/2);strike.strokePath();this.burst(e.x+Math.cos(aim)*reach*.8,e.y+Math.sin(aim)*reach*.8,0xa99479,5);}
                        this.tweens.add({targets:strike,alpha:0,duration:spear?130:240,onComplete:()=>strike.destroy()});
                    }
                    else if (e.type === 'boss') {
                        if (e.phase % 3 === 0) {
                            // The marked rupture / reactor pattern resolves on the simulation clock.
                            this.impactRing(e.x,e.y,55,e.faction==='robot'?0x79e4ed:0xd7a579);
                        }
                        else if (e.phase % 3 === 1) {
                            for(let i=0;i<5;i++)this.spawn('basic',i%4,.2+i*.15,e.faction);
                            this.impactRing(e.x,e.y,85,0xa8b58b);
                        }
                        else {
                            e.chargeTime=.65;e.chargeHit=false;
                        }
                        e.phase++;
                    }
                    else if(e.type==='abomination'){
                        this.impactRing(e.targetX,e.targetY,115,0xc56da5);
                        if(Math.hypot(this.x-e.targetX,this.y-e.targetY)<115)this.hurt(e.damage,e,a+Math.PI);
                    }
                    else if (d < e.r + 65) {
                        this.hurt(e.damage, e, a + Math.PI);
                        {const p=this.moveOnGround(this.x,this.y,dx/d*25,dy/d*25,17);this.x=p.x;this.y=p.y;}
                    }
                }
                continue;
            }
            if(e.type==='shooterBoss'||e.type==='commander'){
                if(e.type==='shooterBoss'&&d<210)speed*=-.5;else if(d<330)speed=0;
                if(e.attack<=0&&view.contains(e.x,e.y)){e.telegraph=e.type==='commander'?1.15:.9;e.attack=e.type==='commander'?6:3.2;e.targetX=this.x;e.targetY=this.y;this.markBoss(e);continue;}
            }
            if(e.type==='cleaver'||e.type==='spear'||e.type==='rifle'){
                const ranged=e.type==='rifle';if(ranged){if(d<180)speed*=-.5;else if(d<330)speed=0;}
                if(e.attack<=0&&d<(ranged?480:e.type==='spear'?175:130)&&(!ranged||view.contains(e.x,e.y))){e.telegraph=ranged?.9:.8;e.attack=ranged?3.5:e.type==='spear'?2.8:2.5;e.targetX=this.x;e.targetY=this.y;if(e.faction==='robot'&&e.type==='cleaver'){e.skillAction='slam';e.skillAge=0;e.skillWindup=.8;}continue;}
            }
            if (e.type === 'spitter'||e.type==='bioScreer') {
                if (d < 210)
                    speed *= -.7;
                if (d > 220 && d < 310)
                    speed = 0;
                if (e.attack <= 0) {
                    e.telegraph = .75;
                    e.attack = 3;
                    e.targetX = this.x;
                    e.targetY = this.y;
                }
            }
            if (e.type === 'boss' && e.threshold < 2 && e.hp < e.max * (e.threshold === 0 ? .66 : .33)) {
                e.threshold++;
                for (let i = 0; i < 4; i++)
                    this.spawn('runner',undefined,undefined,e.faction);
            }
            if (e.type === 'boss' && e.attack <= 0) {
                e.telegraph = 1.15;
                e.attack = 4;
                e.targetX = this.x;
                e.targetY = this.y;
                this.markBoss(e);
                if(e.phase%3===1){for(let i=0;i<5;i++){const side=i%4,f=.2+i*.15;this.reinforcementMarks.push({x:side===0?view.x+20:side===1?view.right-20:view.x+view.width*f,y:side===2?view.y+25:side===3?view.bottom-25:view.y+view.height*f,life:1.5});}}
                continue;
            }
            if ((e.type === 'brute'||e.type==='abomination') && d < (e.type==='abomination'?135:100) && e.attack <= 0) {
                e.telegraph = .7;
                if(e.faction==='robot'){e.skillAction='slam';e.skillAge=0;e.skillWindup=.7;}
                e.attack = 2.2;
                e.targetX = this.x;
                e.targetY = this.y;
            }
            if(this.mapCars.length&&!this.decoy)moveAngle=wreckSteering(e.x,e.y,this.x,this.y,e.r,this.mapCars);
            const wobble = e.type === 'runner' ? Math.sin(this.elapsed * 6 + e.x) * .35 : 0;
            {const p=this.moveOnGround(e.x,e.y,Math.cos(moveAngle+wobble)*speed*dt,Math.sin(moveAngle+wobble)*speed*dt,e.r);e.x=p.x;e.y=p.y;}
            const cx = Math.floor(e.x / 64), cy = Math.floor(e.y / 64);
            let checks = 0;
            for (let ix = -1; ix <= 1; ix++)
                for (let iy = -1; iy <= 1; iy++) {
                    const cell = this.grid.get(`${cx + ix},${cy + iy}`);
                    if (cell)
                        for (const other of cell) {
                            if (other === e || checks++ > 12)
                                continue;
                            const sx = e.x - other.x, sy = e.y - other.y, dist = Math.hypot(sx, sy);
                            if((e.faction==='robot'||isRigZombie(e.type))&&(other.faction==='robot'||isRigZombie(other.type))){
                                const push=crowdSeparation(sx,sy,e.r,other.r,dt);e.x+=push.x;e.y+=push.y;
                            }else if (dist > 0 && dist < e.r + other.r) {
                                e.x+=sx/dist*18*dt;e.y+=sy/dist*18*dt;
                            }
                        }
                }
            {const p=separateWrecks(e.x,e.y,e.r,this.mapCars);e.x=p.x;e.y=p.y;}
            if (d < e.r + 17 && !['brute','abomination','cleaver','spear','rifle','shooterBoss','commander'].includes(e.type) && e.attack <= 0) {
                this.hurt(e.damage, e, a + Math.PI,e.faction==='robot'?'Robot strike':'Zombie bite',true);
                e.attack = .9;
            }
        }
    }
    updateBullets(dt: number) {
        for (const b of this.bullets) {
            if (!b.active)
                continue;
            b.life -= dt;
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            if (b.life <= 0 || Math.abs(b.x-this.x)>1400 || Math.abs(b.y-this.y)>1100) {
                b.active = false;
                continue;
            }
            if (b.hostile) {
                if (Math.hypot(b.x - this.x, b.y - this.y) < 22) {
                    const a = Math.atan2(b.y - this.y, b.x - this.x);
                    if (this.u('reflect') && this.attacking && Math.abs(Phaser.Math.Angle.Wrap(a - this.angle)) < 1.3) {
                        b.hostile = false;if(this.evolved('reflect'))b.damage*=2;
                        if(this.hero==='tank'){b.reflected=true;this.visuals.tankSkills.reflect(b.x,b.y,a,this.elapsed);this.audio.play('tank-return');}
                        b.vx *= -2;
                        b.vy *= -2;
                        b.life = 1;
                    }
                    else {
                        this.hurt(b.damage, undefined, a,b.source);
                        // A perfect counter may reuse this pooled bullet as a returned shot.
                        if(b.hostile)b.active=false;
                    }
                }
            }
            else
                for (const e of this.enemies)
                    if (e.active && !b.hit.has(e) && Math.hypot(e.x - b.x, e.y - b.y) < e.r + (b.kind==='wind'?30:6)) {
                        b.hit.add(e);
                        if(this.hero==='gunner'&&b.kind==='round'&&b.piercingRound&&b.pierce>0)this.visuals.gunnerSkills.pierce(b.x,b.y,Math.atan2(b.vy,b.vx),this.elapsed);
                        if(b.kind==='wind'&&this.hasSynergy('firewind')){e.burn=Math.max(e.burn,2);const neighbours=this.enemies.filter(n=>n.active&&n!==e&&Math.hypot(n.x-e.x,n.y-e.y)<115).slice(0,2);for(const target of neighbours){target.burn=Math.max(target.burn,2);this.particle(target.x,target.y,0xc89b72,35,4,.4);}if(neighbours.length&&this.synergyClock<=0){this.synergyClock=.8;this.notifyCombat('FIRESTORM · BURN SPREAD');}}
                        this.hit(e, b.damage, 8, b.kind!=='wind',b.source!=='Crossfire');
                        if(b.kind==='wind'&&this.hero==='samurai')this.visuals.samuraiSkills.windHit(e.x,e.y,this.elapsed);
                        if(b.kind==='wind'&&this.hero!=='samurai'){const cut=this.add.graphics().setDepth(5);cut.lineStyle(3,0x9eb7b3,.9);cut.lineBetween(e.x-18,e.y-12,e.x+18,e.y+12);this.tweens.add({targets:cut,alpha:0,duration:140,onComplete:()=>cut.destroy()});}


                        if (b.explosive) {
                            if(this.hero==='gunner'){this.visuals.gunnerSkills.verdict(b.x,b.y,this.evolved('explosive')?120:85,this.elapsed);this.audio.play('verdict-pop');}else{this.burst(b.x,b.y,0xa58d73,10);this.impactRing(b.x,b.y,this.evolved('explosive')?120:85);}
                            for (const nearby of this.enemies)
                                if (nearby.active && Math.hypot(nearby.x - b.x, nearby.y - b.y) < (this.evolved('explosive')?120:85))
                                    this.hit(nearby, b.damage * (.6+this.evolution.power*.1), 22);
                        }
                        if (b.source!=='Crossfire'&&this.u('ricochet') && b.hit.size <= (this.evolved('ricochet')?2:1)) {
                            const target = this.enemies.find(n => n.active && !b.hit.has(n) && Math.hypot(n.x - b.x, n.y - b.y) < 180);
                            if (target) {
                                const a = Math.atan2(target.y - b.y, target.x - b.x);
                                if(this.hasSynergy('crossfire')&&b.pierce>0){if(b.hit.size===1){const split=this.shoot(b.x,b.y,a,b.damage*.55,false,0,false,false,'phantom','Crossfire');split?.hit.add(e);if(split&&this.hero==='gunner'){split.bounces=1;this.visuals.gunnerSkills.bounce(b.x,b.y,Math.atan2(b.vy,b.vx),a,this.elapsed);this.audio.play('ricochet-chime');}if(this.synergyClock<=0){this.synergyClock=.7;this.notifyCombat('CROSSFIRE · PIERCING SPLIT');}}}
                                else{if(this.hero==='gunner'){this.visuals.gunnerSkills.bounce(b.x,b.y,Math.atan2(b.vy,b.vx),a,this.elapsed);this.audio.play('ricochet-chime');}b.vx = Math.cos(a) * 650;b.vy = Math.sin(a) * 650;b.pierce++;b.bounces++;}
                            }
                        }
                        if (b.pierce-- <= 0) {
                            b.active = false;
                            break;
                        }
                    }
        }
    }
    updateDrops(dt: number) {
        if(this.bossMagnet?.active&&Math.hypot(this.x-this.bossMagnet.x,this.y-this.bossMagnet.y)<40)this.collectBossMagnet();
        for (const d of this.drops) {
            if (!d.active)
                continue;
            const dx = this.x - d.x, dy = this.y - d.y, dist = Math.hypot(dx, dy);
            const radius = BALANCE.magnet * (1 + this.u('magnet') * .3 + (d.gold ? this.meta('magnet') * .05 : 0));
            if (d.vacuum || dist < radius) {
                d.x += dx * Math.min(1,dt * 8);
                d.y += dy * Math.min(1,dt * 8);
            }
            if (dist < 22) {
                d.active = false;
                if (d.gold) {
                    this.stats.gold += d.value;
                    this.waveStats.gold += d.value;
                    this.save.gold += d.value;
                    this.audio.play('gold');
                }
                else {
                    this.xp += d.value;
                    this.audio.play('xp');
                }
            }
        }
        if (!(this.finiteRun&&this.stats.wave===10&&this.bossDefeated) && this.xp >= this.xpNeed) {
            this.xp -= this.xpNeed;
            this.level++;
            this.xpNeed = BALANCE.xpBase + (this.level - 1) * BALANCE.xpGrowth;

            this.paused = true;
            this.burst(this.x, this.y, 0x9ae4ed, 35);
            this.onChoice(false);
            return;
        }
    }
    render() {
        const g = this.gfx;this.warningGfx.clear();
        this.cameras.main.centerOn(this.x,this.y);
        this.drawWorld();
        g.clear();
        for(const m of this.reinforcementMarks){g.lineStyle(3,0x9ebad6,m.life/1.2);g.strokeCircle(m.x,m.y,18+8*(1.2-m.life));g.lineBetween(m.x-7,m.y,m.x+7,m.y);g.lineBetween(m.x,m.y-7,m.x,m.y+7);}
        for(const p of this.firePatches){g.fillStyle(0xbd7347,.18);g.fillCircle(p.x,p.y,45);g.lineStyle(2,0xd0a05c,.65);g.strokeCircle(p.x,p.y,30+Math.sin(this.elapsed*8)*5);}
        if(this.speedBurst>0){g.lineStyle(4,0xb7a5da,.45);g.lineBetween(this.x,this.y,this.x-Math.cos(this.angle)*65,this.y-Math.sin(this.angle)*65);}
        if(this.landmark&&!this.landmark.done&&this.landmark.kind==='cache')drawHealSupply(g,this.landmark.x,this.landmark.y,this.elapsed);
        if(this.landmark&&!this.landmark.done&&this.landmark.kind==='beacon'){const l=this.landmark;drawBeacon(g,l.x,l.y,this.elapsed,l.progress);}
        if(this.landmark&&!this.landmark.done&&this.landmark.kind==='patrol'){const l=this.landmark;g.fillStyle(0x588dc9);g.lineStyle(3,0x162c36);g.fillTriangle(l.x-19,l.y-18,l.x+19,l.y-18,l.x,l.y+24);g.strokeTriangle(l.x-19,l.y-18,l.x+19,l.y-18,l.x,l.y+24);}
        for(const c of this.supplies)if(c.active)drawSupply(g,c.x,c.y,this.elapsed);
        if(this.bossMagnet?.active)drawMagnet(g,this.bossMagnet.x,this.bossMagnet.y,this.elapsed);
        if(this.eventName==='Hold the zone'&&!this.zone.done){g.lineStyle(3,0x8caeac,.75);g.strokeCircle(this.zone.x,this.zone.y,140);g.lineStyle(6,0xc5b58d,.9);g.beginPath();g.arc(this.zone.x,this.zone.y,140,-Math.PI/2,-Math.PI/2+Math.PI*2*this.zone.progress/20);g.strokePath();}
        if(this.hazard){g.lineStyle(4,0x1e252a,.95);g.strokeCircle(this.hazard.x,this.hazard.y,67);g.lineStyle(2,0xca876e,.9);g.strokeCircle(this.hazard.x,this.hazard.y,63);g.fillStyle(0x9b5a38,this.hazard.time<1?.5:.12);g.fillCircle(this.hazard.x,this.hazard.y,63);}
        for (const d of this.drops)
            if (d.active) {
                if(d.vacuum){const a=Math.atan2(this.y-d.y,this.x-d.x);g.lineStyle(2,d.gold?0xffd16d:0x78d9dc,.5);g.lineBetween(d.x,d.y,d.x-Math.cos(a)*18,d.y-Math.sin(a)*18);}
                g.fillStyle(d.gold ? 0xffd16d : 0x78d9dc);
                if (d.gold)
                    g.fillCircle(d.x, d.y, 5);
                else
                    g.fillTriangle(d.x, d.y - 5, d.x - 4, d.y + 3, d.x + 4, d.y + 3);
            }
        for (const e of this.enemies) {
            const g=this.warningGfx;
            if (!e.active)
                continue;
            if(e.burn>0){g.lineStyle(2,0xd59a66,.75);g.strokeCircle(e.x,e.y,e.r+5+Math.sin(this.elapsed*14)*2);}
            if (e.type === 'elite') {
                g.lineStyle(2, [0xcfe2bc, 0xffa06b, 0x9fd58b, 0xc69edc, 0xf48499][e.mod], .25 + .12 * Math.sin(this.elapsed * 5));
                g.strokeCircle(e.x, e.y, e.r + 10 + (e.mod === 1 ? 15 : 0));
            }
            if (['elite','boss','shooterBoss','commander'].includes(e.type)) {
                g.lineStyle(2, 0xffca6d, .7);
                g.strokeCircle(e.x, e.y, e.r + 5);
                g.fillStyle(0x24222a);
                g.fillRect(e.x - 30, e.y - e.r - 15, 60, 5);
                g.fillStyle(0xff867f);
                g.fillRect(e.x - 30, e.y - e.r - 15, 60 * e.hp / e.max, 5);
            }
            if(e.type==='commander'&&e.commandTime>0){g.lineStyle(2,0x91a9d0,.65);g.strokeCircle(e.x,e.y,220);for(const n of this.enemies)if(n.active&&n!==e&&Math.hypot(n.x-e.x,n.y-e.y)<220){g.lineStyle(2,0x9bb2d1,.8);g.strokeCircle(n.x,n.y,n.r+7);}}
            if(e.telegraph>0&&['shooterBoss','commander'].includes(e.type)){if(e.type==='commander'){g.lineStyle(3,0x98b5d6,.8);g.strokeCircle(e.x,e.y,80+Math.sin(this.elapsed*8)*12);}else if(e.phase%3!==2){const aim=Math.atan2(e.targetY-e.y,e.targetX-e.x);for(const offset of e.phase%2===0?[0]:[-.5,0,.5]){g.lineStyle(3,0x1c2733,.9);g.lineBetween(e.x,e.y,e.x+Math.cos(aim+offset)*480,e.y+Math.sin(aim+offset)*480);g.lineStyle(1,0xc7ab7d,.9);g.lineBetween(e.x,e.y,e.x+Math.cos(aim+offset)*480,e.y+Math.sin(aim+offset)*480);}}continue;}
            if(e.telegraph>0&&e.type==='rifle')continue;
            if(e.telegraph>0&&['cleaver','spear'].includes(e.type)){
                const aim=Math.atan2(e.targetY-e.y,e.targetX-e.x),range=e.type==='spear'?155:110;
                if(e.type!=='cleaver'){g.lineStyle(6,0x142027,.9);g.lineBetween(e.x,e.y,e.x+Math.cos(aim)*range,e.y+Math.sin(aim)*range);g.lineStyle(2,0xc1967c,.9);g.lineBetween(e.x,e.y,e.x+Math.cos(aim)*range,e.y+Math.sin(aim)*range);}else{g.fillStyle(0xb88d77,.15);g.fillPoints([{x:e.x,y:e.y},...Array.from({length:12},(_,i)=>({x:e.x+Math.cos(aim-.95+i*1.9/11)*range,y:e.y+Math.sin(aim-.95+i*1.9/11)*range}))],true);}
                if(e.type==='spear'){g.lineStyle(2,0x91b7bf,.8);const sx=Math.sin(aim)*12,sy=-Math.cos(aim)*12;g.lineBetween(e.x+sx,e.y+sy,e.x+Math.cos(aim)*range+sx,e.y+Math.sin(aim)*range+sy);g.lineBetween(e.x-sx,e.y-sy,e.x+Math.cos(aim)*range-sx,e.y+Math.sin(aim)*range-sy);}else if(e.type==='cleaver'){const arc=1.9;g.lineStyle(3,0xc1967c,.9);g.beginPath();g.arc(e.x,e.y,range,aim-arc/2,aim+arc/2);g.strokePath();}continue;
            }
            if(e.type==='boss'&&e.telegraph>0){
                const phase=e.phase%3,remaining=Phaser.Math.Clamp(e.telegraph/1.15,0,1);
                if(phase===0){
                    // Pattern circles above are the exact damage footprint.
                }else if(phase===1){
                    g.lineStyle(5,0x182129,.9);g.strokeCircle(e.x,e.y,78);g.lineStyle(3,0xa8b58b,.9);g.strokeCircle(e.x,e.y,78);for(let i=0;i<4;i++){const a=i*Math.PI/2,r=85+12*(1-remaining),x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;g.lineBetween(x,y,x-Math.cos(a-.55)*14,y-Math.sin(a-.55)*14);g.lineBetween(x,y,x-Math.cos(a+.55)*14,y-Math.sin(a+.55)*14);}
                }else{
                    const a=Math.atan2(e.targetY-e.y,e.targetX-e.x),nx=-Math.sin(a)*70,ny=Math.cos(a)*70;
                    const points=[{x:e.x+nx,y:e.y+ny},{x:e.targetX+nx,y:e.targetY+ny},{x:e.targetX+Math.cos(a)*35,y:e.targetY+Math.sin(a)*35},{x:e.targetX-nx,y:e.targetY-ny},{x:e.x-nx,y:e.y-ny}];
                    g.fillStyle(0xc17d78,.12);g.fillPoints(points,true);g.lineStyle(7,0x182129,.95);g.strokePoints(points,true);g.lineStyle(2,0xc17d78,.95);g.strokePoints(points,true);
                    for(let i=1;i<=3;i++){const t=i/4,x=e.x+(e.targetX-e.x)*t,y=e.y+(e.targetY-e.y)*t;g.lineBetween(x,y,x-Math.cos(a-.6)*18,y-Math.sin(a-.6)*18);g.lineBetween(x,y,x-Math.cos(a+.6)*18,y-Math.sin(a+.6)*18);}
                }
                continue;
            }
            if(e.type==='abomination'&&e.telegraph>0){g.fillStyle(0xb65f99,.14);g.fillCircle(e.targetX,e.targetY,115);g.lineStyle(6,0x182129,.9);g.strokeCircle(e.targetX,e.targetY,115);g.lineStyle(3,0xc56da5,.95);g.strokeCircle(e.targetX,e.targetY,115);continue;}
            if (e.telegraph > 0) {
                g.lineStyle(6,0x182129,.95);g.strokeCircle(e.type==='boss'?e.targetX:e.x,e.type==='boss'?e.targetY:e.y,e.type==='boss'?115:e.type==='brute'?75:28);
                if(e.type==='boss'&&e.phase%3===2){g.lineStyle(12,0x182129,.8);g.lineBetween(e.x,e.y,e.targetX,e.targetY);g.lineStyle(4,0xbb796f,.95);g.lineBetween(e.x,e.y,e.targetX,e.targetY);}
                g.lineStyle(3, 0xc17d78, .95);
                g.strokeCircle(e.type === 'boss' ? e.targetX : e.x, e.type === 'boss' ? e.targetY : e.y, e.type === 'boss' ? 115 : e.type === 'brute' ? 75 : 28);
                g.fillStyle(0xff667b, .12);
                g.fillCircle(e.type === 'boss' ? e.targetX : e.x, e.type === 'boss' ? e.targetY : e.y, e.type === 'boss' ? 115 : 50);
            }
        }
        for(const mark of this.bossMarks){
            if(!mark.owner.active)continue;
            const g=this.warningGfx,progress=Phaser.Math.Clamp(1-mark.remaining/mark.delay,0,1);
            if(mark.remaining>0){
                g.fillStyle(mark.color,.09);g.fillCircle(mark.x,mark.y,mark.radius);
                g.lineStyle(5,0x14202a,.9);g.strokeCircle(mark.x,mark.y,mark.radius);
                g.lineStyle(2,mark.color,.95);g.strokeCircle(mark.x,mark.y,mark.radius);
                g.beginPath();g.arc(mark.x,mark.y,mark.radius-6,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);g.strokePath();
                if(mark.style!=='rally')for(const side of [-1,1]){g.lineBetween(mark.x+side*9,mark.y,mark.x+side*18,mark.y);g.lineBetween(mark.x,mark.y+side*9,mark.x,mark.y+side*18);}
            }else{
                const fade=Math.max(0,1+mark.remaining/.55),t=1-fade;
                g.lineStyle(3,mark.color,fade);g.strokeCircle(mark.x,mark.y,mark.radius*(.4+t*.6));
                for(let i=0;i<(mark.style==='reactor'?8:6);i++){
                    const a=i*Math.PI/(mark.style==='reactor'?4:3),r=mark.radius*.8;
                    const x=mark.x+Math.cos(a)*r,y=mark.y+Math.sin(a)*r;
                    if(mark.style==='rupture'){
                        g.fillStyle(mark.color,fade);g.fillTriangle(x-8,y,x+8,y,x+Math.cos(a)*9,y-30*Math.sin(t*Math.PI));
                        g.lineBetween(mark.x,mark.y,x,y);
                    }else if(mark.style==='reactor'){
                        g.lineBetween(mark.x+Math.cos(a)*12,mark.y+Math.sin(a)*12,x,y);
                        g.strokeRect(x-5,y-5-t*18,10,10);
                    }else if(mark.style==='mortar'){
                        g.lineBetween(x,y,x+Math.cos(a)*t*25,y+Math.sin(a)*t*25-20*t);
                    }else{g.strokeCircle(x,y,4+4*t);}
                }
            }
        }
        if(this.hitConfirm.time>0){const h=this.hitConfirm,w=this.warningGfx;w.lineStyle(h.crit?3:2,h.crit?0xe0c98b:0xc5d3c4,Math.min(1,h.time*5));for(const side of [-1,1]){w.lineBetween(h.x+side*5,h.y+side*5,h.x+side*10,h.y+side*10);w.lineBetween(h.x+side*5,h.y-side*5,h.x+side*10,h.y-side*10);}}
        if(this.enemies.filter(e=>e.active&&Math.hypot(e.x-this.x,e.y-this.y)<240).length>=10){const w=this.warningGfx,a=this.escapeAngle;w.lineStyle(2,0xa7b69a,.5);for(const distance of [65,83]){const x=this.x+Math.cos(a)*distance,y=this.y+Math.sin(a)*distance;w.lineBetween(x,y,x-Math.cos(a-.55)*8,y-Math.sin(a-.55)*8);w.lineBetween(x,y,x-Math.cos(a+.55)*8,y-Math.sin(a+.55)*8);}}
        if(this.hero==='tank')this.visuals.tankSkills.render({x:this.x,y:this.y,angle:this.angle,time:this.elapsed,weapon:this.weapon,swing:this.swing,sequence:this.attackSequence,stamina:this.stamina,lungs:this.u('stamina'),guard:this.u('block'),thorns:this.u('spikes'),reflect:!!this.u('reflect')},window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        if(this.hero==='gunner')this.visuals.gunnerSkills.render({x:this.x,y:this.y,angle:this.angle,time:this.elapsed,weapon:this.weapon,ammo:this.ammo,maxAmmo:this.maxAmmo,magazine:this.u('magazine'),quickHands:this.u('reload'),reload:this.reload,reloadDuration:this.reloadDuration,overdrive:this.overdrive},window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        if(this.hero==='samurai')this.visuals.samuraiSkills.render(this.x,this.y,this.elapsed,this.counter,.6+this.u('counter')*.3,
            {range:this.u('range'),bleed:this.u('bleed'),counter:this.u('counter')},
            {bleed:this.evolved('bleed'),counter:this.evolved('counter')},this.enemies,window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        for (const b of this.bullets)
            if (b.active) {
                if(this.hero==='gunner'&&!b.hostile&&b.kind==='phantom'&&b.source==='Crossfire'){this.visuals.gunnerSkills.round(b,this.weapon,this.elapsed,window.matchMedia('(prefers-reduced-motion: reduce)').matches);continue;}
                if(this.hero==='tank'&&!b.hostile&&b.reflected){this.visuals.tankSkills.reflectedRound(b,window.matchMedia('(prefers-reduced-motion: reduce)').matches);continue;}
                if(b.kind==='phantom'){g.lineStyle(4,0xbca4e0,.55);g.lineBetween(b.x,b.y,b.x-b.vx*.035,b.y-b.vy*.035);g.lineStyle(1,0xd7c7ee,.8);g.lineBetween(b.x,b.y,b.x-b.vx*.02,b.y-b.vy*.02);continue;}
                if(b.kind==='wind'){
                    if(this.hero==='samurai'){this.visuals.samuraiSkills.wind(b.x,b.y,b.vx,b.vy,this.elapsed,this.evolved('wind'),window.matchMedia('(prefers-reduced-motion: reduce)').matches);continue;}
                    const a=Math.atan2(b.vy,b.vx);for(let trail=2;trail>=0;trail--){const cx=b.x-Math.cos(a)*(30+trail*14),cy=b.y-Math.sin(a)*(30+trail*14);g.lineStyle(trail===0?8:4,trail===0?0x172229:0x7e9997,trail===0?.9:.25);g.beginPath();g.arc(cx,cy,48,a-1.1,a+1.1);g.strokePath();if(trail===0){g.lineStyle(3,0xa1bbb5,.9);g.beginPath();g.arc(cx,cy,48,a-1.1,a+1.1);g.strokePath();}}continue;
                }
                if(!b.hostile&&this.evolution.reach){g.lineStyle(2,0x8caaa9,.7);g.lineBetween(b.x-b.vx*.03,b.y-b.vy*.03,b.x-b.vx*.065,b.y-b.vy*.065);}
                if(!b.hostile&&this.evolution.power){const a=Math.atan2(b.vy,b.vx);g.lineStyle(4,0xd69b63,.65);g.lineBetween(b.x,b.y,b.x-Math.cos(a)*19,b.y-Math.sin(a)*19);}
                if(this.hero==='gunner'&&!b.hostile&&b.kind==='round'){this.visuals.gunnerSkills.round(b,this.weapon,this.elapsed,window.matchMedia('(prefers-reduced-motion: reduce)').matches);continue;}
                if(b.explosive){g.lineStyle(2,0xad9479,.9);g.strokeCircle(b.x,b.y,5);}
                const tail=b.hostile?.025:this.weapon==='shotgun'?.009:this.weapon==='smg'?.013:.023;
                g.lineStyle(b.hostile?8:5,0x141820,.9);g.lineBetween(b.x,b.y,b.x-b.vx*tail,b.y-b.vy*tail);
                g.lineStyle(b.hostile?4:this.weapon==='shotgun'?2:1.5,b.hostile?(this.stats.wave>=11?0x67e8ff:0xc58ce9):WEAPON_EFFECTS[this.weapon].color,.9);g.lineBetween(b.x,b.y,b.x-b.vx*tail,b.y-b.vy*tail);
                if(!b.hostile){g.fillStyle(WEAPON_EFFECTS[this.weapon].color,.9);g.fillCircle(b.x,b.y,this.weapon==='shotgun'?2.5:1.5);}
            }
        for (const p of this.particles)
            if (p.active) {
                g.fillStyle(p.color, p.life / p.max);
                g.fillCircle(p.x, p.y, p.size * p.life / p.max);
            }
        const color = HEROES[this.hero].color;
        g.fillStyle(0x040b12, .6);
        g.fillEllipse(this.x, this.y + 17, 44, 18);
        this.visuals.render(this.enemies, this.hero, this.weapon, this.x, this.y, this.angle, this.elapsed, this.swing, this.dash, this.invuln, this.hero === 'tank' && this.weapon!=='hammer' && this.attacking && this.stamina > 0, this.counter, this.ammo,this.attackSequence,1+this.u('range')*.25,1+this.u('wide')*.25,{reload:this.reload,reloadDuration:this.reloadDuration,overdrive:this.overdrive});
        this.visuals.passiveSkills(this.hero,this.x,this.y,this.angle,this.elapsed,this.u('fire'),this.evolved('fire'),this.clone,this.evolved('clone'),this.tick);
        if (this.u('orbit')) {
            for(const offset of this.evolved('orbit')?[0,Math.PI]:[0]){const a = this.elapsed * 3+offset;
            const x=this.x+Math.cos(a)*95,y=this.y+Math.sin(a)*95,angle=a+Math.PI/2;
            const point=(f:number,v:number)=>({x:x+Math.cos(angle)*f-Math.sin(angle)*v,y:y+Math.sin(angle)*f+Math.cos(angle)*v});
            const blade=[point(17,0),point(3,6),point(-1,0),point(3,-6)];
            g.fillStyle(0xadbcc5);g.fillPoints(blade,true);g.lineStyle(2,0x17222d,.95);g.strokePoints(blade,true);
            const tip=point(16,0),ridge=point(2,0);g.lineStyle(1,0xd0d8ce,.9);g.lineBetween(tip.x,tip.y,ridge.x,ridge.y);
            const grip=point(-10,0),guard=point(-1,0);g.lineStyle(5,0x19242e);g.lineBetween(grip.x,grip.y,guard.x,guard.y);
            for(let i=0;i<3;i++){const l=point(-3-i*3,-2),r=point(-4-i*3,2);g.lineStyle(1,0x8e849e);g.lineBetween(l.x,l.y,r.x,r.y);}
            const ring=point(-14,0);g.lineStyle(2,0xa7b4bf);g.strokeCircle(ring.x,ring.y,3.5);if(this.evolved('orbit')){g.lineStyle(3,0xb2a4d2,.45);g.lineBetween(x,y,x-Math.cos(angle)*28,y-Math.sin(angle)*28);}}
        }
        this.visuals.showDecoy(this.hero,this.decoy);
        if(this.earlyPower){const w=this.warningGfx,color=({ninja:0xb9a1f2,samurai:0xffb279,gunner:0xffd16c,tank:0x84e1da})[this.hero];const pose=this.hero==='gunner'&&isGunnerWeapon(this.weapon)?gunnerWeaponPose(this.weapon,this.x,this.y,this.angle,1-this.swing/WEAPON_EFFECTS[this.weapon].duration,this.swing>0,this.weapon==='pistols'&&this.attackSequence%2===1,{reload:this.reload,reloadDuration:this.reloadDuration,overdrive:this.overdrive}):weaponPose(this.weapon,this.x,this.y,this.angle,this.swing,this.swing>0,this.attackSequence,false,false,1+this.u('range')*.25,1+this.u('wide')*.25);w.fillStyle(color,.28+.15*Math.sin(this.elapsed*5));w.fillCircle(pose.tip.x,pose.tip.y,5);}

        if(this.decoy){g.fillStyle(0x7d78a4,.35);g.fillEllipse(this.decoy.x,this.decoy.y,36,44);g.lineStyle(2,0xaba3c0,.6);g.strokeCircle(this.decoy.x,this.decoy.y,25);}
        this.visuals.evolutionDetails(this.evolution,this.swing,this.elapsed);
        this.visuals.applyCosmetics(cosmeticColor(this.save,'character',this.hero),cosmeticColor(this.save,'weapon',this.weapon),this.invuln>0&&this.dash<=0);
        if(this.hero==='ninja')this.visuals.ninjaUltimate(this.x,this.y,this.dashX,this.dashY,this.elapsed,this.dash>0,!!this.u('trail'),this.evolved('trail'));
        if(this.dash>0&&this.hero!=='ninja'&&!(this.hero==='samurai'&&this.u('dragon-slash'))){g.lineStyle(5,color,.5);g.lineBetween(this.x,this.y,this.x-this.dashX*65,this.y-this.dashY*65);}
        if(this.boostSpeed>0){g.lineStyle(3,0x829fa9,.8);for(let i=0;i<3;i++)g.lineBetween(this.x-20-i*8,this.y+10,this.x-28-i*8,this.y+10);}
        if (this.countdown > 0) {
            const camera = this.cameras.main;
            const width = camera.width / camera.zoom, height = camera.height / camera.zoom;
            g.fillStyle(0x0a101d, .18);
            g.fillRect(this.x-width/2-2, this.y-height/2-2, width+4, height+4);
        }
    }
}
