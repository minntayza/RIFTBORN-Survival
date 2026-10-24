import {separateWrecks,type Wreck} from './map-ground';
export type CampObstacle=Wreck&{id:string;group:'camp'|'court'};
/** Ground footprints registered to the 320px beacon and 1280×960 courtyard art.
 * Raised flames, banners and foliage are not treated as solid ground. */
export function campObstacles(x:number,y:number):CampObstacle[]{
 const boxes:[string,'camp'|'court',number,number,number,number][]=[
  ['beacon-base','camp',0,-24,49,52],
  ['left-supplies','camp',-104,22,32,35],['right-supplies','camp',104,28,30,33],
  ['rear-left-barricade','camp',-65,-27,19,25],['rear-right-barricade','camp',66,-24,19,25],
  ['front-left-barricade','camp',-65,68,39,16],['front-right-barricade','camp',65,68,39,16],
  ['left-lantern-post','camp',-134,28,7,13],['right-lantern-post','camp',134,34,7,13],
  ['north-west-wall','court',-310,-366,220,22],['north-east-wall','court',310,-366,220,22],
  ['south-west-wall','court',-310,378,220,23],['south-east-wall','court',310,378,220,23],
  ['west-north-wall','court',-542,-210,22,105],['west-south-wall','court',-542,210,22,105],
  ['east-north-wall','court',542,-210,22,105],['east-south-wall','court',542,210,22,105],
  ['north-west-pillar','court',-495,-308,22,22],['north-east-pillar','court',495,-308,22,22],
  ['south-west-pillar','court',-495,310,22,22],['south-east-pillar','court',495,310,22,22],
 ];
 return boxes.map(([id,group,dx,dy,halfW,halfH])=>({id,group,x:x+dx,y:y+dy,halfW,halfH,horizontal:halfW>halfH,variant:0}));
}
export function obstacleDistance(x:number,y:number,o:Wreck){return Math.hypot(Math.max(0,Math.abs(x-o.x)-o.halfW),Math.max(0,Math.abs(y-o.y)-o.halfH));}
export function resolveCampGround(x:number,y:number,r:number,cx:number,cy:number,obstacles:CampObstacle[]){
 const minX=cx-550+r,maxX=cx+550-r,minY=cy-395+r,maxY=cy+395-r;
 x=Math.max(minX,Math.min(maxX,x));y=Math.max(minY,Math.min(maxY,y));
 for(let pass=0;pass<8;pass++){
  const oldX=x,oldY=y;
  for(const o of obstacles){
   const p=separateWrecks(x,y,r,[o]);x=p.x;y=p.y;
   // Perimeter walls resolve toward the courtyard, never back into a wall at the map limit.
   if(x<minX)x=o.x+o.halfW+r;if(x>maxX)x=o.x-o.halfW-r;
   if(y<minY)y=o.y+o.halfH+r;if(y>maxY)y=o.y-o.halfH-r;
  }
  const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy),minimum=62+r;
  if(d<minimum){x=cx+(d?dx/d:1)*minimum;y=cy+(d?dy/d:0)*minimum;}
  if(Math.hypot(x-oldX,y-oldY)<.0001)break;
 }
 const clear=(px:number,py:number)=>px>=minX&&px<=maxX&&py>=minY&&py<=maxY&&Math.hypot(px-cx,py-cy)>=62+r-.001&&obstacles.every(o=>obstacleDistance(px,py,o)>=r-.001);
 if(!clear(x,y)){
  // Recovery for actors spawned or crowd-pushed deep into overlapping shapes.
  // Normal movement rejects long recovery jumps, so this cannot become a dash shortcut.
  const candidates:{x:number;y:number}[]=[];
  for(const o of obstacles){const hw=o.halfW+r+1,hh=o.halfH+r+1;for(const [dx,dy] of [[-hw,-hh],[hw,-hh],[-hw,hh],[hw,hh],[-hw,0],[hw,0],[0,-hh],[0,hh]])candidates.push({x:o.x+dx,y:o.y+dy});}
  for(let i=0;i<32;i++){const a=i/32*Math.PI*2;candidates.push({x:cx+Math.cos(a)*(63+r),y:cy+Math.sin(a)*(63+r)});}
  const best=candidates.filter(p=>clear(p.x,p.y)).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];if(best)return best;
 }
 return{x:Math.max(minX,Math.min(maxX,x)),y:Math.max(minY,Math.min(maxY,y))};
}
/** Segment against an expanded rectangle, excluding mere endpoint contact. */
function crosses(x:number,y:number,tx:number,ty:number,o:Wreck,padding:number){
 let lo=0,hi=1;
 for(const [p,d,min,max] of [[x,tx-x,o.x-o.halfW-padding,o.x+o.halfW+padding],[y,ty-y,o.y-o.halfH-padding,o.y+o.halfH+padding]]){
  if(Math.abs(d)<.00001){if(p<=min||p>=max)return false;}
  else{const a=(min-p)/d,b=(max-p)/d;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));}
 }
 return lo<hi&&hi>.00001&&lo<.99999;
}
/** Route across visible corners, rather than repeatedly aiming at the same near corner. */
export function campSteering(x:number,y:number,tx:number,ty:number,r:number,cx:number,cy:number,obstacles:CampObstacle[]){
 const core:Wreck={x:cx,y:cy,halfW:62,halfH:62,horizontal:true,variant:0};
 if(![core,...obstacles].some(o=>crosses(x,y,tx,ty,o,r+1)))return Math.atan2(ty-y,tx-x);
 const camp:Wreck={x:cx,y:cy+18,halfW:142,halfH:84,horizontal:true,variant:0},routes=[camp,...obstacles.filter(o=>o.group==='court')];
 const blocking=routes.filter(o=>crosses(x,y,tx,ty,o,r+4)).sort((a,b)=>obstacleDistance(x,y,a)-obstacleDistance(x,y,b))[0];if(!blocking)return Math.atan2(ty-y,tx-x);
 const hw=blocking.halfW+r+18,hh=blocking.halfH+r+18;
 const outside=(px:number,py:number)=>[{x:blocking.x-hw,y:py},{x:blocking.x+hw,y:py},{x:px,y:blocking.y-hh},{x:px,y:blocking.y+hh}].sort((a,b)=>Math.hypot(a.x-px,a.y-py)-Math.hypot(b.x-px,b.y-py));
 if(Math.abs(x-blocking.x)<blocking.halfW+r+4&&Math.abs(y-blocking.y)<blocking.halfH+r+4){const exit=outside(x,y).find(p=>![core,...obstacles].some(o=>crosses(x,y,p.x,p.y,o,r)));if(exit)return Math.atan2(exit.y-y,exit.x-x);}
 if(Math.abs(tx-blocking.x)<blocking.halfW+r+4&&Math.abs(ty-blocking.y)<blocking.halfH+r+4){const goal=outside(tx,ty)[0];tx=goal.x;ty=goal.y;}
 const nodes=[{x,y},{x:tx,y:ty},...([[-hw,-hh],[hw,-hh],[-hw,hh],[hw,hh]] as const).map(([dx,dy])=>({x:blocking.x+dx,y:blocking.y+dy}))],distance=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),done=new Set<number>();distance[0]=0;
 for(let step=0;step<nodes.length;step++){
  let current=-1;for(let i=0;i<nodes.length;i++)if(!done.has(i)&&(current<0||distance[i]<distance[current]))current=i;
  if(current<0||!Number.isFinite(distance[current]))break;if(current===1)break;done.add(current);
  for(let next=0;next<nodes.length;next++){if(next===current||done.has(next))continue;const a=nodes[current],b=nodes[next];if(routes.some(o=>crosses(a.x,a.y,b.x,b.y,o,r+4)))continue;const cost=distance[current]+Math.hypot(a.x-b.x,a.y-b.y);if(cost<distance[next]){distance[next]=cost;previous[next]=current;}}
 }
 const path:number[]=[];let next=1;if(previous[next]<0)return Math.atan2(ty-y,tx-x);while(next>0){path.unshift(next);next=previous[next];}
 while(path.length>1&&Math.hypot(nodes[path[0]].x-x,nodes[path[0]].y-y)<8)path.shift();
 const waypoint=nodes[path[0]??1];return Math.atan2(waypoint.y-y,waypoint.x-x);
}
