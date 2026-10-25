import type Phaser from 'phaser';
import type {WeaponId} from './config';
import {gunnerWeaponPose} from './gunner-motion';
import {isGunnerWeapon} from './gunner-weapons';
export type GunnerRound={x:number;y:number;vx:number;vy:number;explosive:boolean;piercingRound?:boolean;bounces?:number;kind?:string};
export const GUNNER_FX_BUDGET=32;
export function extraLoadedRounds(ammo:number,maxAmmo:number,rank:number){
 const bonus=Math.max(0,Math.min(16,Math.floor(rank)*4)),base=maxAmmo-bonus;
 return {slots:bonus,loaded:Math.max(0,Math.min(bonus,Math.floor(ammo-base)))};
}
export function gunnerRoundStyle(weapon:WeaponId,round:Pick<GunnerRound,'explosive'|'piercingRound'|'bounces'>){
 return {color:round.explosive?0xffaa87:round.bounces?0xf0b0e4:round.piercingRound?0x9de8f5:0xffdfa2,
  tail:weapon==='shotgun'?11:weapon==='smg'?16:23,core:weapon==='shotgun'?2:2.7};
}
export function reloadFraction(remaining:number,duration:number){return Math.max(0,Math.min(1,1-remaining/Math.max(.01,duration)));}
type Event={kind:'muzzle'|'pierce'|'bounce'|'verdict'|'refill';x:number;y:number;born:number;angle:number;out:number;radius:number;color:number};
type State={x:number;y:number;angle:number;time:number;weapon:WeaponId;ammo:number;maxAmmo:number;magazine:number;quickHands:number;reload:number;reloadDuration:number;overdrive:number};
export class GunnerSkillEffects{
 private g:Phaser.GameObjects.Graphics;
 private events:Event[]=[];
 private lastOverdrive=0;
 private overdriveBorn=-10;
 constructor(scene:Phaser.Scene){this.g=scene.add.graphics().setDepth(4.2);}
 private event(e:Event){this.events.push(e);if(this.events.length>GUNNER_FX_BUDGET)this.events.shift();}
 muzzle(x:number,y:number,angle:number,time:number,color=0xffdfa2){this.event({kind:'muzzle',x,y,angle,out:0,born:time,radius:0,color});}
 pierce(x:number,y:number,angle:number,time:number){this.event({kind:'pierce',x,y,angle,out:0,born:time,radius:0,color:0x9de8f5});}
 bounce(x:number,y:number,incoming:number,outgoing:number,time:number){this.event({kind:'bounce',x,y,angle:incoming,out:outgoing,born:time,radius:0,color:0xf0b0e4});}
 verdict(x:number,y:number,radius:number,time:number,color=0xffbd94){
  // Shotgun pellets can explode together. Keep their real damage, merge only nearby artwork.
  if(this.events.some(e=>e.kind==='verdict'&&e.color===color&&time-e.born<.06&&Math.hypot(x-e.x,y-e.y)<25))return;
  this.event({kind:'verdict',x,y,angle:0,out:0,born:time,radius,color});
 }
 refill(x:number,y:number,time:number){this.event({kind:'refill',x,y,angle:0,out:0,born:time,radius:0,color:0xa7edcf});}
 private star(x:number,y:number,r:number,color:number,fade:number){
  const points=[];for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,d=i%2?r*.5:r;points.push({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d});}
  this.g.fillStyle(color,fade);this.g.fillPoints(points,true);this.g.lineStyle(1,0xfff4d7,fade*.8);this.g.strokePoints(points,true);
 }
 round(b:GunnerRound,weapon:WeaponId,time:number,reduced=false){
  const g=this.g,a=Math.atan2(b.vy,b.vx),style=gunnerRoundStyle(weapon,b),tail=reduced?style.tail*.5:style.tail;
  const back={x:b.x-Math.cos(a)*tail,y:b.y-Math.sin(a)*tail};
  if(!reduced){g.lineStyle(6,style.color,.13);g.lineBetween(b.x,b.y,back.x,back.y);}
  g.lineStyle(2.3,style.color,.9);g.lineBetween(b.x,b.y,back.x,back.y);
  g.lineStyle(1,0xfff9e5,1);g.lineBetween(b.x,b.y,b.x-Math.cos(a)*tail*.55,b.y-Math.sin(a)*tail*.55);
  g.fillStyle(style.color,.95);g.fillCircle(b.x,b.y,style.core);g.fillStyle(0xfffbe9,1);g.fillCircle(b.x,b.y,1.2);
  if(b.explosive){g.lineStyle(1.2,0xffbd95,.9);g.strokeCircle(b.x,b.y,5);if(!reduced)this.star(b.x-Math.cos(a)*9,b.y-Math.sin(a)*9,2.5,0xffdfa1,.85);}
  else if(b.bounces&&!reduced){for(let i=1;i<=2;i++){g.fillStyle(0xf4c6ea,.65/i);g.fillCircle(back.x-Math.cos(a)*i*5,back.y-Math.sin(a)*i*5,1.4);}}
 }
 render(s:State,reduced=false){
  const g=this.g;g.clear();
  if(s.overdrive>0&&this.lastOverdrive<=0)this.overdriveBorn=s.time;
  this.lastOverdrive=s.overdrive;
  if(s.overdrive>0){
   const age=s.time-this.overdriveBorn,progress=Math.min(1,s.overdrive/3);
   g.lineStyle(2.3,0xffd58c,.85);g.beginPath();g.arc(s.x,s.y,35,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);g.strokePath();
   for(let i=0;i<4;i++){
    const a=i*Math.PI/2+(reduced?0:s.time*.9),r=38,px=s.x+Math.cos(a)*r,py=s.y+Math.sin(a)*r;
    this.star(px,py,3.5,i%2?0xffdbb3:0xffe9ae,.85);
   }
   if(age<.5){const fade=1-age/.5,r=reduced?30:24+age*50;
    for(let i=0;i<6;i++){const a=i*Math.PI/3;this.star(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r,4,0xffd7a4,fade*.9);}
    this.star(s.x,s.y-47-(reduced?0:age*12),9,0xffe0a2,fade);g.fillStyle(0x80566a,fade);g.fillCircle(s.x-2.5,s.y-48-(reduced?0:age*12),1);g.fillCircle(s.x+2.5,s.y-48-(reduced?0:age*12),1);
   }
  }
  const reserve=extraLoadedRounds(s.ammo,s.maxAmmo,s.magazine);
  if(reserve.slots){
   const rows=Math.ceil(reserve.slots/4),left=s.x-13,top=s.y+39;
   g.fillStyle(0x312a40,.65);g.fillRoundedRect(left-4,top-4,32,rows*5+7,4);
   for(let i=0;i<reserve.slots;i++){const px=left+i%4*7,py=top+Math.floor(i/4)*5;g.fillStyle(i<reserve.loaded?0xffd48a:0x776d75,i<reserve.loaded?.95:.45);g.fillRoundedRect(px,py,4,3,1);}
  }
  if(s.reload>0&&s.quickHands&&isGunnerWeapon(s.weapon)){
   const p=reloadFraction(s.reload,s.reloadDuration),pose=gunnerWeaponPose(s.weapon,s.x,s.y,s.angle,1,false,false,{reload:s.reload,reloadDuration:s.reloadDuration,overdrive:s.overdrive}),cx=pose.grip.x,cy=pose.grip.y;
   g.lineStyle(2.2,0xb9f2dc,.85);g.beginPath();g.arc(cx,cy,19,-Math.PI/2,-Math.PI/2+Math.PI*2*p);g.strokePath();
   if(!reduced){
    const lift=Math.sin(p*Math.PI),px=cx-Math.cos(s.angle)*(18*(1-p)),py=cy+18*(1-p)-lift*10;
    g.fillStyle(0x96dbc9,.85);g.fillRoundedRect(px-3,py-6,6,11,2);g.lineStyle(1,0xe8ffe2,.9);g.lineBetween(px-2,py-2,px+2,py-2);
    for(let i=0;i<Math.min(3,s.quickHands);i++){const back=9+i*5;g.lineStyle(1.2,0xcaf8df,.5);g.lineBetween(px-back,py+3+i*2,px-back+6,py+i*2);}
   }
  }
  this.events=this.events.filter(e=>s.time-e.born<(e.kind==='verdict'?.48:e.kind==='refill'?.4:e.kind==='muzzle'?.1:.25));
  for(const e of this.events){
   const duration=e.kind==='verdict'?.48:e.kind==='refill'?.4:e.kind==='muzzle'?.1:.25,age=Math.max(0,s.time-e.born),fade=Math.max(0,1-age/duration),point=(u:number,v:number,a=e.angle)=>({x:e.x+Math.cos(a)*u-Math.sin(a)*v,y:e.y+Math.sin(a)*u+Math.cos(a)*v});
   if(e.kind==='muzzle'){
    this.star(e.x,e.y,reduced?4:6+fade*4,e.color,fade*.9);
   }else if(e.kind==='pierce'){
    const from=point(-13,0),to=point(17,0);g.lineStyle(2,0xc8f5ff,fade*.85);g.lineBetween(from.x,from.y,to.x,to.y);
    for(const side of [-1,1]){const p=point(4,side*(reduced?6:7+age*18));this.star(p.x,p.y,3,0xb6eafa,fade);}
   }else if(e.kind==='bounce'){
    const from=point(-18,0),to=point(18,0,e.out);g.lineStyle(2,0xf3bee8,fade*.8);g.beginPath();g.moveTo(from.x,from.y);g.lineTo(e.x,e.y);g.lineTo(to.x,to.y);g.strokePath();
    this.star(e.x,e.y,5+fade*2,0xf1b7df,fade);
   }else if(e.kind==='refill'){
    this.star(e.x,e.y-30-(reduced?0:age*15),6,0xb8f1d2,fade);
    if(!reduced)for(let i=0;i<4;i++){g.fillStyle(i%2?0xffdfa1:0xb6efd2,fade*.8);g.fillRoundedRect(e.x+(i-1.5)*8,e.y+32-age*25,3,6,1);}
   }else{
    const spread=reduced?1:1-Math.pow(1-Math.min(1,age/.16),3),r=e.radius*spread;
    const chain=e.color===0x72e5ff,highlight=chain?0xd4faff:0xffdfa8,core=chain?0x9ef1ff:0xffcd88,detail=chain?0x247f9e:0x80566a,size=Math.min(1,e.radius/85);
    // Both generations share the animation; cyan distinguishes the smaller chain blasts.
    for(let i=0;i<8;i++){const a=i*Math.PI/4,px=e.x+Math.cos(a)*r*.8,py=e.y+Math.sin(a)*r*.8;
     if(!reduced){g.fillStyle(chain?e.color:i%2?0xffbd99:0xf4b2b6,fade*.18);g.fillCircle(px,py,12*size+r*.12);}
     g.lineStyle(2,highlight,fade*.8);g.beginPath();g.arc(e.x,e.y,r,a+.1,a+.45);g.strokePath();
     if(!reduced)this.star(px,py,(3+fade*3)*size,highlight,fade*.9);
    }
    this.star(e.x,e.y,(10+fade*7)*size,core,fade);g.fillStyle(detail,fade);g.fillCircle(e.x-4,e.y-1,1.5);g.fillCircle(e.x+4,e.y-1,1.5);g.lineStyle(1.2,detail,fade);g.beginPath();g.arc(e.x,e.y+3,3,0,Math.PI);g.strokePath();
   }
  }
 }
}
