/** A short input grace period, measured in real time, never queues repeated casts. */
export class SkillInputBuffer {
 private pending?:{slot:number;dx:number;dy:number;expires:number};
 request(slot:number,dx:number,dy:number,now:number){this.pending={slot,dx,dy,expires:now+180};}
 consume(now:number,cast:(slot:number,dx:number,dy:number)=>boolean){const p=this.pending;if(!p)return;if(now>p.expires){this.pending=undefined;return;}if(cast(p.slot,p.dx,p.dy))this.pending=undefined;}
 clear(){this.pending=undefined;}
}
/** Keep important geometry while reducing decorative repetition in crowded views. */
export function effectBudget(wide:boolean,reduced:boolean,crowd:number){return {particles:reduced?1:wide||crowd>22?3:7,accents:reduced?1:wide?2:4,ghosts:reduced?0:wide?1:3};}
