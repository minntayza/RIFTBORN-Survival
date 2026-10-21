/** The contact time is shared by the rig, damage, and impact effects. Times are seconds. */
export const ZAWGYI_SLAM={windup:.22,apex:.34,impact:.43,hold:.56,duration:.84,groundY:126} as const;
const mix=(a:number,b:number,t:number)=>a+(b-a)*Math.max(0,Math.min(1,t));
const ease=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const armAtImpact=.32,staffAtImpact=.02;
// Solve the shoulder-to-hand-to-staff chain so the lower tip touches the ground exactly.
const impactCrouch=ZAWGYI_SLAM.groundY-(61+Math.sin(armAtImpact)*10.8+Math.cos(armAtImpact)*25.5+Math.cos(staffAtImpact)*27.55);
export function zawgyiSlamMotion(age:number){
 if(age<0||age>=ZAWGYI_SLAM.duration)return {lift:0,crouch:0,rightArm:0,leftArm:0,staff:.12,stance:0,stage:'idle'};
 if(age<ZAWGYI_SLAM.windup){const t=ease(age/ZAWGYI_SLAM.windup);return {lift:0,crouch:5*t*(1-t),rightArm:mix(0,-2.55,t),leftArm:mix(0,-.8,t),staff:mix(.12,-1.3,t),stance:mix(0,.18,t),stage:'windup'};}
 if(age<ZAWGYI_SLAM.apex){const t=(age-ZAWGYI_SLAM.windup)/(ZAWGYI_SLAM.apex-ZAWGYI_SLAM.windup);return {lift:16*Math.sin(t*Math.PI/2),crouch:0,rightArm:-2.55,leftArm:-.8,staff:-1.3,stance:.18,stage:'lift'};}
 if(age<ZAWGYI_SLAM.impact){const t=(age-ZAWGYI_SLAM.apex)/(ZAWGYI_SLAM.impact-ZAWGYI_SLAM.apex),strike=t*t*t;return {lift:16*(1-strike),crouch:mix(0,impactCrouch,strike),rightArm:mix(-2.55,armAtImpact,strike),leftArm:mix(-.8,.12,strike),staff:mix(-1.3,staffAtImpact,strike),stance:.18,stage:'strike'};}
 if(age<ZAWGYI_SLAM.hold)return {lift:0,crouch:impactCrouch,rightArm:armAtImpact,leftArm:.12,staff:staffAtImpact,stance:.18,stage:'impact'};
 const t=ease((age-ZAWGYI_SLAM.hold)/(ZAWGYI_SLAM.duration-ZAWGYI_SLAM.hold));return {lift:0,crouch:mix(impactCrouch,0,t),rightArm:mix(armAtImpact,0,t),leftArm:mix(.12,0,t),staff:mix(staffAtImpact,.12,t),stance:mix(.18,0,t),stage:'recover'};
}
