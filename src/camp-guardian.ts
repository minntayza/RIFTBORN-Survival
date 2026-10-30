type Target={active:boolean;x:number;y:number;hp:number};
export class CampGuardian<T extends Target> {
 clock=0;lastShot=-10;
 shots:{x:number;y:number;target:T;damage:number;trail:{x:number;y:number}[]}[]=[];
 constructor(readonly x:number,readonly y:number){}
 update(dt:number,time:number,level:number,enemies:Iterable<T>,hit:(enemy:T,damage:number)=>void){
  for(const shot of this.shots){
   if(!shot.target.active||shot.target.hp<=0)continue;
   const dx=shot.target.x-shot.x,dy=shot.target.y-shot.y,d=Math.hypot(dx,dy),travel=360*dt;
   if(d<=travel+8){hit(shot.target,shot.damage);shot.damage=0;}
   else{shot.trail.unshift({x:shot.x,y:shot.y});shot.trail.length=Math.min(6,shot.trail.length);shot.x+=dx/d*travel;shot.y+=dy/d*travel;}
  }
  this.shots=this.shots.filter(s=>s.damage>0&&s.target.active&&s.target.hp>0);
  if(level<=0)return;
  this.clock=Math.max(0,this.clock-dt);
  if(this.clock>0)return;
  const target=[...enemies].filter(e=>e.active&&e.hp>0&&Math.hypot(e.x-this.x,e.y-this.y)<=340).sort((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)-Math.hypot(b.x-this.x,b.y-this.y))[0];
  if(!target)return;
  this.clock=1.5;this.lastShot=time;this.shots.push({x:this.x,y:this.y-20,target,damage:12+8*(level-1),trail:[]});
 }
}
