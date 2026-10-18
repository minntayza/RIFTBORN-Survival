import {rigidHeroArm,shoulderGrip} from './hero-arm';
import type {ArmPoint} from './ninja-arm';
export type NinjaJointPart='upper'|'forearm'|'hand';
const anchors={upper:{w:252,h:345,a:{x:150,y:40},b:{x:166,y:302}},forearm:{w:202,h:357,a:{x:101,y:36},b:{x:103,y:318}},hand:{w:305,h:325,a:{x:63,y:270},b:{x:191,y:134}}};
export function ninjaJointSprite(part:NinjaJointPart,a:ArmPoint,b:ArmPoint){const p=anchors[part],scale=Math.hypot(b.x-a.x,b.y-a.y)/Math.hypot(p.b.x-p.a.x,p.b.y-p.a.y),rotation=Math.atan2(b.y-a.y,b.x-a.x)-Math.atan2(p.b.y-p.a.y,p.b.x-p.a.x);return {x:a.x,y:a.y,width:p.w*scale,height:p.h*scale,originX:p.a.x/p.w,originY:p.a.y/p.h,rotation};}
/** Like the General: rotate the upper arm about the shoulder, then the forearm about its elbow. No inverse elbow solving. */
export function ninjaForwardArm(shoulder:ArmPoint,rotation:number,facing=1,offhand=false,rest=false){
 const angle=rest?Math.PI/2:rotation+(offhand?.65:.35)*facing;
 return rigidHeroArm(shoulder,shoulderGrip(shoulder,angle,offhand?18:21),facing);
}
export function ninjaAttackRig(shoulder:ArmPoint,_grip:ArmPoint,rotation:number,facing=1,offhand=false,rest=false){return ninjaForwardArm(shoulder,rotation,facing,offhand,rest);}
