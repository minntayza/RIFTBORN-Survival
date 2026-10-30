import Phaser from 'phaser';
import {CampGuardian} from '../src/camp-guardian';
import {ArenaScene,type Enemy} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
const audio=new AudioManager();audio.sound=audio.music=false;
const scene=new ArenaScene(freshSave(),audio,()=>{},()=>{},()=>{},{mode:'daily',build:'assault',technique:'standard',hero:'zawgyi',weapon:'mysticstaff',seed:1,practice:true});
const status=document.querySelector('#checks')!;
let attackers:Enemy[]=[],playing=false,last=0;
function reset(){
 scene.campStrikes=[];scene.siegeWindups.clear();scene.camp!.hp=600;scene.camp!.hitAt=-10;
 attackers.forEach((e,i)=>{e.x=scene.camp!.x+(i?-188:188);e.y=scene.camp!.y+28;e.attack=0;e.telegraph=0;e.stagger=0;e.campLane=i?6:0;e.campTarget=true;e.campAssignedAt=scene.elapsed;
 for(let n=0;n<1200&&!scene.siegeWindups.has(e);n++)scene.updateSiege(e,.016);});
}
function tick(dt:number){
 scene.elapsed+=dt;for(const e of attackers){e.attack-=dt;scene.updateSiege(e,dt);}
 scene.resolveCampStrikes();scene.campGuardian?.update(dt,scene.elapsed,scene.camp!.guardianLevel,scene.siegeEnemies,(e,d)=>scene.guardianHit(e,d));scene.render();
}
scene.onArenaReady=()=>{
 scene.paused=true;scene.countdown=0;scene.plan=[];scene.enemies.forEach(e=>e.active=false);
 scene.spawn('brute',0,.5,'zombie');scene.spawn('armoured',1,.5,'robot');
 const seeded=scene.random;scene.random=()=>.1;
 const assigned=scene.spawn('basic',0,.5,'zombie');if(!assigned?.campTarget)throw Error('Low seeded roll should target camp');
 scene.random=()=>.95;const hunter=scene.spawn('basic',1,.5,'robot');if(hunter?.campTarget)throw Error('High seeded roll should target survivor');
 scene.random=seeded;
 assigned.active=false;if(hunter)hunter.active=false;
 attackers=scene.enemies.filter(e=>e.active);scene.siegeEnemies=new Set(attackers);scene.x=600;scene.y=610;scene.cameras.main.centerOn(600,395);scene.cameras.main.setZoom(1.4);reset();
 const before=scene.camp!.hp;tick(1.4);
 if(scene.campStrikes.length!==2)throw Error('Both contacts must resolve');
 const zombie=scene.campStrikes.find(h=>!h.robot)!,robot=scene.campStrikes.find(h=>h.robot)!;
 if(scene.camp!.hp!==before-zombie.damage||robot.resolved)throw Error('Robot damage must wait for pulse arrival');
 tick(.101);if(scene.camp!.hp!==before-zombie.damage-robot.damage)throw Error('Impact damage mismatch');
 status.textContent='PASS · spawn target rolls, zombie contact, robot pulse arrival, damage once, and local impacts. No saved progress changed.';
 scene.camp!.reward('defense',1);scene.campGuardian=new CampGuardian(scene.camp!.x+112,scene.camp!.y+88);reset();tick(.01);playing=true;last=performance.now();
};
document.querySelector('#windup')!.addEventListener('click',()=>{playing=false;reset();tick(1.05);});
document.querySelector('#contact')!.addEventListener('click',()=>{playing=false;reset();tick(1.4);tick(.13);});
document.querySelector('#play')!.addEventListener('click',()=>{playing=!playing;last=performance.now();});
function frame(now:number){if(playing)tick(Math.min(.03,(now-last)/1000));if(!playing&&scene.campArt)scene.render();last=now;requestAnimationFrame(frame);}requestAnimationFrame(frame);
window.addEventListener('error',e=>status.textContent='FAIL · '+e.message);
new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:1000,height:610,scene:[scene],audio:{noAudio:true},banner:false});

document.querySelector('#arrival')!.addEventListener('click',()=>{scene.campArt?.summon(true);});
document.querySelector('#finale')!.addEventListener('click',()=>{scene.campArt?.finalStand();});
document.querySelector('#victory')!.addEventListener('click',()=>{scene.campArt?.celebrate();});
