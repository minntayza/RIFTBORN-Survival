import {drawGunnerGadget,GUNNER_THEMES,type GunnerTheme} from './gunner-gadgets';
import type Phaser from 'phaser';
import {ABILITY_TUNING as T} from './config';
type Point={x:number;y:number};
type Event=Point&{kind:'deploy'|'throw'|'redirect'|'blast';angle:number;age:number};
type State={beacon?:Point&{life:number;redirects:number};charge?:Point&{flight:number;fuse:number;target:Point};wide:boolean;reduced:boolean};
/** Original Gunner's little gadgets. Decorations observe real events, never affect combat. */
export class GunnerActiveEffects{
 private g:Phaser.GameObjects.Graphics;private events:Event[]=[];private clock=0;
 constructor(scene:Phaser.Scene,readonly theme?:GunnerTheme){this.g=scene.add.graphics().setDepth(4.35);}
 event(kind:Event['kind'],p:Point,angle=0){this.events.push({...p,kind,angle,age:0});if(this.events.length>24)this.events.shift();}
 tick(dt:number){this.clock+=dt;this.events=this.events.filter(e=>(e.age+=Math.max(0,dt))<(e.kind==='blast'?.65:.38));}
 clear(){this.events=[];this.clock=0;this.g.clear();}
 destroy(){this.clear();this.g.destroy();}
 render(s:State){const g=this.g,quiet=s.wide||s.reduced,dark=0x172b38,palette=this.theme?GUNNER_THEMES[this.theme]:undefined,teal=palette?.primary??0x6ce4d4,gold=palette?.accent??0xffd780,cream=palette?.light??0xfff6d9;g.clear();
 const star=(x:number,y:number,r:number,c:number,a=1)=>{g.fillStyle(c,a);g.fillPoints([{x,y:y-r},{x:x+r*.3,y:y-r*.3},{x:x+r,y},{x:x+r*.3,y:y+r*.3},{x,y:y+r},{x:x-r*.3,y:y+r*.3},{x:x-r,y},{x:x-r*.3,y:y-r*.3}],true);};
 const ring=(x:number,y:number,r:number,c:number,a:number,w=2)=>{g.lineStyle(w,c,a);g.strokeEllipse(x,y,r*2,r*.65);};
 if(s.beacon){const b=s.beacon,age=T.beacon.duration-b.life,deploy=Math.max(0,1-age/.3),reaction=this.events.find(e=>e.kind==='redirect'&&e.age<.25),react=quiet?0:reaction?Math.sin(reaction.age/.25*Math.PI)*4:0,bob=quiet?0:Math.sin(this.clock*4)*1.6+react,lift=deploy*(quiet?0:9),y=b.y-bob-lift-(this.theme==='starlight'?12:0);
  // Dashed ground footprint communicates the actual redirect radius without an opaque field.
  g.lineStyle(1,teal,.2);for(let i=0;i<(quiet?8:12);i++){const a=i*Math.PI*2/(quiet?8:12);g.beginPath();g.arc(b.x,b.y,T.beacon.radius,a,a+.08);g.strokePath();}
  g.fillStyle(dark,.3);g.fillEllipse(b.x,b.y+12,35,10);ring(b.x,b.y+10,19,teal,.55);
  if(this.theme){
   g.fillStyle(0x081720,.5);g.fillEllipse(b.x,b.y+24,49,14);if(this.theme==='jade'){g.fillStyle(0x233c45,1);g.fillRoundedRect(b.x-31,b.y+17,62,7,3);if(!quiet)for(let i=0;i<5;i++){const h=3+Math.abs(Math.sin(this.clock*5+i))*5;g.fillStyle(i%2?gold:teal,.7);g.fillRect(b.x-15+i*7,b.y+24-h,4,h);}}else{g.fillStyle(palette!.body,1);g.fillEllipse(b.x,b.y+19,42,13);g.lineStyle(2,gold,.85);g.strokeEllipse(b.x,b.y+17,42,12);}
   if(!quiet){g.fillStyle(teal,.09);g.fillTriangle(b.x-14,b.y+16,b.x+14,b.y+16,b.x,y-18);}
   drawGunnerGadget(g,'beacon',this.theme,b.x,y-4,.82,this.theme==='starlight'&&!quiet?Math.sin(this.clock*3)*.045:0);
   if(this.theme==='starlight'){for(const side of [-1,1]){g.fillStyle(gold,.45);g.fillTriangle(b.x+side*25-3,y+17,b.x+side*25+3,y+17,b.x+side*25,y+28+(quiet?0:Math.sin(this.clock*9)*3));}g.lineStyle(1.5,teal,.65);g.strokeEllipse(b.x,y-5,66,23);}
   if(!quiet){star(b.x-23,y-18,3,cream,.8);if(react>0){star(b.x+27,y-13,5,gold,react/4);star(b.x-28,y+2,4,cream,react/4);}}
  }else{g.fillStyle(dark,1);g.fillRoundedRect(b.x-16,y-18,32,31,10);g.lineStyle(2,gold,1);g.strokeRoundedRect(b.x-16,y-18,32,31,10);
  g.fillStyle(0x294b58,1);g.fillRoundedRect(b.x-12,y-14,24,21,7);g.lineStyle(2,teal,1);g.lineBetween(b.x,y-19,b.x,y-26);star(b.x,y-29,5,gold);
  for(const side of [-1,1]){g.fillStyle(teal,1);g.fillEllipse(b.x+side*6,y-6,4,6);g.fillStyle(cream,1);g.fillCircle(b.x+side*6-1,y-8,1);g.fillStyle(0xf2b09b,.65);g.fillEllipse(b.x+side*10,y+1,4,2);}
  g.lineStyle(1.5,cream,1);g.beginPath();g.arc(b.x,y,3,.2,Math.PI-.2);g.strokePath();
  }const remaining=1-b.redirects/T.beacon.maxRedirects;g.lineStyle(2,teal,.8);g.lineBetween(b.x-12,this.theme?b.y+18:y+9,b.x-12+24*remaining,this.theme?b.y+18:y+9);
  if(!quiet)for(const side of [-1,1]){g.lineStyle(2,teal,.5);g.beginPath();g.arc(b.x,y-7,22+Math.sin(this.clock*4)*2,side===1?-.45:Math.PI-.45,side===1?.45:Math.PI+.45);g.strokePath();}
 }
 if(s.charge){const c=s.charge,p=1-c.flight/T.breach.flight,flight=c.flight>0,lift=flight?Math.sin(p*Math.PI)*(quiet?13:31):0,x=c.x,y=c.y-lift;
  g.fillStyle(dark,.25);g.fillEllipse(c.x,c.y+8,22,7);
  // Landing footprint follows the damage center and radius; no misleading extra range.
  if(!flight){g.lineStyle(1.5,gold,.45);g.beginPath();g.arc(c.target.x,c.target.y,T.breach.radius,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-c.fuse/T.breach.fuse));g.strokePath();}
  const a=flight&&!quiet?p*Math.PI*2:0,ca=Math.cos(a),sa=Math.sin(a),point=(px:number,py:number)=>({x:x+px*ca-py*sa,y:y+px*sa+py*ca});
  const poly=(coords:number[][],color:number,width=1.5)=>{const pts=coords.map(([px,py])=>point(px,py));g.fillStyle(color,1);g.fillPoints(pts,true);g.lineStyle(width,0x202337,1);g.strokePoints(pts,true);};
  if(this.theme){const land=flight||quiet?0:Math.max(0,1-(T.breach.fuse-c.fuse)/.16),hop=land*5;
   g.fillStyle(0x071721,.4);g.fillEllipse(c.x,c.y+15,34,10);const hover=this.theme==='starlight'&&!flight?7+(quiet?0:Math.sin(this.clock*6)*1.5):0;drawGunnerGadget(g,'breach',this.theme,x,y-hop-hover,.68,a);
   if(this.theme==='jade'&&!flight){g.fillStyle(teal,.3);g.fillEllipse(x-10,c.y+15,16,6);g.fillStyle(gold,.3);g.fillCircle(x+10,c.y+13,3);}
   if(this.theme==='starlight'){g.lineStyle(2,gold,.65);g.strokeEllipse(x,y-hover,40,13);if(!quiet)star(x+23,y-hover-4,3,cream,.8);}
   if(!quiet){star(x-21,y-16,3,cream,.8);if(flight){g.lineStyle(2,teal,.55);g.lineBetween(x-22,y+10,x-33,y+16);g.lineStyle(2,gold,.45);g.lineBetween(x-17,y+20,x-26,y+24);}}
  }else{
  // Chunky pineapple shell, separate lever and bright pull ring, readable during rotation.
  poly([[-7,-8],[6,-8],[12,0],[12,10],[7,17],[-5,18],[-12,11],[-13,1]],0x37482e,2);
  for(let row=0;row<3;row++)for(let col=0;col<2;col++){const px=-10+col*11,py=-5+row*7;poly([[px,py],[px+8,py-1],[px+9,py+5],[px+1,py+6]],col?0x657b43:0x829553,1.3);}
  poly([[-6,-9],[-7,-16],[5,-17],[8,-9]],0x424943);
  poly([[-10,-16],[-10,-20],[6,-21],[11,-16],[15,10],[12,12],[6,-13]],0x525950,1.8);
  const ringCenter=point(6,-12);g.lineStyle(4,0x202337,1);g.strokeCircle(ringCenter.x,ringCenter.y,7);g.lineStyle(2,0xe8edf0,1);g.strokeCircle(ringCenter.x,ringCenter.y,7);
  }if(!flight){const tip=point(-10,-19);star(tip.x,tip.y,quiet?3:3+Math.sin(this.clock*16),gold);if(!quiet){star(x-17,y-18,2,cream,.7);star(x+16,y-11,2,gold,.8);}}

 }
 for(const e of this.events){const duration=e.kind==='blast'?.65:.38,p=Math.min(1,e.age/duration),f=1-p;
  if(e.kind==='blast'){
   const r=T.breach.radius*(s.reduced?.8:.2+p*.8);g.lineStyle(quiet?3:5,gold,f*.85);g.strokeCircle(e.x,e.y,r);g.lineStyle(2,cream,f*.7);g.strokeCircle(e.x,e.y,r*.87);
   if(this.theme){const pts=Array.from({length:20},(_,i)=>{const a=i*Math.PI/10,d=r*(i%2?.72:1);return{x:e.x+Math.cos(a)*d,y:e.y+Math.sin(a)*d};});g.lineStyle(quiet?2:3,teal,f*.65);g.strokePoints(pts,true);if(!quiet&&p<.5){const spokes=6;for(let i=0;i<spokes;i++){const a=i*Math.PI*2/spokes,d=r*.55;g.lineStyle(3,cream,f*.75);g.lineBetween(e.x+Math.cos(a)*d,e.y+Math.sin(a)*d,e.x+Math.cos(a)*(d+12),e.y+Math.sin(a)*(d+12));}}}
   // Short scalloped cartoon puff; its center opens quickly so targets remain readable.
   for(let i=0;i<(quiet?4:8);i++){const a=i*Math.PI*2/(quiet?4:8),d=quiet?r*.65:r*.45+p*20;g.fillStyle(this.theme?(i%2?teal:gold):i%2?0xffcf85:0xf5e6bb,f*.28);g.fillCircle(e.x+Math.cos(a)*d,e.y+Math.sin(a)*d,(quiet?8:17)*(1-p));const x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;if(this.theme==='jade'){g.fillStyle(i%2?gold:teal,f*.45);g.fillEllipse(x,y,(quiet?6:14)*(1-p*.5),(quiet?4:8)*(1-p*.5));}else star(x,y,(quiet?4:9)*(1-p*.6),i%2?cream:gold,f);}
   if(this.theme==='starlight'&&!quiet){g.lineStyle(3,teal,f*.8);g.beginPath();g.arc(e.x,e.y,r*.55,.2,Math.PI*1.4);g.strokePath();}if(p<.3)star(e.x,e.y,21*(1-p/.3),cream,f*.8);
  }else if(e.kind==='redirect'){
   if(this.theme==='sakura'){g.lineStyle(3,gold,f);g.beginPath();g.arc(e.x,e.y,8+p*8,.1,Math.PI-.1);g.strokePath();}else if(this.theme==='jade'){g.lineStyle(3,gold,f);g.strokePoints([{x:e.x-10,y:e.y+6},{x:e.x,y:e.y-6},{x:e.x+8,y:e.y+3}],false);}else star(e.x,e.y,5+Math.sin(p*Math.PI)*7,cream,f);g.lineStyle(quiet?2:3,teal,f);const d=quiet?16:13+p*24,dx=Math.cos(e.angle),dy=Math.sin(e.angle);g.lineBetween(e.x,e.y,e.x+dx*d,e.y+dy*d);g.lineBetween(e.x+dx*d,e.y+dy*d,e.x+Math.cos(e.angle+2.5)*(d*.3)+dx*d,e.y+Math.sin(e.angle+2.5)*(d*.3)+dy*d);g.lineBetween(e.x+dx*d,e.y+dy*d,e.x+Math.cos(e.angle-2.5)*(d*.3)+dx*d,e.y+Math.sin(e.angle-2.5)*(d*.3)+dy*d);
  }else{ring(e.x,e.y,12+(s.reduced?0:p*22),e.kind==='deploy'?teal:gold,f);if(!quiet)for(let i=0;i<3;i++){const a=i*Math.PI*2/3;star(e.x+Math.cos(a)*(15+p*15),e.y+Math.sin(a)*(15+p*15),4,cream,f);}}
 }
 }
}
