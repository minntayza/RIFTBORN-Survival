import Phaser from 'phaser';
import {CosmeticWeaponEffects} from './cosmetic-weapon-fx';
import type {OutfitProfile} from './outfit-effect-profiles';
type Burst={p:OutfitProfile;x:number;y:number;born:number;radius:number};
type Ghost={x:number;y:number;born:number};
export type OutfitAbilityState={x:number;y:number;angle:number;time:number;dash:number;counter:number;overdrive:number;reduced:boolean;texture?:string};
/** Outfit-only decoration. Never owns ability timers, collisions, damage, or gameplay RNG. */
export class OutfitAbilityEffects{
 private g:Phaser.GameObjects.Graphics;private particles:CosmeticWeaponEffects;private bursts:Burst[]=[];private trail:Ghost[]=[];private ghosts:Phaser.GameObjects.Image[]=[];private trailAt=-1;private sparkleAt=-1;private began=-10;private lastId='';
 get activeCount(){return this.particles.activeCount+this.bursts.length+this.trail.length;}
 get profileId(){return this.lastId;}
 constructor(private scene:Phaser.Scene){this.g=scene.add.graphics().setDepth(4.85);this.particles=new CosmeticWeaponEffects(scene);for(let i=0;i<4;i++)this.ghosts.push(scene.add.image(0,0,'__WHITE').setVisible(false).setDepth(2.95));}
 begin(p:OutfitProfile|undefined,x:number,y:number,angle:number,time:number){if(!p)return;this.lastId=p.id;this.began=time;this.trail=[];
  if(p.hero==='tank'){this.burst(p,x,y,time,155);return;}
  this.particles.emit(p,x,y,angle,time,p.hero==='ninja'?10:8,48);
 }
 counter(p:OutfitProfile|undefined,x:number,y:number,time:number){if(p?.hero==='samurai'){this.lastId=p.id;this.burst(p,x,y,time,210);}}
 private burst(p:OutfitProfile,x:number,y:number,time:number,radius:number){if(this.bursts.length>=4)this.bursts.shift();this.bursts.push({p,x,y,born:time,radius});for(let i=0;i<12;i++){const a=i*Math.PI/6;this.particles.emit(p,x+Math.cos(a)*radius*.25,y+Math.sin(a)*radius*.2,a,time,2,70);}}
 private ring(x:number,y:number,r:number,color:number,alpha:number,width=2){this.g.lineStyle(width,color,alpha);this.g.strokeEllipse(x,y,r*2,r*1.16);}
 private stamp(p:OutfitProfile,x:number,y:number,r:number,time:number,alpha=1,spin=0){this.particles.glyph(p,x,y,r,spin,alpha);}
 private smilingStar(x:number,y:number,r:number,color:number,alpha:number){const g=this.g,points=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,s=i%2?r*.48:r;points.push({x:x+Math.cos(a)*s,y:y+Math.sin(a)*s});}g.fillStyle(color,alpha);g.fillPoints(points,true);g.fillStyle(0x3d4550,alpha);g.fillCircle(x-r*.22,y,r*.09);g.fillCircle(x+r*.22,y,r*.09);g.lineStyle(1.2,0x3d4550,alpha);g.beginPath();g.arc(x,y+r*.07,r*.22,.2,Math.PI-.2);g.strokePath();}
 render(p:OutfitProfile|undefined,s:OutfitAbilityState){const {x,y,time:t}=s,g=this.g;g.clear();this.particles.render(t,[],undefined);this.ghosts.forEach(i=>i.setVisible(false));this.bursts=this.bursts.filter(b=>t-b.born<1.05);this.trail=this.trail.filter(b=>t-b.born<.27);
  if(!p){this.trail=[];this.bursts=[];return;}
  const age=t-this.began;
  // Dash themes: soft ink shadows, graphic street arrows, or holographic body copies.
  if(p.hero==='ninja'&&(s.dash>0||this.trail.length>0)){if(s.dash>0&&t-this.trailAt>.045){this.trailAt=t;this.trail.push({x,y,born:t});if(this.trail.length>6)this.trail.shift();this.particles.emit(p,x,y,s.angle+Math.PI,t,s.reduced?1:3,25);}
   const texture=s.texture||'cute-ninja-0';if(!s.reduced&&this.scene.textures.exists(texture))for(let i=0;i<Math.min(4,this.trail.length);i++){const q=this.trail[Math.max(0,this.trail.length-1-i)],a=(1-(t-q.born)/.27)*.35;this.ghosts[i].setTexture(texture).setPosition(q.x,q.y).setDisplaySize(78,78).setTint(p.color).setAlpha(a).setFlipX(Math.cos(s.angle)<0).setVisible(true);}
   for(const [i,q] of this.trail.entries()){const fade=(1-(t-q.born)/.27)*.65;if(p.theme==='sakura'){g.fillStyle(0x253b38,fade*.45);g.fillEllipse(q.x,q.y+23,40,15);this.stamp(p,q.x,q.y-7,7,t,fade,i*.7);}else if(p.theme==='jade'){this.stamp(p,q.x,q.y+12,12,t,fade,s.angle);g.lineStyle(2,p.accent,fade*.4);g.lineBetween(q.x-8,q.y-13,q.x+7,q.y-13);}else{g.lineStyle(1.4,p.color,fade);g.strokeRoundedRect(q.x-24,q.y-32,48,64,6);this.stamp(p,q.x+25,q.y-25,6,t,fade);}}
  }
  // Counter stance is a readable halo; only successful counters trigger the celebration.
  if(p.hero==='samurai'&&s.counter>0){this.ring(x,y+21,49,p.color,.65,2);for(let i=0;i<5;i++){const a=i*Math.PI*2/5+(s.reduced?0:t*.8);this.stamp(p,x+Math.cos(a)*48,y+17+Math.sin(a)*25,8,t,.85,a*.2);}if(p.theme==='jade'){this.stamp(p,x,y-55,15,t,.95);}else if(p.theme==='starlight'){g.lineStyle(2,p.accent,.8);g.beginPath();g.arc(x,y,40,-1.1,1.1);g.strokePath();}}
  // Three seconds of Overdrive get a distinct sustained identity, not a one-frame flash.
  if(p.hero==='gunner'&&s.overdrive>0){const phase=s.reduced?0:t*1.8;this.ring(x,y+20,46,p.color,.32,1.5);
   if(p.theme==='sakura'){for(let i=0;i<5;i++){const a=phase+i*Math.PI*2/5;this.stamp(p,x+Math.cos(a)*43,y-7+Math.sin(a)*23,7,t,.9,a);}this.smilingStar(x,y-53,12,p.accent,.95);}
   else if(p.theme==='jade'){for(let i=0;i<9;i++){const h=5+(s.reduced?7:(Math.sin(t*8+i*1.8)+1)*8);g.fillStyle(i%2?p.color:p.accent,.7);g.fillRoundedRect(x-37+i*9,y+39-h,5,h,2);}this.stamp(p,x-42,y-30,10,t,.9);this.stamp(p,x+39,y-40,8,t,.9,.2);}
   else{this.ring(x,y-4,53,p.color,.5);for(let i=0;i<3;i++){const a=phase+i*Math.PI*2/3;const px=x+Math.cos(a)*52,py=y-8+Math.sin(a)*30;this.stamp(p,px,py,9,t,.9);g.lineStyle(2,p.accent,.5);g.lineBetween(px,py,px-Math.cos(a+.7)*10,py-Math.sin(a+.7)*10);}}
   if(t-this.sparkleAt>.17){this.sparkleAt=t;this.particles.emit(p,x,y-30,-Math.PI/2,t,1,27);}
  }
  for(const b of this.bursts){const u=(t-b.born)/1.05,fade=Math.max(0,1-u),r=b.radius*(.22+u*.78),bp=b.p;this.ring(b.x,b.y+15,r,bp.color,fade*.65,3);this.ring(b.x,b.y+15,r*.78,bp.accent,fade*.4,1.5);
   if(bp.hero==='samurai'){
    const count=bp.theme==='sakura'?10:bp.theme==='jade'?6:8;for(let i=0;i<count;i++){const a=i*Math.PI*2/count+u*.7;this.stamp(bp,b.x+Math.cos(a)*r*.75,b.y+Math.sin(a)*r*.45,9+fade*4,t,fade,a);}
    if(bp.theme==='sakura'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;g.fillStyle(bp.color,fade*.55);g.fillEllipse(b.x+Math.cos(a)*13,b.y-44+Math.sin(a)*13,17,25);}this.smilingStar(b.x,b.y-44,13,bp.accent,fade);}
    else if(bp.theme==='jade'){this.stamp(bp,b.x,b.y-45-u*25,25,t,fade);for(let i=0;i<2;i++){g.lineStyle(3,bp.color,fade*.4);g.beginPath();g.arc(b.x,b.y,r*.6,u*2+i*Math.PI,u*2+i*Math.PI+1.7);g.strokePath();}}
    else{this.stamp(bp,b.x,b.y-45-u*20,28,t,fade);this.smilingStar(b.x+35,b.y-60,10,bp.accent,fade);}
   }else if(bp.theme==='sakura'){this.stamp(bp,b.x,b.y-48-u*25,26,t,fade);for(let i=0;i<8;i++){const a=i*Math.PI/4;g.fillStyle(i%2?bp.color:bp.accent,fade);const cx=b.x+Math.cos(a)*r*.7,cy=b.y+15+Math.sin(a)*r*.4;g.fillPoints([{x:cx,y:cy-8},{x:cx+6,y:cy},{x:cx,y:cy+8},{x:cx-6,y:cy}],true);}}
   else if(bp.theme==='jade'){for(let i=0;i<8;i++){const a=i*Math.PI/4;this.stamp(bp,b.x+Math.cos(a)*r*.65,b.y+15+Math.sin(a)*r*.4,14,t,fade);g.lineStyle(2,bp.accent,fade*.4);g.lineBetween(b.x+Math.cos(a)*25,b.y+15+Math.sin(a)*16,b.x+Math.cos(a)*r*.5,b.y+15+Math.sin(a)*r*.3);}this.stamp(bp,b.x,b.y-35-u*20,22,t,fade);}
   else{this.stamp(bp,b.x,b.y-35-u*20,25,t,fade);for(let i=0;i<6;i++){const a=i*Math.PI/3;this.stamp(bp,b.x+Math.cos(a)*r*.7,b.y+15+Math.sin(a)*r*.4,10,t,fade,u*.4);g.fillStyle(bp.accent,fade*.35);const cx=b.x+Math.cos(a)*r*.5,cy=b.y+15+Math.sin(a)*r*.3;g.fillTriangle(cx-5,cy,cx,cy-20*fade,cx+5,cy);}}
  }
 }
}
