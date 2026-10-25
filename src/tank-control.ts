/** Small thumb jitter should not turn the shield. The returned heading drives both art and blocking. */
export function tankTouchAim(current:number,dx:number,dy:number,dt:number){
 if(Math.hypot(dx,dy)<.12)return current;
 const target=Math.atan2(dy,dx),delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));
 return current+delta*(1-Math.exp(-32*Math.max(0,dt)));
}
/** Preserve the committed strike direction through contact, free steering during recovery. */
export function tankShieldCommitted(swing:number,duration:number){return swing>duration*.45;}
