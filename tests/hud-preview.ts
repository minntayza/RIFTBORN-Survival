import Phaser from 'phaser';
import '../src/style.css';
import '../src/combat-layout.css';
import {ArenaScene} from '../src/combat';
import {AudioManager} from '../src/audio';
import {freshSave} from '../src/save';
import {combatHud,abilityIcons,buildDetails} from '../src/combat-hud';
import {TouchControls} from '../src/touch';
const s=new ArenaScene(freshSave(),new AudioManager(),()=>{},()=>{},()=>{});
const game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:390,height:844,scene:[s],scale:{mode:Phaser.Scale.RESIZE},audio:{noAudio:true}});
game.events.once('ready',()=>setTimeout(()=>{
 s.stats.wave=8;s.level=9;s.xp=22;s.xpNeed=40;s.hp=72;s.levels={damage:3,wide:2,orbit:3,crit:2,speed:2,regen:1,double:1};s.cardEvolutions.orbit=true;s.identityCharge=100;s.elapsed=10;s.waveTime=22;s.paused=true;s.landmark=undefined;
 for(const e of s.enemies)e.active=false;
 for(let i=0;i<13;i++){const e=s.spawn(i%3?'basic':'runner');if(e){const a=i*.75;e.x=s.x+Math.cos(a)*(110+i*10);e.y=s.y+Math.sin(a)*(110+i*10);}}
 s.events.on('postupdate',()=>s.render());s.render();document.querySelector('#hud')!.innerHTML=combatHud(s,true);const touch=new TouchControls(()=>{});touch.state.enabled=true;touch.update(true,3,'Shadow Dash',6,abilityIcons.ninja);
 const overlay=document.querySelector<HTMLElement>('#overlay')!;document.querySelector('#hud')!.addEventListener('click',e=>{if((e.target as Element).closest('[data-hud]')){overlay.style.display='grid';overlay.innerHTML=`<section class="panel wide"><h2>Your Build</h2><p class="muted">The run is paused.</p>${buildDetails(s)}<div class="actions"><button id="close-build">Resume →</button></div></section>`;touch.update(false,0,'');overlay.querySelector('#close-build')!.addEventListener('click',()=>{overlay.style.display='none';touch.update(true,0,'Shadow Dash',6,abilityIcons.ninja);});}});
},100));
