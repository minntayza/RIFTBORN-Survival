import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
const save=freshSave();save.settings.sound=false;save.settings.shake=false;
const audio=new AudioManager();audio.sound=false;
const results=document.getElementById('results')!;
const scene=new ArenaScene(save,audio,()=>{},()=>{},()=>{});
const checks:string[]=[];
function check(name:string,ok:boolean){checks.push(`${ok?'PASS':'FAIL'} · ${name}`);results.textContent=checks.join('\n');}
function reset(){scene.paused=true;scene.enemies.forEach(e=>e.active=false);scene.plan=[];scene.bullets.forEach(b=>b.active=false);scene.waiting=false;scene.countdown=0;}
scene.onArenaReady=()=>{
 reset();scene.levels.health=5;scene.apply('evolve:health');scene.paused=true;
 check('Evolution immediately grants two seconds of armour',scene.ironHeart.remaining===2);
 scene.invuln=0;scene.rewardShield=0;scene.waveWard=false;scene.counter=0;scene.hp=scene.maxHp;
 const before=scene.hp;scene.hurt(40);check('Armour reduces a 40 damage hit to 10',Math.abs(before-scene.hp-10)<.001);
 scene.ironHeart.tick(2);scene.invuln=0;const unprotected=scene.hp;scene.hurt(40);check('Armour expires after two seconds',Math.abs(unprotected-scene.hp-40)<.001);
 reset();scene.stats.wave=10;scene.nextWave();scene.nextWave();
 check('Wave 10 opens one gate without a countdown',!!scene.areaGate&&scene.countdown===0&&scene.stats.wave===10);
 scene.paused=false;scene.update(0,40);scene.paused=true;
 check('Waiting outside the gate does not start wave 11',scene.stats.wave===10);
 scene.render();
};
document.getElementById('armour')!.onclick=()=>{scene.paused=true;scene.ironHeart.activate();scene.render();};
document.getElementById('gate')!.onclick=()=>{reset();scene.stats.wave=10;scene.drawFloor();scene.nextWave();scene.paused=true;scene.render();};
document.getElementById('enter')!.onclick=()=>{
 const gate=scene.areaGate;if(!gate)return;scene.x=gate.x;scene.y=gate.y;scene.paused=false;scene.update(0,16);scene.paused=true;
 check('Entering the gate starts wave 11 on the robot map',scene.stats.wave===11&&scene.floorTheme===1&&!scene.areaGate&&!scene.waiting);
 check('Transition removes the gate label and old enemies',!scene.gateLabel&&!scene.enemies.some(e=>e.active));scene.render();
};
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1100,height:680,scene:[scene],audio:{noAudio:true},banner:false});
