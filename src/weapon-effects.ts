import {pairedGrip,shoulderGrip} from './hero-arm';
import {ninjaForwardArm} from './ninja-rig';
import {isTankWeapon,tankWeaponMetrics} from './tank-weapons';
import {isSamuraiWeapon,samuraiWeaponMetrics,SAMURAI_WEAPON_LENGTH} from './samurai-weapons';
import {samuraiSwing} from './samurai-motion';
import {ninjaWeaponSwing,ninjaRecovery} from './ninja-arm';
import type {WeaponId} from './config';
export type Point={x:number;y:number};
type Geometry={grip:Point;tip:Point;size:number;duration:number;style:string;color:number};
export const WEAPON_EFFECTS:Record<WeaponId,Geometry>={
 aungzeyabow:{grip:{x:-12,y:0},tip:{x:45,y:0},size:95,duration:.28,style:'bow-shot',color:0xf6cb62},
 solarcrossbow:{grip:{x:-14,y:2},tip:{x:38,y:0},size:82,duration:.14,style:'solar-shot',color:0xffaa44},
 greatbow:{grip:{x:-16,y:0},tip:{x:54,y:0},size:115,duration:.44,style:'heavy-shot',color:0xff7733},
  hempwraps:{grip:{x:0,y:0},tip:{x:44,y:0},size:102,duration:.18,style:'fist-strike',color:0xbd3a42},
  ironwraps:{grip:{x:0,y:0},tip:{x:48,y:0},size:108,duration:.26,style:'iron-strike',color:0x889aa8},
  tigerwraps:{grip:{x:0,y:0},tip:{x:46,y:0},size:106,duration:.2,style:'claw-strike',color:0xd46830},
  arindamaspear:{grip:{x:-36,y:0},tip:{x:68,y:0},size:160,duration:.38,style:'arindama-thrust',color:0x72c438},
  baganpike:{grip:{x:-32,y:0},tip:{x:58,y:-16},size:150,duration:.42,style:'crescent-sweep',color:0xb5c84d},
  royallance:{grip:{x:-40,y:0},tip:{x:74,y:0},size:175,duration:.48,style:'heavy-lance',color:0xd4af37},
  mysticstaff:{grip:{x:0,y:10},tip:{x:0,y:-42},size:90,duration:.24,style:"magic-bolt",color:0xffce76},
  katana:{grip:{x:-20,y:0},tip:{x:52,y:-9},size:110,duration:.3,style:'clean-cut',color:0xabbcc3},
  dual:{grip:{x:-20,y:0},tip:{x:48,y:-9},size:92,duration:.2,style:'cross-cut',color:0xa6a2bb},
  kama:{grip:{x:-19,y:0},tip:{x:42,y:-24},size:105,duration:.27,style:'hook-cut',color:0xadb5b7},
  nodachi:{grip:{x:-21,y:0},tip:{x:55,y:-10},size:135,duration:.4,style:'heavy-cut',color:0xb5bbaa},
  cursed:{grip:{x:-21,y:0},tip:{x:52,y:-9},size:135,duration:.34,style:'fractured-cut',color:0xaf7e8b},
  naginata:{grip:{x:-34,y:0},tip:{x:56,y:-18},size:168,duration:.44,style:'pole-sweep',color:0xa5b7b1},
  pistols:{grip:{x:-8,y:10},tip:{x:25,y:-2},size:78,duration:.12,style:'twin-shot',color:0xb9ae86},
  shotgun:{grip:{x:-26,y:2},tip:{x:46,y:-1},size:90,duration:.22,style:'scatter-shot',color:0xb4a185},
  smg:{grip:{x:-20,y:10},tip:{x:48,y:-2},size:84,duration:.09,style:'rapid-shot',color:0xaaa98d},
  shield:{grip:{x:0,y:0},tip:{x:16,y:0},size:82,duration:.28,style:'guard-bash',color:0x91b4b5},
  spiked:{grip:{x:0,y:0},tip:{x:22,y:0},size:86,duration:.3,style:'thorn-bash',color:0xa9b5bd},
  hammer:{grip:{x:-31,y:0},tip:{x:34,y:0},size:112,duration:.46,style:'hammer-slam',color:0xa89a82}
 };
 export const isGun=(id:WeaponId)=>['pistols','shotgun','smg'].includes(id);
 export const isBow=(id:WeaponId)=>['aungzeyabow','solarcrossbow','greatbow'].includes(id);
 export const isLethweiWeapon=(id:WeaponId)=>['hempwraps','ironwraps','tigerwraps'].includes(id);
 export function weaponPose(id:WeaponId,x:number,y:number,aim:number,phase:number,active:boolean,sequence=0,offhand=false,blocking=false,reach=1,arcScale=1,articulated:boolean|'samurai'|'tank'=false){
  const g=WEAPON_EFFECTS[id],t=Math.max(0,Math.min(1,phase)),ease=t*t*(3-2*t),shield=id==='shield'||id==='spiked',gun=isGun(id);
  const facing=Math.cos(aim)<0?-1:1,samuraiFacing=articulated==='samurai'||articulated==='tank'&&shield?facing:1;
  let rotation=aim,forward=shield?24:7,side=shield?0:(offhand?-13:13);
  if(active){if(shield)forward+=Math.sin(Math.PI*t)*18;else if(gun)forward-=Math.sin(Math.PI*t)*(id==='shotgun'?8:id==='smg'?2:4);else if(id==='hammer'){rotation+=t<.3?-.9*t/.3:-.9+(t-.3)/.7*1.5;forward+=Math.sin(Math.PI*t)*4;}else if(isLethweiWeapon(id)){forward+=Math.sin(Math.PI*t)*22;const direction=(sequence%2===0)!==offhand?1:-1;rotation+=direction*(0.35*arcScale-ease*0.7*arcScale);}else{const arc=id==='naginata'?2.4:id==='kama'?2.8:id==='nodachi'?2:id==='cursed'?2.1:1.7;const direction=id==='dual'&&((sequence%2===0)!==offhand)?-1:1;rotation+=direction*(arc*arcScale/2-ease*arc*arcScale);}}
 if(blocking&&shield)forward+=5;
 if(articulated==='tank'&&shield){const push=!active?0:t<.26?-4*(t/.26):t<.5?-4+15*(1-Math.pow(1-(t-.26)/.24,3)):11*(1-(t-.5)/.5);forward=18+push-(blocking&&!active?3:0);}
 if(articulated&&!gun&&!shield)rotation=aim+(active?(articulated==='samurai'?samuraiSwing(id,t)*facing:ninjaWeaponSwing(id,t,sequence,offhand)*(articulated==='tank'?facing:1))*arcScale:0);
 const radius=(articulated==='samurai'||articulated==='tank'?16:24)*(active?ninjaRecovery(t):1);
 const size=(articulated==='tank'&&id==='hammer'?94:g.size)*reach*(articulated?(id==='katana'?.76:id==='dual'?.8:id==='kama'?.82:1):1);
 let grip=articulated&&!gun&&!shield?{x:x+Math.cos(rotation)*radius-Math.sin(rotation)*(articulated==='samurai'||articulated==='tank'?5*facing:offhand?-6:9),y:y+6+Math.sin(rotation)*radius+Math.cos(rotation)*(articulated==='samurai'||articulated==='tank'?5*facing:offhand?-6:9)}:{x:x+Math.cos(aim)*forward-Math.sin(aim)*side,y:y+Math.sin(aim)*forward+Math.cos(aim)*side};
 if(articulated===true&&!gun&&!shield){grip=ninjaForwardArm({x:x+(offhand?-9:8)*facing,y:y+5},rotation,facing,offhand).grip;}
 if(articulated&&articulated!==true&&!gun&&(!shield||articulated==='tank')){
  const flip=Math.cos(aim)<0?-1:1,sx=x+(offhand?-9:8)*flip,sy=y+5;
  const dx=grip.x-sx,dy=grip.y-sy,d=Math.hypot(dx,dy),bounded=Math.max(1.1,Math.min(26.5,d));
  if(d!==bounded){grip.x=sx+dx/(d||1)*bounded;grip.y=sy+dy/(d||1)*bounded;}
 }
 if(articulated==='samurai'||articulated==='tank'&&id==='hammer'){
 const offset={x:-Math.cos(rotation)*10.5,y:-Math.sin(rotation)*10.5};grip=pairedGrip({x:x+8*facing,y:y+5},{x:x-9*facing,y:y+5},offset);
 }else if(articulated==='tank'&&shield){rotation=aim+facing*(active?(t<.26?.25+.4*t/.26:t<.5?.65-.95*(t-.26)/.24:-.3+.55*(t-.5)/.5):.25);grip=shoulderGrip({x:x+8*facing,y:y+5},rotation+.3*facing,18);}
 const samurai=articulated==='samurai'&&isSamuraiWeapon(id)?samuraiWeaponMetrics(id):undefined;
 const tank=articulated==='tank'&&isTankWeapon(id)?tankWeaponMetrics(id):undefined;
 const gripPoint=tank?.grip??samurai?.grip??(articulated==='samurai'?{x:g.grip.x+4,y:g.grip.y}:g.grip);
 const defaultTip=isSamuraiWeapon(id)?{x:gripPoint.x+(g.tip.x-gripPoint.x)*SAMURAI_WEAPON_LENGTH,y:g.tip.y}:g.tip;
 const tipPoint=tank?.tip??samurai?.tip??(articulated&&id==='kama'?{x:-3,y:-43}:defaultTip);
 const thickness=articulated==='samurai'?size/reach:size;
 const local={x:(tipPoint.x-gripPoint.x)*size/128,y:(tipPoint.y-gripPoint.y)*thickness/128*samuraiFacing};
 const tip={x:grip.x+Math.cos(rotation)*local.x-Math.sin(rotation)*local.y,y:grip.y+Math.sin(rotation)*local.x+Math.cos(rotation)*local.y};
 const hook=articulated&&id==='kama'?{x:grip.x+Math.cos(rotation)*65*size/128,y:grip.y+Math.sin(rotation)*65*size/128}:undefined;
 return {grip,tip,rotation,size,thickness,hook,flipY:(articulated==='samurai'||articulated==='tank'&&shield)&&facing<0,originX:(64+gripPoint.x)/128,originY:(64+gripPoint.y)/128};
}
function segmentDistance(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);}
export function meleeContact(id:WeaponId,x:number,y:number,aim:number,enemy:Point,radius:number,sequence=0,reach=1,arcScale=1,articulated:boolean|'samurai'|'tank'=false){
 if(isGun(id)||isBow(id))return false;
 for(let i=0;i<=16;i++)for(const offhand of id==='dual'?[false,true]:[false]){
 const pose=weaponPose(id,x,y,aim,i/16*.55,true,sequence,offhand,false,reach,arcScale,articulated),tip=pose.tip;
 if(articulated&&id==='kama'){if(pose.hook&&(segmentDistance(enemy,pose.grip,pose.hook)<=radius+11||segmentDistance(enemy,pose.hook,tip)<=radius+11))return true;}
 else if(id==='hammer'||id==='kama'){if(Math.hypot(enemy.x-tip.x,enemy.y-tip.y)<=radius+(id==='hammer'?14:11))return true;}
 else if(isLethweiWeapon(id)){if(Math.hypot(enemy.x-tip.x,enemy.y-tip.y)<=radius+18||segmentDistance(enemy,pose.grip,tip)<=radius+14)return true;}
 else if(id==='shield'||id==='spiked'){const dx=-Math.sin(pose.rotation)*20,dy=Math.cos(pose.rotation)*20;if(segmentDistance(enemy,{x:tip.x-dx,y:tip.y-dy},{x:tip.x+dx,y:tip.y+dy})<=radius+5)return true;}
 else{const start=id==='naginata'?.7:.2;const a={x:pose.grip.x+(tip.x-pose.grip.x)*start,y:pose.grip.y+(tip.y-pose.grip.y)*start};if(segmentDistance(enemy,a,tip)<=radius+4)return true;}
 }return false;
}
