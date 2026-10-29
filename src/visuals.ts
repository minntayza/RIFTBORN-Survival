import type {ArenaScene} from './combat';
import {LethweiRig} from './lethwei-rig';
import {PyusawhtiRig} from './pyusawhti-rig';
import {KyansitthaRig} from './kyansittha-rig';
import {FUTURE_ARMS,registerFutureArms} from './future-ghost-arms';
import {ANCIENT_ARMS,registerAncientArms} from './ancient-shadow-arms';
import {ninjaCosmeticPose,ninjaCosmeticShoulder,ninjaOutfitFit} from './ninja-cosmetic-pose';
import {colorfulCharacter,outlinedWeapon} from './equipment-presentation';
import {survivorArmOverscan} from './survivor-redesign';
import {gameplayArtwork} from './gameplay-art';
import {isRedesignedSurvivor,survivorShoulder,survivorEquipmentPose,survivorArmPose} from './survivor-redesign';
import {tankSkillWeaponPose,tankMotionPoint,type TankMotion} from './tank-active-motion';
import {tankEquipmentPose,tankArmPose,isRedesignedTank} from './tank-redesign';
import {ZawgyiRig} from './zawgyi-rig';
import {tankOutfitShoulder} from './tank-arm-art';
import {tankSkinArm} from './tank-cosmetics';
import {gunnerSkinArm} from './gunner-cosmetics';
import {imageSourceUrl} from './texture-cache';
import {NINJA_SKIN_KEY,ninjaSkinWeaponCanvas,ninjaSkinCanvas,ninjaSkinArm} from './ninja-cosmetics';
import {TankSkillEffects} from './tank-skill-fx';
import {GunnerSkillEffects} from './gunner-skill-fx';
import {SamuraiSkillEffects} from './samurai-skill-fx';
import {awakenWeaponCanvas,type WeaponElement} from './weapon-awakening-art';
import {CONNECTED_ARMS,connectedArmCanvas,connectedArmPose,connectedArmVisible} from './connected-arms';
import {rigidHeroArm,heroArmSprite,shoulderGrip} from './hero-arm';
import {TANK_WEAPONS_ATLAS,TANK_WEAPONS,tankWeaponCanvas} from './tank-weapons';
import {TANK_ATLAS,tankCanvas,tankPart} from './tank-art';
import {GUNNER_ATLAS,gunnerCanvas,gunnerPart} from './gunner-art';
import {GUNNER_WEAPONS_ATLAS,GUNNER_WEAPONS,isGunnerWeapon,gunnerWeaponCanvas} from './gunner-weapons';
import {gunnerWeaponPose,gunnerSupportHand,gunnerReload,type GunnerState} from './gunner-motion';
import {SAMURAI_WEAPONS_ATLAS,SAMURAI_WEAPONS,samuraiWeaponCanvas} from './samurai-weapons';
import {SAMURAI_ATLAS,samuraiCanvas,samuraiPart,samuraiSkinArm} from './samurai-art';
import {samuraiSupportHand,samuraiFlipX} from './samurai-motion';
import {LEADER_ATLAS,leaderCanvas} from './cute-robot-leaders';
import {ROBOT_ATLAS,isCuteRobot,cuteRobotCanvas} from './cute-robots';
import {COMMAND_ATLAS,commandCanvas} from './cute-command';
import {OFFICER_ATLAS,hordeAtlas,isCuteHorde,hordeCanvas,cuteRifleHandsCanvas,rifleHandPose} from './cute-horde';
import {cachedCanvas} from './texture-cache';
import {NINJA_ATTACK_ATLAS,NINJA_WEAPONS_ATLAS,ninjaAttackPart,ninjaSwordCanvas,ninjaWeaponCanvas} from './ninja-attack-art';
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
    get heroDepth(){return this.hero.depth;}
    private campDepths=new WeakMap<Phaser.GameObjects.Image|Phaser.GameObjects.Graphics,{base:number;applied:number}>();
    /** Sort a complete rig from its ground position, never from individual hands. */
    campLayer(y:number,campY:number){
        const offset=y>=campY+60?0:-1.8;
        for(const part of [this.hero,this.weapon,this.offhand,...this.ninjaBones,...this.cuteArms,...this.weaponEchoes,this.ninjaArmFx,this.attackFx,this.accents]){
            const prior=this.campDepths.get(part),base=prior&&part.depth===prior.applied?prior.base:part.depth;
            part.setDepth(base+offset);this.campDepths.set(part,{base,applied:base+offset});
        }
        this.zawgyiRig?.campLayer(offset);this.lethweiRig?.campLayer(offset);this.pyusawhtiRig?.campLayer(offset);this.kyansitthaRig?.campLayer(offset);
    }
    zawgyiRuby=false;
    zawgyiCharges=0;
    zawgyiLift=0;
    zawgyiSlam=-1;
    private zawgyiRig?:ZawgyiRig;
    private lethweiRig?:LethweiRig;
    private pyusawhtiRig?:PyusawhtiRig;
    private kyansitthaRig?:KyansitthaRig;
    private tankEffects?:TankSkillEffects;
    get tankSkills(){return this.tankEffects??=new TankSkillEffects(this.scene);}

    private gunnerEffects?:GunnerSkillEffects;
    get gunnerSkills(){return this.gunnerEffects??=new GunnerSkillEffects(this.scene);}

    private samuraiEffects?:SamuraiSkillEffects;
    get samuraiSkills(){return this.samuraiEffects??=new SamuraiSkillEffects(this.scene);}

    applyCosmetics(character:number,weapon:number,flashing:boolean){if(!flashing)this.hero.setTint(character);for(const arm of this.ninjaBones)if(arm.visible)arm.setTint(character);this.weapon.setTint(weapon);this.offhand.setTint(weapon);}
    veteran(){this.hero.setTint(0xd7c8ac);}
    private decoyImage!:Phaser.GameObjects.Image;
    showDecoy(hero:HeroId,decoy:{x:number;y:number;angle:number}|undefined){this.decoyImage.setVisible(!!decoy);if(decoy)this.decoyImage.setTexture(hero==='ninja'?'cute-ninja-full':`hero-${hero}-0`).setPosition(decoy.x,decoy.y).setRotation(hero==='ninja'?0:decoy.angle).setTint(0x8d86ae).setAlpha(.45);}
    private shieldFx!:Phaser.GameObjects.Graphics;
    private attackFx!:Phaser.GameObjects.Graphics;
    private tipTrail:{x:number;y:number}[]=[];
    private secondTrail:{x:number;y:number}[]=[];
    private lastSequence=-1;
    private accents!:Phaser.GameObjects.Graphics;
    private elementalCuts:{points:{x:number;y:number}[];born:number;element:WeaponElement;full:boolean}[]=[];
    private cutStamp=-1;
    private awakenedArt=new Map<string,{key:string;points:{u:number;v:number}[]}>();
    private weaponEchoes:Phaser.GameObjects.Image[]=[];
    evolutionDetails(e:{reach:number;power:number;tempo:number},swing:number,time:number){
        const g=this.accents;g.clear();this.weaponEchoes.forEach(image=>image.setVisible(false));
        const element:WeaponElement|undefined=e.reach?'reach':e.power?'power':e.tempo?'tempo':undefined;
        if(!element)return;
        const full=e[element]>1,color=element==='reach'?0x81dfff:element==='power'?0xffa64c:0xc09aff;
        if(this.tipTrail.length>1&&time-this.cutStamp>.045){
            this.cutStamp=time;
            for(const points of [this.tipTrail,this.secondTrail])if(points.length>1)this.elementalCuts.push({points:points.map(p=>({...p})),born:time,element,full});
            if(this.elementalCuts.length>10)this.elementalCuts.splice(0,this.elementalCuts.length-10);
        }
        this.elementalCuts=this.elementalCuts.filter(c=>time-c.born<.32);
        for(const cut of this.elementalCuts){
            const age=(time-cut.born)/.32,fade=1-age,points=cut.points;
            if(cut.element==='reach'){
                const jagged=points.map((p,i)=>({x:p.x+(i%2?2:-2)*fade,y:p.y+(i%2?-2:2)*fade}));
                g.lineStyle(cut.full?5:3,0x399cdd,.25*fade);g.strokePoints(points,false);
                g.lineStyle(cut.full?2:1.3,0x9eeaff,.9*fade);g.strokePoints(jagged,false);
                const tip=points[points.length-1];for(let i=0;i<(cut.full?3:2);i++){const angle=cut.born*17+i*2.1;g.lineStyle(1,0xd9ffff,fade);g.lineBetween(tip.x,tip.y,tip.x+Math.cos(angle)*(5+age*10),tip.y+Math.sin(angle)*(5+age*10));}
            }else if(cut.element==='power'){
                g.lineStyle(cut.full?7:4,0xff7736,.55*fade);g.strokePoints(points,false);g.lineStyle(1.5,0xffe2a0,.85*fade);g.strokePoints(points,false);
                for(let i=1;i<points.length;i+=3){const p=points[i],rise=age*13;g.fillStyle(i%2?0xffa548:0xffd378,fade);g.fillTriangle(p.x-2*fade,p.y-rise,p.x+2*fade,p.y-rise,p.x+Math.sin(i+cut.born)*3,p.y-rise-5*fade);}
            }else if(age>.17){
                for(let echo=1;echo<=(cut.full?2:1);echo++){
                    const dx=-echo*(3+age*7),dy=-echo*2;const trail=points.map(p=>({x:p.x+dx,y:p.y+dy}));
                    g.lineStyle(cut.full?4:2.5,0xb69af5,.45*fade/echo);g.strokePoints(trail,false);g.lineStyle(1,0xf2dcff,.7*fade/echo);g.strokePoints(trail,false);
                }
            }
        }
        for(const [hand,w] of [this.weapon,this.offhand].entries()){
            if(!w.visible)continue;
            const base=w.texture.key,key=`awakened:${base}:${element}:${full?'full':'first'}`;
            let art=this.awakenedArt.get(key);
            if(!art){const source=w.texture.getSourceImage() as HTMLCanvasElement;const generated=awakenWeaponCanvas(source,source.width,source.height,element,full);this.scene.textures.addCanvas(key,generated.canvas);art={key,points:generated.points};this.awakenedArt.set(key,art);}
            const width=w.displayWidth,height=w.displayHeight;w.setTexture(art.key).setDisplaySize(width,height);
            const point=(u:number,v:number)=>{const dx=((w.flipX?1-u:u)-w.originX)*width,dy=((w.flipY?1-v:v)-w.originY)*height,a=w.rotation;return{x:w.x+Math.cos(a)*dx-Math.sin(a)*dy,y:w.y+Math.sin(a)*dx+Math.cos(a)*dy};};
            const points=art.points.length?art.points:[{u:.55,v:.45}];
            // A fixed small budget, shared by every frame, keeps crowded waves inexpensive.
            const count=full?6:3,beat=Math.floor(time*(element==='reach'?11:5));
            for(let i=0;i<count;i++){
                const p=points[(i*Math.max(1,Math.floor(points.length/count))+beat)%points.length],q=point(p.u,p.v);
                if(element==='reach'){
                    const next=points[(i*Math.max(1,Math.floor(points.length/count))+beat+1)%points.length],r=point(next.u,next.v);
                    g.lineStyle(full?1.8:1.2,color,.9);g.beginPath();g.moveTo(q.x,q.y);g.lineTo((q.x+r.x)/2+Math.sin(beat+i)*2,(q.y+r.y)/2+Math.cos(beat+i)*2);g.lineTo(r.x,r.y);g.strokePath();g.fillStyle(0xe1fbff,.9);g.fillCircle(q.x,q.y,full?1.4:1);
                }else if(element==='power'){
                    const age=(time*2+i*.19)%1;g.fillStyle(age<.4?0xffdc86:color,1-age);g.fillTriangle(q.x-2,q.y,q.x+2,q.y,q.x+Math.sin(time*6+i)*2,q.y-4-age*(full?9:5));
                }else{g.fillStyle(color,.45);g.fillCircle(q.x+Math.sin(time*3+i)*3,q.y-2,1.2);}
            }
            if(element==='tempo')for(let i=0;i<(full?2:1);i++){
                const slot=hand*2+i;let echo=this.weaponEchoes[slot];if(!echo){echo=this.scene.add.image(0,0,art.key).setDepth(3.1);this.weaponEchoes[slot]=echo;}
                const distance=(i+1)*(swing>0?7:3);echo.setTexture(art.key).setOrigin(w.originX,w.originY).setDisplaySize(width,height).setPosition(w.x-Math.cos(w.rotation)*distance,w.y-Math.sin(w.rotation)*distance).setRotation(w.rotation-(swing>0?.12*(i+1):0)).setFlip(w.flipX,w.flipY).setTint(color).setAlpha(.24/(i+1)).setVisible(true);
            }
        }
    }
    /** Sample the same striking interval and geometry used by meleeContact. */
    meleeReward(hero:HeroId,id:WeaponId,x:number,y:number,angle:number,sequence:number,reach:number,arc:number,power:number,wide:number,echo:boolean,time=0){
        if(isGun(id)||['shield','spiked','hammer'].includes(id)||(!power&&!wide&&!echo))return;
        const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const g=this.scene.add.graphics().setDepth(4);
        for(const offhand of id==='dual'?[false,true]:[false]){
            const points=[];
            for(let i=0;i<=16;i++){
                const pose=weaponPose(id,x,y,angle,i/16*.55,true,sequence,offhand,false,reach,arc,hero==='samurai'?'samurai':hero==='tank'?'tank':hero==='ninja');
                points.push(pose.tip);
            }
            const sparkle=(px:number,py:number,size:number,color:number)=>{
                g.fillStyle(color,.95);g.fillPoints([{x:px,y:py-size},{x:px+size*.28,y:py-size*.28},{x:px+size,y:py},{x:px+size*.28,y:py+size*.28},{x:px,y:py+size},{x:px-size*.28,y:py+size*.28},{x:px-size,y:py},{x:px-size*.28,y:py-size*.28}],true);
            };
            if(echo){
                // A dotted violet echo is deliberately unlike the solid ribbon.
                g.lineStyle(2.5,0xb69aff,.65);g.strokePoints(points.slice(4,14),false);
                if(!reduced)for(let i=2;i<points.length;i+=3){const p=points[i];g.fillStyle(i%2?0xf2d9ff:0xa987e8,.7);g.fillCircle(p.x,p.y,i%2?2:3);}
                const p=points[12];sparkle(p.x,p.y,5,0xf0d8ff);
            }else{
                if(wide){
                    // Taper the inner edge into a soft crescent, using the real tip sweep.
                    const inner=points.map((p,i)=>{const depth=Math.sin(i/(points.length-1)*Math.PI)*(reduced?5:13);const d=Math.hypot(p.x-x,p.y-y)||1;return{x:p.x-(p.x-x)/d*depth,y:p.y-(p.y-y)/d*depth};});
                    g.fillStyle(0xc6a6f4,reduced?.24:.38);g.fillPoints([...points,...inner.reverse()],true);
                    g.lineStyle(2.5,0xf3dcff,.9);g.strokePoints(points,false);
                    if(!reduced)for(const i of [5,11]){const p=points[i];g.fillStyle(0xf7c3ed,.85);g.fillEllipse(p.x,p.y,5,9);}
                }
                if(power){
                    // Short honey-colored glints and four-point stars, never another broad arc.
                    g.lineStyle(2,0xffe7ac,.9);g.strokePoints(points.slice(9),false);
                    for(const i of reduced?[12]:[4,10,15]){const p=points[i];sparkle(p.x,p.y,3.5+Math.min(5,power)*.5,0xffcf79);}
                    if(!reduced){const p=points[10];g.fillStyle(0xfff5d9,.9);g.fillCircle(p.x+6,p.y-5,1.7);}
                }
            }
        }
        const duration=reduced?90:echo?240:wide?210:160;
        this.scene.tweens.add({targets:g,alpha:0,duration,onComplete:()=>g.destroy()});
        if(echo&&!reduced){
            const h=this.hero;
            const ghost=this.scene.add.image(h.x-Math.cos(angle)*7,h.y-Math.sin(angle)*7,h.texture.key,h.frame.name)
                .setOrigin(h.originX,h.originY).setDisplaySize(h.displayWidth,h.displayHeight)
                .setRotation(h.rotation).setFlip(h.flipX,h.flipY).setTint(0xa982ed).setAlpha(.28).setDepth(2.95);
            this.scene.tweens.add({targets:ghost,alpha:0,duration:200,onComplete:()=>ghost.destroy()});
        }
    }
    private moonFx?:Phaser.GameObjects.Graphics;
    private moonDashing=false;
    private moonStamp=-1;
    private moonMotes:{x:number;y:number;born:number;flower:boolean}[]=[];
    ninjaUltimate(x:number,y:number,dx:number,dy:number,time:number,dashing:boolean,damageWake=false,evolvedWake=false){
        const g=this.moonFx||(this.moonFx=this.scene.add.graphics().setDepth(4.2));g.clear();
        const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if(dashing!==this.moonDashing){this.moonMotes.push({x,y,born:time,flower:true});this.moonDashing=dashing;}
        if(dashing&&time-this.moonStamp>.035){this.moonStamp=time;this.moonMotes.push({x,y,born:time,flower:false});}
        this.moonMotes=this.moonMotes.filter(p=>time-p.born<(p.flower?.48:.36)).slice(-24);
        const flower=(px:number,py:number,r:number,alpha:number)=>{
            for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;g.fillStyle(i%2?0xf4b8e1:0xe7c5ff,alpha);g.fillCircle(px+Math.cos(a)*r*.65,py+Math.sin(a)*r*.65,r*.48);}
            g.fillStyle(0xffe4a0,alpha);g.fillCircle(px,py,r*.24);
        };
        for(const [i,p] of this.moonMotes.entries()){
            const age=time-p.born,fade=1-age/(p.flower?.48:.36);
            if(p.flower){
                g.lineStyle(reduced?2:3,0xf7d3ef,fade*.7);g.strokeEllipse(p.x,p.y+22,30+age*100,10+age*32);
                if(!reduced)for(let n=0;n<5;n++){const a=n*Math.PI*2/5,r=15+age*65;flower(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r*.65,5*(.6+fade),fade);}
            }else if(!reduced){
                g.fillStyle(i%2?0xe8b6f5:0xa9a1f1,fade*.35);g.fillCircle(p.x,p.y+10,9*fade);
                const side=i%2?1:-1;flower(p.x-dy*side*(12+age*22),p.y+dx*side*(12+age*22)-age*12,3.5*fade,fade*.85);
            }
        }
        if(dashing){
            if(damageWake){
                // Flower tips sit on the actual circular damage boundary; the centre stays clear.
                const radius=evolvedWake?110:80,count=reduced?5:evolvedWake?12:8;
                const rotation=reduced?0:time*(evolvedWake?1.1:.7);
                for(let i=0;i<count;i++){
                    const a=i/count*Math.PI*2+rotation,px=x+Math.cos(a)*(radius-5),py=y+Math.sin(a)*(radius-5);
                    flower(px,py,evolvedWake?6:4.5,.82);
                    if(!reduced){
                        g.lineStyle(evolvedWake?2.5:1.5,evolvedWake?0xffdfa7:0xdab9ff,.55);
                        g.beginPath();g.arc(x,y,radius-2,a+.07,a+Math.PI*2/count-.09);g.strokePath();
                        const r=radius*(.55+.16*Math.sin(time*7+i));
                        g.fillStyle(i%2?0xffd3ed:0xe3ceff,.6);g.fillEllipse(x+Math.cos(a)*r,y+Math.sin(a)*r,3,6);
                    }
                }
            }
            const a=Math.atan2(dy,dx);
            g.lineStyle(reduced?2:5,0xbba3f4,.65);g.beginPath();g.arc(x,y,27,a-1.2,a+1.2);g.strokePath();
            g.lineStyle(2,0xffe7ac,.95);g.beginPath();g.arc(x,y,30,a-.9,a+.9);g.strokePath();
            if(!reduced){g.lineStyle(3,0xf6c1e6,.7);g.lineBetween(x-dx*13-dy*9,y-dy*13+dx*9,x-dx*48-dy*5,y-dy*48+dx*5);}
        }
    }
    private criticalFx?:Phaser.GameObjects.Graphics;
    private criticalPops:{x:number;y:number;born:number}[]=[];
    criticalHit(x:number,y:number,time:number){
        this.criticalPops.push({x,y,born:time});
        if(this.criticalPops.length>5)this.criticalPops.shift();
    }
    private renderCriticalHits(time:number){
        if(!this.criticalFx&&!this.criticalPops.length)return;
        const g=this.criticalFx||(this.criticalFx=this.scene.add.graphics().setDepth(6));g.clear();
        const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.criticalPops=this.criticalPops.filter(p=>time-p.born<(reduced?.22:.5));
        for(const pop of this.criticalPops){
            const age=Math.max(0,time-pop.born),fade=Math.min(1,(.5-age)*4),px=pop.x,py=pop.y-12-(reduced?0:age*24);
            const size=reduced?9:10+Math.sin(Math.min(1,age/.18)*Math.PI)*5;
            const star=[];
            for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?size*.5:size;star.push({x:px+Math.cos(a)*r,y:py+Math.sin(a)*r});}
            g.fillStyle(0xffd47f,fade);g.fillPoints(star,true);g.lineStyle(1.3,0xfff0c6,fade);g.strokePoints(star,true);
            g.fillStyle(0x73516b,fade);g.fillCircle(px-3,py-1,1.1);g.fillCircle(px+3,py-1,1.1);
            g.lineStyle(1,0x73516b,fade);g.beginPath();g.arc(px,py+2,2,0,Math.PI);g.strokePath();
            if(!reduced)for(let i=0;i<5;i++){
                const a=i*Math.PI*2/5-.4,r=15+age*48,cx=pop.x+Math.cos(a)*r,cy=pop.y-10+Math.sin(a)*r-age*10;
                g.fillStyle(i%2?0xf6b8dc:0xffe3a0,fade*.85);
                if(i%2){g.fillCircle(cx-1.5,cy,2.4);g.fillCircle(cx+1.5,cy,2.4);g.fillTriangle(cx-3.5,cy,cx+3.5,cy,cx,cy+5);}
                else{g.fillTriangle(cx,cy-4,cx-2,cy,cx+2,cy);g.fillTriangle(cx,cy+4,cx-2,cy,cx+2,cy);}
            }
        }
    }
    private smokeFx?:Phaser.GameObjects.Graphics;
    private smokeBlooms:{x:number;y:number;radius:number;level:number;evolved:boolean;born:number}[]=[];
    smokeBomb(x:number,y:number,radius:number,level:number,evolved:boolean,time:number){
        this.smokeBlooms.push({x,y,radius,level,evolved,born:time});
        if(this.smokeBlooms.length>3)this.smokeBlooms.shift();
    }
    private renderSmoke(time:number){
        if(!this.smokeFx&&!this.smokeBlooms.length)return;
        const g=this.smokeFx||(this.smokeFx=this.scene.add.graphics().setDepth(4.1));g.clear();
        const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.smokeBlooms=this.smokeBlooms.filter(b=>time-b.born<1.6);
        for(const b of this.smokeBlooms){
            const age=Math.max(0,time-b.born),fade=Math.min(1,(1.6-age)*2),spread=reduced?1:1-Math.pow(1-Math.min(1,age/.38),3);
            const count=8+b.level*2+(b.evolved?4:0);
            for(let i=0;i<count;i++){
                const a=i/count*Math.PI*2,ring=b.radius*(.5+.25*(i%2))*spread;
                const px=b.x+Math.cos(a)*ring,py=b.y+Math.sin(a)*ring-(reduced?0:age*13);
                const r=(19+b.level*4+(i%3)*5)*(reduced?1:.55+spread*.45);
                g.fillStyle(i%2?0xc3a6ed:0xe0b9ef,.2*fade);
                g.fillRoundedRect(px-r,py-r*.35,r*2,r*1.05,r*.45);
                g.fillCircle(px-r*.43,py-r*.25,r*.6);g.fillCircle(px+r*.2,py-r*.45,r*.7);g.fillCircle(px+r*.65,py,r*.45);
                g.lineStyle(1.5,b.evolved?0xffe1b4:0xf3d9ff,.6*fade);
                g.beginPath();g.arc(px,py,r,a-.6,a+1.7);g.strokePath();
                if(i%4===0){
                    // Little sleepy faces make the blinding cloud feel playful.
                    g.lineStyle(2,0x73538d,.85*fade);
                    for(const side of [-1,1]){g.beginPath();g.arc(px+side*5,py-2,2.5,0,Math.PI);g.strokePath();}
                    g.beginPath();g.arc(px,py+5,3,0,Math.PI);g.strokePath();
                    g.fillStyle(0xf5afcf,.5*fade);g.fillCircle(px-10,py+4,3);g.fillCircle(px+10,py+4,3);
                }
            }
            if(!reduced)for(let i=0;i<4+b.level*2;i++){
                const a=i/(4+b.level*2)*Math.PI*2+.3,r=b.radius*(.35+.55*spread),px=b.x+Math.cos(a)*r,py=b.y+Math.sin(a)*r-age*20;
                const size=(3+i%3)*fade;g.fillStyle(i%2?0xffe5ad:0xf3d8ff,.9*fade);
                g.fillPoints([{x:px,y:py-size},{x:px+size*.3,y:py-size*.3},{x:px+size,y:py},{x:px+size*.3,y:py+size*.3},{x:px,y:py+size},{x:px-size*.3,y:py+size*.3},{x:px-size,y:py},{x:px-size*.3,y:py-size*.3}],true);
            }
        }
    }
    private skillFx?:Phaser.GameObjects.Graphics;
    private allySprite?:Phaser.GameObjects.Image;
    private allyWeapon?:Phaser.GameObjects.Image;
    private allyBorn=0;
    private allyRemaining=0;
    private allyStrike=-10;
    phantomStrike(time:number){this.allyStrike=time;}
    passiveSkills(hero:HeroId,x:number,y:number,angle:number,time:number,fire:number,fullFire:boolean,clone:number,fullClone:boolean,tick:number){
        const g=this.skillFx||(this.skillFx=this.scene.add.graphics().setDepth(3.2));g.clear();
        if(fire){
            // Each rank adds visible fire, while the damage radius stays at 100 units.
            const level=Math.max(1,Math.min(4,Math.floor(fire))),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const pulse=reduced?0:Math.max(0,1-tick*4),count=4+level*4+(fullFire?6:0);
            const rotation=reduced?0:time*.22;
            for(let i=0;i<count;i++){
                const a=i/count*Math.PI*2+rotation,px=x+Math.cos(a)*98,py=y+Math.sin(a)*98;
                const flicker=reduced?0:Math.sin(time*(7+level)+i*2)*2;
                const height=7+level*4+(fullFire?7:0)+pulse*4+flicker,width=3+level*.65;
                if(level>=3){g.fillStyle(0xff8b48,.08+level*.015);g.fillCircle(px,py-height*.35,width*2.4);}
                // Rounded orange base, pointed flame, and a warm cream core.
                g.fillStyle(fullFire?0xff7048:0xff853f,.8);g.fillCircle(px,py-2,width);
                g.fillTriangle(px-width,py,px+width,py,px+Math.sin(a+time)*2,py-height);
                g.fillStyle(fullFire?0xffedb0:0xffd77a,.95);g.fillCircle(px,py-2,width*.5);
                g.fillTriangle(px-width*.5,py,px+width*.5,py,px,py-height*.65);
                if(level>=2){g.fillStyle(0xffad55,.8);g.fillTriangle(px-width,py,px-width*1.7,py-3,px-width*.8,py-height*.6);}
                if(!reduced)for(let ember=0;ember<level+(fullFire?1:0);ember++){
                    const rise=(time*(.8+level*.1)+i*.13+ember*.27)%1;
                    g.fillStyle(ember%2?0xffecb0:0xffb265,(1-rise)*.7);
                    g.fillCircle(px+Math.sin(i+time*2+ember)*5,py-rise*(14+level*6),1+level*.15);
                }
            }
            if(level>=3&&!reduced)for(let i=0;i<level*2;i++){
                const a=i/(level*2)*Math.PI*2-time*.3,r=65+Math.sin(time*3+i)*8;
                g.fillStyle(0xffbd77,.5);g.fillCircle(x+Math.cos(a)*r,y+Math.sin(a)*r,1.5);
            }
        }
        if(clone>this.allyRemaining+.1)this.allyBorn=time;this.allyRemaining=clone;
        this.allySprite?.setVisible(clone>0);this.allyWeapon?.setVisible(clone>0);
        if(clone<=0)return;
        const age=time-this.allyBorn,fade=Math.min(1,age*5,clone*3),strike=Math.max(0,1-(time-this.allyStrike)/.3);
        const face=Math.cos(angle)<0?-1:1,ax=x-face*42+Math.sin(time*2)*3,ay=y-17;
        if(!this.allySprite)this.allySprite=this.scene.add.image(0,0,'cute-ninja-full').setDepth(2.9);
        this.allySprite.setTexture(hero==='ninja'?'cute-ninja-full':this.hero.texture.key).setPosition(ax+face*strike*8,ay).setDisplaySize(72,72).setTint(fullClone?0xd1b0ff:0x9a80df).setAlpha(fade*.63).setFlipX(face<0).setVisible(true);
        if(!this.allyWeapon)this.allyWeapon=this.scene.add.image(0,0,this.weapon.texture.key).setDepth(3.15);
        const w=this.weapon;this.allyWeapon.setTexture(w.texture.key).setOrigin(w.originX,w.originY).setDisplaySize(w.displayWidth,w.displayHeight).setPosition(w.x+(ax-x)+face*strike*8,w.y+(ay-y)).setRotation(w.rotation-strike*.5*face).setFlip(w.flipX,w.flipY).setTint(0xd2b4ff).setAlpha(fade*.7).setVisible(true);
        g.fillStyle(0x9b78dc,fade*.16);g.fillEllipse(ax,ay+29,42,11);
        // Wisps dissolve upward at summon and expiry; attacks have a separate short crescent.
        for(let i=0;i<4;i++){const p=(time+i*.23)%1;g.fillStyle(0xb399ed,fade*(1-p)*.4);g.fillCircle(ax+(i-1.5)*9,ay+28-p*23,2.5*(1-p));}
        if(age<.4){g.lineStyle(2,0xd8c0ff,(1-age/.4)*.6);g.strokeEllipse(ax,ay+25,25+age*70,8+age*20);}
        if(strike>0){const start=angle-.8,end=angle+.8,radius=fullClone?55:43;g.lineStyle(fullClone?5:3,0xa77be4,strike*.6);g.beginPath();g.arc(ax,ay,radius,start,end);g.strokePath();g.lineStyle(1.3,0xf0dfff,strike*.9);g.beginPath();g.arc(ax,ay,radius+3,start+.15,end-.15);g.strokePath();}
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
    private tankOutfit=false;
    private tankOutfitUrl='';
    constructor(private scene: Phaser.Scene,skin=false,ninjaSkin=false,gunnerSkin=false,tankSkin=false) {this.tankOutfit=tankSkin;if(scene.textures.exists(FUTURE_ARMS.key))registerFutureArms(scene.textures.get(FUTURE_ARMS.key).getSourceImage() as HTMLImageElement);if(scene.textures.exists(ANCIENT_ARMS.key))registerAncientArms(scene.textures.get(ANCIENT_ARMS.key).getSourceImage() as HTMLImageElement);
        const addArt=(key:string,canvas:HTMLCanvasElement)=>scene.textures.addCanvas(key,gameplayArtwork(/^(tank|gunner|samurai|ninja)-(hammer|shield|spiked|pistols|shotgun|smg|nodachi|cursed|naginata|katana|dual|kama)$/.test(key)?outlinedWeapon(canvas):colorfulCharacter(canvas,/(ninja|samurai)/.test(key)),256));
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
        const connectedSource=scene.textures.get(CONNECTED_ARMS.key).getSourceImage() as HTMLImageElement;
        for(const hero of (Object.keys(HEROES) as HeroId[]).filter(h=>h!=='zawgyi'))for(let i=0;i<2;i++)if(!scene.textures.exists(`connected-${hero}-${i}`))addArt(`connected-${hero}-${i}`,skin&&hero==='samurai'?samuraiSkinArm(scene.textures.get(SAMURAI_ATLAS.key).getSourceImage() as HTMLImageElement,i):ninjaSkin&&hero==='ninja'?ninjaSkinArm(scene.textures.get(NINJA_SKIN_KEY).getSourceImage() as HTMLImageElement,i):gunnerSkin&&hero==='gunner'?gunnerSkinArm(scene.textures.get(GUNNER_ATLAS.key).getSourceImage() as HTMLImageElement,i):tankSkin&&hero==='tank'?tankSkinArm(scene.textures.get(TANK_ATLAS.key).getSourceImage() as HTMLImageElement,i):connectedArmCanvas(connectedSource,hero,i));
        const gunnerSource=scene.textures.get(GUNNER_ATLAS.key).getSourceImage() as HTMLImageElement;
        for(const part of ['upper','forearm','hand','otherHand'] as const)if(!scene.textures.exists(`gunner-${part}`))scene.textures.addCanvas(`gunner-${part}`,gunnerPart(gunnerSource,part));
        if(!scene.textures.exists('cute-gunner-full'))addArt('cute-gunner-full',gunnerCanvas(gunnerSource,0,false));
        const guns=scene.textures.get(GUNNER_WEAPONS_ATLAS.key).getSourceImage() as HTMLImageElement;
        for(const id of GUNNER_WEAPONS)if(!scene.textures.exists(`gunner-${id}`))addArt(`gunner-${id}`,gunnerWeaponCanvas(guns,id));
        const samuraiWeapons=scene.textures.get(SAMURAI_WEAPONS_ATLAS.key).getSourceImage() as HTMLImageElement;
        for(const id of SAMURAI_WEAPONS)if(!scene.textures.exists(`samurai-${id}`))addArt(`samurai-${id}`,samuraiWeaponCanvas(samuraiWeapons,id));
        const samuraiSource=scene.textures.get(SAMURAI_ATLAS.key).getSourceImage() as HTMLImageElement;
        for(const part of ['upper','forearm','hand','otherHand'] as const)if(!scene.textures.exists(`samurai-${part}`))scene.textures.addCanvas(`samurai-${part}`,samuraiPart(samuraiSource,part));
        if(!scene.textures.exists('cute-samurai-full'))addArt('cute-samurai-full',samuraiCanvas(samuraiSource,0,true));
        const attackSource=scene.textures.get(NINJA_ATTACK_ATLAS.key).getSourceImage() as HTMLImageElement;
        for(const part of ['upper','forearm','hand'] as const){
            if(!scene.textures.exists(`ninja-${part}`))scene.textures.addCanvas(`ninja-${part}`,ninjaAttackPart(attackSource,part));
        }
        const ninjaWeapons=scene.textures.get(NINJA_WEAPONS_ATLAS.key).getSourceImage() as HTMLImageElement;
        const ninjaWeaponSkin=scene.textures.exists('ninja-cosmetic-weapons')?scene.textures.get('ninja-cosmetic-weapons').getSourceImage() as HTMLImageElement:undefined;
        for(const id of ['dual','kama'] as const)if(!scene.textures.exists(`ninja-${id}`))addArt(`ninja-${id}`,ninjaWeaponSkin?ninjaSkinWeaponCanvas(ninjaWeaponSkin,id):ninjaWeaponCanvas(ninjaWeapons,id));
        if(!scene.textures.exists('ninja-katana'))addArt('ninja-katana',ninjaWeaponSkin?ninjaSkinWeaponCanvas(ninjaWeaponSkin,'katana'):ninjaSwordCanvas(attackSource));
        for(let side=0;side<2;side++)for(const part of ['upper','forearm','hand'] as const)this.ninjaBones.push(scene.add.image(0,0,`ninja-${part}`).setVisible(false).setDepth(part==='hand'?3.21:3.14));
        const cuteSource=scene.textures.get(CUTE_ATLAS.key).getSourceImage() as HTMLImageElement;
        if(!scene.textures.exists('cute-ninja-full'))addArt('cute-ninja-full',ninjaSkin?ninjaSkinCanvas(scene.textures.get(NINJA_SKIN_KEY).getSourceImage() as HTMLImageElement,0,true):cuteCanvas(cuteSource,'ninja',0,0,true));
        for(const part of ['leftArm','rightArm'] as const){
            const key=`cute-ninja-${part}`;if(!scene.textures.exists(key))addArt(key,cuteArmCanvas(cuteSource,part));
            this.cuteArms.push(scene.add.image(0,0,key).setVisible(false).setDepth(3.2));
        }
        this.decoyImage=scene.add.image(0,0,'hero-ninja-0').setVisible(false).setDepth(2).setDisplaySize(78,78);
        this.hero = scene.add.image(600, 380, 'hero-ninja-0').setDepth(3).setDisplaySize(78, 78);
        this.weapon = scene.add.image(600, 380, 'weapon-katana').setDepth(3.2);
        this.offhand = scene.add.image(600, 380, 'weapon-katana').setDepth(3.1).setVisible(false);
    }
    prepareTexture(key:string){
        const textures=this.scene.textures;if(textures.exists(key))return;
        const sourceKey=key.startsWith('cute-tank-')?TANK_ATLAS.key:key.startsWith('cute-gunner-')?GUNNER_ATLAS.key:key.startsWith('cute-samurai-')?SAMURAI_ATLAS.key:key.startsWith('cute-ninja-')?(textures.exists(NINJA_SKIN_KEY)?NINJA_SKIN_KEY:CUTE_ATLAS.key):undefined;
        const cacheKey=sourceKey?`${key}:hd256-color-facing-v4:${imageSourceUrl(textures.get(sourceKey).getSourceImage() as HTMLImageElement)}`:key;
        const canvas=cachedCanvas(cacheKey,()=>{
            if(key.endsWith('-small')){const full=key.slice(0,-6);this.prepareTexture(full);return minifiedZombieCanvas(textures.get(full).getSourceImage() as HTMLCanvasElement);}
            const frame=Number(key.slice(key.lastIndexOf('-')+1));
            if(key.startsWith('cute-tank-'))return tankCanvas(textures.get(TANK_ATLAS.key).getSourceImage() as HTMLImageElement,frame);
            if(key.startsWith('cute-gunner-'))return gunnerCanvas(textures.get(GUNNER_ATLAS.key).getSourceImage() as HTMLImageElement,frame);
            if(key.startsWith('cute-ninja-')&&textures.exists(NINJA_SKIN_KEY))return ninjaSkinCanvas(textures.get(NINJA_SKIN_KEY).getSourceImage() as HTMLImageElement,frame);
            if(key.startsWith('cute-samurai-'))return samuraiCanvas(textures.get(SAMURAI_ATLAS.key).getSourceImage() as HTMLImageElement,frame);
            if(key.startsWith('cute-')){
                const id=key.split('-')[1] as 'ninja'|'wanderer'|'pulse';
                return cuteCanvas(textures.get(CUTE_ATLAS.key).getSourceImage() as HTMLImageElement,id,frame===0?0:(frame-1)%24/24,frame===0?0:frame>24?.4:1,id!=='ninja');
            }
            if(key.startsWith('robot-unit-')){const type=key.split('-')[2] as EnemyId;const kind=ROBOT_ROLES[type];if(kind==='command'||kind==='sentinel')return leaderCanvas(textures.get(LEADER_ATLAS.key).getSourceImage() as HTMLImageElement,kind,frame);return isCuteRobot(kind)?cuteRobotCanvas(textures.get(ROBOT_ATLAS.key).getSourceImage() as HTMLImageElement,kind,frame,false,type):robotCanvas(kind,frame,undefined,type);}
            if(key.startsWith('skill-')){
                const [,faction,type,action]=key.split('-');
                if(faction==='robot'&&(type==='commander'||type==='boss'))return leaderCanvas(textures.get(LEADER_ATLAS.key).getSourceImage() as HTMLImageElement,type==='boss'?'sentinel':'command',frame,action as BossAction);
                if(faction==='robot'&&isCuteRobot(ROBOT_ROLES[type as EnemyId]))return cuteRobotCanvas(textures.get(ROBOT_ATLAS.key).getSourceImage() as HTMLImageElement,ROBOT_ROLES[type as EnemyId] as import('./cute-robots').CuteRobot,frame,true,type as EnemyId);
                if(faction==='zombie'&&(type==='boss'||type==='commander'))return commandCanvas(textures.get(COMMAND_ATLAS.key).getSourceImage() as HTMLImageElement,type,frame,action as BossAction);
                return faction==='robot'?robotCanvas(ROBOT_ROLES[type as EnemyId],frame,action as BossAction,type as EnemyId):zombieBossCanvas(type as 'boss'|'commander'|'shooterBoss',action as BossAction,frame);
            }
            const id=key.split('-')[1] as EnemyId;
            if(id==='boss'||id==='commander')return commandCanvas(textures.get(COMMAND_ATLAS.key).getSourceImage() as HTMLImageElement,id,frame);
            if(isCuteHorde(id))return hordeCanvas(textures.get(hordeAtlas(id).key).getSourceImage() as HTMLImageElement,id,frame);
            return zombieSpriteLocation(id)?zombieWalkCanvases(textures.get(CUTE_ATLAS.key).getSourceImage() as HTMLImageElement,id)![frame]:actorCanvas('enemy',id,frame);
        });
        textures.addCanvas(key,/^cute-(tank|gunner|samurai|ninja)-/.test(key)?gameplayArtwork(colorfulCharacter(canvas,/(ninja|samurai)/.test(key))):canvas);
    }
    defeat() { this.lethweiRig?.defeat(); this.pyusawhtiRig?.clear(); this.kyansitthaRig?.clear(); this.hero.setRotation(this.hero.rotation + 1.2).setAlpha(.5).setScale(.5); this.weapon.setVisible(false); this.offhand.setVisible(false);this.cuteArms.forEach(arm=>arm.setVisible(false));this.ninjaArmFx.clear();this.ninjaBones.forEach(bone=>bone.setVisible(false)); }
    death(e: EnemyVisual, time: number) { const key=e.faction==='robot'?(e.type==='spitter'?'cute-pulse-0':`robot-unit-${e.type}-0`):(e.type==='basic'?'cute-wanderer-0':`enemy-${e.type}-0`);const size=e.r*3.4*zombieVisualScale(e.type,this.scene.cameras.main.zoom);let slot = this.ghosts.find(s => s.expires <= time); if (!slot) {
        if (this.ghosts.length >= 24)
            return;
        this.prepareTexture(key);
        slot = { image: this.scene.add.image(0, 0, key).setDepth(1), size, expires: 0 };
        this.ghosts.push(slot);
    } this.prepareTexture(key);slot.size=size;slot.expires = time + .55; slot.image.setTexture(key).setPosition(e.x, e.y).setRotation(.7).setDisplaySize(size,size).setAlpha(.7).setTint(0x778b81).setVisible(true); }
    render(enemies: EnemyVisual[], hero: HeroId, weapon: WeaponId, x: number, y: number, angle: number, time: number, swing: number, dash: number, invuln: number, blocking: boolean, counter: number, ammo: number, sequence=0,reach=1,arcScale=1,gunnerState?:GunnerState,tankMotion?:TankMotion,survivorMotion?:{brace:boolean;gesture:number;sweep?:number;weaponTurn?:number;skillAim?:number;bodyLift?:number;dashTrail?:boolean;trailColor?:number}) {
        this.renderSmoke(time);
        this.renderCriticalHits(time);
        const moved = Math.hypot(x - this.lastX, y - this.lastY) > .2, frame = moved ? 1 + Math.floor(time * 10) % 2 : 0;
        this.lastX = x;
        this.lastY = y;
        if(hero!=='zawgyi'&&hero!=='lethwei'&&hero!=='pyusawhti'&&hero!=='kyansittha'){
        const survivorOutfitUrl=(hero==='samurai'||hero==='gunner')?imageSourceUrl(this.scene.textures.get(hero==='samurai'?SAMURAI_ATLAS.key:GUNNER_ATLAS.key).getSourceImage() as HTMLImageElement):'',survivorRedesigned=isRedesignedSurvivor(survivorOutfitUrl);
        const articulatedHero=hero==='ninja'||hero==='samurai'||hero==='gunner'||hero==='tank',weaponRig=hero==='samurai'?'samurai':hero==='tank'?'tank':hero==='ninja';
        const tankFrame=tankMotion&&tankMotion.frame>=0?tankMotion.frame:moved?1+Math.floor(time*10)%24:0;
        if(hero==='tank')this.prepareTexture(`cute-tank-${tankFrame}`);
        if(hero==='gunner')this.prepareTexture(`cute-gunner-${moved?1+Math.floor(time*10)%24:0}`);
        if(hero==='samurai')this.prepareTexture(`cute-samurai-${moved?1+Math.floor(time*10)%24:0}`);
        if(hero==='ninja')this.prepareTexture(`cute-ninja-${moved?1+Math.floor(time*10)%24:0}`);
        this.hero.setTexture(hero==='tank'?`cute-tank-${tankFrame}`:hero==='gunner'?`cute-gunner-${moved?1+Math.floor(time*10)%24:0}`:hero==='samurai'?`cute-samurai-${moved?1+Math.floor(time*10)%24:0}`:hero==='ninja'?`cute-ninja-${moved?1+Math.floor(time*10)%24:0}`:`hero-${hero}-${frame}`).setPosition(x, y).setRotation(articulatedHero?0:angle).setFlipX(hero==='samurai'&&!survivorRedesigned?samuraiFlipX(angle):articulatedHero&&Math.cos(angle)<0).setAlpha(1);
        this.hero.setDisplaySize(78,articulatedHero?78:78+Math.sin(time*3)*.8);
        this.hero.clearTint();
        // Protection is communicated by skill state, never by washing out the outfit.
        const duration=WEAPON_EFFECTS[weapon].duration,progress=Math.max(0,Math.min(1,swing/duration)),phase=1-progress,active=swing>0;
        let gunnerHeld=hero==='gunner'&&isGunnerWeapon(weapon)?gunnerWeaponPose(weapon,x,y,angle,phase,active&&(weapon!=='pistols'||sequence%2===0),false,gunnerState):undefined;
        let pose=gunnerHeld||weaponPose(weapon,x,y,angle,phase,active&&(weapon!=='pistols'||sequence%2===0),sequence,false,blocking,reach,arcScale,weaponRig);
        if(hero==='ninja'&&this.scene.textures.exists(NINJA_SKIN_KEY))pose=ninjaCosmeticPose(pose,x,y,angle,phase,active,false,ninjaOutfitFit(imageSourceUrl(this.scene.textures.get(NINJA_SKIN_KEY).getSourceImage() as HTMLImageElement)));
        if(hero==='tank')pose=tankEquipmentPose(pose,x,y,Math.cos(angle)<0?-1:1,this.tankOutfitUrl,weapon==='hammer');
        if(hero==='tank'&&tankMotion)pose=tankSkillWeaponPose(pose,x,y,angle,this.tankOutfitUrl,weapon==='hammer',tankMotion);
        if(survivorMotion&&(hero==='samurai'||hero==='gunner')){if(gunnerHeld){gunnerHeld=survivorEquipmentPose(gunnerHeld,'gunner',angle,survivorMotion);pose=gunnerHeld;}else pose=survivorEquipmentPose(pose,'samurai',angle,survivorMotion);}
        this.weapon.setDepth(3.22).setTexture(hero==='tank'?`tank-${weapon}`:hero==='gunner'?`gunner-${weapon}`:hero==='samurai'?`samurai-${weapon}`:hero==='ninja'?`ninja-${weapon}`:`weapon-${weapon}`).setOrigin(pose.originX,pose.originY).setDisplaySize(pose.size,hero==='samurai'?pose.size/reach:pose.size).setPosition(pose.grip.x,pose.grip.y).setRotation(pose.rotation).setFlipY(pose.flipY).setAlpha(1);
        const dual=weapon==='dual'||weapon==='pistols';this.offhand.setVisible(dual);
        let other=hero==='gunner'&&isGunnerWeapon(weapon)?gunnerWeaponPose(weapon,x,y,angle,phase,active&&(weapon!=='pistols'||sequence%2!==0),true,gunnerState):weaponPose(weapon,x,y,angle,phase,active&&(weapon!=='pistols'||sequence%2!==0),sequence,true,false,reach,arcScale,weaponRig);
        if(hero==='ninja'&&this.scene.textures.exists(NINJA_SKIN_KEY))other=ninjaCosmeticPose(other,x,y,angle,phase,active,true,ninjaOutfitFit(imageSourceUrl(this.scene.textures.get(NINJA_SKIN_KEY).getSourceImage() as HTMLImageElement)));
        if(dual)this.offhand.setDepth(3.22).setTexture(hero==='gunner'?`gunner-${weapon}`:hero==='ninja'?`ninja-${weapon}`:`weapon-${weapon}`).setOrigin(other.originX,other.originY).setDisplaySize(other.size,other.size).setPosition(other.grip.x,other.grip.y).setRotation(other.rotation).setFlipY(other.flipY);
        this.cuteArms.forEach(arm=>arm.setVisible(false));
        this.ninjaArmFx.clear();this.ninjaBones.forEach(bone=>bone.setVisible(false));
        if(articulatedHero){
            const g=this.ninjaArmFx,flip=Math.cos(angle)<0?-1:1;
            for(let index=0;index<2;index++){
                if(!connectedArmVisible(hero,index)&&!(hero==='gunner'&&(!dual||isRedesignedSurvivor(imageSourceUrl(this.scene.textures.get(GUNNER_ATLAS.key).getSourceImage() as HTMLImageElement)))||hero==='tank'&&(weapon==='hammer'||isRedesignedTank(this.tankOutfitUrl)||!!tankMotion&&(tankMotion.slam>0||tankMotion.brace||tankMotion.march))))continue;
                const shoulder=hero==='ninja'&&this.scene.textures.exists(NINJA_SKIN_KEY)?ninjaCosmeticShoulder(x,y,index,flip,ninjaOutfitFit(imageSourceUrl(this.scene.textures.get(NINJA_SKIN_KEY).getSourceImage() as HTMLImageElement))):survivorRedesigned?survivorShoulder(x,y,index,flip,survivorOutfitUrl):hero==='tank'&&this.tankOutfit?tankOutfitShoulder(x,y,index,flip,this.tankOutfitUrl):{x:x+(index===0?8:-9)*flip,y:y+5};
                const target=index===0?pose.grip:hero==='samurai'||hero==='tank'&&weapon==='hammer'?samuraiSupportHand(pose.grip,pose.rotation):hero==='gunner'&&!dual&&isGunnerWeapon(weapon)?gunnerSupportHand(gunnerHeld||gunnerWeaponPose(weapon,x,y,angle,phase,active,false,gunnerState),gunnerState):dual?other.grip:{x:x-12*flip,y:y+21};
                const resting=index===1&&!dual&&hero!=='samurai'&&hero!=='gunner'&&weapon!=='hammer';
                const held=resting?shoulderGrip(shoulder,Math.PI/2,18):target;
                const p=survivorRedesigned?survivorArmPose(hero==='samurai'?'samurai':'gunner',index,shoulder,held,flip,survivorOutfitUrl):hero==='tank'&&isRedesignedTank(this.tankOutfitUrl)?tankArmPose(index,shoulder,held,flip):connectedArmPose(hero,index,shoulder,held,flip);
                this.ninjaBones[index*3].setTexture(`connected-${hero}-${index}`).setFlipX(p.flipX).setVisible(true).setOrigin(p.originX,p.originY).setPosition(p.x,p.y).setDisplaySize(p.width,p.height).setRotation(p.rotation).setDepth(hero==='tank'&&(weapon!=='hammer'||isRedesignedTank(this.tankOutfitUrl))||hero==='gunner'&&!dual?3.19:3.21).setAlpha(this.hero.alpha);
                // Weapons stay above sleeves and torso. Only the glove covers its grip.
                if(!resting){
                    const hand=this.ninjaBones[index*3+2],texture=this.scene.textures.get(`connected-${hero}-${index}`),source=texture.getSourceImage();
                    const start=hero==='gunner'&&survivorRedesigned?.76/survivorArmOverscan(survivorOutfitUrl,'gunner',index):.76;
                    hand.setTexture(`connected-${hero}-${index}`).setCrop(0,source.height*start,source.width,source.height*(1-start)).setFlipX(p.flipX).setVisible(true).setOrigin(p.originX,p.originY).setPosition(p.x,p.y).setDisplaySize(p.width,p.height).setRotation(p.rotation).setDepth(3.23).setAlpha(this.hero.alpha);
                }

            }
        }
        if(hero==='samurai'&&survivorMotion?.bodyLift){
            const lift=survivorMotion.bodyLift;
            for(const image of [this.hero,this.weapon,this.offhand,...this.ninjaBones,...this.cuteArms])if(image.visible)image.setY(image.y+lift);
            pose={...pose,grip:{...pose.grip,y:pose.grip.y+lift},tip:{...pose.tip,y:pose.tip.y+lift}};
        }
        if(hero==='tank'&&tankMotion?.lean){
            const lean=tankMotion.lean;
            for(const image of [this.hero,this.weapon,...this.ninjaBones])if(image.visible){const p=tankMotionPoint(image,x,y,lean);image.setPosition(p.x,p.y).setRotation(image.rotation+lean);}
            pose={...pose,grip:tankMotionPoint(pose.grip,x,y,lean),tip:tankMotionPoint(pose.tip,x,y,lean),rotation:pose.rotation+lean};
        }
        if(hero==='gunner'){
            const g=this.ninjaArmFx,face=Math.cos(angle)<0?-1:1;
            if(gunnerState&&gunnerState.overdrive>0){g.fillStyle(0xffdb6b,.3+Math.sin(time*18)*.1);g.fillEllipse(x+5*face,y-21,13,9);g.fillEllipse(x+16*face,y-19,8,8);}

        }
        this.attackFx.clear();
        if(sequence!==this.lastSequence||!active){this.tipTrail=[];this.secondTrail=[];this.lastSequence=sequence;}
        if(active&&isGun(weapon)&&phase<.6){
            const muzzle=weapon==='pistols'&&sequence%2===1?other:pose,g=this.attackFx,color=WEAPON_EFFECTS[weapon].color,length=(weapon==='shotgun'?17:weapon==='smg'?7:10)*(hero==='gunner'&&gunnerState&&gunnerState.overdrive>0?1.4:1);
            for(const spread of weapon==='shotgun'?[-.5,0,.5]:[-.25,.25]){g.lineStyle(3,0x15222a,.9);g.lineBetween(muzzle.tip.x,muzzle.tip.y,muzzle.tip.x+Math.cos(angle+spread)*length,muzzle.tip.y+Math.sin(angle+spread)*length);g.lineStyle(hero==='gunner'&&gunnerState&&gunnerState.overdrive>0?2.5:1.5,hero==='gunner'&&gunnerState&&gunnerState.overdrive>0?0xffe1a0:color,.8);g.lineBetween(muzzle.tip.x,muzzle.tip.y,muzzle.tip.x+Math.cos(angle+spread)*length,muzzle.tip.y+Math.sin(angle+spread)*length);}
        }
        if(articulatedHero&&(phase<.26||phase>.64)){this.tipTrail=[];this.secondTrail=[];}
        if(active&&!isGun(weapon)&&(!articulatedHero||phase>=.26&&phase<=.64)){
            this.tipTrail.push(pose.tip);if(this.tipTrail.length>12)this.tipTrail.shift();if(weapon==='dual'){this.secondTrail.push(other.tip);if(this.secondTrail.length>10)this.secondTrail.shift();}
            const g=this.attackFx,color=WEAPON_EFFECTS[weapon].color;
            const stroke=(pts:{x:number;y:number}[],width:number)=>{if(pts.length<2)return;if(!articulatedHero){g.lineStyle(width+3,0x111d26,.8);g.strokePoints(pts,false);}g.lineStyle(articulatedHero?width+1:width,hero==='samurai'?0xffd6a0:hero==='ninja'?0xdcc1ff:color,articulatedHero?.6:.75*progress+.15);g.strokePoints(pts,false);};
            if(weapon==='shield'||weapon==='spiked'){g.lineStyle(3,color,.75);g.lineBetween(pose.tip.x-Math.sin(angle)*16,pose.tip.y+Math.cos(angle)*16,pose.tip.x+Math.sin(angle)*16,pose.tip.y-Math.cos(angle)*16);if(weapon==='spiked')for(let i=-1;i<=1;i++){const px=pose.tip.x-Math.sin(angle)*i*12,py=pose.tip.y+Math.cos(angle)*i*12;g.lineBetween(px,py,px+Math.cos(angle)*8,py+Math.sin(angle)*8);}}
            else if(weapon==='hammer'){stroke(this.tipTrail,5);g.lineStyle(2,color,.6);g.strokeCircle(pose.tip.x,pose.tip.y,8);}
            else if(weapon==='cursed'){stroke(this.tipTrail,4);for(let i=2;i<this.tipTrail.length;i+=3){const p=this.tipTrail[i];g.lineStyle(1,0xb18791,.7);g.lineBetween(p.x-4,p.y-4,p.x+5,p.y+3);}}
            else if(weapon==='kama'){stroke(this.tipTrail,3);if(hero!=='ninja'){g.lineStyle(2,color,.7);g.beginPath();g.arc(pose.tip.x,pose.tip.y,11,pose.rotation-.5,pose.rotation+2);g.strokePath();}}
            else{stroke(this.tipTrail,weapon==='nodachi'?5:weapon==='naginata'?4:2);if(weapon==='dual')stroke(this.secondTrail,2);}
        }
        if ((dash > 0||hero==='samurai'&&survivorMotion?.dashTrail) && time - this.lastGhost > .045 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.lastGhost = time;
            let s = this.afterimages.find(s => s.expires <= time);
            if (!s) {
                s = { image: this.scene.add.image(x, y, `hero-${hero}-${frame}`).setDepth(2), expires: 0 };
                this.afterimages.push(s);
            }
            s.expires = time + .22;
            s.image.setTexture(hero==='tank'?'cute-tank-full':hero==='gunner'?'cute-gunner-full':hero==='samurai'?'cute-samurai-full':hero==='ninja'?'cute-ninja-full':`hero-${hero}-${frame}`).setPosition(x, y).setDisplaySize(78, 78).setRotation(articulatedHero?0:angle).setFlipX(hero==='samurai'&&!isRedesignedSurvivor(imageSourceUrl(this.scene.textures.get(SAMURAI_ATLAS.key).getSourceImage() as HTMLImageElement))?samuraiFlipX(angle):(hero==='ninja'||hero==='gunner'||hero==='tank'||hero==='samurai')&&Math.cos(angle)<0).setTint(hero==='samurai'?(survivorMotion?.trailColor??HEROES[hero].color):HEROES[hero].color).setVisible(true);
        }
        }else{this.hero.setVisible(false);this.weapon.setVisible(false);this.offhand.setVisible(false);this.cuteArms.forEach(a=>a.setVisible(false));this.ninjaBones.forEach(a=>a.setVisible(false));this.attackFx.clear();if(hero==='lethwei')(this.lethweiRig??=new LethweiRig(this.scene)).render(x,y,angle,time,moved,swing,sequence,WEAPON_EFFECTS[weapon].duration,(this.scene as ArenaScene).lethwei?.techniques.action);else if(hero==='zawgyi')(this.zawgyiRig??=new ZawgyiRig(this.scene)).render(x,y,angle,time,moved,swing,sequence,this.zawgyiLift,invuln,this.zawgyiSlam,this.zawgyiRuby,this.zawgyiCharges);else if(hero==='pyusawhti')(this.pyusawhtiRig??=new PyusawhtiRig(this.scene)).render(x,y,angle,time,moved,swing,sequence,WEAPON_EFFECTS[weapon].duration);else if(hero==='kyansittha')(this.kyansitthaRig??=new KyansitthaRig(this.scene)).render(x,y,angle,time,moved,swing,sequence,WEAPON_EFFECTS[weapon].duration);}
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
                sprite.setTexture(texture).setRotation(0).setFlipX((e.type==='boss'||e.type==='commander')?(e.targetX??x)<e.x:x<e.x);
            }
            const camp=(this.scene as Phaser.Scene&{camp?:{y:number}}).camp;
            sprite.setDepth((camp&&e.y>=camp.y+60?2.7:2)+Math.atan((e.y+e.r)/1000)*.1);
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
        if (counter > 0 && hero!=='samurai')
            this.weapon.setRotation(angle - .5);
    }
}
