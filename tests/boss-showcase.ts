import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
const scene=new ArenaScene(freshSave(),new AudioManager(),()=>{},()=>{},()=>{});
new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:innerWidth,height:innerHeight,scene:[scene],scale:{mode:Phaser.Scale.RESIZE},audio:{noAudio:true}});
let chosen='boss',timer=0;
function cast(){
 scene.bossMarks=[];scene.enemyBursts=[];for(const e of scene.enemies)e.active=false;
 scene.stats.wave=chosen==='reactor'?15:10;scene.x=600;scene.y=430;scene.drawFloor();scene.cameras.main.centerOn(600,380);
 const e=scene.spawn(chosen==='reactor'?'boss':chosen as 'boss'|'shooterBoss'|'commander')!;
 e.x=440;e.y=340;e.phase=chosen==='shooterBoss'?2:0;e.telegraph=chosen==='shooterBoss'?.9:1.15;e.targetX=660;e.targetY=430;e.attack=999;
 scene.markBoss(e);scene.invuln=999;timer=0;
 document.querySelector('#status')!.textContent='Automatic replay · wind-up → marked impact → recovery. Ordinary zombie stats unchanged.';
}
for(const b of Array.from(document.querySelectorAll<HTMLButtonElement>('button')))b.onclick=()=>{chosen=b.dataset.type!;if(scene.visuals)cast();};
const ready=setInterval(()=>{if(!scene.visuals)return;clearInterval(ready);scene.paused=true;cast();let last=performance.now();
 const tick=(now:number)=>{const dt=Math.min(.04,(now-last)/1000);last=now;timer+=dt;scene.elapsed+=dt;
 scene.updateEnemies(dt);scene.render();if(timer>3.5)cast();requestAnimationFrame(tick);};requestAnimationFrame(tick);
},50);
