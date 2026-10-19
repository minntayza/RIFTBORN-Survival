import type Phaser from 'phaser';
import type {WeaponId} from './config';
import {weaponPose,WEAPON_EFFECTS} from './weapon-effects';
export const TANK_FX_BUDGET=28;
export function tankStaminaMeter(stamina:number,rank:number){const capacity=100*(1+Math.max(0,rank)*.4);return{capacity,fill:Math.max(0,Math.min(1,stamina/capacity))};}
export function tankGuardHalfAngle(rank:number){return 1+Math.max(0,rank)*.25;}
type Event={kind:'bash'|'hammer'|'block'|'reflect'|'slam'|'crown'|'charge';x:number;y:number;angle:number;radius:number;level:number;born:number};
type State={x:number;y:number;angle:number;time:number;weapon:WeaponId;swing:number;sequence:number;stamina:number;lungs:number;guard:number;thorns:number;reflect:boolean};
export class TankSkillEffects{
 private g:Phaser.GameObjects.Graphics;
 private events:Event[]=[];
 constructor(scene:Phaser.Scene){this.g=scene.add.graphics().setDepth(4.2);}
 private add(e:Event){this.events.push(e);if(this.events.length>TANK_FX_BUDGET)this.events.shift();}
 bash(x:number,y:number,angle:number,thorns:number,hammer:boolean,time:number){this.add({kind:hammer?'hammer':'bash',x,y,angle,radius:hammer?75:22,level:thorns,born:time});}
 block(x:number,y:number,angle:number,time:number){this.add({kind:'block',x,y,angle,radius:0,level:0,born:time});}
 reflect(x:number,y:number,angle:number,time:number){this.add({kind:'reflect',x,y,angle,radius:0,level:0,born:time});}
 slam(x:number,y:number,radius:number,level:number,time:number,kind:'slam'|'crown'|'charge'='slam'){this.add({kind,x,y,angle:0,radius,level,born:time});}
 private diamond(x:number,y:number,r:number,color:number,fade:number){const g=this.g;g.fillStyle(color,fade);g.fillPoints([{x,y:y-r},{x:x+r*.6,y},{x,y:y+r},{x:x-r*.6,y}],true);g.lineStyle(1,0xfff1cf,fade*.65);g.lineBetween(x,y-r*.6,x,y+r*.3);}
 private star(x:number,y:number,r:number,color:number,fade:number){const p=[];for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,d=i%2?r*.5:r;p.push({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d});}this.g.fillStyle(color,fade);this.g.fillPoints(p,true);}
 reflectedRound(b:{x:number;y:number;vx:number;vy:number},reduced=false){
  const g=this.g,a=Math.atan2(b.vy,b.vx),length=reduced?10:21;
  g.lineStyle(5,0xa5ebdf,.2);g.lineBetween(b.x,b.y,b.x-Math.cos(a)*length,b.y-Math.sin(a)*length);
  g.lineStyle(1.8,0xd3fff0,.95);g.lineBetween(b.x,b.y,b.x-Math.cos(a)*length,b.y-Math.sin(a)*length);
  this.diamond(b.x,b.y,4,0xc1f2e4,.95);
 }
 render(s:State,reduced=false){
  const g=this.g;g.clear();const meter=tankStaminaMeter(s.stamina,s.lungs),blocking=s.weapon!=='hammer'&&s.stamina>0;
  if(s.lungs){
   const y=s.y+42,w=34+s.lungs*3;
   g.fillStyle(0x243e40,.75);g.fillRoundedRect(s.x-w/2-3,y-3,w+6,10,4);
   g.fillStyle(meter.fill<.2?0xffd194:0xa3dfcd,.9);g.fillRoundedRect(s.x-w/2,y,Math.max(1,w*meter.fill),4,2);
   if(!reduced&&meter.fill>.2){const p=(s.time*.65)%1;for(const side of [-1,1]){g.lineStyle(1,0xbdebd9,(1-p)*.5);g.beginPath();g.arc(s.x+side*(w/2+5),y-4-p*4,3+p*3,side<0?2:4,side<0?4:6);g.strokePath();}}
  }
  if(blocking&&s.guard){
   const half=tankGuardHalfAngle(s.guard),r=43;
   g.lineStyle(5,0x8ed8c9,.12);g.beginPath();g.arc(s.x,s.y,r,s.angle-half,s.angle+half);g.strokePath();
   g.lineStyle(1.8,0xc3f0da,.8);g.beginPath();g.arc(s.x,s.y,r,s.angle-half,s.angle+half);g.strokePath();
   for(const side of [-1,1]){const a=s.angle+side*half;this.diamond(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r,4,0xe4edb7,.9);}
  }
  if(s.thorns&&s.weapon!=='hammer'){
   const phase=1-Math.max(0,s.swing)/WEAPON_EFFECTS[s.weapon].duration,pose=weaponPose(s.weapon,s.x,s.y,s.angle,phase,s.swing>0,s.sequence,false,blocking,1,1,'tank');
   for(let i=-1;i<=1;i++){const dx=-Math.sin(pose.rotation)*i*13,dy=Math.cos(pose.rotation)*i*13;this.diamond(pose.tip.x+dx,pose.tip.y+dy,3+s.thorns*.6,0xf0b7c0,.85);}
  }
  this.events=this.events.filter(e=>s.time-e.born<(e.kind==='bash'?.2:e.kind==='block'||e.kind==='reflect'?.3:.55));
  for(const e of this.events){
   const duration=e.kind==='bash'?.2:e.kind==='block'||e.kind==='reflect'?.3:.55,age=Math.max(0,s.time-e.born),fade=Math.max(0,1-age/duration);
   if(e.kind==='bash'||e.kind==='hammer'){
    const color=e.level?0xf1b7c3:0xb7e8d5;
    if(e.kind==='hammer'){
     if(!reduced)for(let i=0;i<4;i++){const a=i*Math.PI/2,drift=9+age*25;g.fillStyle(0xc9dcb9,fade*.16);g.fillEllipse(e.x+Math.cos(a)*drift,e.y+Math.sin(a)*drift+5,16,10);}
     const r=e.radius*(reduced?1:.4+Math.min(1,age/.14)*.6);for(let i=0;i<6;i++){const a=i*Math.PI/3;g.lineStyle(2,0xd0eac3,fade*.7);g.beginPath();g.arc(e.x,e.y,r,a+.1,a+.7);g.strokePath();}
    }else{g.lineStyle(4,color,fade*.6);g.beginPath();g.arc(e.x,e.y,22,e.angle-1,e.angle+1);g.strokePath();g.lineStyle(1.5,0xffedbd,fade);g.beginPath();g.arc(e.x,e.y,24,e.angle-.8,e.angle+.8);g.strokePath();}
    this.star(e.x,e.y,7+fade*3,0xffdf9e,fade);g.fillStyle(0x7d6570,fade);g.fillCircle(e.x-2,e.y-1,.9);g.fillCircle(e.x+2,e.y-1,.9);
    if(!reduced)for(let i=0;i<(e.level?6:3);i++){const a=i*Math.PI*2/(e.level?6:3),r=10+age*50;this.diamond(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r-age*10,3,e.level?0xf2becb:0xc2e6cb,fade*.8);}
   }else if(e.kind==='block'||e.kind==='reflect'){
    const color=e.kind==='reflect'?0xc5eeff:0xc2eed9;
    this.diamond(e.x,e.y,8+fade*3,color,fade);
    if(!reduced)for(const side of [-1,1]){const a=e.angle+side*.7,r=9+age*40;this.star(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,3,0xffe4ab,fade);}
   }else{
    const progress=reduced?1:Math.min(1,age/.2),r=e.radius*(.3+progress*.7),color=e.kind==='crown'?0xefbac9:e.kind==='charge'?0xffdfa7:0xaedecf;
    const count=8+Math.min(4,e.level)*2;
    for(let i=0;i<count;i++){
     const a=i/count*Math.PI*2,px=e.x+Math.cos(a)*r,py=e.y+Math.sin(a)*r;
     g.lineStyle(e.level>1?2.6:2,color,fade*.85);g.beginPath();g.arc(e.x,e.y,r,a+.05,a+Math.PI*2/count-.07);g.strokePath();
     if(!reduced){g.fillStyle(color,fade*.65);g.fillRoundedRect(px-4,py-3-Math.sin(age*Math.PI/.55)*8,8,6,2);this.star(e.x+Math.cos(a)*r*.72,e.y+Math.sin(a)*r*.72,3,0xffe5b6,fade*.8);}
    }
    if(e.level>1){g.lineStyle(1.5,0xffe4b5,fade*.5);g.strokeEllipse(e.x,e.y,r*1.45,r*1.45);}
    if(e.kind==='slam'&&!reduced)for(let i=0;i<5;i++){
     const a=i*Math.PI*2/5,orbit=18+age*35,px=e.x+Math.cos(a)*orbit,py=e.y-18+Math.sin(a)*orbit-age*10;
     this.diamond(px,py,3.5,0xc8eed6,fade*.8);
    }
    this.star(e.x,e.y-42,11,0xffdfaa,fade);g.fillStyle(0x82626c,fade);g.fillCircle(e.x-3,e.y-44,1.2);g.fillCircle(e.x+3,e.y-44,1.2);g.lineStyle(1,0x82626c,fade);g.beginPath();g.arc(e.x,e.y-39,2.5,0,Math.PI);g.strokePath();
   }
  }
 }
}
