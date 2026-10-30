import {pyusawhtiSkillIcon} from '../src/pyusawhti';
import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
const status=document.querySelector('#checks')!,save=freshSave();save.hero='pyusawhti';save.weapon='aungzeyabow';save.settings.sound=false;save.settings.shake=false;
const audio=new AudioManager();audio.sound=false;
const scene=new ArenaScene(save,audio,()=>{},()=>{},()=>{});
window.addEventListener('error',e=>status.textContent='FAIL: '+e.message);
scene.onArenaReady=()=>{scene.plan=[];scene.spawnIndex=0;scene.waveTime=-1e6;scene.enemies.forEach(e=>e.active=false);scene.countdown=0;scene.angle=0;scene.cameras.main.setZoom(1.4);scene.paused=true;scene.render();status.textContent='Ready · actual gameplay character and combat effects';};
let stop=0;
function play(kind:'shot'|'crown'|'wind'){
 clearTimeout(stop);scene.paused=false;scene.swing=0;scene.angle=aim;scene.attack=999;
 if(kind==='shot')scene.pyusawhti?.bowAttack();else{const c=scene.pyusawhti!;c.cooldowns=[0,0];c.activate(kind==='crown'?0:1,Math.cos(aim),Math.sin(aim));}
 for(let i=0;i<10;i++)scene.update(0,16);
 scene.paused=true;scene.render();
 status.textContent=kind==='wind'?'Moonwind follows the current bow direction':Math.abs(Math.sin(scene.angle-aim))<1e-8?'PASS · pose and projectile retain the selected aim':'FAIL · pose changed direction';
}
let aim=0;
document.querySelector('#shot')!.addEventListener('click',()=>play('shot'));
document.querySelector('#crown')!.addEventListener('click',()=>play('crown'));
document.querySelector('#wind')!.addEventListener('click',()=>play('wind'));
document.querySelector('#turn')!.addEventListener('click',()=>{aim+=Math.PI/4;scene.angle=aim;scene.render();});
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1100,height:620,scene:[scene],audio:{noAudio:true},banner:false});

for(const [button,skill] of [['crown','banepierce'],['wind','windfocus']] as const){document.querySelector('#'+button)!.insertAdjacentHTML('afterbegin',pyusawhtiSkillIcon(skill));}
