import {zawgyiSlamMotion,ZAWGYI_SLAM} from './zawgyi-slam-motion';
export type ZawgyiPart='body'|'leftArm'|'rightArm'|'leftLeg'|'rightLeg'|'staff';
export type ZawgyiPose={part:ZawgyiPart;x:number;y:number;width:number;height:number;rotation:number;ox:number;oy:number};
export const ZAWGYI_SCALE=.72;
export const ZAWGYI_SHOULDERS=[{x:44,y:56},{x:93,y:55}] as const;
export const ZAWGYI_HIPS=[{x:54,y:88},{x:77,y:88}] as const;
export function localPartPoint(p:ZawgyiPose,u:number,v:number){const dx=(u-p.ox)*p.width,dy=(v-p.oy)*p.height;return {x:p.x+Math.cos(p.rotation)*dx-Math.sin(p.rotation)*dy,y:p.y+Math.sin(p.rotation)*dx+Math.cos(p.rotation)*dy};}
/** A shoulder-led backswing, fast sweep through the target, then recovery. */
export function zawgyiSwing(remaining:number,sequence=0,aim=0){
 const t=Math.max(0,Math.min(1,1-remaining/.24)),side=sequence%2?1:-1;
 const direction=Math.atan2(Math.abs(Math.sin(aim))<1e-10?0:Math.sin(aim),Math.abs(Math.cos(aim))),center=direction+Math.PI/2;
 const smooth=(v:number)=>v*v*(3-2*v);
 const wind=center-side*.95,end=center+side*.95;
 const staff=t<.2?.12+(wind-.12)*smooth(t/.2):t<.72?wind+(end-wind)*smooth((t-.2)/.52):end+(.12-end)*smooth((t-.72)/.28);
 return {staff,arm:-Math.sin(t*Math.PI)*.8+side*Math.sin(t*Math.PI*2)*.28};
}
/** Arms remain rigid; every limb rotates about its own shoulder or hip. */
export function zawgyiMotion(time:number,moving=false,attack=0,sequence=0,slam=-1,aim=0){
 const action=zawgyiSlamMotion(slam),slamming=slam>=0&&slam<ZAWGYI_SLAM.duration;
 const stride=!slamming&&moving?Math.sin(time*10):0,bob=slamming?action.crouch:moving?-Math.abs(Math.cos(time*10))*1.2:Math.sin(time*2)*.35,legBob=slamming?0:bob;
 const striking=attack>0,swing=zawgyiSwing(attack,sequence,aim);
 const leftArm:ZawgyiPose={part:'leftArm',x:44,y:56+bob,width:24,height:43,rotation:slamming?action.leftArm:stride*.24,ox:.68,oy:.12};
 const rightArm:ZawgyiPose={part:'rightArm',x:93,y:55+bob,width:24,height:43,rotation:slamming?action.rightArm:striking?swing.arm:-stride*.1,ox:.25,oy:.12};
 const grip=localPartPoint(rightArm,.77,.89);
 const staff:ZawgyiPose={part:'staff',x:grip.x,y:grip.y,width:7,height:125,rotation:slamming?action.staff:striking?swing.staff:.12+rightArm.rotation,ox:.5,oy:1-27.55/125};
 const parts:ZawgyiPose[]=[{part:'leftLeg',x:54,y:88+legBob,width:25,height:41,rotation:-stride*.31-(slamming?action.stance:0),ox:.60,oy:.06},{part:'rightLeg',x:77,y:88+legBob,width:25,height:41,rotation:stride*.31+(slamming?action.stance:0),ox:.34,oy:.06},{part:'body',x:64,y:4+bob,width:70,height:90,rotation:moving?stride*.012:0,ox:.5,oy:0},leftArm,staff,rightArm];
 return {parts,grip,tip:localPartPoint(staff,.5,0),contact:localPartPoint(staff,.5,1)};
}
export function zawgyiWorldPoint(point:{x:number;y:number},x:number,y:number,aim:number,lift=0){return {x:x+(point.x-64)*ZAWGYI_SCALE*(Math.cos(aim)<0?-1:1),y:y+(point.y-98)*ZAWGYI_SCALE-lift};}

export function zawgyiSlamContact(x:number,y:number,aim:number){return zawgyiWorldPoint(zawgyiMotion(0,false,0,0,ZAWGYI_SLAM.impact).contact,x,y,aim);}

/** The visible cane segment is also the melee contact surface. */
export function zawgyiStaffContact(x:number,y:number,aim:number,remaining:number,sequence:number,time:number,target:{x:number;y:number},radius:number){
 const pose=zawgyiMotion(time,false,remaining,sequence,-1,aim),a=zawgyiWorldPoint(pose.contact,x,y,aim),b=zawgyiWorldPoint(pose.tip,x,y,aim),dx=b.x-a.x,dy=b.y-a.y;
 const t=Math.max(0,Math.min(1,((target.x-a.x)*dx+(target.y-a.y)*dy)/(dx*dx+dy*dy)));
 return Math.hypot(target.x-a.x-dx*t,target.y-a.y-dy*t)<=radius+5;
}
