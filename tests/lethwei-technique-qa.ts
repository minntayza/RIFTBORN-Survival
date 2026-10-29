import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {UPGRADES} from '../src/upgrades';
import {WEAPONS} from '../src/config';
const save=freshSave();save.hero='lethwei';save.weapon='hempwraps';save.settings.sound=false;save.settings.shake=false;
const audio=new AudioManager();audio.sound=false;const checks:string[]=[];
const check=(name:string,ok:boolean)=>{checks.push(`${ok?'PASS':'FAIL'} · ${name}`);document.querySelector('#checks')!.textContent=checks.join('\n');};
const s=new ArenaScene(save,audio,()=>{},()=>{},()=>{});
function step(n:number){s.paused=false;for(let i=0;i<n;i++)s.update(0,16);s.paused=true;}
s.onArenaReady=()=>{
 s.plan=[];s.spawnIndex=0;s.waveTime=-1e6;s.xpNeed=1e9;s.countdown=0;s.enemies.forEach(e=>e.active=false);s.x=600;s.y=380;s.attack=999;
 for(const id of ['nineweapons','ironshins','headbutt','ringmaster','goldenbelt']){const u=UPGRADES.find(u=>u.id===id)!;for(let i=0;i<u.max;i++)s.apply(id);s.apply('evolve:'+id);check(id+' evolution applies',s.evolved(id));}
 const e=s.spawn('basic')!;e.hp=e.max=1e6;e.speed=0;e.damage=0;
 s.hp=s.maxHp*.4;const hp=s.hp;
 for(let i=1;i<=6;i++){e.x=s.x+25;e.y=s.y+5;s.attackSequence++;s.resolveStrike({weapon:'hempwraps',damage:25,range:WEAPONS.hempwraps.range,arc:2.4,echo:false,angle:0,sequence:s.attackSequence});step(18);}
 step(25);
 check('Real punches trigger elbow / kick follow-ups',(s.damageSources['Nine Limbs Combo']||0)>0);
 check('Real punches trigger evolved claw damage',(s.damageSources['Roaring Tiger']||0)>0);
 check('Running / lunge proximity triggers Iron Shins',(s.damageSources['Iron Shins']||0)>0);
 check('Five real punch contacts trigger Headbutt',(s.damageSources['Lethwei Headbutt']||0)>0);
 check('Actual damage heals through Golden Champion',s.hp>hp);
 s.hp=s.maxHp*.25;s.invuln=0;const before=s.hp;s.hurt(20);check('Low-health hit is blocked by emergency invulnerability',s.hp===before&&s.invuln>=3);
 const l=s.lethwei!;s.paused=false;l.activate(1);s.paused=true;check('Evolved ring summons two spirit fighters',l.clones.length===2);
 s.x=l.ring.x+l.ring.radius-10;s.y=l.ring.y;l.techniques.update(.01,l.ring);s.x+=2;l.techniques.update(.01,l.ring);
 check('Outward rope contact empowers next punch',l.techniques.reboundMultiplier>1);
 s.x=l.ring.x;s.y=l.ring.y;e.x=s.x+28;e.y=s.y;l.techniques.onBasicContact(100,0);l.techniques.onBasicContact(101,0);l.techniques.onBasicContact(102,0);l.techniques.update(.35,l.ring);
 s.cameras.main.setZoom(1.45);l.update(.12);s.paused=true;s.render();
};
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1100,height:620,scene:[s],audio:{noAudio:true},banner:false});
