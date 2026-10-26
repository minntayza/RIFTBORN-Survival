import {pairedGrip,shoulderGrip} from './hero-arm';
import {gunnerWeaponLocal,type GunnerWeapon} from './gunner-weapons';
export type GunnerState={reload:number;reloadDuration:number;overdrive:number};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export function gunnerReload(state?:GunnerState){return state&&state.reload>0?clamp(1-state.reload/Math.max(.01,state.reloadDuration)):undefined;}
export function gunnerRecoil(id:GunnerWeapon,phase:number,active:boolean){if(!active||phase>=1||phase<=0)return 0;const t=clamp(phase);return (t<.18?Math.sin(t/.18*Math.PI/2):Math.pow(1-(t-.18)/.82,2))*(id==='shotgun'?6:id==='smg'?1.6:3);}
export function gunnerWeaponPose(id:GunnerWeapon,x:number,y:number,aim:number,phase:number,active:boolean,offhand=false,state?:GunnerState){
 const facing=Math.cos(aim)<0?-1:1,local=gunnerWeaponLocal(id),kick=gunnerRecoil(id,phase,active),reload=gunnerReload(state),load=reload===undefined?0:Math.sin(reload*Math.PI),rotation=aim+facing*(load*.35-kick*.014),side=(id==='pistols'?(offhand?6:13):12)*facing;
 const forward=(id==='pistols'?12:id==='shotgun'?-12:-9)-kick,grip={x:x+Math.cos(aim)*forward-Math.sin(aim)*side,y:y+5+Math.sin(aim)*forward+Math.cos(aim)*side};
 const shoulder={x:x+(offhand?-9:8)*facing,y:y+5},dx=grip.x-shoulder.x,dy=grip.y-shoulder.y,d=Math.hypot(dx,dy);if(d>30.5){grip.x=shoulder.x+dx/d*30.5;grip.y=shoulder.y+dy/d*30.5;}
 const anchor={x:x+8*facing,y:y+5},support={x:x-9*facing,y:y+5};
 const u=local.fore.x*local.size/128,v=local.fore.y*local.size/128*facing,offset={x:Math.cos(rotation)*u-Math.sin(rotation)*v,y:Math.sin(rotation)*u+Math.cos(rotation)*v};
 const held=id==='pistols'?shoulderGrip(shoulder,rotation+.65*facing,17):pairedGrip(anchor,support,offset);grip.x=held.x;grip.y=held.y;
 const project=(p:{x:number;y:number})=>{const u=p.x*local.size/128,v=p.y*local.size/128*facing;return {x:grip.x+Math.cos(rotation)*u-Math.sin(rotation)*v,y:grip.y+Math.sin(rotation)*u+Math.cos(rotation)*v};};
 return {body:{x,y},facing,grip,tip:project(local.tip),fore:project(local.fore),rotation,size:local.size,originX:.5,originY:.5,flipY:facing<0,hook:undefined};
}
export function gunnerSupportHand(pose:ReturnType<typeof gunnerWeaponPose>,state?:GunnerState){const reload=gunnerReload(state),load=reload===undefined?0:Math.sin(reload*Math.PI),shoulder={x:pose.body.x-9*pose.facing,y:pose.body.y+5},dx=pose.fore.x-shoulder.x,dy=pose.fore.y-shoulder.y;return shoulderGrip(shoulder,Math.atan2(dy,dx)+load*.65*pose.facing,Math.hypot(dx,dy));}
