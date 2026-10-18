import Phaser from 'phaser';
import {ArenaVisuals} from '../src/visuals';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
class Preview extends ArenaScene{
 constructor(){super(freshSave(),new AudioManager(),()=>{},()=>{},()=>{});}
 update(){}
 create(){
  this.tweens.timeScale=.25;
  const labels=['SHARPENED EDGE','CRESCENT CUT','ECHO SLASH','COMBINED'];
  const slots=labels.map((label,i)=>{const x=155+i%2*310,y=140+Math.floor(i/2)*240,v=new ArenaVisuals(this);this.add.text(x-110,y+80,label,{fontSize:'16px',color:'#dfdfd3'});v.render([],'ninja','katana',x,y,0,0,.15,0,0,false,0,0,1,1,i===1||i===3?1.75:1);return {v,x,y,i};});
  const strike=()=>{for(const {v,x,y,i} of slots){v.meleeReward('ninja','katana',x,y,0,1,1,i===1||i===3?1.75:1,i===0||i===3?4:0,i===1||i===3?3:0,false);if(i>=2)this.time.delayedCall(110,()=>v.meleeReward('ninja','katana',x,y,0,1,1,i===3?1.75:1,i===3?4:0,i===3?3:0,true));}};
  strike();this.time.addEvent({delay:1100,loop:true,callback:strike});
 }
}
new Phaser.Game({type:Phaser.CANVAS,parent:'fixture',width:620,height:620,backgroundColor:'#182935',scene:[Preview],audio:{noAudio:true}});
