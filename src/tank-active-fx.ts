import type Phaser from 'phaser';
import {ABILITY_TUNING as T} from './config';
import {TANK_EVENT_LIFE,TANK_PALETTES,tankChargeSegments,tankSecondaryCount,type TankTheme,type TankActiveTimeline,type TankVisualEvent} from './tank-active-motion';
type State={x:number;y:number;angle:number;theme:TankTheme;energy:number;bulwark:boolean;march:boolean;wide:boolean;reduced:boolean};
/** Bounded, flat cartoon shapes. Ground decorations sit below actors; warnings remain above both layers. */
export class TankActiveEffects{
 private ground:Phaser.GameObjects.Graphics;private front:Phaser.GameObjects.Graphics;private disposed=false;
 constructor(scene:Phaser.Scene){this.ground=scene.add.graphics().setDepth(1.8);this.front=scene.add.graphics().setDepth(3.45);}
 clear(){this.ground.clear();this.front.clear();}
 destroy(){if(this.disposed)return;this.clear();this.disposed=true;this.ground.destroy();this.front.destroy();}
 private crest(g:Phaser.GameObjects.Graphics,theme:TankTheme,x:number,y:number,color:number,alpha:number){
  g.lineStyle(2,color,alpha);
  if(theme==='royal'){
   const points=Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,r=i%2?8:11;return{x:x+Math.cos(a)*r,y:y+Math.sin(a)*r};});g.strokePoints(points,true);g.strokeCircle(x,y,5);g.fillStyle(color,alpha);g.fillTriangle(x-2,y,x+2,y,x,y+3);g.fillCircle(x-3,y-2,1);g.fillCircle(x+3,y-2,1);
  }else if(theme==='forge'){g.strokePoints([{x,y:y-9},{x:x+7,y},{x,y:y+7},{x:x-7,y},{x,y:y-9}],false);g.lineBetween(x-4,y+5,x+3,y+11);g.lineBetween(x+4,y+5,x-3,y+11);}
  else if(theme==='polar'){for(let i=0;i<6;i++){const a=i*Math.PI/3,dx=Math.cos(a),dy=Math.sin(a);g.lineBetween(x,y,x+dx*11,y+dy*11);g.lineBetween(x+dx*7,y+dy*7,x+dx*5-dy*3,y+dy*5+dx*3);}}
  else{g.strokePoints([{x:x-7,y:y-8},{x:x+7,y:y-8},{x:x+6,y:y+4},{x,y:y+10},{x:x-6,y:y+4}],true);}
 }
 /** Filled wave edge keeps its centre transparent and reads at gameplay scale. */
 private ring(g:Phaser.GameObjects.Graphics,x:number,y:number,r:number,color:number,ink:number,fade:number,width=7){
  const thickness=Math.min(r*.18,width*1.8),n=40;
  g.fillStyle(color,fade*.23);
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,point=(t:number,d:number)=>({x:x+Math.cos(t)*d,y:y+Math.sin(t)*d});g.fillPoints([point(a,r-thickness),point(a,r),point(b,r),point(b,r-thickness)],true);}
  g.lineStyle(width+3,ink,fade*.65);g.strokeCircle(x,y,r);g.lineStyle(width,color,fade*.9);g.strokeCircle(x,y,r);g.lineStyle(1.5,0xf0f6ef,fade*.6);g.strokeCircle(x,y,r+width*.35);
 }
 private shard(g:Phaser.GameObjects.Graphics,s:State,x:number,y:number,size:number,alpha:number){
  const p=TANK_PALETTES[s.theme],ice=s.theme==='polar',points=ice?[{x,y:y-size*1.5},{x:x+size*.7,y:y-size*.25},{x:x+size*.35,y:y+size*.65},{x:x-size*.65,y:y+size*.4}]:[{x:x-size,y},{x:x-size*.45,y:y-size},{x:x+size*.8,y:y-size*.6},{x:x+size,y:y+size*.45},{x:x-size*.25,y:y+size*.7}];
  g.fillStyle(p.fragment,alpha);g.lineStyle(2,p.ink,alpha);g.fillPoints(points,true);g.strokePoints(points,true);g.fillStyle(ice?p.accent:p.primary,alpha*.7);g.fillTriangle(points[0].x,points[0].y,points[1].x,points[1].y,x,y);g.lineStyle(1.5,p.accent,alpha*.8);g.lineBetween(points[1].x,points[1].y,points[2].x,points[2].y);
  if(s.theme==='forge'){g.lineStyle(2,p.primary,alpha);g.lineBetween(x-2,y+2,x+1,y-3);g.lineBetween(x+1,y-3,x+4,y);}
 }
 private plume(g:Phaser.GameObjects.Graphics,s:State,x:number,y:number,u:number,fade:number,size=1){
  const p=TANK_PALETTES[s.theme];g.fillStyle(s.theme==='polar'?0xd7effb:p.fragment,fade*.3);
  for(let i=0;i<3;i++){const side=i-1;g.fillEllipse(x+side*(8+u*12)*size,y-3-u*(i===1?13:6)*size,(15+u*15)*size,(8+u*6)*size);}
  g.lineStyle(2,p.accent,fade*.45);g.lineBetween(x-13*size,y+2,x-5*size,y+3);
 }
 private impact(e:TankVisualEvent,s:State){
  const g=this.ground,p=TANK_PALETTES[s.theme],life=TANK_EVENT_LIFE[e.kind],u=Math.min(1,e.age/life),fade=1-u;
  const compress=e.kind==='release'?.055:0,progress=s.reduced?1:Math.min(1,Math.max(0,e.age-compress)/.24),r=e.radius*(.28+.72*(1-Math.pow(1-progress,3)));
  if(e.kind!=='release'||e.age>=compress)this.ring(g,e.x,e.y,r,p.primary,p.ink,fade*.8,(s.wide?6.5:7.5)+Math.min(2,e.power/40));
  else{const q=1-e.age/compress,x=e.x+Math.cos(e.angle)*T.bulwark.radius,y=e.y+Math.sin(e.angle)*T.bulwark.radius;this.front.fillStyle(p.accent,q*.7);this.front.fillCircle(x,y,3+q*6);}
  // Short, branching ground fractures anchor the impact without masking actors.
  if(e.kind!=='release'&&!s.reduced){
   const branches=s.wide?3:6,reach=Math.min(e.radius*.52,74)*(1-Math.pow(1-Math.min(1,u*5),3));
   for(let i=0;i<branches;i++){const a=i*Math.PI*2/branches+.2,pt=(d:number,o=0)=>({x:e.x+Math.cos(a+o)*d,y:e.y+Math.sin(a+o)*d});
    const points=[pt(17),pt(reach*.56,.08),pt(reach,-.05)];g.lineStyle(4,p.ink,fade*.65);g.strokePoints(points,false);g.lineStyle(2.8,p.primary,fade*.8);g.strokePoints(points,false);
    if(!s.wide){const q=points[1],b=pt(reach*.83,.24);g.lineStyle(2,p.ink,fade*.6);g.lineBetween(q.x,q.y,b.x,b.y);}
   }
  }
  if(!s.reduced&&e.kind!=='release'){
   const n=s.wide?4:7;g.fillStyle(p.ink,fade*.5);
   for(let i=0;i<n;i++){const a=i/n*Math.PI*2+.12,near=28,far=(54+i%3*9)*(1+u*.3),q=(r:number,o:number)=>({x:e.x+Math.cos(a+o)*r,y:e.y+Math.sin(a+o)*r});const pts=[q(near,-.08),q(far,-.05),q(far+9,0),q(near,.07)];g.fillPoints(pts,true);g.lineStyle(2,p.primary,fade*.65);g.strokePoints(pts,false);}
  }
  // A compact contact star, not a screen flash. Reduced motion keeps a quiet marker.
  if(e.age<.1){const f=(1-e.age/.1)*(s.reduced?.22:.65),r=s.reduced?9:10+u*18;g.fillStyle(p.accent,f);g.fillTriangle(e.x-r,e.y,e.x+r,e.y,e.x,e.y-5);g.fillTriangle(e.x,e.y-r,e.x+4,e.y+7,e.x-4,e.y+7);}
  const count=tankSecondaryCount(s.wide,s.reduced,e.kind==='stomp'?4:6);
  for(let i=0;i<count;i++){
   const a=i*Math.PI*2/count+.35,d=30+u*(e.kind==='slam'?45:31),x=e.x+Math.cos(a)*d,y=e.y+24+Math.sin(a)*d*.45-Math.sin(Math.PI*u)*9,size=(i%2?4:6)*(1-u*.4);
   this.shard(g,s,x,y,size*1.55,fade*.95);
   if(s.theme==='forge'&&i<2){g.fillStyle(p.primary,fade*.7);g.fillRect(x-1,y-size-5,2,3);}else if(s.theme==='polar'){g.lineStyle(1,p.accent,fade);g.lineBetween(x,y-size,x+size*.4,y);}
  }
  if(!s.reduced){const dust=s.wide?2:4;for(let i=0;i<dust;i++){const a=i/dust*Math.PI*2+.4;this.plume(g,s,e.x+Math.cos(a)*(35+u*38),e.y+Math.sin(a)*(20+u*20)+20,u,fade,s.wide?.65:.85);}}
  if(e.kind==='slam'&&u<.48)this.crest(g,s.theme,e.x,e.y+26,p.accent,(1-u/.48)*.6);
 }
 render(timeline:TankActiveTimeline,s:State){
  if(this.disposed)return;this.clear();const p=TANK_PALETTES[s.theme],g=this.front;
  if(s.bulwark){
   const r=T.bulwark.radius,half=T.bulwark.halfAngle;
   // This arc has exactly the same direction, radius and half-angle as absorb().
   g.lineStyle(s.wide?6:5,p.primary,.18);g.beginPath();g.arc(s.x,s.y,r,s.angle-half,s.angle+half);g.strokePath();
   g.lineStyle(2,p.accent,.85);g.beginPath();g.arc(s.x,s.y,r,s.angle-half,s.angle+half);g.strokePath();
   for(const side of [-1,1]){const a=s.angle+side*half;g.lineBetween(s.x+Math.cos(a)*(r-6),s.y+Math.sin(a)*(r-6),s.x+Math.cos(a)*(r+1),s.y+Math.sin(a)*(r+1));}
   const point=(forward:number,side:number)=>({x:s.x+Math.cos(s.angle)*forward-Math.sin(s.angle)*side,y:s.y+Math.sin(s.angle)*forward+Math.cos(s.angle)*side});
   // Five translucent armored facets stay entirely inside the real frontal sector.
   const sector=(a:number,radius:number)=>({x:s.x+Math.cos(s.angle+a)*radius,y:s.y+Math.sin(s.angle+a)*radius});
   for(let i=0;i<5;i++){const a=-half+i*half*2/5+.025,b=a+half*2/5-.05,pts=[sector(a,59),sector(a,73),sector((a+b)/2,75),sector(b,73),sector(b,59)];g.fillStyle(p.primary,s.reduced?.14:.3);g.fillPoints(pts,true);g.lineStyle(s.wide?2.2:1.8,p.accent,.8);g.strokePoints(pts,true);g.fillStyle(p.accent,.1);g.fillPoints([sector(a,70),sector((a+b)/2,74),sector(b,70)],true);const c=(a+b)/2;if(s.theme==='polar'){g.fillStyle(p.accent,.65);g.fillPoints([sector(c-.07,65),sector(c,75),sector(c+.07,65)],true);}else if(s.theme==='royal'){g.lineStyle(3,p.primary,.9);const q=sector(c-.07,69),v=sector(c,74),z=sector(c+.07,69);g.strokePoints([q,v,z],false);}else if(s.theme==='forge'){for(const t of [a+.07,b-.07]){const q=sector(t,67);g.fillStyle(p.primary,.85);g.fillCircle(q.x,q.y,2);}}}
   const plate=[point(55,-15),point(68,-18),point(74,0),point(68,18),point(55,15)];g.fillStyle(p.ink,.4);g.fillPoints(plate,true);g.lineStyle(2.5,p.primary,.95);g.strokePoints(plate,true);
   const charged=tankChargeSegments(s.energy);
   for(let i=0;i<5;i++){const a=s.angle+(i-2)*.3,x=s.x+Math.cos(a)*(r-2),y=s.y+Math.sin(a)*(r-2);g.fillStyle(i<charged?p.primary:p.ink,i<charged?.95:.6);g.fillCircle(x,y,s.wide?4:3.5);}
   if(charged>0){const cx=s.x+Math.cos(s.angle)*(r-12),cy=s.y+Math.sin(s.angle)*(r-12);this.crest(g,s.theme,cx,cy,p.accent,.55+charged*.07);}
   if(charged===5){const x=s.x+Math.cos(s.angle)*(r-15),y=s.y+Math.sin(s.angle)*(r-15);g.lineStyle(1.6,p.accent,.9);g.strokeCircle(x,y,4);}
  }
  if(s.march){const ground=this.ground;ground.lineStyle(3,p.primary,.7);for(const side of [-1,1])ground.lineBetween(s.x+side*22,s.y+21,s.x+side*26,s.y+29);
   if(timeline.moving&&!s.reduced){const a=timeline.moveAngle,dx=Math.cos(a),dy=Math.sin(a),stride=timeline.distance%36/36;for(const side of [-1,1]){const x=s.x-dy*side*23,y=s.y+21+dx*side*10;ground.fillStyle(p.primary,.22);ground.fillTriangle(x,y,x-dx*(22+stride*12)-dy*3,y-dy*(22+stride*12)+dx*3,x-dx*13+dy*3,y-dy*13-dx*3);ground.lineStyle(2,p.accent,.65);ground.lineBetween(x,y,x-dx*18,y-dy*18);}}
  }
  let absorbedShown=0,stepsShown=0;
  for(const e of timeline.events){
   const fade=1-e.age/TANK_EVENT_LIFE[e.kind];
   if(e.kind==='slam'||e.kind==='release'||e.kind==='stomp'){this.impact(e,s);continue;}
   if(e.kind==='absorb'){if(s.wide&&absorbedShown++>=2)continue;
    const u=s.reduced?1:Math.min(1,e.age/.15),tx=s.x+Math.cos(s.angle)*T.bulwark.radius,ty=s.y+Math.sin(s.angle)*T.bulwark.radius,x=e.x+(tx-e.x)*u,y=e.y+(ty-e.y)*u;
    g.fillStyle(p.primary,fade);g.fillCircle(x,y,s.wide?3.5:3);if(!s.reduced){g.lineStyle(s.wide?3:4,p.primary,fade*.18);g.lineBetween(e.x,e.y,x,y);g.lineStyle(1,p.accent,fade*.7);g.strokeCircle(x,y,5+(1-fade)*3);}if(!s.reduced){g.lineStyle(1.7,p.accent,fade*.6);g.lineBetween(x,y,x-(tx-e.x)*.12,y-(ty-e.y)*.12);}continue;
   }
   if(s.reduced)continue;
   if(e.kind==='step'){if(s.wide&&stepsShown++>=2)continue;this.ground.lineStyle(s.wide?3:2.5,p.primary,fade*.7);this.ground.strokeEllipse(e.x,e.y,12+(1-fade)*9,5+(1-fade)*4);if(!s.wide){this.plume(this.ground,s,e.x,e.y,1-fade,fade,.6);for(const side of [-1,1])this.shard(this.ground,s,e.x+side*(10+(1-fade)*7),e.y-3-(1-fade)*8,2.5,fade*.8);}}
   if(e.kind==='push'){const x=e.x+Math.cos(e.angle)*8,y=e.y+22;this.ground.lineStyle(2,p.accent,fade*.55);this.ground.lineBetween(x-3,y-3,x+2,y);this.ground.lineBetween(x+2,y,x-3,y+3);}
  }
 }
}
