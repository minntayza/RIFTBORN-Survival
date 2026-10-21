import Phaser from 'phaser';
import {COSMETIC_FX_LIMIT,type CosmeticEffectProfile as Profile} from './cosmetic-effect-profiles';
type Spark={x:number;y:number;vx:number;vy:number;born:number;life:number;size:number;spin:number;profile:Profile;kind:'glyph'|'glint'};
type Sweep={x:number;y:number;angle:number;radius:number;span:number;born:number;life:number;profile:Profile;ring:boolean};
/** Decorative only: no combat callbacks, damage, targeting, sounds or gameplay RNG. */
export class CosmeticWeaponEffects{
 private g:Phaser.GameObjects.Graphics;private sparks:Spark[]=[];private sweeps:Sweep[]=[];private impactAt=-1;private serial=0;
 get activeCount(){return this.sparks.length+this.sweeps.length;}
 constructor(scene:Phaser.Scene){this.g=scene.add.graphics().setDepth(5);}
 emit(p:Profile,x:number,y:number,angle:number,time:number,count:number,speed=40){for(let i=0;i<count;i++){
  const phase=(++this.serial*2.399963)+(i*.7),a=angle+Math.sin(phase)*1.6;
  if(this.sparks.length>=COSMETIC_FX_LIMIT-10)this.sparks.shift();
  this.sparks.push({x,y,vx:Math.cos(a)*speed*(.5+.5*Math.abs(Math.sin(phase))),vy:Math.sin(a)*speed-15,born:time,life:.42+(i%3)*.12,size:4+(i%3)*1.4,spin:phase,profile:p,kind:i%3===2?'glint':'glyph'});
 }}
 muzzle(p:Profile|undefined,x:number,y:number,angle:number,time:number){if(p)this.emit(p,x,y,angle,time,3,48);}
 strike(p:Profile|undefined,x:number,y:number,angle:number,range:number,span:number,time:number,ring=false){if(!p)return;if(this.sweeps.length>=10)this.sweeps.shift();this.sweeps.push({x,y,angle,radius:range*.78,span:Math.min(2.5,Math.max(.9,span)),born:time,life:.3,profile:p,ring});
  for(let i=0;i<5;i++){const a=angle+(i/4-.5)*Math.min(span,2.5);this.emit(p,x+Math.cos(a)*range*.72,y+Math.sin(a)*range*.72,a,time,1,26);}
 }
 impact(p:Profile|undefined,x:number,y:number,time:number,critical=false){if(!p||time-this.impactAt<.045)return;this.impactAt=time;this.emit(p,x,y,-Math.PI/2,time,critical?6:4,critical?64:42);}
 glyph(p:Profile,x:number,y:number,r:number,angle:number,alpha:number,glint=false){const g=this.g,c=Math.cos(angle),s=Math.sin(angle),point=(px:number,py:number)=>({x:x+(px*c-py*s)*r,y:y+(px*s+py*c)*r}),line=(a:number,b:number,d:number,e:number)=>{const u=point(a,b),v=point(d,e);g.lineBetween(u.x,u.y,v.x,v.y);},poly=(pts:number[][])=>{g.fillPoints(pts.map(([a,b])=>point(a,b)),true);};
  g.fillStyle(p.color,alpha);g.lineStyle(1.3,p.accent,alpha);
  if(glint){line(-.8,0,.8,0);line(0,-.8,0,.8);return;}
  switch(p.motif){
   case 'petal':g.fillEllipse(x,y,r*1.2,r*2);g.fillStyle(p.accent,alpha);g.fillCircle(x-r*.18,y+r*.4,r*.18);break;
   case 'fox':poly([[-1,-1],[-.35,-.65],[.35,-.65],[1,-1],[.7,.4],[0,1],[-.7,.4]]);g.fillStyle(0x65452c,alpha);g.fillCircle(x-r*.3,y,r*.12);g.fillCircle(x+r*.3,y,r*.12);break;
   case 'moon':g.beginPath();g.arc(x,y,r,-1.2,1.9);g.strokePath();g.fillStyle(p.accent,alpha);g.fillCircle(x+r*.8,y-r*.7,r*.2);break;
   case 'leaf':poly([[0,-1],[.8,-.1],[0,1],[-.65,.1]]);line(0,-.7,0,.7);break;
   case 'chevron':line(-1,-.8,0,0);line(0,0,-1,.8);line(0,-.8,1,0);line(1,0,0,.8);break;
   case 'chip':g.strokeRect(x-r*.7,y-r*.7,r*1.4,r*1.4);line(-1.2,-.3,-.7,-.3);line(.7,.3,1.2,.3);g.fillCircle(x,y,r*.25);break;
   case 'coin':g.fillCircle(x,y,r);g.lineStyle(1,p.accent,alpha);g.strokeCircle(x,y,r*.7);line(0,-.5,0,.5);break;
   case 'note':g.fillCircle(x-r*.3,y+r*.5,r*.45);line(0,.5,0,-1);line(0,-1,.8,-.5);break;
   case 'planet':g.fillCircle(x,y,r*.65);g.strokeEllipse(x,y,r*2.3,r*.8);g.fillStyle(p.accent,alpha);g.fillCircle(x-r*.3,y-r*.3,r*.16);break;
   case 'crown':poly([[-1,-.6],[-.5,0],[0,-1],[.5,0],[1,-.6],[.8,.7],[-.8,.7]]);g.fillStyle(p.accent,alpha);g.fillCircle(x,y+r*.25,r*.17);break;
   case 'rune':line(0,-1,0,1);line(0,-1,.8,-.4);line(.8,-.4,0,.1);line(0,.1,-.7,-.5);g.fillStyle(p.accent,alpha);g.fillCircle(x,y+r,r*.18);break;
   case 'snow':for(let i=0;i<3;i++){const a=i*Math.PI/3,u=point(Math.cos(a),Math.sin(a)),v=point(-Math.cos(a),-Math.sin(a));g.lineBetween(u.x,u.y,v.x,v.y);}g.fillStyle(p.accent,alpha);g.fillCircle(x,y,r*.23);break;
  }
 }
 render(time:number,bullets:readonly {active:boolean;hostile:boolean;x:number;y:number;vx:number;vy:number}[],p:Profile|undefined){const g=this.g;g.clear();this.sparks=this.sparks.filter(s=>time-s.born<s.life);this.sweeps=this.sweeps.filter(s=>time-s.born<s.life);
  for(const s of this.sweeps){const t=(time-s.born)/s.life,a=(1-t)*.55;g.lineStyle(8,s.profile.color,a*.15);g.beginPath();g.arc(s.x,s.y,s.radius*(.9+t*.16),s.angle-s.span/2,s.angle+s.span/2);g.strokePath();g.lineStyle(2,s.profile.accent,a);g.beginPath();g.arc(s.x,s.y,s.radius*(.9+t*.16),s.angle-s.span/2,s.angle+s.span/2);g.strokePath();if(s.ring){g.lineStyle(1.5,s.profile.color,a*.5);g.strokeCircle(s.x,s.y,s.radius*(.7+t*.4));}}
  for(const s of this.sparks){const age=time-s.born,t=age/s.life;this.glyph(s.profile,s.x+s.vx*age,s.y+s.vy*age-12*age*age,s.size*(1-t*.5),s.spin+age*1.6,(1-t)*.9,s.kind==='glint');}
  if(p){let n=0;for(const b of bullets){if(!b.active||b.hostile||n++>=40)continue;const length=Math.hypot(b.vx,b.vy)||1,dx=b.vx/length,dy=b.vy/length;g.lineStyle(3,p.color,.23);g.lineBetween(b.x,b.y,b.x-dx*15,b.y-dy*15);g.lineStyle(1,p.accent,.8);g.lineBetween(b.x,b.y,b.x-dx*9,b.y-dy*9);if(n%4===0)this.glyph(p,b.x-dx*18,b.y-dy*18,3,time+n,.65);}}
 }
}
