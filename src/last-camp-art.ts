import {campContact} from './camp-siege';
import type Phaser from 'phaser';
import type {ArenaScene,Enemy} from './combat';
import {COURT_WALLS,COURT_ART_WIDTH,COURT_ART_HEIGHT} from './last-camp-occlusion';
/** A bounded native 2D scene: stone court, lanterns, shelter, beacon and warning layer. */
export class LastCampArt {
 private flames:Phaser.GameObjects.Graphics;private foreground:Phaser.GameObjects.Image;private sprite:Phaser.GameObjects.Image;private ground:Phaser.GameObjects.Image;private camp:Phaser.GameObjects.Graphics;private warnings:Phaser.GameObjects.Graphics;
 constructor(private scene:ArenaScene){scene.cameras.main.setBackgroundColor(0x10212c);this.ground=scene.add.image(scene.camp!.x,scene.camp!.y,'last-camp-court').setDisplaySize(1280,960).setDepth(-2.5);const key='last-camp-wall-foreground';if(!scene.textures.exists(key)){const source=scene.textures.get('last-camp-court').getSourceImage() as HTMLImageElement;const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;const ctx=canvas.getContext('2d')!;ctx.scale(canvas.width/COURT_ART_WIDTH,canvas.height/COURT_ART_HEIGHT);ctx.beginPath();for(const polygon of COURT_WALLS){ctx.moveTo(polygon[0][0],polygon[0][1]);for(const [x,y] of polygon.slice(1))ctx.lineTo(x,y);ctx.closePath();}ctx.clip();ctx.drawImage(source,0,0,COURT_ART_WIDTH,COURT_ART_HEIGHT);scene.textures.addCanvas(key,canvas);}this.foreground=scene.add.image(scene.camp!.x,scene.camp!.y,key).setDisplaySize(1280,960).setDepth(11);this.camp=scene.add.graphics().setDepth(1.9);this.flames=scene.add.graphics().setDepth(2.6);this.warnings=scene.add.graphics().setDepth(5.8);this.sprite=scene.add.image(scene.camp!.x,scene.camp!.y-10,'last-camp-beacon').setDisplaySize(320,320).setDepth(2.5);scene.events.once('shutdown',()=>{this.sprite.destroy();this.ground.destroy();this.foreground.destroy();this.camp.destroy();this.flames.destroy();this.warnings.destroy();});}
 render(time:number,siege:Enemy[],reduced:boolean,wide:boolean){const c=this.scene.camp!,g=this.camp,w=this.warnings,f=this.flames;g.clear();w.clear();f.clear();const x=c.x,y=c.y,threat=siege.some(e=>e.active&&Math.hypot(e.x-x,e.y-y)<190),hitAge=time-c.hitAt;
 this.sprite.setTint(c.fraction<.35?0xc5a58c:c.fraction<.7?0xe3cfb4:0xffffff);
 g.fillStyle(0xffb749,.035*c.fraction);g.fillEllipse(x,y,400,300);g.fillStyle(0xffc560,.07*c.fraction);g.fillEllipse(x,y,260,180);
 const flicker=reduced?0:Math.sin(time*7)*3,flameY=y-106,height=52*(.45+c.fraction*.55);
 if(c.hp>0)for(const [size,color] of [[1,0xef8434],[.7,0xffc94d],[.38,0xfff0a1]]){f.fillStyle(color);f.fillPoints([{x:x-19*size,y:flameY},{x:x-13*size,y:flameY-height*.42*size},{x:x-5*size,y:flameY-height*.23*size},{x:x+flicker*size,y:flameY-height*size},{x:x+10*size,y:flameY-height*.52*size},{x:x+16*size,y:flameY-height*.28*size},{x:x+19*size,y:flameY}],true);f.fillEllipse(x,flameY-6,34*size,22*size);}
 if(c.hp>0&&!reduced&&!wide)for(let i=0;i<6;i++){const t=(time*.6+i/6)%1;f.fillStyle(0xffd175,(1-t)*.65);f.fillCircle(x+Math.sin(time+i*4)*17,flameY-8-t*65,1.8);}

 // Persistent, sparse cracks communicate camp condition without hiding enemies.
 if(c.fraction<.7){f.lineStyle(2.4,0x493426,.9);for(const dx of [-73,78])f.strokePoints([{x:x+dx-9,y:y+40},{x:x+dx,y:y+48},{x:x+dx-3,y:y+57},{x:x+dx+7,y:y+65}],false);}
 if(c.fraction<.35){f.lineStyle(3,0x3b2d2b,.9);f.strokePoints([{x:x-15,y:y-45},{x:x-5,y:y-29},{x:x-10,y:y-12},{x:x+5,y:y+2}],false);}
 // The baked survivors remain stationary; readable alarm bubbles make their reaction visible.
 if(threat||hitAge<1.5)for(const dx of [-28,32]){f.fillStyle(0x14212b,.95);f.fillRoundedRect(x+dx-7,y+2,14,18,4);f.fillStyle(0xffd279);f.fillRect(x+dx-1,y+5,2,7);f.fillCircle(x+dx,y+16,1.3);}


 // Local contact effects replace whole-camp rings.
 let shakeX=0,shakeY=0;
 for(const hit of this.scene.campStrikes){
  const age=time-hit.impactAt,dx=hit.to.x-hit.from.x,dy=hit.to.y-hit.from.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,nx=-uy,ny=ux;
  if(hit.robot&&age<0){const t=Math.max(0,Math.min(1,(time-hit.born)/.1)),px=hit.from.x+dx*t,py=hit.from.y+dy*t;
   w.lineStyle(5,0x193c4c,.7);w.lineBetween(px-ux*15,py-uy*15,px,py);w.lineStyle(2,0xb0f5ff,1);w.lineBetween(px-ux*11,py-uy*11,px,py);continue;}
  if(age<0||age>.45)continue;
  const fade=1-age/.45,reach=hit.heavy?17:11;
  if(!reduced){shakeX-=ux*Math.sin(age*55)*fade*1.5;shakeY-=uy*Math.sin(age*55)*fade*1.5;}
  // A bright scratch on the struck face and tiny outward chips.
  w.lineStyle(hit.heavy?4:2,hit.robot?0xb9f5ff:0xffe2b1,fade);
  for(let i=0;i<(hit.robot?3:2);i++){const shift=(i-.5)*6;
   const px=hit.to.x+nx*shift,py=hit.to.y+ny*shift;
   w.lineBetween(px-nx*reach*.5-ux*3,py-ny*reach*.5-uy*3,px+nx*reach*.5+ux*3,py+ny*reach*.5+uy*3);}
  if(!reduced)for(let i=0;i<(wide?3:5);i++){
   const spread=(i-2)*.48,a=Math.atan2(-uy,-ux)+spread,speed=20+i*6,px=hit.to.x+Math.cos(a)*age*speed,py=hit.to.y+Math.sin(a)*age*speed+age*age*45;
   w.lineStyle(i%2?2:3,hit.robot?0x7ee0ed:i%2?0xd19b63:0xffdc9e,fade);w.lineBetween(px,py,px+Math.cos(a)*4,py+Math.sin(a)*4);
  }
 }
 this.sprite.setPosition(x+Math.max(-2,Math.min(2,shakeX)),y-10+Math.max(-2,Math.min(2,shakeY)));
 for(const e of siege){
  if(!e.active)continue;
  const back=e.x<c.x?-1:1,mx=e.x+back*(e.r*.7+3),my=e.y-e.r*.9,robotMarker=e.faction==='robot';
  // Persistent silhouette marker: a cloth pennant for zombies, a shoulder beacon for robots.
  w.lineStyle(3,0x192a32,1);
  if(robotMarker){
   w.lineBetween(mx,my+5,mx,my-9);w.fillStyle(0x8a572b);w.fillRoundedRect(mx-7,my-12,14,10,3);
   w.fillStyle(0xffc66b,.8+(reduced?0:Math.sin(time*5)*.15));w.fillRect(mx-4,my-10,8,6);
   w.lineStyle(1.5,0xffe1a1,.9);w.lineBetween(mx-9,my-13,mx-12,my-17);w.lineBetween(mx+9,my-13,mx+12,my-17);
  }else{
   w.lineBetween(mx,my+13,mx,my-15);const flag=[{x:mx,y:my-15},{x:mx+back*17,y:my-12},{x:mx+back*12,y:my-5},{x:mx+back*17,y:my+1},{x:mx,y:my-1}];
   w.fillStyle(0xf9a554);w.fillPoints(flag,true);w.strokePoints(flag,true);w.lineStyle(1.5,0xffe0a3);w.lineBetween(mx+back*3,my-11,mx+back*10,my-9);
  }
  // Brief camp glyph at assignment; it never follows survivor hunters.
  const assignedAge=e.campAssignedAt===undefined?Infinity:time-e.campAssignedAt;
  if(assignedAge<1.6){const hx=e.x,hy=e.y-e.r-30,fade=Math.min(1,(1.6-assignedAge)*2);
   w.fillStyle(0x172b34,fade*.95);w.fillRoundedRect(hx-11,hy-13,22,23,5);w.fillStyle(0xffd58b,fade);w.fillRect(hx-6,hy-2,12,8);w.fillTriangle(hx-8,hy-2,hx+8,hy-2,hx,hy-10);w.fillStyle(0x172b34,fade);w.fillRect(hx-2,hy+1,4,5);}
  if(e.telegraph<=0)continue;
  const contact=campContact(e.x,e.y,c.obstacles),dx=contact.x-e.x,dy=contact.y-e.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,progress=1-Math.min(1,e.telegraph/1.4),robot=e.faction==='robot',heavy=['brute','armoured','boss'].includes(e.type);
  const sx=e.x+ux*e.r*.7,sy=e.y+uy*e.r*.7-5;
  if(robot){w.lineStyle(2,0x91ebf5,.3+progress*.6);w.lineBetween(sx-uy*3,sy+ux*3,sx+uy*3,sy-ux*3);}
  if(heavy){const px=contact.x-ux*(18-progress*5),py=contact.y-uy*(18-progress*5),size=7;
   w.lineStyle(2,robot?0x98e9f2:0xe6c0a0,.3+progress*.6);w.lineBetween(px-ux*size-uy*size*.6,py-uy*size+ux*size*.6,px,py);w.lineBetween(px,py,px-ux*size+uy*size*.6,py-uy*size-ux*size*.6);}
 }
 }
}
