import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
const save=freshSave();save.hero='gunner';save.weapon='pistols';save.settings.sound=false;save.settings.shake=false;
const audio=new AudioManager();audio.sound=false;
const scene=new ArenaScene(save,audio,()=>{},()=>{},()=>{});
scene.onArenaReady=()=>{
 scene.paused=true;scene.plan=[];scene.enemies.forEach(e=>e.active=false);scene.elapsed=5;
 const x=scene.x,y=scene.y;
 const positions=[{x:x+145,y:y-30},{x:x+210,y:y-70},{x:x+230,y:y+20},{x:x+155,y:y+70}];
 for(const [i,p] of positions.entries()){const e=scene.spawn(i%2?'runner':'basic');if(e){e.x=p.x;e.y=p.y;e.hp=e.max;}}
 scene.angle=0;scene.cameras.main.setZoom(1.4);scene.render();
 const fx=scene.visuals.gunnerSkills;
 fx.verdict(x+170,y,120,4.8);
 scene.cataclysm.trigger(positions,100);
 for(const blast of scene.cataclysm.tick(.5))fx.verdict(blast.x,blast.y,blast.radius,4.88,0x72e5ff);
 fx.render({x,y,angle:0,time:5,weapon:'pistols',ammo:0,maxAmmo:10,magazine:0,quickHands:0,reload:0,reloadDuration:1,overdrive:0});
 scene.add.text(x+170,y-145,'MAIN BLAST',{fontSize:'14px',color:'#ffd5a5',backgroundColor:'#142332',padding:{x:8,y:4}}).setOrigin(.5).setDepth(8);
 scene.add.text(x+235,y+132,'CYAN CHAIN BLASTS · SMALLER RANGE',{fontSize:'13px',color:'#9af2ff',backgroundColor:'#142332',padding:{x:8,y:4}}).setOrigin(.5).setDepth(8);
};
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1100,height:650,scene:[scene],audio:{noAudio:true},banner:false});
