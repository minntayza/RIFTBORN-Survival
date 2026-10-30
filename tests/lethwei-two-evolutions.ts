import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
const save=freshSave();save.hero='lethwei';save.weapon='hempwraps';save.settings.sound=false;save.settings.shake=false;
const audio=new AudioManager();audio.sound=false;
const s=new ArenaScene(save,audio,()=>{},()=>{},()=>{}),status=document.querySelector('#checks')!;
const lines:string[]=[];const check=(name:string,pass:boolean)=>{lines.push(`${pass?'PASS':'FAIL'} · ${name}`);status.textContent=lines.join('\n');};
window.addEventListener('error',e=>status.textContent+='\nFAIL · '+e.message);
s.onArenaReady=()=>{
 s.plan=[];s.spawnIndex=0;s.waveTime=-1e6;s.xpNeed=1e9;s.countdown=0;s.attack=999;s.enemies.forEach(e=>e.active=false);s.paused=false;
 for(const id of ['ironshins','ringmaster']){for(let i=0;i<3;i++)s.apply(id);s.apply('evolve:'+id);}
 const l=s.lethwei!,hits:{source:string;damage:number}[]=[],realHit=s.hit.bind(s);
 s.hit=(e,damage,knock,bullet,elemental,source)=>{const hp=e.hp;realHit(e,damage,knock,bullet,elemental,source);hits.push({source:source||'',damage:Math.min(hp,hp-e.hp)});};
 const e=s.spawn('basic')!;e.hp=e.max=1e6;e.speed=0;e.damage=0;
 const origin={x:s.x,y:s.y};let peakStun=0;
 for(let i=0;i<360;i++){s.x=origin.x+i/2;e.x=s.x+30;e.y=s.y;e.stagger=Math.max(0,e.stagger-1/60);l.update(1/60);peakStun=Math.max(peakStun,e.stagger);}
 const kicks=hits.filter(h=>h.source==='Iron Shins');check(`Real combat: ${kicks.length} evolved kicks in 6s; ${Math.round(kicks.reduce((n,h)=>n+h.damage,0))} damage`,kicks.length===4);
 check('Evolved kick applies a 0.7s stun',Math.abs(peakStun-.7)<1e-8);
 l.clear();hits.length=0;s.x=origin.x;s.y=origin.y;e.x=s.x;e.y=s.y;l.cooldowns=[0,0];l.activate(1);
 check('Colosseum summons two gameplay clones',l.clones.length===2);
 check('Inside ring: 20% damage reduction',l.damageReductionMultiplier===.8);
 let bothAttacked=false;for(let i=0;i<600;i++){l.update(.01);if(l.clones.length===2&&l.clones.every(c=>c.punchSequence>1))bothAttacked=true;}
 const punches=hits.filter(h=>h.source==='Spirit Clone Strike');check(`Real combat: ${punches.length} clone punches; ${Math.round(punches.reduce((n,h)=>n+h.damage,0))} damage in 6s (knockback enabled)`,punches.length>0&&punches.length<=20&&bothAttacked);
 l.update(.02);check('Ring and both clones expire together',!l.ring.active&&l.clones.length===0);
 l.clear();l.cooldowns=[0,0];hits.length=0;l.activate(1);e.x=s.x+175;e.y=s.y;
 for(let i=0;i<300;i++){e.x=s.x+175;l.update(.01);}
 check('Boundary pressure: 5 rope hits in 3s',hits.filter(h=>h.source==='Ring Ropes').length===5);
 l.clear();l.cooldowns=[0,0];l.activate(1);e.x=s.x+30;e.y=s.y;l.update(.35);
 s.paused=true;s.cameras.main.setZoom(1.35);s.render();
};
document.querySelector('#rerun')!.addEventListener('click',()=>location.reload());
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1000,height:600,scene:[s],audio:{noAudio:true},banner:false});
