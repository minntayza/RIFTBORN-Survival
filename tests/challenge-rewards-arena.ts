import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {AudioManager} from '../src/audio';
import {freshSave} from '../src/save';
import {FOX_RONIN_REWARD} from '../src/challenge-rewards';
const audio=new AudioManager();audio.sound=false;audio.music=false;
const scene=new ArenaScene(freshSave(),audio,()=>{},()=>{},()=>{});
const status=document.querySelector('#checks')!;
scene.onArenaReady=()=>{
 const lines:string[]=[];const check=(condition:boolean,label:string)=>{if(!condition)throw Error(label);lines.push('PASS · '+label);};
 try{
 scene.paused=true;scene.countdown=0;scene.plan=[];scene.spawnIndex=0;scene.enemies.forEach(e=>e.active=false);
 scene.stats.wave=15;scene.finishWave();check(!scene.save.heroes.includes('lethwei')&&scene.save.bestClearedWave===15,'Actual Wave 15 clear makes Lethwei claimable without ownership');check(scene.challengeUnlocks.includes('lethwei'),'Unlock celebration is queued');
 scene.save=freshSave();scene.waiting=false;scene.ended=false;scene.options={mode:'daily',build:'assault',technique:'standard'};scene.stats.wave=10;scene.bossDefeated=true;scene.finishWave();check(!scene.save.cosmetics.owned.includes(FOX_RONIN_REWARD)&&scene.save.firstDailyCleared,'Daily victory makes Fox Ronin claimable without ownership');
 scene.save=freshSave();scene.waiting=false;scene.ended=false;scene.options={mode:'daily',build:'assault',technique:'standard',practice:true};scene.finishWave();check(!scene.save.cosmetics.owned.includes(FOX_RONIN_REWARD)&&scene.save.bestClearedWave===0,'Practice grants no challenge rewards or progress');
 status.textContent=lines.join('\n');
 }catch(e){status.textContent=lines.join('\n')+'\nFAIL · '+e;}
};
new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:600,height:350,scene:[scene],audio:{noAudio:true},banner:false});
