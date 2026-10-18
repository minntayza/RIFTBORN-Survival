import Phaser from 'phaser';
import '../src/style.css';
import {ArenaScene} from '../src/combat';
import {AudioManager} from '../src/audio';
import {freshSave} from '../src/save';
import {WEAPONS,type WeaponId,type HeroId} from '../src/config';
const save=freshSave(),audio=new AudioManager();audio.sound=false;audio.music=false;
const s=new ArenaScene(save,audio,()=>{},()=>{},()=>{});
new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:900,height:650,scene:[s],scale:{mode:Phaser.Scale.RESIZE},audio:{noAudio:true}});
const controls=document.createElement('div');controls.style.cssText='position:fixed;z-index:100;left:12px;top:12px;display:flex;gap:8px;flex-wrap:wrap;background:#14232ded;padding:12px;border-radius:12px';
controls.innerHTML=`<select aria-label="Weapon">${Object.entries(WEAPONS).map(([id,w])=>`<option value="${id}">${w.name}</option>`).join('')}</select><select aria-label="Element"><option value="reach">Lightning</option><option value="power">Wildfire</option><option value="tempo">Phantom</option></select><label><input type="checkbox" aria-label="Full evolution"> Full evolution</label><span style="font-size:12px">Live gameplay art · automatic attacks</span>`;document.body.append(controls);
controls.querySelector<HTMLSelectElement>('[aria-label=Weapon]')!.value='katana';
s.onArenaReady=()=>{s.paused=true;for(const e of s.enemies)e.active=false;s.events.on('postupdate',()=>{
 const weapon=controls.querySelector<HTMLSelectElement>('[aria-label=Weapon]')!.value as WeaponId,hero=WEAPONS[weapon].hero as HeroId,element=controls.querySelector<HTMLSelectElement>('[aria-label=Element]')!.value as 'reach'|'power'|'tempo',level=controls.querySelector<HTMLInputElement>('input')!.checked?2:1;
 s.hero=hero;s.weapon=weapon;s.evolution={reach:0,power:0,tempo:0};s.evolution[element]=level;s.elapsed=performance.now()/1000;s.swing=(s.elapsed%1.6)<.5?.5-(s.elapsed%1.6):0;s.angle=Math.sin(s.elapsed*.4)*.4;s.render();
 });};
