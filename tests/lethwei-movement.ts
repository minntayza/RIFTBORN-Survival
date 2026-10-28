import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {FIGHTER_PARTS,LETHWEI_ART} from '../src/lethwei-rig';
const save=freshSave();save.hero='lethwei';save.weapon='hempwraps';save.settings.sound=false;save.settings.shake=false;
const audio=new AudioManager();audio.sound=false;
const scene=new ArenaScene(save,audio,()=>{scene.xp=0;scene.paused=false;},()=>{},()=>{scene.paused=!scene.paused;});
const checks:string[]=[];
function check(name:string,ok:boolean){checks.push(`${ok?'PASS':'FAIL'} · ${name}`);document.querySelector('#checks')!.textContent=checks.join('\n');}
function step(n:number){scene.paused=false;for(let i=0;i<n;i++)scene.update(0,16);scene.paused=true;}
scene.onArenaReady=()=>{
 scene.plan=[];scene.spawnIndex=0;scene.waveTime=-1e6;scene.xpNeed=1e9;scene.enemies.forEach(e=>e.active=false);scene.countdown=0;scene.render();
 check('All seven fighter textures load in the combat renderer',FIGHTER_PARTS.every(p=>scene.textures.exists(LETHWEI_ART.key+'-'+p)));
 scene.x=600;scene.y=380;const start=scene.x;scene.touch={enabled:true,x:1,y:0};step(20);scene.touch={enabled:false,x:0,y:0};
 check('Movement runs through the actual game update',scene.x>start+20);
 scene.angle=0;scene.attack=0;scene.basicAttack();
 check('Basic attack drives the fighter punch timer',scene.swing>0&&scene.attackSequence>0);
 step(30);check('Punch returns to guard',scene.swing===0);
 scene.cameras.main.setZoom(2);scene.paused=true;scene.render();
 const e=scene.spawn('basic');if(e){e.x=scene.x+90;e.y=scene.y;e.hp=e.max=1e6;e.speed=0;e.damage=0;}
};
document.querySelector<HTMLButtonElement>('#pause')!.onclick=e=>{scene.paused=!scene.paused;if(!scene.paused)scene.tweens.resumeAll();(e.target as HTMLButtonElement).textContent=scene.paused?'Resume':'Pause';};
document.querySelector('#punch')!.addEventListener('click',()=>{scene.paused=true;scene.attack=0;scene.angle=0;scene.basicAttack();step(7);scene.tweens.pauseAll();scene.render();});
document.querySelector('#chin')!.addEventListener('click',()=>{const l=scene.lethwei;if(!l)return;const old=l.equipped[0];l.equipped[0]='ironchin';l.cooldowns[0]=0;scene.paused=false;l.activate(0);step(18);l.onDamageTaken(10);step(5);scene.tweens.pauseAll();scene.render();l.equipped[0]=old;check('Iron Chin retains 50% damage reduction',l.damageReductionMultiplier===.5);});
document.querySelector('#ring')!.addEventListener('click',()=>{if(!scene.lethwei)return;scene.paused=false;scene.lethwei.cooldowns[1]=0;scene.lethwei.activate(1);step(18);scene.tweens.pauseAll();scene.render();});
document.querySelector('#blitz')!.addEventListener('click',()=>{if(!scene.lethwei)return;scene.paused=false;scene.lethwei.cooldowns[0]=0;scene.lethwei.activate(0,1,0);step(23);scene.tweens.pauseAll();scene.render();});
document.querySelector('#spirit')!.addEventListener('click',()=>{const e=scene.enemies.find(e=>e.active);if(!e)return;e.x=scene.x+25;e.y=scene.y;scene.identityCharge=100;const procs=scene.identityProcs;scene.paused=true;scene.attack=0;scene.angle=0;scene.basicAttack();step(7);scene.tweens.pauseAll();scene.render();check('Warrior Spirit fires on contact and consumes its charge',scene.identityProcs===procs+1&&scene.identityCharge<100);});
document.querySelector('#walk')!.addEventListener('click',()=>{scene.touch={enabled:true,x:1,y:0};step(8);scene.touch={enabled:false,x:0,y:0};scene.render();});
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1100,height:620,scene:[scene],audio:{noAudio:true},banner:false});
