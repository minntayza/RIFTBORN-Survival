import Phaser from 'phaser';
import {PYUSAWHTI_RIG_ASSETS,PyusawhtiRig,pyusawhtiArrowOrigin} from '../src/pyusawhti-rig';
class AimReview extends Phaser.Scene{
 preload(){for(const asset of Object.values(PYUSAWHTI_RIG_ASSETS))this.load.image(asset.key,asset.url);}
 create(){for(let i=0;i<8;i++){const aim=i*Math.PI/4,x=140+(i%4)*235,y=130+Math.floor(i/4)*265;
 const rig=new PyusawhtiRig(this);rig.render(x,y,aim,0,false,1,1);
 const p=pyusawhtiArrowOrigin(x,y,aim),g=this.add.graphics().setDepth(4);g.lineStyle(2,0xffd46e).lineBetween(p.x,p.y,p.x+Math.cos(aim)*32,p.y+Math.sin(aim)*32);g.fillStyle(0xffffff).fillCircle(p.x,p.y,2);
 this.add.text(x-45,y+65,['RIGHT','DOWN RIGHT','DOWN','DOWN LEFT','LEFT','UP LEFT','UP','UP RIGHT'][i],{fontSize:'14px',color:'#ffe5a6'});
 }}
}
new Phaser.Game({type:Phaser.CANVAS,width:980,height:540,parent:'game',backgroundColor:'#203c40',scene:AimReview,audio:{noAudio:true}});
