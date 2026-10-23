import type Phaser from 'phaser';
import type {ArenaScene,Enemy} from './combat';
/** A bounded native 2D scene: stone court, lanterns, shelter, beacon and warning layer. */
export class LastCampArt {
 private ground:Phaser.GameObjects.Graphics;private camp:Phaser.GameObjects.Graphics;private warnings:Phaser.GameObjects.Graphics;
 constructor(private scene:ArenaScene){this.ground=scene.add.graphics().setDepth(-2.5);this.camp=scene.add.graphics().setDepth(2.7);this.warnings=scene.add.graphics().setDepth(5.8);this.floor();scene.events.once('shutdown',()=>{this.ground.destroy();this.camp.destroy();this.warnings.destroy();});}
 private floor(){const g=this.ground,c=this.scene.camp!;g.fillStyle(0x142631);g.fillRoundedRect(c.x-640,c.y-480,1280,960,30);for(let y=-450;y<450;y+=50)for(let x=-600;x<600;x+=64){const shift=(Math.floor(y/50)%2)*28;g.fillStyle((Math.abs(x*7+y*3)%5)<2?0x34454a:0x2b3d44);g.fillRoundedRect(c.x+x+shift,c.y+y,59,45,5);g.lineStyle(1,0x53616a,.35);g.strokeRoundedRect(c.x+x+shift,c.y+y,59,45,5);if((x+y)%7===0){g.fillStyle(0x486b4d,.7);g.fillEllipse(c.x+x+10,c.y+y+39,15,7);}}
 for(let i=0;i<32;i++){const a=i/32*Math.PI*2,x=c.x+Math.cos(a)*145,y=c.y+Math.sin(a)*105;g.fillStyle(0x8c8064,.45);g.fillEllipse(x,y,25,13);}
 // Broken walls leave four broad entrances rather than a closed obstacle maze.
 for(const [x,y,w,h] of [[-600,-440,470,22],[130,-440,470,22],[-600,420,470,22],[130,420,470,22],[-620,-420,22,290],[-620,130,22,290],[600,-420,22,290],[600,130,22,290]]){g.fillStyle(0x101e29);g.fillRoundedRect(c.x+x-4,c.y+y+4,w+8,h+8,5);g.fillStyle(0x596368);g.fillRoundedRect(c.x+x,c.y+y,w,h,4);}}
 render(time:number,siege:Enemy[],reduced:boolean,wide:boolean){const c=this.scene.camp!,g=this.camp,w=this.warnings;g.clear();w.clear();const x=c.x,y=c.y;
 g.fillStyle(0xffb749,.035);g.fillEllipse(x,y,380,280);g.fillStyle(0xffc560,.065);g.fillEllipse(x,y,230,160);g.fillStyle(0x08151b,.5);g.fillEllipse(x,y+48,180,92);
 for(const [dx,dy] of [[-76,-38],[65,-20],[-70,28]]){g.fillStyle(0x251d20);g.fillRoundedRect(x+dx-17,y+dy-22,36,35,4);g.fillStyle(0x8e6336);g.fillRoundedRect(x+dx-14,y+dy-23,30,29,3);g.lineStyle(3,0xc69c58);g.strokeRect(x+dx-10,y+dy-20,23,23);g.lineBetween(x+dx-10,y+dy-20,x+dx+13,y+dy+3);}
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;if(i===3||i===9)continue;const px=x+Math.cos(a)*77,py=y+Math.sin(a)*47;g.fillStyle(0x1b272d);g.fillRoundedRect(px-18,py-6,36,25,5);g.fillStyle(0x9a8d6a);g.fillRoundedRect(px-17,py-10,34,22,5);g.fillStyle(0xc8b887);g.fillRoundedRect(px-14,py-10,28,6,3);}
 g.fillStyle(0x202a30);g.fillEllipse(x,y+13,76,40);g.fillStyle(0xb8a577);g.fillRoundedRect(x-27,y-35,54,55,5);g.fillStyle(0xe0c486);g.fillEllipse(x,y-33,65,22);g.fillStyle(0x514539);g.fillEllipse(x,y-35,45,13);
 const flicker=reduced?0:Math.sin(time*7)*3;for(const [size,color] of [[1,0xef8434],[.7,0xffc94d],[.38,0xfff0a1]]){g.fillStyle(color);g.fillTriangle(x-25*size,y-35,x+25*size,y-35,x+flicker*size,y-110*size-22);g.fillEllipse(x,y-42,44*size,32*size);}
 g.lineStyle(4,0x46372b);g.lineBetween(x+54,y-88,x+54,y+18);g.fillStyle(0x704083);g.fillPoints([{x:x+56,y:y-84},{x:x+86,y:y-80},{x:x+84,y:y-33},{x:x+71,y:y-42},{x:x+56,y:y-34}],true);g.lineStyle(2,0xe1b96e);g.lineBetween(x+65,y-66,x+74,y-52);g.lineBetween(x+74,y-52,x+81,y-67);
 for(const dx of [-115,110]){g.fillStyle(0xffba48,.1);g.fillCircle(x+dx,y+12,27);g.fillStyle(0x202730);g.fillRoundedRect(x+dx-7,y-8,14,25,3);g.fillStyle(0xffd777);g.fillRoundedRect(x+dx-4,y-5,8,13,2);}
 for(const dx of [-31,38]){g.fillStyle(0x243747);g.fillRoundedRect(x+dx-8,y+22,16,22,5);g.fillStyle(0xe7b482);g.fillCircle(x+dx,y+18,8);g.fillStyle(0x534537);g.fillEllipse(x+dx,y+12,19,7);g.fillStyle(0x151e29);g.fillCircle(x+dx-3,y+18,1.3);g.fillCircle(x+dx+3,y+18,1.3);}
 if(!reduced&&!wide)for(let i=0;i<6;i++){const t=(time*.6+i/6)%1;g.fillStyle(0xffd175,(1-t)*.65);g.fillCircle(x+Math.sin(time+i*4)*17,y-45-t*77,1.8);}
 for(const e of siege){if(!e.active)continue;w.lineStyle(2,0xffaa63,.9);w.strokeCircle(e.x,e.y-35,e.r>22?10:7);w.lineBetween(e.x-3,e.y-35,e.x+3,e.y-35);if(e.telegraph>0){w.fillStyle(0xff633f,.18);w.fillCircle(e.x,e.y,e.r+18);w.lineStyle(2,0xffbd67,.9);w.strokeCircle(e.x,e.y,e.r+18);}}
 }
}
