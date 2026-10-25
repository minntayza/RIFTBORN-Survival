/** Royal Dat Lone keeps one shared gameplay center; these offsets are visual only. */
export function royalDatLoneOffsets(time:number,pull:number,reduced=false){
 const angle=reduced?0:time*2.4;
 const radius=33*Math.min(1,Math.max(0,pull)/.24);
 return [0,Math.PI].map(offset=>({x:Math.cos(angle+offset)*radius,y:Math.sin(angle+offset)*radius}));
}
export const datLoneExplosionDamage=(twinBonus:number,royal=false)=>100*(1+twinBonus)*(royal?1.25:1);
