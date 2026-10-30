import type Phaser from 'phaser';
import type {ArenaScene,Enemy} from './combat';
import {WEAPONS} from './config';
import {fighterPose} from './lethwei-rig';
export type LethweiAction={kind:'elbow'|'kick'|'headbutt';time:number;duration:number;aim:number};
type Event={kind:'elbow'|'kick'|'headbutt'|'claws'|'rebound'|'champion';x:number;y:number;aim:number;life:number;max:number};
/** Card mechanics share one clock, and only real basic contacts advance combos. */
export class LethweiTechniques{
 action?:LethweiAction;
 private clock=0;private lastSequence=-1;private landed=0;private chain=0;private lastContact=-10;
 private kickReady=0;private headReady=0;private ropeReady=0;private championReady=0;
 private healReady=0;
 private boostUntil=0;private pending:{at:number;kind:'elbow'|'kick';aim:number}[]=[];
 private vulnerable=new Map<Enemy,number>();private events:Event[]=[];
 private prior?:{x:number;y:number};
 constructor(private s:ArenaScene){}
 get speedMultiplier(){return 1+this.s.u('ironshins')*.1;}
 damageMultiplier(e:Enemy){return (this.vulnerable.get(e)||0)>this.clock?1.25:1;}
 get reboundMultiplier(){return this.boostUntil>this.clock?1+this.s.u('ringmaster')*.5:1;}
 consumeRebound(echo:boolean,connected=true){const value=this.reboundMultiplier;if(!echo&&connected)this.boostUntil=0;return echo?1:value;}
 private effect(kind:Event['kind'],aim:number,x=this.s.x,y=this.s.y,life=.3){this.events.push({kind,x,y,aim,life,max:life});}
 private animate(kind:LethweiAction['kind'],aim:number){this.action={kind,time:.24,duration:.24,aim};}
 onBasicContact(sequence:number,aim:number){
  if(sequence===this.lastSequence)return;this.lastSequence=sequence;
  const s=this.s;this.landed++;this.chain=this.clock-this.lastContact<=2?this.chain+1:1;this.lastContact=this.clock;
  if(s.u('goldenbelt')&&!s.evolved('goldenbelt')&&s.hp<s.maxHp*.5&&this.clock>=this.healReady){s.heal(s.u('goldenbelt'));this.healReady=this.clock+.5;}
  if(s.u('nineweapons')&&this.landed%3===0){this.pending.push({at:this.clock+.08,kind:'elbow',aim},{at:this.clock+.34,kind:'kick',aim});}
  if(s.u('headbutt')&&this.chain>=5&&this.clock>=this.headReady){
   this.chain=0;this.headReady=this.clock+3;this.animate('headbutt',aim);this.effect('headbutt',aim);
   const p=s.moveOnGround(s.x,s.y,Math.cos(aim)*12,Math.sin(aim)*12,17);s.x=p.x;s.y=p.y;
   for(const e of s.enemies)if(e.active&&Math.hypot(e.x-s.x,e.y-s.y)<65+e.r){
    if(s.evolved('headbutt'))this.vulnerable.set(e,this.clock+3);
    s.hit(e,WEAPONS[s.weapon].damage*.4,25,false,false,'Lethwei Headbutt');e.stagger=Math.max(e.stagger||0,.25+s.u('headbutt')*.15);
   }
  }
 }
 onDamageDealt(actual:number,source?:string){if(this.s.evolved('goldenbelt')&&source==='Lethwei Basic Punch')this.s.heal(actual*.1);}
 beforeDamage(value:number){
  const s=this.s;if(value<=0||!s.evolved('goldenbelt')||this.clock<this.championReady||s.hp-value>s.maxHp*.3)return false;
  this.championReady=this.clock+25;s.protect(1.5);s.notifyCombat('GOLDEN CHAMPION · 1.5s INVULNERABLE');this.effect('champion',0,s.x,s.y,1.5);return true;
 }
 update(dt:number,ring:{active:boolean;x:number;y:number;radius:number}){
  const s=this.s;this.clock+=dt;
  if(this.action){this.action.time-=dt;if(this.action.time<=0)this.action=undefined;}
  this.events.forEach(e=>e.life-=dt);this.events=this.events.filter(e=>e.life>0);
  for(const [e,t] of this.vulnerable)if(!e.active||t<=this.clock)this.vulnerable.delete(e);
  for(const p of this.pending.filter(p=>p.at<=this.clock)){
   this.animate(p.kind,p.aim);this.effect(p.kind,p.aim);
   const x=s.x+Math.cos(p.aim)*25,y=s.y+Math.sin(p.aim)*25;
   for(const e of s.enemies)if(e.active&&Math.hypot(e.x-x,e.y-y)<36+e.r)s.hit(e,WEAPONS[s.weapon].damage*.15*s.u('nineweapons'),20,false,false,'Nine Limbs Combo');
   if(p.kind==='kick'&&s.evolved('nineweapons')){this.effect('claws',p.aim);this.forwardHit(p.aim,110,.8,35,0,'Roaring Tiger');}
  }
  this.pending=this.pending.filter(p=>p.at>this.clock);
  const old=this.prior;this.prior={x:s.x,y:s.y};if(!old||dt<=0)return;
  const dx=s.x-old.x,dy=s.y-old.y,distance=Math.hypot(dx,dy),moving=distance>.05&&distance<80;
  if(moving&&s.u('ironshins')&&this.clock>=this.kickReady&&s.enemies.some(e=>e.active&&Math.hypot(e.x-s.x,e.y-s.y)<35+e.r)){
   const aim=Math.atan2(dy,dx);this.kickReady=this.clock+1.5;this.animate('kick',aim);this.effect('kick',aim);
   this.forwardHit(aim,s.evolved('ironshins')?115:55,.5*s.u('ironshins'),45,s.evolved('ironshins')?.7:.15,'Iron Shins');
  }
  if(moving&&ring.active&&s.u('ringmaster')&&this.clock>=this.ropeReady){
   const x=s.x-ring.x,y=s.y-ring.y,W=ring.radius;
   const side=Math.abs(x)>Math.abs(y)?'x':'y',offset=side==='x'?x:y,velocity=side==='x'?dx:dy;
   if(Math.abs(x)<=W+16&&Math.abs(y)<=W+16&&Math.abs(offset)>=W-18&&offset*velocity>0){
    const aim=side==='x'?(x>0?Math.PI:0):(y>0?-Math.PI/2:Math.PI/2);
    const p=s.moveOnGround(s.x,s.y,Math.cos(aim)*46,Math.sin(aim)*46,17);s.x=p.x;s.y=p.y;
    this.ropeReady=this.clock+1.5;this.boostUntil=this.clock+3;this.effect('rebound',aim);s.notifyCombat('ROPE REBOUND · NEXT PUNCH EMPOWERED');
   }
  }
 }
 private forwardHit(aim:number,range:number,mult:number,knock:number,stun:number,source:string){
  const s=this.s;for(const e of s.enemies){const dx=e.x-s.x,dy=e.y-s.y,forward=dx*Math.cos(aim)+dy*Math.sin(aim),side=Math.abs(-dx*Math.sin(aim)+dy*Math.cos(aim));
   if(e.active&&forward>=-e.r&&forward<range+e.r&&side<28+e.r){s.hit(e,WEAPONS[s.weapon].damage*mult,knock,false,false,source);e.stagger=Math.max(e.stagger||0,stun);}
  }
 }
 render(g:Phaser.GameObjects.Graphics){
  const s=this.s;
  const cue=this.action,comboReady=s.u('nineweapons')>0&&this.landed%3===2;
  if(cue||comboReady){
   const aim=cue?.aim??s.angle,flip=Math.cos(aim)<0,localAim=Math.atan2(Math.sin(aim),Math.abs(Math.cos(aim)));
   for(const p of fighterPose(s.elapsed,false,s.swing,s.attackSequence,undefined,.18,localAim,cue)){
    const foot=cue?.kind==='kick'&&p.part==='leftLeg',fist=p.part.includes('Forearm')&&(comboReady||cue?.kind==='elbow');
    if(!foot&&!fist)continue;
    const length=((foot?.94:.82)-p.oy)*p.h;
    const x=s.x+(p.x-Math.sin(p.r)*length)*.58*(flip?-1:1),y=s.y+(p.y+Math.cos(p.r)*length-4)*.58;
    g.lineStyle(1.5,0xffe2a2,foot?.85:.55);g.beginPath();g.arc(x,y,foot?9:5,aim-.8,aim+1.8);g.strokePath();
   }
  }
  if(this.boostUntil>this.clock){g.lineStyle(1.5,0xffdd8d,.7);g.strokeCircle(s.x,s.y-7,19);}
  for(const e of this.events){const t=1-e.life/e.max,a=1-t,x=e.x,y=e.y;
   if(e.kind==='champion'){g.lineStyle(2,0xffdb7e,.4+.3*Math.sin(this.clock*10));g.strokeEllipse(s.x,s.y-4,42,66);continue;}
   if(e.kind==='headbutt'){g.lineStyle(2.5,0xffedb7,a);g.strokePoints([{x:x-10,y:y-29},{x,y:y-42},{x:x+10,y:y-29},{x,y:y-16}],true);}
   else if(e.kind==='claws'){for(const offset of [-10,0,10]){const px=x-Math.sin(e.aim)*offset,py=y+Math.cos(e.aim)*offset;g.lineStyle(3,0xffcf75,a);g.lineBetween(px,py,px+Math.cos(e.aim)*(30+t*80),py+Math.sin(e.aim)*(30+t*80));}}
   else {const r=e.kind==='kick'&&s.evolved('ironshins')?28+t*80:18+t*25;g.lineStyle(e.kind==='kick'?3:2,0xffe5af,a);g.beginPath();g.arc(x,y,r,e.aim-.7,e.aim+.7);g.strokePath();}
  }
  for(const [e] of this.vulnerable){g.lineStyle(1.5,0xffe5ae,.8);g.strokePoints([{x:e.x-4,y:e.y-e.r-10},{x:e.x,y:e.y-e.r-16},{x:e.x+4,y:e.y-e.r-10},{x:e.x,y:e.y-e.r-4}],true);}
 }
 clear(){this.action=undefined;this.pending=[];this.events=[];this.vulnerable.clear();this.prior=undefined;this.chain=0;this.landed=0;this.boostUntil=0;this.clock=0;this.lastSequence=-1;this.lastContact=-10;this.kickReady=0;this.headReady=0;this.ropeReady=0;this.championReady=0;this.healReady=0;}
}
