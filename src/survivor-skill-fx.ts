import type Phaser from 'phaser';
import {ABILITY_TUNING as T} from './config';
import type {OutfitProfile} from './outfit-effect-profiles';
export type SurvivorEventKind='counter'|'draw'|'finish'|'shot'|'deploy'|'throw'|'blast'|'redirect'|'reload';
export type SurvivorEvent={kind:SurvivorEventKind;x:number;y:number;angle:number;age:number};
export const SURVIVOR_EVENT_LIMIT=24;
export const survivorPalette=(p:Pick<OutfitProfile,'hero'|'theme'>)=>p.hero==='samurai'?(p.theme==='sakura'?[0xef799e,0xffd698]:p.theme==='jade'?[0x4fcf91,0xf2fff8]:[0x233e79,0xf4f8ff]):p.theme==='sakura'?[0xf0bc62,0xffe5ac]:p.theme==='jade'?[0x63dcd2,0xc6f3ea]:[0xb49af5,0x8adfed];
export class SurvivorSkillTimeline{
 events:SurvivorEvent[]=[];
 add(kind:SurvivorEventKind,p:{x:number;y:number},angle=0){this.events.push({kind,x:p.x,y:p.y,angle,age:0});if(this.events.length>SURVIVOR_EVENT_LIMIT)this.events.shift();}
 tick(dt:number){this.events=this.events.filter(e=>(e.age+=Math.max(0,dt))<(e.kind==='shot'?.12:e.kind==='redirect'?.22:.48));}
 clear(){this.events=[];}
}
type State={gadgetsExternal?:boolean;x:number;y:number;angle:number;counter:number;drawTime:number;drawAim:number;overdrive:number;markTime:number;markHits:number;marked?:{x:number;y:number;r:number;active:boolean};beacon?:{x:number;y:number;life:number;redirects:number};charge?:{x:number;y:number;flight:number;fuse:number;target:{x:number;y:number}};bullets:readonly {active:boolean;hostile:boolean;x:number;y:number;vx:number;vy:number;kind:string}[];wide:boolean;reduced:boolean};
/** Decorations consume real combat state/events and never own gameplay timers. */
export class SurvivorSkillEffects{
 readonly timeline=new SurvivorSkillTimeline();private g:Phaser.GameObjects.Graphics;private disposed=false;
 constructor(scene:Phaser.Scene,readonly profile:OutfitProfile){this.g=scene.add.graphics().setDepth(4.35);}
 event(kind:SurvivorEventKind,p:{x:number;y:number},angle=0){this.timeline.add(kind,p,angle);}
 clear(){this.timeline.clear();this.g.clear();}
 destroy(){if(this.disposed)return;this.clear();this.disposed=true;this.g.destroy();}
 private emblem(x:number,y:number,r:number,alpha:number){const g=this.g,p=this.profile,[color,accent]=survivorPalette(p);g.lineStyle(2,0x182b36,alpha);g.fillStyle(color,alpha);
  if(p.hero==='samurai'&&p.theme==='sakura'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;g.fillEllipse(x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55,r*.7,r*.9);}g.fillStyle(accent,alpha);g.fillCircle(x,y,r*.22);}
  else if(p.hero==='samurai'&&p.theme==='jade'){const pts=[{x:x-r,y:y-r},{x:x-r*.25,y:y-r*.6},{x:x+r*.25,y:y-r*.6},{x:x+r,y:y-r},{x:x+r*.7,y:y+r*.3},{x,y:y+r},{x:x-r*.7,y:y+r*.3}];g.fillPoints(pts,true);g.strokePoints(pts,true);g.lineStyle(2,accent,alpha);g.lineBetween(x-r*.5,y,x-r*.15,y+r*.2);g.lineBetween(x+r*.5,y,x+r*.15,y+r*.2);}
  else if(p.hero==='samurai'){g.lineStyle(Math.max(2,r*.32),color,alpha);g.beginPath();g.arc(x,y,r,-.3,Math.PI*1.25);g.strokePath();g.fillStyle(accent,alpha);g.fillTriangle(x+r*.55,y-r*.8,x+r*.85,y-r*.1,x+r*.2,y-r*.4);}
  else if(p.theme==='jade'){g.lineStyle(2.5,color,alpha);g.strokePoints([{x:x-r,y},{x,y:y-r},{x:x+r,y},{x,y:y+r}],true);g.lineBetween(x-r*.5,y,x+r*.5,y);}
  else{const pts=Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,d=i%2?r*.45:r;return{x:x+Math.cos(a)*d,y:y+Math.sin(a)*d};});g.fillPoints(pts,true);g.strokePoints(pts,true);g.fillStyle(accent,alpha);g.fillTriangle(x,y-r*.6,x+r*.3,y,x,y+r*.3);}
 }
 private crescent(x:number,y:number,r:number,angle:number,span:number,fade:number,quiet:boolean){const g=this.g,[color,accent]=survivorPalette(this.profile),n=quiet?12:24,points=[];for(let i=0;i<=n;i++){const a=angle-span/2+i/n*span;points.push({x:x+Math.cos(a)*r,y:y+Math.sin(a)*r});}for(let i=n;i>=0;i--){const a=angle-span/2+i/n*span,rr=r-(quiet?6:11)*Math.sin(Math.PI*i/n);points.push({x:x+Math.cos(a)*rr,y:y+Math.sin(a)*rr});}g.fillStyle(color,fade*.55);g.fillPoints(points,true);g.lineStyle(2.5,accent,fade*.9);g.strokePoints(points.slice(0,n+1),false);}
 render(s:State){if(this.disposed)return;const g=this.g,p=this.profile,[color,accent]=survivorPalette(p),quiet=s.wide||s.reduced;g.clear();
  if(s.counter>0||s.drawTime>0){const aim=s.drawTime>0?s.drawAim:s.angle;this.crescent(s.x,s.y,43,aim,1.5,.75,true);this.emblem(s.x+Math.cos(aim)*44,s.y+Math.sin(aim)*44,7,.9);}
  if(s.marked?.active&&s.markTime>0){const e=s.marked,y=e.y-e.r-19;this.emblem(e.x,y,10,.95);for(let i=0;i<T.mark.hits;i++){g.fillStyle(i<s.markHits?accent:0x263b45,.95);g.lineStyle(1,color,.8);g.fillRoundedRect(e.x-18+i*10,y+17,7,4,1);g.strokeRoundedRect(e.x-18+i*10,y+17,7,4,1);}g.lineStyle(2,color,.8);for(const side of [-1,1])g.lineBetween(e.x+side*(e.r+6),e.y-7,e.x+side*(e.r+6),e.y+8);}
  if(s.overdrive>0){g.lineStyle(2,color,.7);for(const side of [-1,1])g.strokePoints([{x:s.x+side*25,y:s.y+18},{x:s.x+side*29,y:s.y+25},{x:s.x+side*20,y:s.y+28}],false);
   if(!s.reduced){let count=0;for(const b of s.bullets){if(!b.active||b.hostile||b.kind!=='round'||count++>=(s.wide?5:12))continue;const a=Math.atan2(b.vy,b.vx);g.lineStyle(s.wide?2.5:2,color,.65);g.lineBetween(b.x,b.y,b.x-Math.cos(a)*11,b.y-Math.sin(a)*11);}}
  }
  if(s.beacon&&!s.gadgetsExternal){const b=s.beacon;g.lineStyle(1.5,color,.25);g.strokeCircle(b.x,b.y,T.beacon.radius);g.fillStyle(0x20313d,1);g.fillRoundedRect(b.x-12,b.y-16,24,28,5);g.lineStyle(2,color,.9);g.strokeRoundedRect(b.x-12,b.y-16,24,28,5);this.emblem(b.x,b.y-3,8,1);g.fillStyle(accent,.9);g.fillRect(b.x-7,b.y+8,14*Math.max(0,1-b.redirects/T.beacon.maxRedirects),2);}
  if(s.charge&&!s.gadgetsExternal){const c=s.charge,lift=s.reduced?0:c.flight>0?Math.sin((1-c.flight/T.breach.flight)*Math.PI)*25:0;g.lineStyle(1.5,color,.45);g.strokeCircle(c.target.x,c.target.y,T.breach.radius);g.fillStyle(0x263542,1);g.fillRoundedRect(c.x-9,c.y-9-lift,18,18,4);g.lineStyle(2,color,1);g.strokeRoundedRect(c.x-9,c.y-9-lift,18,18,4);this.emblem(c.x,c.y-lift,5,.9);g.lineStyle(2,accent,.9);g.beginPath();g.arc(c.x,c.y-lift,14,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(0,c.fuse/T.breach.fuse));g.strokePath();}
  for(const e of this.timeline.events){if(s.gadgetsExternal&&['blast','deploy','throw','redirect'].includes(e.kind))continue;const u=Math.min(1,e.age/.48),fade=1-u;
   if(e.kind==='counter'||e.kind==='draw'){const radius=e.kind==='counter'?210:T.draw.range,span=e.kind==='counter'?Math.PI*2:T.draw.arc;this.crescent(e.x,e.y,s.reduced?radius:radius*(.5+u*.5),e.angle,span,fade,quiet);if(!s.reduced)for(let i=0;i<(s.wide?2:4);i++){const a=e.angle+(i/3-.5)*span,r=radius*(.5+u*.4);this.emblem(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,7*(1-u*.5),fade);}}
   else if(e.kind==='blast'){const r=s.reduced?T.breach.radius:T.breach.radius*(.3+Math.min(1,u*2)*.7);g.lineStyle(quiet?5:7,color,fade*.8);g.strokeCircle(e.x,e.y,r);if(!s.reduced)for(let i=0;i<(s.wide?3:6);i++){const a=i*Math.PI/3,d=20+u*50;g.fillStyle(accent,fade*.2);g.fillEllipse(e.x+Math.cos(a)*d,e.y+Math.sin(a)*d,18+u*16,12+u*10);this.emblem(e.x+Math.cos(a)*d,e.y+Math.sin(a)*d,5,fade);}}
   else if(e.kind==='shot'){const f=1-e.age/.12,dx=Math.cos(e.angle),dy=Math.sin(e.angle),r=quiet?8:12;g.fillStyle(accent,f*.9);g.fillPoints([{x:e.x-dy*4,y:e.y+dx*4},{x:e.x+dx*r,y:e.y+dy*r},{x:e.x+dy*4,y:e.y-dx*4},{x:e.x-dx*3,y:e.y-dy*3}],true);if(!quiet)this.emblem(e.x,e.y,5,f*.8);}
   else if(e.kind==='finish'){g.lineStyle(3,accent,fade);const d=s.reduced?18:12+u*20;g.lineBetween(e.x-d,e.y-d,e.x+d,e.y+d);g.lineBetween(e.x+d,e.y-d,e.x-d,e.y+d);this.emblem(e.x,e.y-24,12,fade);}
   else if(e.kind==='redirect'){g.lineStyle(3,accent,(1-e.age/.22)*.9);g.strokePoints([{x:e.x-9,y:e.y+5},{x:e.x,y:e.y-5},{x:e.x+8,y:e.y}],false);}
   else if(e.kind==='reload'){g.lineStyle(3,color,fade*.8);g.strokePoints([{x:e.x-15,y:e.y+13},{x:e.x,y:e.y+20},{x:e.x+15,y:e.y+13}],false);}
   else if(!s.reduced){g.lineStyle(2,color,fade*.6);g.strokeEllipse(e.x,e.y+13,25+u*25,10+u*8);this.emblem(e.x,e.y-12-u*12,7,fade);}
  }
 }
}
