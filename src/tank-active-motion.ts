import {ABILITY_TUNING as T} from './config';
import {pairedGrip,shoulderGrip} from './hero-arm';
import {isRedesignedTank,tankEquipmentPose} from './tank-redesign';
export const TANK_SLAM_RADIUS=155;
export const TANK_ACTIVE_BUDGET=24;
export type TankTheme='default'|'royal'|'forge'|'polar';
export type TankPoint={x:number;y:number};
export type TankEventKind='slam'|'release'|'stomp'|'absorb'|'step'|'push';
export type TankVisualEvent=TankPoint&{kind:TankEventKind;age:number;radius:number;angle:number;power:number;side:number};
export const TANK_EVENT_LIFE={slam:.48,release:.42,stomp:.4,absorb:.18,step:.24,push:.18} as const;
const limits={slam:1,release:1,stomp:1,absorb:8,step:6,push:4} as const;
export const tankTheme=(finish?:string):TankTheme=>finish==='sakura'?'royal':finish==='jade'?'forge':finish==='starlight'?'polar':'default';
export const TANK_PALETTES={
 default:{primary:0x8fcabd,accent:0xc8d9df,fragment:0x6e818b,ink:0x20333d},
 royal:{primary:0xe5bc62,accent:0x729de0,fragment:0x99a1a6,ink:0x293e5d},
 forge:{primary:0xf1a157,accent:0xcc8756,fragment:0x46505b,ink:0x302e37},
 polar:{primary:0xa6ddf4,accent:0x749cdb,fragment:0xa8cee4,ink:0x334c6b}
} as const;
export function tankChargeSegments(energy:number){return Math.max(0,Math.min(5,Math.ceil(energy/T.bulwark.energyCap*5)));}
export function tankSecondaryCount(wide:boolean,reduced:boolean,normal=6){return reduced?0:wide?Math.min(2,normal):normal;}
export type TankMotion={slam:number;brace:boolean;march:boolean;moving:boolean;frame:number;lean:number;reduced:boolean};
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
/** Presentation clock only: no timers or callbacks can apply damage or modify movement. */
export class TankActiveTimeline{
 time=0;events:TankVisualEvent[]=[];distance=0;moving=false;moveAngle=0;
 private observedAt=-1;private last?:TankPoint;private lastStep=0;private stepAt=-1;private side=1;private pushAt=-1;
 impact(kind:'slam'|'release'|'stomp',p:TankPoint,radius:number,angle:number,power=0){this.add(kind,p,radius,angle,power);}
 absorb(p:TankPoint,angle:number){this.add('absorb',p,0,angle);}
 pushed(p:TankPoint,angle:number){if(this.time-this.pushAt<.08)return;this.pushAt=this.time;this.add('push',p,12,angle);}
 private add(kind:TankEventKind,p:TankPoint,radius:number,angle:number,power=0){
  const same=this.events.filter(e=>e.kind===kind);if(same.length>=limits[kind])this.events.splice(this.events.indexOf(same[0]),1);
  this.events.push({kind,x:p.x,y:p.y,radius,angle,power,age:0,side:this.side});if(this.events.length>TANK_ACTIVE_BUDGET)this.events.shift();
 }
 beginMarch(p:TankPoint,angle:number){this.observedAt=-1;this.last={...p};this.distance=this.lastStep=0;this.moving=false;this.moveAngle=angle;this.stepAt=-1;}
 tick(dt:number){this.time+=Math.max(0,dt);this.events=this.events.filter(e=>(e.age+=Math.max(0,dt))<TANK_EVENT_LIFE[e.kind]);}
 observe(p:TankPoint,marching:boolean){
  if(this.observedAt===this.time&&this.last?.x===p.x&&this.last?.y===p.y)return;this.observedAt=this.time;
  const dx=this.last?p.x-this.last.x:0,dy=this.last?p.y-this.last.y:0,d=Math.hypot(dx,dy);this.last={...p};this.moving=marching&&d>.1&&d<80;
  if(!marching){this.lastStep=this.distance;return;}if(!this.moving)return;
  this.moveAngle=Math.atan2(dy,dx);this.distance+=d;
  if(this.distance-this.lastStep>=36&&this.time-this.stepAt>=.16){this.lastStep=this.distance;this.stepAt=this.time;this.side*=-1;this.add('step',{x:p.x+this.side*9,y:p.y+31},12,this.moveAngle);}
 }
 motion(brace:boolean,march:boolean,reduced:boolean):TankMotion{
  const slam=this.events.find(e=>e.kind==='slam'||e.kind==='stomp'),strength=slam?(1-ease(slam.age/(slam.kind==='stomp'?.2:.32)))*(slam.kind==='stomp'?.45:1):0;
  return {slam:strength,brace,march,moving:this.moving,frame:strength>0?0:march&&this.moving&&!reduced?1+Math.floor(this.distance/72*24)%24:-1,lean:reduced||strength>0?0:march&&this.moving?Math.cos(this.moveAngle)*.075:0,reduced};
 }
 clear(){this.observedAt=-1;this.events=[];this.distance=0;this.time=0;this.last=undefined;this.moving=false;this.lastStep=0;this.stepAt=this.pushAt=-1;this.side=1;}
}
/** The whole assembled actor rotates about its feet; every shoulder/grip gets the same transform. */
export function tankMotionPoint(p:TankPoint,x:number,y:number,lean:number){const dx=p.x-x,dy=p.y-y-32;return {x:x+dx*Math.cos(lean)-dy*Math.sin(lean),y:y+32+dx*Math.sin(lean)+dy*Math.cos(lean)};}
export function tankSkillWeaponPose<P extends {grip:TankPoint;tip:TankPoint;rotation:number}>(pose:P,x:number,y:number,aim:number,url:string,hammer:boolean,m:TankMotion):P{
 if(m.slam<=0&&!m.brace&&!m.march)return pose;
 const facing=Math.cos(aim)<0?-1:1,down=aim+(m.reduced?.25:1.05)*facing,target=m.slam>0?down:m.brace?aim+(hammer?-.52:.08)*facing:aim+.12*facing;
 const delta=Math.atan2(Math.sin(target-pose.rotation),Math.cos(target-pose.rotation))*(m.slam>0?m.slam:1),rotation=pose.rotation+delta,dx=pose.tip.x-pose.grip.x,dy=pose.tip.y-pose.grip.y;
 let result={...pose,rotation,tip:{x:pose.grip.x+dx*Math.cos(delta)-dy*Math.sin(delta),y:pose.grip.y+dx*Math.sin(delta)+dy*Math.cos(delta)}};
 if(isRedesignedTank(url))return tankEquipmentPose(result,x,y,facing,url,hammer);
 const primary={x:x+8*facing,y:y+5},support={x:x-9*facing,y:y+5},grip=hammer?pairedGrip(primary,support,{x:-Math.cos(rotation)*10.5,y:-Math.sin(rotation)*10.5}):shoulderGrip(primary,rotation+.3*facing,18);
 result={...result,grip,tip:{x:result.tip.x+grip.x-pose.grip.x,y:result.tip.y+grip.y-pose.grip.y}};return result;
}
