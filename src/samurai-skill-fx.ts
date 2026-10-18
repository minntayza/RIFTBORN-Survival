import type Phaser from 'phaser';
import {weaponPose,type Point} from './weapon-effects';
import {type WeaponId} from './config';

type Mark={active:boolean;x:number;y:number;r:number;bleed:number};
type Event={kind:'reach'|'dragon'|'counter'|'oath'|'wind';x:number;y:number;angle:number;born:number;radius:number;level:number;points?:Point[]};
export const SAMURAI_FX_BUDGET={events:24,markedEnemies:20};
/** The same 0–55% sword interval sampled by meleeContact, including mirrored poses. */
export function samuraiReachPath(id:WeaponId,x:number,y:number,angle:number,sequence:number,reach:number,arc:number){
 return Array.from({length:25},(_,i)=>weaponPose(id,x,y,angle,i/24*.55,true,sequence,false,false,reach,arc,'samurai').tip);
}
/** Launch along aim, independent of the sword's sideways/downward recovery pose. */
export function samuraiStormLaunch(x:number,y:number,angle:number){return{x:x+Math.cos(angle)*28,y:y+Math.sin(angle)*28};}
/** Main wind silhouette remains inside the projectile's 30-unit contact radius. */
export function stormCrescent(x:number,y:number,angle:number){
 return Array.from({length:21},(_,i)=>{const a=-1.28+i/20*2.56,u=-3+26*Math.cos(a),v=26*Math.sin(a);return{x:x+Math.cos(angle)*u-Math.sin(angle)*v,y:y+Math.sin(angle)*u+Math.cos(angle)*v};});
}
export class SamuraiSkillEffects{
 private g:Phaser.GameObjects.Graphics;
 private events:Event[]=[];
 constructor(scene:Phaser.Scene){this.g=scene.add.graphics().setDepth(4.15);}
 private add(e:Event){this.events.push(e);if(this.events.length>SAMURAI_FX_BUDGET.events)this.events.shift();}
 reach(id:WeaponId,x:number,y:number,angle:number,sequence:number,reach:number,arc:number,time:number){
  this.add({kind:'reach',x,y,angle,born:time,radius:0,level:Math.max(1,Math.round((reach-1)*4)),points:samuraiReachPath(id,x,y,angle,sequence,reach,arc)});
 }
 dragon(x:number,y:number,angle:number,range:number,level:number,time:number){this.add({kind:'dragon',x,y,angle,born:time,radius:range,level});}
 counter(x:number,y:number,radius:number,level:number,time:number){this.add({kind:'counter',x,y,angle:0,born:time,radius,level});}
 oath(x:number,y:number,time:number,level:number){this.add({kind:'oath',x,y,angle:0,born:time,radius:0,level});}
 windHit(x:number,y:number,time:number){this.add({kind:'wind',x,y,angle:0,born:time,radius:0,level:1});}
 private petal(x:number,y:number,size:number,color:number,alpha:number){
  const g=this.g;g.fillStyle(color,alpha);g.fillEllipse(x,y,size*.8,size*1.5);g.lineStyle(1,0xfff0dd,alpha*.65);g.lineBetween(x,y-size*.45,x,y+size*.35);
 }
 private star(x:number,y:number,size:number,color:number,alpha:number){
  this.g.fillStyle(color,alpha);this.g.fillPoints([{x,y:y-size},{x:x+size*.28,y:y-size*.28},{x:x+size,y},{x:x+size*.28,y:y+size*.28},{x,y:y+size},{x:x-size*.28,y:y+size*.28},{x:x-size,y},{x:x-size*.28,y:y-size*.28}],true);
 }
 wind(x:number,y:number,vx:number,vy:number,time:number,evolved:boolean,reduced=false){
  const g=this.g,a=Math.atan2(vy,vx),points=stormCrescent(x,y,a);
  if(!reduced){g.lineStyle(8,0x80dbc6,.15);g.strokePoints(points,false);}
  g.lineStyle(evolved?4:3,0xa9f0d8,.9);g.strokePoints(points,false);g.lineStyle(1.2,0xf7ffe7,1);g.strokePoints(points.slice(3,18),false);
  if(!reduced)for(let i=0;i<3;i++){
   const u=-16-i*13,v=Math.sin(time*12+i*1.6)*6,px=x+Math.cos(a)*u-Math.sin(a)*v,py=y+Math.sin(a)*u+Math.cos(a)*v;
   this.petal(px,py,3.5,0xcaf5d7,.8-i*.15);
  }
 }
 render(x:number,y:number,time:number,counter:number,counterMax:number,levels:{range:number;bleed:number;counter:number},evolved:{bleed:boolean;counter:boolean},enemies:readonly Mark[],reduced=false){
  const g=this.g;g.clear();
  // Mark only enemies actually afflicted by Blood Oath, with a fixed crowded-wave budget.
  let marked=0;
  for(const e of enemies){
   if(!e.active||e.bleed<=0||!levels.bleed||Math.hypot(e.x-x,e.y-y)>800)continue;
   if(marked++>=SAMURAI_FX_BUDGET.markedEnemies)break;
   const fade=Math.min(1,e.bleed*3),py=e.y+e.r*.65,phase=reduced?0:time*.9;
   for(let i=0;i<3;i++){const a=i*Math.PI*2/3+phase;this.petal(e.x+Math.cos(a)*10,py+Math.sin(a)*5,3+Math.min(3,levels.bleed)*.5,0xf58ca5,fade*.9);}
   g.lineStyle(1.2,evolved.bleed?0xffce98:0xd97a9e,fade*.7);g.strokeEllipse(e.x,py,27,12);
   if(!reduced)for(let i=0;i<Math.min(3,levels.bleed);i++){const p=(time*1.1+i*.34)%1;this.petal(e.x+(i-1)*7,e.y-e.r-p*13,3,0xf5a7bb,(1-p)*fade*.8);}
  }
  if(counter>0){
   const progress=Math.max(0,Math.min(1,counter/Math.max(.01,counterMax)));
   // This close lotus is a timing indicator, not the counter's damage radius.
   g.lineStyle(2.5,0xffdda5,.95);g.beginPath();g.arc(x,y,38,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);g.strokePath();
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2,r=23+progress*10;this.petal(x+Math.cos(a)*r,y+Math.sin(a)*r,4+progress*3,evolved.counter?0xffc7eb:0xffdfac,.85);}
   this.star(x,y-48,4+Math.min(3,levels.counter),0xffedbd,.95);
  }
  this.events=this.events.filter(e=>time-e.born<(e.kind==='dragon'?.65:e.kind==='counter'?.5:.34));
  for(const e of this.events){
   const age=Math.max(0,time-e.born),duration=e.kind==='dragon'?.65:e.kind==='counter'?.5:.34,fade=Math.max(0,1-age/duration);
   if(e.kind==='reach'){
    const points=e.points!;
    if(!reduced){g.lineStyle(6+e.level,0xecc58a,fade*.22);g.strokePoints(points,false);}
    g.lineStyle(2.3,0xffdfa7,fade*.85);g.strokePoints(points,false);g.lineStyle(1,0xfffae7,fade);g.strokePoints(points.slice(4,22),false);
    const p=points[20];this.star(p.x,p.y,3+e.level*.5,0xffedc4,fade);
   }else if(e.kind==='counter'){
    const r=e.radius*(reduced?1:.5+Math.min(1,age/.12)*.5);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;g.lineStyle(2,0xffde9f,fade*.8);g.beginPath();g.arc(e.x,e.y,r,a+.08,a+.5);g.strokePath();this.petal(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,5+e.level,0xffc7dd,fade);}
    this.star(e.x,e.y-27,12,0xffe7ab,fade);
    g.fillStyle(0x805768,fade);g.fillCircle(e.x-3,e.y-28,1.1);g.fillCircle(e.x+3,e.y-28,1.1);
    g.lineStyle(1,0x805768,fade);g.beginPath();g.arc(e.x,e.y-24,2,0,Math.PI);g.strokePath();
    if(!reduced)for(let i=0;i<5;i++){const a=i*Math.PI*2/5,orbit=18+age*45;this.petal(e.x+Math.cos(a)*orbit,e.y-20+Math.sin(a)*orbit-age*15,4,0xf7bed8,fade);}
   }else if(e.kind==='oath'||e.kind==='wind'){
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5,r=8+(reduced?0:age*35);this.petal(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r-age*12,4,e.kind==='oath'?0xf5a1b7:0xb5f1d7,fade);}
   }else{
    // A friendly fire dragon travels inside Dragon Slash's real forward cone.
    const travel=reduced?.8:Math.min(1,age/.16),length=(e.radius-24)*travel;
    const local=(u:number,v:number)=>({x:e.x+Math.cos(e.angle)*u-Math.sin(e.angle)*v,y:e.y+Math.sin(e.angle)*u+Math.cos(e.angle)*v});
    const body=Array.from({length:49},(_,i)=>{const u=length*i/48,v=Math.sin(i/48*11.7-age*12)*Math.min(15,u*.18);return local(u,v);});
    if(!reduced){g.lineStyle(26,0xf6a064,fade*.13);g.strokePoints(body,false);}
    for(let i=1;i<body.length;i++){
     g.lineStyle(2+i/body.length*12,0xef9979,fade*.85);g.lineBetween(body[i-1].x,body[i-1].y,body[i].x,body[i].y);
     g.lineStyle(1+i/body.length*3,0xffe5ac,fade*.95);g.lineBetween(body[i-1].x,body[i-1].y,body[i].x,body[i].y);
    }
    if(!reduced)for(let i=8;i<44;i+=6){const p=body[i];this.petal(p.x,p.y,3+e.level,0xffd396,fade*.85);}
    const head=local(length,0),size=16+Math.min(4,e.level);
    // Peach muzzle, cream horns, a coral mane, bright eye and cheek: a little dragon, not a fireball.
    for(const side of [-1,1]){
     const ear=local(length-9,side*10),horn=local(length-13,side*24),root=local(length-1,side*14);
     g.fillStyle(0xffe8b5,fade);g.fillTriangle(ear.x,ear.y,horn.x,horn.y,root.x,root.y);
    }
    for(let i=0;i<5;i++){const a=1.8+i*.67,p=local(length+Math.cos(a)*17,Math.sin(a)*17);this.petal(p.x,p.y,7,0xee998f,fade);}
    g.fillStyle(0xffc58c,fade);g.fillCircle(head.x,head.y,size);
    const muzzle=local(length+12,4);g.fillStyle(0xffdfad,fade);g.fillCircle(muzzle.x,muzzle.y,10);
    const eye=local(length+4,-6),cheek=local(length+4,7);
    g.fillStyle(0x694b61,fade);g.fillCircle(eye.x,eye.y,3);g.fillStyle(0xfff7e5,fade);g.fillCircle(eye.x+.8,eye.y-.8,1.2);
    g.fillStyle(0xf390a3,fade*.9);g.fillCircle(cheek.x,cheek.y,4);
    const smile=[local(length+11,6),local(length+15,9),local(length+19,6)];g.lineStyle(1.4,0x9d6c70,fade);g.strokePoints(smile,false);
    const nose=local(length+21,0);g.fillStyle(0xba8581,fade);g.fillCircle(nose.x,nose.y,1.2);
    g.lineStyle(1.5,0xfff0bf,fade);for(const side of [-1,1]){const start=local(length+15,side*4),whisker=local(length+22,side*12);g.lineBetween(start.x,start.y,whisker.x,whisker.y);}

   }
  }
 }
}
