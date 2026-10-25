import type {ArenaScene,Enemy} from './combat';
import {WEAPONS,ABILITY_TUNING as T} from './config';
import {outfitEffectProfile} from './outfit-effect-profiles';
import {survivorPalette} from './survivor-skill-fx';
type Point={x:number;y:number};
type Cut=Point&{angle:number;radius:number;span:number;age:number;heavy:boolean};
type BlossomHit=Point&{age:number;angle:number};
const gap=(a:number,b:number)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
const boss=(e:Enemy)=>['boss','commander','shooterBoss'].includes(e.type);
const elite=(e:Enemy)=>boss(e)||['elite','brute','armoured','cleaver','abomination'].includes(e.type);
/** Old draw/mark save IDs intentionally remain stable; this owns their new active attacks. */
export class SamuraiActive{
 kind:'draw'|'mark'|undefined;age=0;aim=0;private nextSweep=0;private dashHits=new Set<Enemy>();
 private impacts:BlossomHit[]=[];private cuts:Cut[]=[];private ghosts:(Point&{age:number;angle:number})[]=[];private ghostClock=0;private g;
 readonly colors:readonly number[];readonly theme:string;
 constructor(private s:ArenaScene){this.g=s.add.graphics().setDepth(4.45);const p=outfitEffectProfile(s.save,'samurai');this.theme=p?.theme||'original';this.colors=p?survivorPalette(p):[0xef6265,0xffd56b];}
 get active(){return !!this.kind;}
 get dashing(){return this.kind==='draw'&&this.age>=T.draw.windup&&this.age<T.draw.windup+T.draw.dash;}
 get duration(){return this.kind==='draw'?T.draw.windup+T.draw.dash+T.draw.recovery:T.mark.duration;}
 begin(kind:'draw'|'mark',aim:number){if(this.active)return false;this.kind=kind;this.age=0;this.aim=aim;this.nextSweep=0;this.dashHits.clear();this.ghostClock=0;this.s.swing=0;this.s.angle=aim;this.s.audio.play('reload-swish');return true;}
 private hit(e:Enemy,damage:number,source:string){this.impacts.push({x:e.x,y:e.y,age:0,angle:Math.atan2(e.y-this.s.y,e.x-this.s.x)});if(this.impacts.length>20)this.impacts.shift();this.s.hit(e,damage,0,false,false,source);}
 private cut(angle:number,radius:number,span:number,heavy=false){this.cuts.push({x:this.s.x,y:this.s.y,angle,radius,span,heavy,age:0});if(this.cuts.length>8)this.cuts.shift();}
 private contact(heavy=false){const s=this.s;s.audio.play(heavy?'lotus-counter':'keen-hit');if(s.save.settings.shake&&!this.reduced())s.cameras?.main.shake(heavy?65:35,s.save.settings.mapView===2?.0005:heavy?.0015:.0007);}
 private reduced(){return typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;}
 private sweep(index:number){const s=this.s,angle=this.aim+(index===1?Math.PI:0),radius=WEAPONS[s.weapon].range*T.mark.rangeScale,heavy=index===2;
  this.cut(angle,radius,T.mark.arc,heavy);let hits=0;
  for(const e of [...s.enemies])if(e.active&&Math.hypot(e.x-s.x,e.y-s.y)<=radius+e.r&&gap(Math.atan2(e.y-s.y,e.x-s.x),angle)<=T.mark.arc/2+Math.asin(Math.min(1,e.r/Math.max(1,Math.hypot(e.x-s.x,e.y-s.y))))){
   this.hit(e,Math.min(T.mark.damageCap,WEAPONS[s.weapon].damage*T.mark.damage[index]),'Blade Tempest');hits++;
   if(heavy&&e.active&&!boss(e)){const a=Math.atan2(e.y-s.y,e.x-s.x),push=T.mark.push*(elite(e)?.15:1),p=s.moveOnGround(e.x,e.y,Math.cos(a)*push,Math.sin(a)*push,e.r);e.x=p.x;e.y=p.y;}
  }
  if(hits)this.contact(heavy);else s.audio.play('reload-swish');
 }
 update(dt:number){dt=Math.max(0,dt);this.impacts=this.impacts.filter(c=>(c.age+=dt)<.44);this.cuts=this.cuts.filter(c=>(c.age+=dt)<(c.heavy?.5:.28));this.ghosts=this.ghosts.filter(c=>(c.age+=dt)<.22);if(!this.kind)return;
  const before=this.age,end=Math.min(this.duration,before+dt);this.age=end;const s=this.s;
  if(this.kind==='draw'){
   const start=T.draw.windup,finish=start+T.draw.dash;
   const overlap=Math.max(0,Math.min(end,finish)-Math.max(before,start));
   if(before<start&&end>=start){s.protect(T.draw.dash);s.audio.play('lotus-counter');}
   // Small steps follow exactly the same obstacle solver as ordinary movement.
   if(overlap>0){const travel=T.draw.distance*overlap/T.draw.dash,steps=Math.max(1,Math.ceil(travel/8));
    for(let i=0;i<steps;i++){const p=s.moveOnGround(s.x,s.y,Math.cos(this.aim)*travel/steps,Math.sin(this.aim)*travel/steps,17);s.x=p.x;s.y=p.y;
     for(const e of [...s.enemies])if(e.active&&!this.dashHits.has(e)&&Math.hypot(e.x-s.x,e.y-s.y)<=T.draw.radius+e.r){this.dashHits.add(e);this.hit(e,Math.min(T.draw.damageCap,WEAPONS[s.weapon].damage*T.draw.damage),'Flash Draw');}
    }
    this.ghostClock+=overlap;if(this.ghostClock>=.035){this.ghostClock=0;this.ghosts.push({x:s.x,y:s.y,angle:this.aim,age:0});if(this.ghosts.length>5)this.ghosts.shift();}
   }
   if(before<finish&&end>=finish){this.cut(this.aim,T.draw.radius+28,2.4,true);if(this.dashHits.size)this.contact(true);}
  }else{while(this.nextSweep<T.mark.strikes.length&&end>=T.mark.strikes[this.nextSweep])this.sweep(this.nextSweep++);}
  if(end>=this.duration)this.kind=undefined;
 }
 motion(){if(!this.kind)return;let weaponTurn=0;
  if(this.kind==='draw'){const p=Math.max(0,Math.min(1,(this.age-T.draw.windup)/T.draw.dash));weaponTurn=this.age<T.draw.windup?-1.1:-1.1+p*2.1;}
  else{const index=Math.max(0,Math.min(2,this.nextSweep)),start=index===0?0:T.mark.strikes[index-1],finish=T.mark.strikes[index],p=Math.max(0,Math.min(1,(this.age-start)/Math.max(.01,finish-start)));weaponTurn=index===1?1.4-p*2.8:-1.4+p*2.8;}
  const reduced=this.reduced(),bounce=reduced?0:this.kind==='draw'?this.dashing?-2:0:-Math.abs(Math.sin(this.age*14))*2.2;return{brace:false,gesture:0,sweep:0,weaponTurn,skillAim:this.aim,bodyLift:bounce,dashTrail:this.dashing,trailColor:this.colors[0]};
 }
 render(){const s=this.s,g=this.g,[color,accent]=this.colors,reduced=this.reduced(),quiet=reduced||s.save.settings.mapView===2;g.clear();
  const petal=(x:number,y:number,r:number,angle:number,alpha:number,fill=color)=>{if(this.theme==='original'||this.theme==='starlight'){g.fillStyle(fill,alpha);g.fillPoints([{x,y:y-r},{x:x+r*.35,y},{x,y:y+r},{x:x-r*.35,y}],true);return;}const ca=Math.cos(angle),sa=Math.sin(angle),p=[[-r,0],[-r*.3,-r*.65],[r*.75,-r*.4],[r,0],[r*.2,r*.55],[-r*.55,r*.35]].map(([px,py])=>({x:x+px*ca-py*sa,y:y+px*sa+py*ca}));g.fillStyle(fill,alpha);g.fillPoints(p,true);g.lineStyle(1,accent,alpha*.5);g.lineBetween(p[0].x,p[0].y,p[3].x,p[3].y);};
  const star=(x:number,y:number,r:number,alpha:number)=>{g.fillStyle(accent,alpha);g.fillPoints([{x,y:y-r},{x:x+r*.28,y:y-r*.28},{x:x+r,y},{x:x+r*.28,y:y+r*.28},{x,y:y+r},{x:x-r*.28,y:y+r*.28},{x:x-r,y},{x:x-r*.28,y:y-r*.28}],true);};
  const flower=(x:number,y:number,r:number,alpha:number)=>{if(this.theme!=='sakura'){
   if(this.theme==='jade'){const pts=[{x:x-r,y:y-r},{x:x-r*.28,y:y-r*.5},{x:x+r*.28,y:y-r*.5},{x:x+r,y:y-r},{x:x+r*.65,y:y+r*.3},{x,y:y+r},{x:x-r*.65,y:y+r*.3}];g.fillStyle(accent,alpha);g.fillPoints(pts,true);g.lineStyle(1.5,color,alpha);g.strokePoints(pts,true);g.lineBetween(x-r*.5,y,x-r*.15,y+r*.15);g.lineBetween(x+r*.5,y,x+r*.15,y+r*.15);return;}
   const pts=[];for(let i=0;i<=18;i++){const a=i/18*Math.PI;pts.push({x:x-Math.sin(a)*r,y:y-Math.cos(a)*r});}for(let i=18;i>=0;i--){const a=i/18*Math.PI;pts.push({x:x-Math.sin(a)*r*.28,y:y-Math.cos(a)*r});}g.fillStyle(accent,alpha);g.fillPoints(pts,true);g.lineStyle(1,color,alpha*.8);g.strokePoints(pts,true);star(x+r*.65,y-r*.4,r*.3,alpha);return;
  }for(let i=0;i<5;i++){const a=i*Math.PI*2/5;petal(x+Math.cos(a)*r*.65,y+Math.sin(a)*r*.65,r*.55,a,alpha);}g.fillStyle(accent,alpha);g.fillCircle(x,y,r*.2);};
  const ribbon=(x:number,y:number,r:number,a:number,span:number,alpha:number,heavy=false)=>{const n=quiet?18:32,out=[],inside=[];for(let i=0;i<=n;i++){const u=i/n,v=a-span/2+span*u,w=Math.pow(Math.sin(Math.PI*u),.7)*(heavy?28:19);out.push({x:x+Math.cos(v)*r,y:y+Math.sin(v)*r});inside.push({x:x+Math.cos(v)*(r-w),y:y+Math.sin(v)*(r-w)});}g.lineStyle(quiet?2:4,0x182935,alpha*.55);g.strokePoints(out,false);g.fillStyle(color,alpha*.67);g.fillPoints([...out,...inside.reverse()],true);g.lineStyle(heavy?3:2,accent,alpha*.95);g.strokePoints(out,false);
   if(!quiet){const inner=out.map((p,i)=>({x:x+(p.x-x)*.94,y:y+(p.y-y)*.94}));g.lineStyle(1.5,0xfff7e5,alpha*.85);g.strokePoints(inner.slice(5,-4),false);}
  };
  if(this.kind==='draw'&&this.age<T.draw.windup){const x=s.x+Math.cos(this.aim)*27,y=s.y+Math.sin(this.aim)*27;star(x,y,6,.9);if(!quiet)petal(x-10,y+9,4,-.5,.7);}
  if(this.dashing){ribbon(s.x,s.y,T.draw.radius,this.aim,1.6,.8);for(let i=0;i<(quiet?1:3);i++){const back=18+i*16,side=Math.sin(this.age*22+i)*6;petal(s.x-Math.cos(this.aim)*back-Math.sin(this.aim)*side,s.y-Math.sin(this.aim)*back+Math.cos(this.aim)*side,quiet?4:5,this.aim,.8-i*.16);}}
  // Curled wind ribbons accompany real outfit afterimages emitted by the character renderer.
  if(!quiet)for(const ghost of this.ghosts){const f=(1-ghost.age/.22)*.3,a=ghost.angle,x=ghost.x-Math.cos(a)*8,y=ghost.y-Math.sin(a)*8;ribbon(x,y,19,a+Math.PI,1.4,f);if(this.theme==='jade')flower(x,y-8,9,f*1.8);else if(this.theme==='starlight')flower(x,y-8,8,f*1.8);}
  for(const c of this.cuts){const p=c.age/(c.heavy?.5:.28),f=Math.pow(1-p,1.3),r=c.radius*(reduced?1:.96+p*.04);ribbon(c.x,c.y,r,c.angle,c.span,f,c.heavy);
   const count=quiet?3:c.heavy?13:9;for(let i=0;i<count;i++){const u=(i+.5)/count,a=c.angle-c.span/2+c.span*u,d=r+(reduced?5:p*(12+(i%3)*8)),x=c.x+Math.cos(a)*d,y=c.y+Math.sin(a)*d-(reduced?0:Math.sin(p*Math.PI)*8);if(i%3===0)star(x,y,(quiet?3:5)*(1-p*.4),f*.9);else petal(x,y,(quiet?3:5)+(i%2),a+(reduced?0:p*2),f*.9);}
   if(c.heavy){const x=c.x+Math.cos(c.angle)*(r*.65),y=c.y+Math.sin(c.angle)*(r*.65);if(this.theme==='starlight'){const rr=quiet?7:11;g.fillStyle(accent,f*.7);g.fillCircle(x,y,rr*(1-p*.2));g.lineStyle(2,color,f*.9);g.strokeCircle(x,y,rr);if(!quiet)for(let i=0;i<5;i++){const a=i*Math.PI*2/5;star(x+Math.cos(a)*(14+p*13),y+Math.sin(a)*(14+p*13),3,f);}}else flower(x,y-(reduced?0:p*12),quiet?8:12,f*.85);}
  }
  for(const hit of this.impacts){const p=hit.age/.44,f=1-p;star(hit.x,hit.y,7+Math.sin(p*Math.PI)*5,f);if(!quiet)for(let i=0;i<4;i++){const a=hit.angle+i*Math.PI/2,d=9+p*18;petal(hit.x+Math.cos(a)*d,hit.y+Math.sin(a)*d,4,a+p,f*.85,i%2?accent:color);}}
  if(this.kind==='mark')for(let i=0;i<3;i++){const x=s.x-13+i*13,y=s.y-51;if(i<this.nextSweep)flower(x,y,4.5,.85);else{g.fillStyle(color,.3);g.fillEllipse(x,y,4,5);}}
 }
 clear(){this.kind=undefined;this.age=0;this.impacts=[];this.cuts=[];this.ghosts=[];this.dashHits.clear();this.g.clear();}
 destroy(){this.clear();this.g.destroy();}
}
