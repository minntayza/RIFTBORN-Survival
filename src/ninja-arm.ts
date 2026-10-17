export type ArmPoint={x:number;y:number};
/** Fixed bone lengths; only joint angles change. */
export function ninjaArm(shoulder:ArmPoint,hand:ArmPoint,bend=1){
 const upper=13,lower=14,dx=hand.x-shoulder.x,dy=hand.y-shoulder.y,d=Math.hypot(dx,dy);
 const distance=Math.max(.001,Math.min(upper+lower-.001,Math.max(Math.abs(upper-lower)+.001,d)));
 const a=Math.atan2(dy,dx),cos=(upper*upper+distance*distance-lower*lower)/(2*upper*distance);
 const elbowAngle=a+bend*Math.acos(Math.max(-1,Math.min(1,cos)));
 const elbow={x:shoulder.x+Math.cos(elbowAngle)*upper,y:shoulder.y+Math.sin(elbowAngle)*upper};
 return {shoulder,elbow,hand:{x:shoulder.x+Math.cos(a)*distance,y:shoulder.y+Math.sin(a)*distance}};
}
export function ninjaSwing(phase:number){
 const t=Math.max(0,Math.min(1,phase)),smooth=(n:number)=>n*n*(3-2*n);
 if(t===0||t===1)return 0;
 if(t<.26)return -.9*smooth(t/.26);
 if(t<.54)return -.9+1.95*(1-Math.pow(1-(t-.26)/.28,3));
 if(t<.68)return 1.05;
 return 1.05*(1-smooth((t-.68)/.32));
}

/** Pull the wrist inward on recovery so returning to ready is not a reverse cut. */
export function ninjaRecovery(phase:number){return phase<=.68||phase>=1?1:1-.32*Math.sin((Math.min(1,phase)-.68)/.32*Math.PI);}
export function ninjaWeaponSwing(id:string,phase:number,sequence=0,offhand=false){
 const t=Math.max(0,Math.min(1,phase));
 if(id==='dual'){
  const local=offhand?Math.max(0,(t-.07)/.93):t;
  const direction=((sequence%2===0)!==offhand)?-1:1;
  return ninjaSwing(local)*direction;
 }
 if(id==='kama')return ninjaSwing(t)*1.25;
 return ninjaSwing(t);
}
