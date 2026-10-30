import type {CampObstacle} from './last-camp-collision';
export type SiegePoint={x:number;y:number};
export type CampStrike={from:SiegePoint;to:SiegePoint;robot:boolean;heavy:boolean;born:number;impactAt:number;damage:number;resolved:boolean;enemy:object};
/** Contact lies on the nearest solid camp surface, never in the beacon centre. */
export function campContact(x:number,y:number,obstacles:CampObstacle[]):SiegePoint{
 let best={x,y},distance=Infinity;
 for(const o of obstacles.filter(o=>o.group==='camp')){
  const p={x:Math.max(o.x-o.halfW,Math.min(o.x+o.halfW,x)),y:Math.max(o.y-o.halfH,Math.min(o.y+o.halfH,y))},d=Math.hypot(x-p.x,y-p.y);
  if(d<distance){distance=d;best=p;}
 }
 return best;
}
export function siegeApproach(e:SiegePoint&{r:number},cx:number,cy:number,others:(SiegePoint&{r:number;active:boolean})[]){
 const dx=cx-e.x,dy=cy-e.y,d=Math.hypot(dx,dy)||1,tx=-dy/d,ty=dx/d;
 let side=0;
 for(const other of others){if(other===e||!other.active)continue;const ox=e.x-other.x,oy=e.y-other.y,gap=Math.hypot(ox,oy),space=e.r+other.r+12;
 if(gap<space){const projection=ox*tx+oy*ty;side+=(projection===0?(others.findIndex(o=>o===e)<others.indexOf(other)?-1:1):Math.sign(projection))*(1-gap/space)*2;}}
 const vx=dx/d+tx*side,vy=dy/d+ty*side,n=Math.hypot(vx,vy)||1;
 return {x:vx/n,y:vy/n,crowded:Math.abs(side)>.25};
}
export function siegeRecoil(remaining:number,age:number,robot:boolean,reduced=false){
 if(reduced)return 0;
 if(remaining>0)return -Math.pow(1-Math.min(1,remaining/1.4),2)*(robot?3:7);
 return age>=0&&age<.28?Math.sin(age/.28*Math.PI)*(robot?-3:10):0;
}

export const campAttackChance=(wave:number)=>.25+Math.min(9,Math.max(0,wave-1))*.15/9;
export const campAttackLimit=(wave:number)=>Math.min(6,3+Math.floor(Math.max(0,wave-1)/3));
export function targetsCamp(type:string,wave:number,roll:number,activeAttackers:number){
 return !['boss','shooterBoss','commander'].includes(type)&&activeAttackers<campAttackLimit(wave)&&roll<campAttackChance(wave);
}
/** Prefer a nearby free perimeter lane so attackers spread without crossing the camp. */
export function campAttackLane(x:number,y:number,cx:number,cy:number,occupied:number[]){
 const arrival=Math.atan2(y-cy,x-cx);let lane=0,best=Infinity;
 for(let i=0;i<12;i++){const a=i*Math.PI/6,turn=Math.abs(Math.atan2(Math.sin(a-arrival),Math.cos(a-arrival))),score=turn+occupied.filter(n=>n===i).length*2;
 if(score<best){best=score;lane=i;}}
 return lane;
}
export function campAttackStation(lane:number,r:number,cx:number,cy:number,obstacles:CampObstacle[]){
 const a=lane*Math.PI/6,p=campContact(cx+Math.cos(a)*240,cy+Math.sin(a)*240,obstacles);
 return {x:p.x+Math.cos(a)*(r+10),y:p.y+Math.sin(a)*(r+10)};
}
