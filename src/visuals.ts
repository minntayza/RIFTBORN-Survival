import {COMMAND_ATLAS,commandCanvas} from './cute-command';
import {OFFICER_ATLAS,hordeAtlas,isCuteHorde,hordeCanvas,cuteRifleHandsCanvas,rifleHandPose} from './cute-horde';
import {cachedCanvas} from './texture-cache';
import {NINJA_ATTACK_ATLAS,NINJA_WEAPONS_ATLAS,ninjaAttackPart,ninjaSwordCanvas,ninjaWeaponCanvas} from './ninja-attack-art';
import {ninjaArm} from './ninja-arm';
import {CUTE_ATLAS,cuteCanvas,cuteArmCanvas} from './cute-trio';
import {bossAction,type BossAction} from './boss-motion';
import {ROBOTS,ROBOT_ROLES,robotCanvas,robotMovementType,type EnemyFaction} from './robot-enemies';
import {advanceZombieRig,isRigZombie,zombieVisualScale,type RigState} from './zombie-rig';
import {WALK_FRAMES} from './zombie-walk';
import {WEAPON_EFFECTS,weaponPose,isGun} from './weapon-effects';
import Phaser from 'phaser';
import {zombieWalkCanvases,zombieSpriteLocation,minifiedZombieCanvas,zombieBossCanvas} from './zombie-sprites';
import { actorCanvas, weaponCanvas } from './art';
import { HEROES, WEAPONS, ENEMIES, type HeroId, type WeaponId, type EnemyId } from './config';
type EnemyVisual = {
    skillAge?:number;
    skillWindup?:number;
    skillAction?:BossAction;
    active: boolean;
    x: number;
    y: number;
    type: EnemyId;
    faction?:EnemyFaction;
    r: number;
    flash: number;
    telegraph: number;
    targetX?:number;
    targetY?:number;
    mod: number;
    stagger?:number;
    shotKick?:number;
    phase?:number;
    chargeTime?:number;
    hp: number;
    max: number;
};
export class ArenaVisuals {
    veteran(){this.hero.setTint(0xd7c8ac);}
    private decoyImage!:Phaser.GameObjects.Image;
    showDecoy(hero:HeroId,decoy:{x:number;y:number;angle:number}|undefined){this.decoyImage.setVisible(!!decoy);if(decoy)this.decoyImage.setTexture(hero==='ninja'?'cute-ninja-full':`hero-${hero}-0`).setPosition(decoy.x,decoy.y).setRotation(hero==='ninja'?0:decoy.angle).setTint(0x8d86ae).setAlpha(.45);}
    private shieldFx!:Phaser.GameObjects.Graphics;
    private attackFx!:Phaser.GameObjects.Graphics;
    private tipTrail:{x:number;y:number}[]=[];
    private secondTrail:{x:number;y:number}[]=[];
    private lastSequence=-1;
    private accents!:Phaser.GameObjects.Graphics;
    evolutionDetails(e:{reach:number;power:number;tempo:number},swing:number,time:number){
        const g=this.accents;g.clear();const w=this.weapon,x=w.x,y=w.y,a=w.rotation;
        if(e.reach||e.power||e.tempo){g.lineStyle(2,e.power?0xb99c79:e.reach?0x8caead:0xb1a6c0,.9);g.lineBetween(x-Math.sin(a)*5,y+Math.cos(a)*5,x+Math.sin(a)*5,y-Math.cos(a)*5);g.strokeCircle(x,y,4);}
        if(e.tempo&&swing>0){for(let i=1;i<=2;i++){const aa=a-i*.17;g.lineStyle(2,0xa79fb8,.5-i*.12);g.lineBetween(x,y,x+Math.cos(aa)*32,y+Math.sin(aa)*32);}}
    }
    private ninjaBones:Phaser.GameObjects.Image[]=[];
    private ninjaArmFx!:Phaser.GameObjects.Graphics;
    private cuteArms:Phaser.GameObjects.Image[]=[];
    private hero: Phaser.GameObjects.Image;
    private weapon: Phaser.GameObjects.Image;
    private offhand: Phaser.GameObjects.Image;
    private enemies = new WeakMap<EnemyVisual, Phaser.GameObjects.Image>();
    private walking = new WeakMap<EnemyVisual,RigState>();
    private rifleHands = new WeakMap<EnemyVisual,Phaser.GameObjects.Image>();
    private shadows = new WeakMap<EnemyVisual, Phaser.GameObjects.Ellipse>();
    private ghosts: {
        size:number;
        image: Phaser.GameObjects.Image;
        expires: number;
    }[] = [];
    private afterimages: {
        image: Phaser.GameObjects.Image;
        expires: number;
    }[] = [];
    private lastGhost = 0;
    private lastX = 600;
    private lastY = 380;
    constructor(private scene: Phaser.Scene) {
        this.ninjaArmFx=scene.add.graphics().setDepth(3.15);
        this.shieldFx=scene.add.graphics().setDepth(.9);
        this.attackFx=scene.add.graphics().setDepth(3.3);
        this.accents=scene.add.graphics().setDepth(3.4);
        for (const id of Object.keys(HEROES) as HeroId[])
            for (let f = 0; f < 3; f++)
                if(!scene.textures.exists(`hero-${id}-${f}`))scene.textures.addCanvas(`hero-${id}-${f}`, actorCanvas('hero', id, f));
        if(!scene.textures.exists('enemy-rifle-hands'))scene.textures.addCanvas('enemy-rifle-hands',cuteRifleHandsCanvas(scene.textures.get(OFFICER_ATLAS.key).getSourceImage() as HTMLImageElement));
        for (const id of Object.keys(WEAPONS) as WeaponId[])
            if(!scene.textures.exists(`weapon-${id}`))scene.textures.addCanvas(`weapon-${id}`, weaponCanvas(id));
        const attackSource=scene.textures.get(NINJA_ATTACK_ATLAS.key).getSourceImage() as HTMLImageElement;
        for(const part of ['upper','forearm','hand'] as const){
            if(!scene.textures.exists(`ninja-${part}`))scene.textures.addCanvas(`ninja-${part}`,ninjaAttackPart(attackSource,part));
        }
        const ninjaWeapons=scene.textures.get(NINJA_WEAPONS_ATLAS.key).getSourceImage() as HTMLImageElement;
        for(const id of ['dual','kama'] as const)if(!scene.textures.exists(`ninja-${id}`))scene.textures.addCanvas(`ninja-${id}`,ninjaWeaponCanvas(ninjaWeapons,id));
        if(!scene.textures.exists('ninja-katana'))scene.textures.addCanvas('ninja-katana',ninjaSwordCanvas(attackSource));
        for(let side=0;side<2;side++)for(const part of ['upper','forearm','hand'] as const)this.ninjaBones.push(scene.add.image(0,0,`ninja-${part}`).setVisible(false).setDepth(part==='hand'?3.21:3.14));
        const cuteSource=scene.textures.get(CUTE_ATLAS.key).getSourceImage() as HTMLImageElement;
        if(!scene.textures.exists('cute-ninja-full'))scene.textures.addCanvas('cute-ninja-full',cuteCanvas(cuteSource,'ninja',0,0,true));
        for(const part of ['leftArm','rightArm'] as const){
            const key=`cute-ninja-${part}`;if(!scene.textures.exists(key))scene.textures.addCanvas(key,cuteArmCanvas(cuteSource,part));
            this.cuteArms.push(scene.add.image(0,0,key).setVisible(false).setDepth(3.2));
        }
        this.decoyImage=scene.add.image(0,0,'hero-ninja-0').setVisible(false).setDepth(2).setDisplaySize(78,78);
        this.hero = scene.add.image(600, 380, 'hero-ninja-0').setDepth(3).setDisplaySize(78, 78);
        this.weapon = scene.add.image(600, 380, 'weapon-katana').setDepth(3.2);
        this.offhand = scene.add.image(600, 380, 'weapon-katana').setDepth(3.1).setVisible(false);
    }
    prepareTexture(key:string){
        const textures=this.scene.textures;if(textures.exists(key))return;
        const canvas=cachedCanvas(key,()=>{
            if(key.endsWith('-small')){const full=key.slice(0,-6);this.prepareTexture(full);return minifiedZombieCanvas(textures.get(full).getSourceImage() as HTMLCanvasElement);}
            const frame=Number(key.slice(key.lastIndexOf('-')+1));
            if(key.startsWith('cute-')){
                const id=key.split('-')[1] as 'ninja'|'wanderer'|'pulse';
                return cuteCanvas(textures.get(CUTE_ATLAS.key).getSourceImage() as HTMLImageElement,id,frame===0?0:(frame-1)%24/24,frame===0?0:frame>24?.4:1,id!=='ninja');
            }
            if(key.startsWith('robot-unit-')){const type=key.split('-')[2] as EnemyId;return robotCanvas(ROBOT_ROLES[type],frame,undefined,type);}
            if(key.startsWith('skill-')){
                const [,faction,type,action]=key.split('-');
                if(faction==='zombie'&&(type==='boss'||type==='commander'))return commandCanvas(textures.get(COMMAND_ATLAS.key).getSourceImage() as HTMLImageElement,type,frame,action as BossAction);
                return faction==='robot'?robotCanvas(ROBOT_ROLES[type as EnemyId],frame,action as BossAction,type as EnemyId):zombieBossCanvas(type as 'boss'|'commander'|'shooterBoss',action as BossAction,frame);
            }
            const id=key.split('-')[1] as EnemyId;
            if(id==='boss'||id==='commander')return commandCanvas(textures.get(COMMAND_ATLAS.key).getSourceImage() as HTMLImageElement,id,frame);
            if(isCuteHorde(id))return hordeCanvas(textures.get(hordeAtlas(id).key).getSourceImage() as HTMLImageElement,id,frame);
            return zombieSpriteLocation(id)?zombieWalkCanvases(textures.get(CUTE_ATLAS.key).getSourceImage() as HTMLImageElement,id)![frame]:actorCanvas('enemy',id,frame);
        });
        textures.addCanvas(key,canvas);
    }
    defeat() { this.hero.setRotation(this.hero.rotation + 1.2).setAlpha(.5).setScale(.5); this.weapon.setVisible(false); this.offhand.setVisible(false);this.cuteArms.forEach(arm=>arm.setVisible(false));this.ninjaArmFx.clear();this.ninjaBones.forEach(bone=>bone.setVisible(false)); }
    death(e: EnemyVisual, time: number) { const key=e.faction==='robot'?(e.type==='spitter'?'cute-pulse-0':`robot-unit-${e.type}-0`):(e.type==='basic'?'cute-wanderer-0':`enemy-${e.type}-0`);const size=e.r*3.4*zombieVisualScale(e.type,this.scene.cameras.main.zoom);let slot = this.ghosts.find(s => s.expires <= time); if (!slot) {
        if (this.ghosts.length >= 24)
            return;
        this.prepareTexture(key);
        slot = { image: this.scene.add.image(0, 0, key).setDepth(1), size, expires: 0 };
        this.ghosts.push(slot);
    } this.prepareTexture(key);slot.size=size;slot.expires = time + .55; slot.image.setTexture(key).setPosition(e.x, e.y).setRotation(.7).setDisplaySize(size,size).setAlpha(.7).setTint(0x778b81).setVisible(true); }
    render(enemies: EnemyVisual[], hero: HeroId, weapon: WeaponId, x: number, y: number, angle: number, time: number, swing: number, dash: number, invuln: number, blocking: boolean, counter: number, ammo: number, sequence=0,reach=1,arcScale=1) {
        const moved = Math.hypot(x - this.lastX, y - this.lastY) > .2, frame = moved ? 1 + Math.floor(time * 10) % 2 : 0;
        this.lastX = x;
        this.lastY = y;
        if(hero==='ninja')this.prepareTexture(`cute-ninja-${moved?1+Math.floor(time*10)%24:0}`);
        this.hero.setTexture(hero==='ninja'?`cute-ninja-${moved?1+Math.floor(time*10)%24:0}`:`hero-${hero}-${frame}`).setPosition(x, y).setRotation(hero==='ninja'?0:angle).setFlipX(hero==='ninja'&&Math.cos(angle)<0).setAlpha(invuln > 0 ? .75 : 1);
        this.hero.setDisplaySize(78,hero==='ninja'?78:78+Math.sin(time*3)*.8);
        this.hero.clearTint();
        if (invuln > 0 && dash <= 0)
            this.hero.setTint(0xffb1b8);
        const duration=WEAPON_EFFECTS[weapon].duration,progress=Math.max(0,Math.min(1,swing/duration)),phase=1-progress,active=swing>0;
        const pose=weaponPose(weapon,x,y,angle,phase,active&&(weapon!=='pistols'||sequence%2===0),sequence,false,blocking,reach,arcScale,hero==='ninja');
        this.weapon.setTexture(hero==='ninja'?`ninja-${weapon}`:`weapon-${weapon}`).setOrigin(pose.originX,pose.originY).setDisplaySize(pose.size,pose.size).setPosition(pose.grip.x,pose.grip.y).setRotation(pose.rotation).setAlpha(1);
        const dual=weapon==='dual'||weapon==='pistols';this.offhand.setVisible(dual);
        const other=weaponPose(weapon,x,y,angle,phase,active&&(weapon!=='pistols'||sequence%2!==0),sequence,true,false,reach,arcScale,hero==='ninja');
        if(dual)this.offhand.setTexture(hero==='ninja'?`ninja-${weapon}`:`weapon-${weapon}`).setOrigin(other.originX,other.originY).setDisplaySize(other.size,other.size).setPosition(other.grip.x,other.grip.y).setRotation(other.rotation);
        this.cuteArms.forEach(arm=>arm.setVisible(false));
        this.ninjaArmFx.clear();this.ninjaBones.forEach(bone=>bone.setVisible(false));
        if(hero==='ninja'){
            const g=this.ninjaArmFx,flip=Math.cos(angle)<0?-1:1;
            for(let index=0;index<2;index++){
                const shoulder={x:x+(index===0?8:-9)*flip,y:y+5};
                const target=index===0?pose.grip:dual?other.grip:{x:x-12*flip,y:y+21};
                const rig=ninjaArm(shoulder,target,index===0?flip:-flip);
                const upper=this.ninjaBones[index*3],forearm=this.ninjaBones[index*3+1],hand=this.ninjaBones[index*3+2];
                const segments=[[upper,rig.shoulder,rig.elbow,10,16],[forearm,rig.elbow,rig.hand,9,17]] as const;
                for(const [sprite,a,b,width,height] of segments)sprite.setVisible(true).setOrigin(.5,.1).setPosition(a.x,a.y).setDisplaySize(width,height).setRotation(Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2).setAlpha(this.hero.alpha);
                hand.setVisible(true).setOrigin(.5,.5).setPosition(rig.hand.x,rig.hand.y).setDisplaySize(10,10).setRotation(index===0?pose.rotation+Math.PI/2:dual?other.rotation+Math.PI/2:0).setAlpha(this.hero.alpha);
            }
        }
        this.attackFx.clear();
        if(sequence!==this.lastSequence||!active){this.tipTrail=[];this.secondTrail=[];this.lastSequence=sequence;}
        if(active&&isGun(weapon)&&phase<.6){
            const muzzle=weapon==='pistols'&&sequence%2===1?other:pose,g=this.attackFx,color=WEAPON_EFFECTS[weapon].color,length=weapon==='shotgun'?17:weapon==='smg'?7:10;
            for(const spread of weapon==='shotgun'?[-.5,0,.5]:[-.25,.25]){g.lineStyle(3,0x15222a,.9);g.lineBetween(muzzle.tip.x,muzzle.tip.y,muzzle.tip.x+Math.cos(angle+spread)*length,muzzle.tip.y+Math.sin(angle+spread)*length);g.lineStyle(1.5,color,.8);g.lineBetween(muzzle.tip.x,muzzle.tip.y,muzzle.tip.x+Math.cos(angle+spread)*length,muzzle.tip.y+Math.sin(angle+spread)*length);}
        }
        if(hero==='ninja'&&(phase<.26||phase>.64)){this.tipTrail=[];this.secondTrail=[];}
        if(active&&!isGun(weapon)&&(hero!=='ninja'||phase>=.26&&phase<=.64)){
            this.tipTrail.push(pose.tip);if(this.tipTrail.length>12)this.tipTrail.shift();if(weapon==='dual'){this.secondTrail.push(other.tip);if(this.secondTrail.length>10)this.secondTrail.shift();}
            const g=this.attackFx,color=WEAPON_EFFECTS[weapon].color;
            const stroke=(pts:{x:number;y:number}[],width:number)=>{if(pts.length<2)return;if(hero!=='ninja'){g.lineStyle(width+3,0x111d26,.8);g.strokePoints(pts,false);}g.lineStyle(hero==='ninja'?width+1:width,hero==='ninja'?0xdcc1ff:color,hero==='ninja'?.6:.75*progress+.15);g.strokePoints(pts,false);};
            if(weapon==='shield'||weapon==='spiked'){g.lineStyle(3,color,.75);g.lineBetween(pose.tip.x-Math.sin(angle)*16,pose.tip.y+Math.cos(angle)*16,pose.tip.x+Math.sin(angle)*16,pose.tip.y-Math.cos(angle)*16);if(weapon==='spiked')for(let i=-1;i<=1;i++){const px=pose.tip.x-Math.sin(angle)*i*12,py=pose.tip.y+Math.cos(angle)*i*12;g.lineBetween(px,py,px+Math.cos(angle)*8,py+Math.sin(angle)*8);}}
            else if(weapon==='hammer'){stroke(this.tipTrail,5);g.lineStyle(2,color,.6);g.strokeCircle(pose.tip.x,pose.tip.y,8);}
            else if(weapon==='cursed'){stroke(this.tipTrail,4);for(let i=2;i<this.tipTrail.length;i+=3){const p=this.tipTrail[i];g.lineStyle(1,0xb18791,.7);g.lineBetween(p.x-4,p.y-4,p.x+5,p.y+3);}}
            else if(weapon==='kama'){stroke(this.tipTrail,3);if(hero!=='ninja'){g.lineStyle(2,color,.7);g.beginPath();g.arc(pose.tip.x,pose.tip.y,11,pose.rotation-.5,pose.rotation+2);g.strokePath();}}
            else{stroke(this.tipTrail,weapon==='nodachi'?5:weapon==='naginata'?4:2);if(weapon==='dual')stroke(this.secondTrail,2);}
        }
        if (dash > 0 && time - this.lastGhost > .045) {
            this.lastGhost = time;
            let s = this.afterimages.find(s => s.expires <= time);
            if (!s) {
                s = { image: this.scene.add.image(x, y, `hero-${hero}-${frame}`).setDepth(2), expires: 0 };
                this.afterimages.push(s);
            }
            s.expires = time + .22;
            s.image.setTexture(hero==='ninja'?'cute-ninja-full':`hero-${hero}-${frame}`).setPosition(x, y).setDisplaySize(78, 78).setRotation(hero==='ninja'?0:angle).setTint(HEROES[hero].color).setVisible(true);
        }
        for (const s of this.afterimages) {
            const left = s.expires - time;
            s.image.setVisible(left > 0).setAlpha(Math.max(0, left / .22) * .4);
        }
        for (const s of this.ghosts) {
            const left = s.expires - time;
            s.image.setVisible(left > 0).setAlpha(Math.max(0, left / .55) * .65);
            if (left > 0)
                s.image.setRotation(.7+(1-left/.55)*.9).setDisplaySize(s.size,s.size*Math.max(.35,left/.55));
        }
        this.shieldFx.clear();
        for (const e of enemies) {
            let sprite = this.enemies.get(e), shadow = this.shadows.get(e);
            if (!e.active) {
                this.rifleHands.get(e)?.setVisible(false);
                this.walking.delete(e);
                sprite?.setVisible(false);
                shadow?.setVisible(false);
                continue;
            }
            if (!sprite) {
                sprite = this.scene.add.image(e.x, e.y, 'hero-ninja-0').setDepth(2);
                shadow = this.scene.add.ellipse(e.x, e.y + 12, e.r * 2.3, e.r, 0x020713, .45).setDepth(.8);
                this.enemies.set(e, sprite);
                this.shadows.set(e, shadow!);
            }
            const locked=(e.telegraph>0||!!e.chargeTime)&&['cleaver','spear','rifle','shooterBoss','boss'].includes(e.type);
            const targetAngle=Math.atan2((locked?e.targetY??y:y)-e.y,(locked?e.targetX??x:x)-e.x);
            let gait=e.telegraph>0?0:1+Math.floor(time*(e.type==='runner'?15:6)+e.x*.01)%2,rotation=targetAngle;
            const robot=e.faction==='robot',rig=robot||isRigZombie(e.type),small=this.scene.cameras.main.zoom<.8;
            let flip=false;
            if(robot||isRigZombie(e.type)){
                let state=this.walking.get(e);
                if(!state){const side=x<e.x?-1:1;state={x:e.x,y:e.y,time,phase:0,moving:0,facing:side,candidate:side,held:0};this.walking.set(e,state);}
                const walk=advanceZombieRig(state,robotMovementType(e.type),e.x,e.y,time,e.r,x-e.x,y-e.y,e.telegraph>0||!!e.chargeTime||!!e.stagger||e.flash>0);
                gait=walk.level===1&&walk.frame>0?walk.frame+WALK_FRAMES:walk.frame;rotation=0;flip=walk.facing<0;
            }
            if(!robot&&isRigZombie(e.type)&&e.telegraph>0){
                const duration=['boss','commander'].includes(e.type)?1.15:e.type==='brute'?.7:e.type==='spitter'?.75:.9;
                gait=49+Math.min(11,Math.floor((1-Math.min(1,e.telegraph/duration))*12));
            }
            if(!robot&&e.type==='shooterBoss'){rotation=0;flip=x<e.x;}
            const camera=this.scene.cameras.main,zoom=camera.zoom,visualScale=zombieVisualScale(e.type,zoom)*(robot?1.15:1),size=e.r*3.4*visualScale;
            const px=rig&&small?Math.round((e.x-camera.worldView.x)*zoom)/zoom+camera.worldView.x:e.x;
            const py=rig&&small?Math.round((e.y-camera.worldView.y)*zoom)/zoom+camera.worldView.y:e.y;
            const cute=(!robot&&e.type==='basic')||(robot&&e.type==='spitter');
            const texture=cute?`cute-${robot?'pulse':'wanderer'}-${Math.min(48,gait)}${small?'-small':''}`:`${robot?'robot-unit-'+e.type:'enemy-'+e.type}-${gait}${rig&&small?'-small':''}`;
            this.prepareTexture(texture);
            sprite.setVisible(true).setTexture(texture).setPosition(px,py).setDisplaySize(size,size).setRotation(cute?0:rotation).setFlipX(flip);
            if(e.skillAction&&e.skillAge!==undefined&&e.skillWindup&&e.skillAge<e.skillWindup+.65){
                const f=Math.min(35,Math.floor(e.skillAge/(e.skillWindup+.65)*35));
                const texture=`skill-${robot?'robot':'zombie'}-${e.type}-${e.skillAction}-${f}${small?'-small':''}`;this.prepareTexture(texture);
                sprite.setTexture(texture).setRotation(0).setFlipX(!robot&&(e.type==='boss'||e.type==='commander')?(e.targetX??x)<e.x:x<e.x);
            }
            sprite.setDepth(2+Math.atan((e.y+e.r)/1000)*.1);
            if(e.type==='rifle'&&!robot){
                let hands=this.rifleHands.get(e);if(!hands){hands=this.scene.add.image(e.x,e.y,'enemy-rifle-hands');this.rifleHands.set(e,hands);}
                const handPose=rifleHandPose(e.shotKick??0,flip?-1:1);
                hands.setVisible(true).setPosition(px+(handPose.x-64)*size/128,py).setRotation(handPose.angle).setFlipX(flip).setDisplaySize(size,size).setDepth(sprite.depth+.01);
            }else this.rifleHands.get(e)?.setVisible(false);
            if(e.flash>0&&!rig){sprite.rotation+=Math.sin(e.flash/.12*Math.PI)*.14;sprite.setDisplaySize(size*.96,size*1.04);}
            if(e.telegraph>0&&e.type==='cleaver'&&!robot)sprite.rotation+=(e.telegraph/.8-.5)*1.3;
            if(e.telegraph>0&&e.type==='spear'){const a=Math.atan2((e.targetY??y)-e.y,(e.targetX??x)-e.x),pull=e.telegraph/.8*6;sprite.setPosition(e.x-Math.cos(a)*pull,e.y-Math.sin(a)*pull);}
            if(e.type==='boss'&&e.telegraph>0&&!rig){
                // Wind up the illustrated body; extra procedural arms would cover
                // the General's actual mutated arm and disconnect it from the pose.
                const phase=(e.phase??0)%3,p=Math.max(0,Math.min(1,1-e.telegraph/1.15));
                if(phase!==2){sprite.setDisplaySize(e.r*3.4*(1+p*.06),e.r*3.4*(1-p*.05));sprite.rotation+=Math.sin(p*Math.PI)*.08;}
                else sprite.setDisplaySize(e.r*3.6,e.r*3.15);
            }
            if(e.shotKick&&!(e.type==='rifle'&&!robot)){const a=targetAngle;sprite.x-=Math.cos(a)*e.shotKick*25;sprite.y-=Math.sin(a)*e.shotKick*25;}
            sprite.clearTint();
            if (e.flash > 0)
                rig?sprite.setTint(0xffc8ba):sprite.setTintFill(0xa9b0a5);
            else if (e.type === 'elite'&&!robot)
                sprite.setTint([0xd3e4c6, 0xffa078, 0xc2efad, 0xd4b3e8, 0xff858d][e.mod]);
            if(robot&&ROBOT_ROLES[e.type]==='shield'){
                this.shieldFx.lineStyle(1.5,0x70cbda,.24);
                this.shieldFx.strokeEllipse(e.x,e.y,230,155);
            }
            shadow!.setVisible(true).setPosition(e.x, e.y + e.r * .6*visualScale).setDisplaySize(e.r * 2.3*visualScale, e.r*visualScale);
            if (e.type === 'spitter' && e.telegraph > 0)
                sprite.setTint(robot?0xb5f4ff:0xddc5ef);
        }
        if (counter > 0)
            this.weapon.setRotation(angle - .5);
    }
}
