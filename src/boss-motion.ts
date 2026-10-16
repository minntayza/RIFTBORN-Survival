export type BossAction='slam'|'rally'|'charge'|'fire';
export const BOSS_RECOVERY=.65;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
/** Wind-up, a fast downstroke, a planted contact pose, then a slow recovery. */
export function bossMotion(age:number,windup:number,action:BossAction){
 const p=clamp(age/windup),after=age-windup;
 const lift=p<.7?smooth(p/.7):p<.88?1:1-smooth((p-.88)/.12);
 const contact=after>=0?1-smooth((after-.12)/(BOSS_RECOVERY-.12)):0;
 const anticipation=after<0?smooth(p/.7):0;
 return {lift,contact,brace:after<0?anticipation:contact,
  crouch:action==='slam'?(after<0?-4*lift+9*(1-lift)*anticipation:9*contact):action==='charge'?6*anticipation:2*contact,
  lean:action==='charge'?-.22*anticipation:action==='fire'?-.12*anticipation:.12*contact,
  recoil:action==='fire'&&after>=0?Math.sin(clamp(after/.3)*Math.PI)*5:0};
}
export function bossAction(type:string,phase:number):BossAction{
 return type==='commander'?'rally':type==='shooterBoss'?'fire':phase%3===0?'slam':phase%3===1?'rally':'charge';
}
