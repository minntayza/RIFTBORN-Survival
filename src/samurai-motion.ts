import {ninjaArm,type ArmPoint} from './ninja-arm';
/** Heavy anticipation, committed cut, held follow-through and a relaxed return. */
export function samuraiSwing(weapon:string,phase:number){
 const t=Math.max(0,Math.min(1,phase)),smooth=(v:number)=>v*v*(3-2*v),back=weapon==='naginata'?-1.2:-1.05,cut=weapon==='cursed'?1.15:1.2;
 if(t===0||t===1)return 0;if(t<.26)return back*smooth(t/.26);if(t<.55)return back+(cut-back)*(1-Math.pow(1-(t-.26)/.29,3));if(t<.68)return cut;return cut*(1-smooth((t-.68)/.32));
}
export function samuraiSupportHand(grip:{x:number;y:number},rotation:number){return {x:grip.x-Math.cos(rotation)*10.5,y:grip.y-Math.sin(rotation)*10.5};}

/** The source Samurai illustration faces left; mirror it for rightward aim. */
export const samuraiFlipX=(aim:number)=>Math.cos(aim)>=0;

/** Prefer the lower elbow solution so the forearm never folds upward across the face. */
export function samuraiArm(shoulder:ArmPoint,hand:ArmPoint){const a=ninjaArm(shoulder,hand,1),b=ninjaArm(shoulder,hand,-1);return a.elbow.y>=b.elbow.y?a:b;}
