import Phaser from 'phaser';
import {PYUSAWHTI_RIG_ASSETS,PyusawhtiRig,pyusawhtiArrowOrigin,ARCHER_DRAW_TIME} from '../src/pyusawhti-rig';
class Preview extends Phaser.Scene{
 rig!:PyusawhtiRig;arrows!:Phaser.GameObjects.Graphics;
 preload(){for(const asset of Object.values(PYUSAWHTI_RIG_ASSETS))this.load.image(asset.key,asset.url);}
 create(){this.rig=new PyusawhtiRig(this);this.arrows=this.add.graphics().setDepth(5);this.cameras.main.setZoom(2.5);}
 update(time:number){const t=time/1000,cycle=.5,age=t%cycle,sequence=Math.floor(t/cycle);this.rig.render(370,240,0,t,false,age<.34?.34-age:0,sequence);this.arrows.clear();if(age>=ARCHER_DRAW_TIME){const p=pyusawhtiArrowOrigin(370,240,0),x=p.x+(age-ARCHER_DRAW_TIME)*250;this.arrows.lineStyle(.9,0xddebf2,.7).lineBetween(x-13,p.y,x,p.y);this.arrows.fillStyle(0xf6fbff).fillTriangle(x+3,p.y,x-2,p.y-2,x-2,p.y+2);}}
}
new Phaser.Game({type:Phaser.CANVAS,width:800,height:480,parent:'game',backgroundColor:'#203c40',scene:Preview,audio:{noAudio:true}});
