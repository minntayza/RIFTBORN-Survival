import {royalDatLoneOffsets,datLoneExplosionDamage} from './zawgyi-card-evolutions';
import {drawFlameLotus} from './lotus-flame-art';
import {drawDatLone} from './dat-lone-art';
import {ZawgyiCards} from './zawgyi-cards';
import {ZAWGYI_SLAM,zawgyiSlamMotion} from './zawgyi-slam-motion';
import {zawgyiStaffContact,zawgyiSlamContact,zawgyiMotion,zawgyiWorldPoint} from './zawgyi-motion';
import {WEAPONS} from './config';
import type {ArenaScene} from './combat';
import {ZAWGYI_SKILLS,validZawgyiLoadout} from './zawgyi';
type Sphere={x:number;y:number;angle:number;flight:number;pull:number;twin?:number;royal?:boolean};
type Flame={x:number;y:number;angle:number;life:number;side:number};
type Burst={kind:'fire'|'royal'|'slam'|'heal'|'tap';x:number;y:number;age:number;radius:number};
const boss=(type:string)=>['boss','commander','shooterBoss'].includes(type);
/** Separate cooldowns; bounded sphere, flame and burst budgets. */
export class ZawgyiCombat {
 readonly cards:ZawgyiCards;readonly equipped;cooldowns:[number,number]=[0,0];
 slamTime=0;slamAim=0;flameTime=0;private slamHit=false;private flameAim=0;private strikeTime=0;private strikeAim=0;private strikeHits=new Set<unknown>();harmonyGlow=0;
 readonly spheres:Sphere[]=[];readonly flames:Flame[]=[];
 private bursts:Burst[]=[];private lastFlame?:{x:number;y:number};private step=0;
 private echoes:{delay:number;x:number;y:number;aim:number;damage:number;sequence:number}[]=[];
 private ground;private effects;
 constructor(private s:ArenaScene){this.cards=new ZawgyiCards(s);s.events?.once('shutdown',()=>this.cards.destroy());this.equipped=validZawgyiLoadout(s.save.zawgyiSkills);this.ground=s.add.graphics().setDepth(1);this.effects=s.add.graphics().setDepth(4.5);}
 get slamAge(){return this.slamTime>0?ZAWGYI_SLAM.duration-this.slamTime:-1;}
 get lift(){return zawgyiSlamMotion(this.slamAge).lift;}
 get speedMultiplier(){return 1;}
 get actionLocked(){return this.flameTime>0||this.slamTime>0&&this.slamAge<ZAWGYI_SLAM.hold;}
 get lockedAim(){return this.slamTime>0&&this.slamAge<ZAWGYI_SLAM.hold?this.slamAim:this.flameTime>0?this.flameAim:this.strikeTime>0?this.strikeAim:undefined;}
 staffAttack(){const s=this.s;if(this.flameTime>0||this.slamTime>0)return;const target=s.enemies.filter(e=>e.active&&Math.hypot(e.x-s.x,e.y-s.y)<=WEAPONS.mysticstaff.range+e.r).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0];if(!target)return;this.strikeAim=Math.atan2(target.y-s.y,target.x-s.x);s.angle=this.strikeAim;s.attackSequence++;s.swing=.24;this.strikeTime=.24;this.strikeHits.clear();if((s.evolution?.tempo||0)>=2||s.evolution?.tempo===1&&s.attackSequence%3===0)this.echoes.push({delay:.32,x:s.x,y:s.y,aim:this.strikeAim,sequence:s.attackSequence,damage:WEAPONS.mysticstaff.damage*.35*(s.earlyPower?1.12:1)});}
 private burst(kind:Burst['kind'],x:number,y:number,radius:number){this.bursts.push({kind,x,y,age:0,radius});if(this.bursts.length>16)this.bursts.shift();}
 private leaveFlame(){const s=this.s,last=this.lastFlame,dx=last?s.x-last.x:Math.cos(s.angle),dy=last?s.y-last.y:Math.sin(s.angle),angle=Math.atan2(dy,dx),side=this.step++%2?1:-1;this.flames.push({x:s.x-Math.sin(angle)*side*5,y:s.y+Math.cos(angle)*side*5+12,angle,life:2,side});if(this.flames.length>48)this.flames.shift();this.lastFlame={x:s.x,y:s.y};}
 activate(slot:number,dx=0,dy=0){const s=this.s;if(slot!==0&&slot!==1||s.hero!=='zawgyi'||s.paused||s.ended||s.countdown>0||this.actionLocked||this.cooldowns[slot]>0)return false;
 const id=this.equipped[slot],angle=dx||dy?Math.atan2(dy,dx):s.angle;this.cooldowns[slot]=ZAWGYI_SKILLS[id].cooldown*(s.options.build==='mobility'?.9:1);
 this.strikeTime=0;this.slamTime=0;s.swing=0;
 if(id==='datlone'){this.spheres.push({x:s.x+Math.cos(angle)*22,y:s.y+Math.sin(angle)*22,angle,flight:.35,pull:2,royal:!!s.cardEvolutions.twindatlone,...(this.cards.twinBonus?{twin:this.cards.twinBonus}:{})});if(this.spheres.length>3)this.spheres.shift();s.audio.play('ricochet-chime');}
 if(id==='flame'){this.flameTime=.32;this.flameAim=angle;s.angle=angle;s.swing=0;this.strikeTime=0;s.protect(.38);this.lastFlame=undefined;this.leaveFlame();s.audio.play('moon-dash');}
 if(id==='slam'){this.slamTime=ZAWGYI_SLAM.duration;this.slamAim=angle;s.angle=angle;this.slamHit=false;s.swing=0;s.protect(ZAWGYI_SLAM.impact+.08);s.audio.play('lotus-guard');}
 this.cards.cast(id);s.notifyCombat(ZAWGYI_SKILLS[id].name.toUpperCase());return true;
 }
 private explode(orb:Sphere){const s=this.s;for(const e of s.enemies)if(e.active&&Math.hypot(e.x-orb.x,e.y-orb.y)<=160+e.r){s.hit(e,datLoneExplosionDamage(orb.twin||0,orb.royal),30,false,false,orb.royal?'Royal Dat Lone':orb.twin?'Twin Dat Lone':'Dat Lone');if(e.active)e.burn=Math.max(e.burn,3);}this.burst(orb.royal?'royal':'fire',orb.x,orb.y,160);s.audio.play('tank-slam');}
 private slam(){const s=this.s,contact=zawgyiSlamContact(s.x,s.y,this.slamAim);for(const e of s.enemies)if(e.active&&Math.hypot(e.x-contact.x,e.y-contact.y)<=175+e.r){s.hit(e,95,110);if(e.active){const locked=e.telegraph>0||e.skillWindup>0||e.chargeTime>0;const stun=boss(e.type)?locked?0:.12:['elite','brute','armoured','cleaver','abomination'].includes(e.type)?1.2:.7;e.stagger=Math.max(e.stagger,stun);}}this.cards.aftershock(contact);this.burst('slam',contact.x,contact.y,175);s.burst(contact.x,contact.y,0xe5cfa2,14);s.strongStop=Math.max(s.strongStop,.045);if(s.save.settings.shake)s.cameras.main.shake(90,.0025);s.audio.play('tank-slam');}

 update(dt:number){const s=this.s;if(s.ended){this.clear();return;}if(s.paused)return;this.cards.update(dt);for(const echo of this.echoes)echo.delay-=dt;const ready=this.echoes.filter(e=>e.delay<=0);this.echoes=this.echoes.filter(e=>e.delay>0);for(const echo of ready){this.burst('tap',echo.x+Math.cos(echo.aim)*55,echo.y+Math.sin(echo.aim)*55,35);for(const e of s.enemies)if(e.active&&zawgyiStaffContact(echo.x,echo.y,echo.aim,.12,echo.sequence,s.elapsed,e,e.r))s.hit(e,echo.damage,12,false,false);}for(let i=0;i<2;i++)this.cooldowns[i as 0|1]=Math.max(0,this.cooldowns[i as 0|1]-dt);
 this.harmonyGlow=Math.max(0,this.harmonyGlow-dt);
 for(const e of this.bursts)e.age+=dt;this.bursts=this.bursts.filter(e=>e.age<(e.kind==='tap'?.22:.8));
 for(let i=this.flames.length-1;i>=0;i--){this.flames[i].life-=dt;if(this.flames[i].life<=1e-6)this.flames.splice(i,1);}
 if(this.flameTime>0){const travel=Math.min(dt,this.flameTime)*640;for(let d=0;d<travel;d+=8){const step=Math.min(8,travel-d),p=s.moveOnGround(s.x,s.y,Math.cos(this.flameAim)*step,Math.sin(this.flameAim)*step,17);s.x=p.x;s.y=p.y;if(!this.lastFlame||Math.hypot(s.x-this.lastFlame.x,s.y-this.lastFlame.y)>=12)this.leaveFlame();}this.flameTime=Math.max(0,this.flameTime-dt);if(this.flameTime<1e-6){this.flameTime=0;this.cards.lotus(s);}s.angle=this.flameAim;}
 if(this.strikeTime>0){const previous=this.strikeTime;this.strikeTime=Math.max(0,this.strikeTime-dt);s.angle=this.strikeAim;
 // Sample the actual sweep to avoid missing contact at lower frame rates.
 for(let remaining=previous;remaining>=this.strikeTime-1e-8;remaining-=Math.min(.008,dt||.008)){
 if(remaining>.192||remaining<.0672)continue;
 for(const e of s.enemies)if(e.active&&!this.strikeHits.has(e)&&zawgyiStaffContact(s.x,s.y,this.strikeAim,remaining,s.attackSequence,s.elapsed,e,e.r)){
 this.strikeHits.add(e);const x=e.x,y=e.y;s.hit(e,WEAPONS.mysticstaff.damage*(s.earlyPower?1.12:1)*(1+this.cards.staffBonus(e)),24);this.boltHit();this.burst('tap',x,y,12);if(this.strikeHits.size===1){if((s.evolution?.reach||0)>=2)s.windSlash(WEAPONS.mysticstaff.damage*.9,{x,y},this.strikeAim);if((s.evolution?.power||0)>=2){for(const n of s.enemies)if(n.active&&Math.hypot(n.x-x,n.y-y)<105+n.r)s.hit(n,WEAPONS.mysticstaff.damage*.5,12,false,false);this.burst('fire',x,y,105);}}if(this.strikeHits.size===1)s.audio.play('staff-contact');}
 }}

 for(const e of s.enemies)if(e.active&&this.flames.some(p=>Math.hypot(e.x-p.x,e.y-p.y)<24+e.r*.5)){e.burn=Math.max(e.burn,.4);e.slow=Math.max(e.slow,.35);}
 if(this.slamTime>0){this.slamTime=Math.max(0,this.slamTime-dt);if(!this.slamHit&&ZAWGYI_SLAM.duration-this.slamTime>=ZAWGYI_SLAM.impact){this.slamHit=true;this.slam();}if(this.slamTime<1e-6)this.slamTime=0;}
 for(let i=this.spheres.length-1;i>=0;i--){const orb=this.spheres[i];let remaining=dt;
 if(orb.flight>0){const step=Math.min(remaining,orb.flight),p=s.moveOnGround(orb.x,orb.y,Math.cos(orb.angle)*480*step,Math.sin(orb.angle)*480*step,12);orb.x=p.x;orb.y=p.y;orb.flight=Math.max(0,orb.flight-step);if(orb.flight<1e-6)orb.flight=0;remaining-=step;}
 if(orb.flight===0){const step=Math.min(remaining,orb.pull);for(const e of s.enemies){const dx=orb.x-e.x,dy=orb.y-e.y,d=Math.hypot(dx,dy);if(!e.active||d>=155+e.r||d<12)continue;const travel=Math.min(d-12,170*step*(boss(e.type)?.08:1)),p=s.moveOnGround(e.x,e.y,dx/d*travel,dy/d*travel,e.r);e.x=p.x;e.y=p.y;}orb.pull=Math.max(0,orb.pull-step);if(orb.pull<1e-6){this.explode(orb);this.spheres.splice(i,1);}}
 }
 s.visuals.zawgyiLift=this.lift;s.visuals.zawgyiSlam=this.slamAge;
 }
 clear(){this.echoes=[];this.cards.clear();this.spheres.length=this.flames.length=this.bursts.length=0;this.slamTime=this.flameTime=this.strikeTime=0;this.strikeHits.clear();}
 boltHit(){const s=this.s;s.identityCharge+=100/6;if(s.identityCharge>=99.99){s.identityCharge=0;s.identityProcs++;const restored=Math.min(s.maxHp*.05,s.maxHp-s.hp);if(restored>0){s.heal(restored);this.harmonyGlow=.9;this.burst('heal',s.x,s.y,35);}}}
 render(time:number){const g=this.effects,f=this.ground;g.clear();f.clear();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,wide=this.s.save.settings.mapView===2;this.cards.render(time,reduced||wide);
 const star=(x:number,y:number,r:number,alpha=1,color=0xffe3a0)=>{g.fillStyle(color,alpha);g.fillPoints([{x,y:y-r},{x:x+r*.3,y:y-r*.3},{x:x+r,y},{x:x+r*.3,y:y+r*.3},{x,y:y+r},{x:x-r*.3,y:y+r*.3},{x:x-r,y},{x:x-r*.3,y:y-r*.3}],true);};
 const flame=(x:number,y:number,r:number,alpha:number,phase:number)=>{const flicker=reduced?0:Math.sin(time*4+phase)*r*.06;f.fillStyle(0xe77938,alpha*.11);f.fillEllipse(x,y+2,r*3,r*1.4);g.fillStyle(0xe95737,alpha*.85);g.fillCircle(x,y-r*.25,r*.55);g.fillTriangle(x-r*.55,y-r*.2,x+r*.55,y-r*.2,x+flicker,y-r*1.75);g.fillStyle(0xffbd58,alpha);g.fillEllipse(x,y-r*.35,r*.72,r*1.25);g.fillStyle(0xffecc2,alpha*.95);g.fillEllipse(x,y-r*.22,r*.32,r*.64);};
 for(const [i,p] of this.flames.entries()){const a=Math.min(1,p.life/.4);if(this.cards.level('lotusflame')){if(i%3===0)drawFlameLotus(f,p.x,p.y,15,a,2-p.life,reduced,!!this.s.cardEvolutions.lotusflame);continue;}f.fillStyle(0xe7994b,a*.3);f.fillEllipse(p.x,p.y,17,8);flame(p.x,p.y,11,a,i);if(!reduced&&!wide&&i%4===0)star(p.x+Math.sin(i+time)*6,p.y-16-(time*15+i*3)%14,2,a*.7);}
 if(this.flameTime>0){const s=this.s;for(let i=0;i<3;i++){const side=i%2?1:-1,x=s.x-Math.cos(s.angle)*(12+i*8)-Math.sin(s.angle)*side*13,y=s.y+12-Math.sin(s.angle)*(12+i*8)+Math.cos(s.angle)*side*13;star(x,y,3,.7);}g.lineStyle(2,0xffd38d,.7);for(const side of [-1,1])g.lineBetween(s.x+side*17,s.y+10,s.x+side*24,s.y+18);}
 for(const orb of this.spheres){const hovering=reduced?0:Math.sin(time*2)*1,y=orb.y-14+hovering;
 f.fillStyle(0xffd27c,.10);f.fillCircle(orb.x,orb.y,155);f.lineStyle(1,0xffd68a,.45);f.strokeCircle(orb.x,orb.y,155);
 if(!reduced&&orb.flight===0)for(let i=0;i<(wide?4:6);i++){const p=(time*.7+i/9)%1,a=i*2.399+time*.4,r=150*(1-p);g.lineStyle(2,0xf6c97c,.2+p*.4);g.beginPath();g.arc(orb.x,orb.y,r,a,a+.36);g.strokePath();star(orb.x+Math.cos(a)*r,orb.y+Math.sin(a)*r,2+p*2,p*.7);}
 if(orb.royal){
 const offsets=royalDatLoneOffsets(time,orb.pull,reduced).sort((a,b)=>a.y-b.y);
 // Opposing orbs have a clear gap throughout the pull; converge only in the final 0.24 seconds.
 if(!reduced){const points=[];for(let i=0;i<=32;i++){const angle=i/32*Math.PI*2+time*2.4;points.push({x:orb.x+Math.cos(angle)*33,y:y+Math.sin(angle)*33});}g.lineStyle(5,0xf6b94d,.28);g.strokePoints(points,false);g.lineStyle(1.5,0xffe7a4,.8);g.strokePoints(points,false);}
 for(const o of offsets)drawDatLone(g,orb.x+o.x,y+o.y,16,time,reduced);
 }else{
 const drawCompanion=()=>{const a=reduced?-.7:time*3,x=orb.x+Math.cos(a)*29,cy=y+Math.sin(a)*16;
 if(!reduced&&!wide)for(let i=3;i>=1;i--){const t=a-i*.17;star(orb.x+Math.cos(t)*29,y+Math.sin(t)*16,2.5-i*.4,.5);}
 drawDatLone(g,x,cy,8,time+.8,reduced);};
 if(orb.twin&&Math.sin(reduced?-.7:time*3)<0)drawCompanion();
 drawDatLone(g,orb.x,y,16,time,reduced);
 if(orb.twin&&Math.sin(reduced?-.7:time*3)>=0)drawCompanion();
 }
 if(orb.flight===0){g.lineStyle(1.5,0xffe3a0,.65);g.beginPath();g.arc(orb.x,y,23,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-orb.pull/2));g.strokePath();}
 if(!reduced&&!wide){const a=time*4;star(orb.x+Math.cos(a)*30,y+Math.sin(a)*14,3,.9);}
 }
 if(this.slamTime>0&&!this.slamHit){const contact=zawgyiSlamContact(this.s.x,this.s.y,this.slamAim);f.fillStyle(0xffe4a0,.07);f.fillCircle(contact.x,contact.y,175);f.lineStyle(1.5,0xeacb87,.45);f.strokeCircle(contact.x,contact.y,175);star(contact.x,contact.y,6,.8);}
 for(const b of this.bursts){const p=b.age/.8,fade=1-p;if(b.kind==='tap'){const fade=Math.max(0,1-b.age/.22);star(b.x,b.y-8,7*fade,fade*.75);for(let i=0;i<3;i++)star(b.x+Math.cos(i*2.1)*p*18,b.y-8+Math.sin(i*2.1)*p*18,3,fade,0xffc4aa);continue;}if(b.kind==='heal'){f.lineStyle(3,0xbbe8ad,fade*.65);f.strokeEllipse(b.x,b.y+15,30+p*40,12+p*16);for(let i=0;i<5;i++){g.fillStyle(i%2?0xbbe8ad:0xffe3a0,fade*.8);g.fillEllipse(b.x+(i-2)*9,b.y-12-p*22,7,12);}continue;}
 f.lineStyle(1.5,0xffe4a4,fade*.3);f.strokeCircle(b.x,b.y,b.radius);
 if(b.kind==='royal'){const spread=Math.min(1,p*2.5),r=b.radius*spread;
 f.lineStyle(10,0xffbf55,fade*.2);f.strokeCircle(b.x,b.y,r);f.lineStyle(3,0xffecc0,fade);f.strokeCircle(b.x,b.y,r);
 drawFlameLotus(g,b.x,b.y+12,38*(.65+spread*.35),fade,b.age,reduced);
 for(let i=0;i<(reduced||wide?4:8);i++){const a=i*Math.PI*2/(reduced||wide?4:8);star(b.x+Math.cos(a)*r*.75,b.y+Math.sin(a)*r*.75,6*fade,fade, i%2?0xffce79:0xff8b76);}
 continue;}
 if(b.kind==='fire'){f.fillStyle(0xf29743,fade*.2);f.fillCircle(b.x,b.y,b.radius*Math.min(1,.3+p*2));g.lineStyle(4,0xffd88c,fade);g.strokeCircle(b.x,b.y,b.radius*Math.min(1,.2+p*2));for(let i=0;i<(reduced||wide?6:10);i++){const a=i*Math.PI*2/(reduced||wide?6:10),r=b.radius*(.25+p*.75);flame(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r,12*fade+3,fade,i);if(!reduced)star(b.x+Math.cos(a+.1)*r,b.y+Math.sin(a+.1)*r-p*25,4,fade);}star(b.x,b.y,18*fade,fade);}
 else{for(let i=0;i<4;i++){g.fillStyle(0xe9d8b6,fade*.25);g.fillCircle(b.x+(i-1.5)*(10+p*28),b.y-3-p*9,7+fade*9);}const r=b.radius*Math.min(1,.12+p*2.2);f.lineStyle(12,0xe9af5c,fade*.25);f.strokeCircle(b.x,b.y,r);f.lineStyle(3,0xffe5b0,fade);f.strokeCircle(b.x,b.y,r);f.lineStyle(1.5,0xe78764,fade);f.strokeCircle(b.x,b.y,r*.8);for(let i=0;i<8;i++){const a=i*Math.PI/4;f.lineStyle(2,0xdcc79a,fade*.35);f.strokePoints([{x:b.x+Math.cos(a)*r*.2,y:b.y+Math.sin(a)*r*.2},{x:b.x+Math.cos(a+.12)*r*.32,y:b.y+Math.sin(a+.12)*r*.32},{x:b.x+Math.cos(a)*r*.48,y:b.y+Math.sin(a)*r*.48}],false);star(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r,5,fade);const px=b.x+Math.cos(a)*r*.72,py=b.y+Math.sin(a)*r*.72-(reduced?0:p*25),size=4+fade*4;g.fillStyle(i%2?0xffc1aa:0xffe6a8,fade*.9);g.fillEllipse(px-size*.5,py,size,size*1.8);g.fillEllipse(px+size*.5,py,size,size*1.8);g.fillStyle(0xffedba,fade);g.fillCircle(px,py+size*.3,size*.35);}g.fillStyle(0xffd68d,fade*.7);for(let i=0;i<5;i++){const a=(i-2)*.45;g.fillEllipse(b.x+Math.sin(a)*17,b.y-10-Math.cos(a)*12,11,25);}star(b.x,b.y-9,9,fade);}}
 if(this.strikeTime>0){const pose=zawgyiMotion(time,false,this.strikeTime,this.s.attackSequence,-1,this.strikeAim),tip=zawgyiWorldPoint(pose.tip,this.s.x,this.s.y,this.strikeAim);if(!reduced&&this.strikeTime<.19&&this.strikeTime>.06){const points=[];for(let i=5;i>=0;i--){const previous=Math.min(.24,this.strikeTime+i*.006),p=zawgyiMotion(time,false,previous,this.s.attackSequence,-1,this.strikeAim);points.push(zawgyiWorldPoint(p.tip,this.s.x,this.s.y,this.strikeAim));}g.lineStyle(5,0xf4b85e,.22);g.strokePoints(points,false);g.lineStyle(2,0xffe7a8,.85);g.strokePoints(points,false);}star(tip.x,tip.y,wide?3:3.5,.65);}
 }
}
