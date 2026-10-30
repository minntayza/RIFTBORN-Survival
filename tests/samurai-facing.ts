import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {AudioManager} from '../src/audio';
import {freshSave} from '../src/save';
import {COSMETICS,buyCosmetic,equipCosmetic} from '../src/cosmetics';
const save=freshSave();save.hero='samurai';save.weapon='nodachi';save.heroes.push('samurai');save.petals=100000;
const outfit=COSMETICS.find(c=>c.kind==='character'&&c.target==='samurai'&&c.asset?.includes('moon-atlas'))!;
buyCosmetic(save,outfit.id);equipCosmetic(save,outfit.id);
const audio=new AudioManager();audio.sound=false;audio.music=false;
const scene=new ArenaScene(save,audio,()=>{},()=>{},()=>{});
function show(aim:number){
 scene.paused=true;scene.angle=aim;scene.cameras.main.setZoom(2.8);
 scene.visuals.render([],'samurai','nodachi',scene.x,scene.y,aim,1,0,0,0,false,0,10);
 const body=scene.children.list.find((c):c is Phaser.GameObjects.Image=>c instanceof Phaser.GameObjects.Image&&c.visible&&c.texture.key.startsWith('cute-samurai-'));
 document.querySelector('#status')!.textContent=body?.flipX===(Math.cos(aim)>=0)?'PASS · face and blade point '+(aim===0?'right':'left'):'FAIL · incorrect mirroring';
}
scene.onArenaReady=()=>{scene.enemies.forEach(e=>e.active=false);scene.countdown=0;show(0);};
document.querySelector('#right')!.addEventListener('click',()=>show(0));
document.querySelector('#left')!.addEventListener('click',()=>show(Math.PI));
new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:900,height:500,scene:[scene],audio:{noAudio:true},banner:false});
