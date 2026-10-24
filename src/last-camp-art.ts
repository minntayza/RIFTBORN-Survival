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
 if(hitAge<.5){g.lineStyle(3,0xff825b,.7);g.strokeEllipse(x,y+20,220,130);}
 // Persistent, sparse cracks communicate camp condition without hiding enemies.
 if(c.fraction<.7){f.lineStyle(2.4,0x493426,.9);for(const dx of [-73,78])f.strokePoints([{x:x+dx-9,y:y+40},{x:x+dx,y:y+48},{x:x+dx-3,y:y+57},{x:x+dx+7,y:y+65}],false);}
 if(c.fraction<.35){f.lineStyle(3,0x3b2d2b,.9);f.strokePoints([{x:x-15,y:y-45},{x:x-5,y:y-29},{x:x-10,y:y-12},{x:x+5,y:y+2}],false);}
 // The baked survivors remain stationary; readable alarm bubbles make their reaction visible.
 if(threat||hitAge<1.5)for(const dx of [-28,32]){f.fillStyle(0x14212b,.95);f.fillRoundedRect(x+dx-7,y+2,14,18,4);f.fillStyle(0xffd279);f.fillRect(x+dx-1,y+5,2,7);f.fillCircle(x+dx,y+16,1.3);}
 if(hitAge<.8){f.lineStyle(2,c.armor>0?0x8ee0e2:0xffb564,.8);f.strokeEllipse(x,y+28,205,100);}
 for(const e of siege){if(!e.active)continue;
  const bx=e.x,by=e.y-e.r-20;
  // A pennant changes the silhouette. The little beacon glyph identifies its target.
  w.lineStyle(3,0x14212b,1);w.lineBetween(bx-13,by+21,bx-13,by-13);w.fillStyle(0xffa853);w.fillPoints([{x:bx-12,y:by-12},{x:bx+14,y:by-9},{x:bx+8,y:by+9},{x:bx-12,y:by+7}],true);w.lineStyle(2,0x1b2730);w.strokePoints([{x:bx-12,y:by-12},{x:bx+14,y:by-9},{x:bx+8,y:by+9},{x:bx-12,y:by+7}],true,true);
  w.fillStyle(0x24343b);w.fillRect(bx-5,by,10,4);w.fillTriangle(bx-4,by,bx+4,by,bx,by-8);
  if(e.telegraph>0){const progress=1-Math.min(1,e.telegraph/1.4);w.fillStyle(0xff633f,.16);w.fillCircle(e.x,e.y,e.r+18);w.lineStyle(3,0xffbd67,.95);w.beginPath();w.arc(e.x,e.y,e.r+18,-Math.PI/2,-Math.PI/2+progress*Math.PI*2);w.strokePath();}
 }
 }
}
