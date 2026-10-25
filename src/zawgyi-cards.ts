import {drawFlameLotus} from './lotus-flame-art';
import type {ArenaScene} from './combat';
import type {ZawgyiSkill} from './zawgyi';
type Point={x:number;y:number};
/** Level-up mechanics only. All delayed effects use scene time and fixed budgets. */
export class ZawgyiCards{
 elixir=0;rhythm=0;ready=false;empoweredHits=0;private lastSkill?:ZawgyiSkill;
 readonly lotuses:(Point&{life:number;tick:number;level:number})[]=[];
 readonly aftershocks:(Point&{delay:number;level:number})[]=[];
 private flashes:(Point&{age:number;kind:'heal'|'shock'|'star'|'sun';aim?:number})[]=[];
 private ground;private front;
 constructor(private s:ArenaScene){this.ground=s.add.graphics().setDepth(1.1);this.front=s.add.graphics().setDepth(4.6);}
 level(id:string){return Math.max(0,Math.min(3,this.s.levels?.[id]||0));}
 get twinBonus(){const n=this.level('twindatlone');return n ? .15+n*.15 : 0;}
 cast(id:ZawgyiSkill){if(!this.level('celestial'))return;if(!this.ready){this.rhythm=this.lastSkill&&this.lastSkill!==id?2:1;if(this.rhythm===2){this.ready=true;this.empoweredHits=this.s.cardEvolutions?.celestial?2:1;this.s.audio.play('ricochet-chime');}}this.lastSkill=id;}
 staffBonus(contact:Point=this.s){if(!this.ready||!this.level('celestial'))return 0;
  this.empoweredHits=Math.max(0,(this.empoweredHits||1)-1);this.ready=this.empoweredHits>0;
  if(!this.ready){this.rhythm=0;this.lastSkill=undefined;}
  this.flash(this.s.cardEvolutions?.celestial?'sun':'star',this.s.cardEvolutions?.celestial?contact:this.s);return .2+this.level('celestial')*.2;
 }
 collectXp(amount:number){const n=this.level('elixir');if(!n||amount<=0)return;this.elixir=Math.min(30,this.elixir+amount);if(this.elixir<30||this.s.hp>=this.s.maxHp)return;this.elixir=0;this.s.heal(this.s.maxHp*(.02+n*.01));this.flash('heal',this.s);this.s.audio.play('reload-pop');}
 lotus(p:Point){const level=this.level('lotusflame');if(!level)return;this.lotuses.push({x:p.x,y:p.y,life:2.2,tick:0,level});if(this.lotuses.length>4)this.lotuses.shift();}
 aftershock(p:Point){const level=this.level('earthshaker');if(!level)return;this.aftershocks.push({x:p.x,y:p.y,delay:.28,level});if(this.aftershocks.length>3)this.aftershocks.shift();}
 private flash(kind:'heal'|'shock'|'star'|'sun',p:Point){this.flashes.push({x:p.x,y:p.y,kind,age:0,aim:this.s.angle});if(this.flashes.length>12)this.flashes.shift();}
 update(dt:number){if(this.s.ended){this.clear();return;}if(this.s.paused)return;dt=Math.max(0,dt);this.flashes=this.flashes.filter(e=>(e.age+=dt)<.55);
  for(let i=this.lotuses.length-1;i>=0;i--){const p=this.lotuses[i],active=Math.min(dt,p.life);p.tick+=active;p.life-=dt;while(p.tick>=.25){p.tick-=.25;for(const e of [...this.s.enemies])if(e.active&&Math.hypot(e.x-p.x,e.y-p.y)<=55+e.r)this.s.hit(e,(8+p.level*8)*.25,0,false,true,'Lotus Flame');}if(p.life<=0)this.lotuses.splice(i,1);}
  for(let i=this.aftershocks.length-1;i>=0;i--){const p=this.aftershocks[i];p.delay-=dt;if(p.delay>0)continue;this.aftershocks.splice(i,1);for(const e of [...this.s.enemies])if(e.active&&Math.hypot(e.x-p.x,e.y-p.y)<=120+e.r)this.s.hit(e,95*(.15+p.level*.15),15,false,false,'Earthshaker Staff');this.flash('shock',p);this.s.audio.play('tank-thump');}
 }
 render(time:number,quiet:boolean){const s=this.s,g=this.front,f=this.ground;g.clear();f.clear();if(s.ended)return;
  const star=(x:number,y:number,r:number,color:number,a=1)=>{g.fillStyle(color,a);g.fillPoints([{x,y:y-r},{x:x+r*.3,y:y-r*.3},{x:x+r,y},{x:x+r*.3,y:y+r*.3},{x,y:y+r},{x:x-r*.3,y:y+r*.3},{x:x-r,y},{x:x-r*.3,y:y-r*.3}],true);};
  const arc=(x:number,y:number,r:number,start:number,end:number,color:number,alpha:number,width=5)=>{g.lineStyle(width,color,alpha*.22);g.beginPath();g.arc(x,y,r,start,end);g.strokePath();g.lineStyle(Math.max(1,width*.38),0xfff0bc,alpha);g.beginPath();g.arc(x,y,r,start+.04,end-.04);g.strokePath();};
  for(const p of this.lotuses){const alpha=Math.min(1,p.life/.4),age=2.2-p.life;
   f.fillStyle(s.cardEvolutions?.lotusflame?0x65d9ff:0xffa057,alpha*.1);f.fillCircle(p.x,p.y,55);
   drawFlameLotus(f,p.x,p.y+8,29,alpha,age,quiet,!!s.cardEvolutions?.lotusflame);
   if(!quiet)for(let i=0;i<3;i++){const a=i*2.1+time*.4;star(p.x+Math.cos(a)*36,p.y+Math.sin(a)*20-8,2.5,0xffe8a2,alpha*.7);}
  }
  if(this.level('elixir')){const x=s.x-27,y=s.y+5;g.fillStyle(0x243d3e,.95);g.fillRoundedRect(x-6,y-6,12,17,4);g.lineStyle(1.5,0xc4efcf,1);g.strokeRoundedRect(x-6,y-6,12,17,4);const fill=11*this.elixir/30;g.fillStyle(0x64d6aa,1);g.fillRoundedRect(x-4,y+9-fill,8,fill,2);g.fillStyle(0xffcc7b,1);g.fillRect(x-4,y-9,8,4);g.fillStyle(0xe1ffe9,.85);g.fillRect(x-3,y-3,2,6);g.fillStyle(0x245d51,1);g.fillRect(x-2.5,y-2.5,5,10);g.fillRect(x-5,y,10,5);g.fillStyle(0xfff4ce,1);g.fillRect(x-1,y-1,2,7);g.fillRect(x-3.5,y+1.5,7,2);if(this.elixir>=30)star(x+10,y-8,3,0xd9ffd3);}
  if(this.level('celestial')){for(let i=0;i<2;i++){const charged=this.ready?(this.s.cardEvolutions?.celestial?i<this.empoweredHits:true):i<this.rhythm,x=s.x-9+i*18,y=s.y-43;star(x,y,charged?6:3,0x5c3c57,.9);star(x,y,charged?4.5:2,charged?0xffe39a:0x83918d,charged?1:.6);}if(this.ready){const a=quiet?-.8:time*1.8;arc(s.x,s.y-13,29,a,a+1.5,0xf2b568,.8,5);if(!quiet)star(s.x+Math.cos(a+1.5)*29,s.y-13+Math.sin(a+1.5)*29,3,0xffedaf);}}
  for(const e of this.flashes){const p=e.age/.55,a=1-p,ease=1-(1-p)**3;
   if(e.kind==='shock'){const r=120*(quiet?1:.2+ease*.8);f.lineStyle(10,0xefac62,a*.22);f.strokeCircle(e.x,e.y,r);f.lineStyle(3,0xffecb7,a);f.strokeCircle(e.x,e.y,r);f.lineStyle(2,0xe3947c,a*.7);f.strokeCircle(e.x,e.y,r*.83);for(let i=0;i<(quiet?4:8);i++){const angle=i*Math.PI/4,x=e.x+Math.cos(angle)*r*.75,y=e.y+Math.sin(angle)*r*.75-(quiet?0:Math.sin(p*Math.PI)*17),size=4+a*3;g.fillStyle(i%2?0xc29978:0xf1c68a,a);g.fillPoints([{x:x-size,y},{x:x-2,y:y-size},{x:x+size,y:y-2},{x:x+2,y:y+size}],true);star(e.x+Math.cos(angle)*r,e.y+Math.sin(angle)*r,4*a,0xffe3a0,a);}star(e.x,e.y-7,18*a,0xffebaa,a);}
   else if(e.kind==='heal'){f.lineStyle(3,0x8be7b2,a*.75);f.strokeEllipse(e.x,e.y+14,30+ease*35,11+ease*12);for(let i=0;i<(quiet?2:5);i++){const x=e.x+(i-2)*11,y=e.y-10-(quiet?0:ease*32)-Math.sin(i*2)*6;g.fillStyle(0x2f826f,a);g.fillRoundedRect(x-4,y-8,8,16,2);g.fillRoundedRect(x-8,y-4,16,8,2);g.fillStyle(0xc8ffd3,a);g.fillRect(x-2,y-6,4,12);g.fillRect(x-6,y-2,12,4);if(!quiet)star(x+7,y-8,3*a,0xffedac,a);}}
   else if(e.kind==='sun'){const aim=e.aim||0;arc(e.x,e.y,16+ease*20,aim-1.3,aim+1.3,0xe93c38,a,12);g.lineStyle(2.5,0xffcc43,a);g.strokeCircle(e.x,e.y,5+ease*7);g.fillStyle(0xe73538,a);g.fillCircle(e.x,e.y,4*a);for(let i=0;i<8;i++){const angle=i*Math.PI/4,r=10+ease*7;g.lineStyle(2,0xffd85c,a);g.lineBetween(e.x+Math.cos(angle)*r,e.y+Math.sin(angle)*r,e.x+Math.cos(angle)*(r+4*a),e.y+Math.sin(angle)*(r+4*a));}if(!quiet)for(let i=0;i<4;i++){const angle=aim+(i-1.5)*.55,r=20+ease*25;star(e.x+Math.cos(angle)*r,e.y+Math.sin(angle)*r,3*a,i%2?0xf3513e:0xffdb63,a);}}
   else{const aim=s.angle,x=e.x+Math.cos(aim)*25,y=e.y+Math.sin(aim)*25;arc(e.x,e.y,30+ease*21,aim-1.1,aim+1.1,0xf7ae65,a,13);star(x,y,19*a,0xffefb3,a);for(let i=0;i<(quiet?2:6);i++){const angle=aim+(i-2.5)*.33,r=25+ease*42;star(e.x+Math.cos(angle)*r,e.y+Math.sin(angle)*r,4*a, i%2?0xffc38d:0xffedb5,a);}}
  }
 }
 clear(){this.lotuses.length=this.aftershocks.length=this.flashes.length=0;this.elixir=this.rhythm=0;this.ready=false;this.empoweredHits=0;this.lastSkill=undefined;this.ground.clear();this.front.clear();}
 destroy(){this.clear();this.ground.destroy();this.front.destroy();}
}
