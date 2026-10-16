import type {EnemyId} from './config';
import {WALK_FRAMES,WALK_PROFILES,type WalkingZombie} from './zombie-walk';
export type RigState={x:number;y:number;time:number;phase:number;moving:number;facing:1|-1;candidate:1|-1;held:number};
export function advanceZombieRig(s:RigState,id:WalkingZombie,x:number,y:number,time:number,r:number,dx:number,dy:number,locked:boolean){
 const dt=Math.max(0,Math.min(.1,time-s.time)),distance=Math.hypot(x-s.x,y-s.y);
 const walking=!locked&&distance>.03&&distance<r*3;
 if(walking)s.phase=(s.phase+distance/(r*WALK_PROFILES[id].stride))%1;
 s.moving=Math.max(0,Math.min(1,s.moving+(walking?1:-1)*dt*8));
 // A central dead zone and a dwell prevent rapid left/right flipping when the
 // player crosses a zombie's center line. The body NEVER rotates as a whole.
 const side=dx/Math.max(1,Math.hypot(dx,dy)),candidate=side>.3?1:side<-.3?-1:s.facing;
 if(candidate!==s.candidate){s.candidate=candidate;s.held=0;}
 else s.held+=dt;
 if(!locked&&s.held>=.22)s.facing=s.candidate;
 s.x=x;s.y=y;s.time=time;
 const walkingFrame=1+Math.floor(s.phase*WALK_FRAMES)%WALK_FRAMES;
 return {frame:s.moving>.15?walkingFrame:0,level:s.moving>.7?2:s.moving>.15?1:0,facing:s.facing};
}
export function crowdSeparation(dx:number,dy:number,r:number,otherR:number,dt:number){
 const distance=Math.hypot(dx,dy),gap=(r+otherR)*1.12;
 if(distance>=gap)return {x:0,y:0};
 // Choose a stable axis for identical spawn points instead of leaving them stacked.
 const push=Math.min((gap-distance)*.45,36*Math.max(0,dt));
 return distance>.001?{x:dx/distance*push,y:dy/distance*push}:{x:push,y:0};
}
export function isRigZombie(id:EnemyId):id is WalkingZombie{return id in WALK_PROFILES;}

export function zombieVisualScale(id:EnemyId,zoom:number){return (zoom<.8?1.17:1)*(id==='runner'?1.2:1);}
