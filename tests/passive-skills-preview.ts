import Phaser from 'phaser';
import '../src/style.css';
import {ArenaScene} from '../src/combat';
import {AudioManager} from '../src/audio';
import {freshSave} from '../src/save';
const audio=new AudioManager();audio.sound=false;audio.music=false;
const s=new ArenaScene(freshSave(),audio,()=>{},()=>{},()=>{});
const bar=document.createElement('div');bar.style.cssText='position:fixed;top:12px;left:12px;z-index:100;background:#14232ded;padding:14px;border-radius:12px;display:flex;gap:15px;flex-wrap:wrap';
bar.innerHTML='<label><input type="checkbox" id="ember" checked> Ember Circle</label><label>Fire level <select id="fire-level"><option>1</option><option>2</option><option>3</option><option selected>4</option></select></label><label><input type="checkbox" id="ally"> Phantom Ally</label><label><input type="checkbox" id="full"> Evolved</label><button id="smoke-preview">Smoke Bomb</button><button id="critical-preview">Critical hit</button>';document.body.append(bar);
new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:900,height:650,scene:[s],scale:{mode:Phaser.Scale.RESIZE},audio:{noAudio:true}});
let last=-1;
s.onArenaReady=()=>{s.paused=true;for(const e of s.enemies)e.active=false;s.events.on('postupdate',()=>{const t=performance.now()/1000,full=(document.querySelector('#full') as HTMLInputElement).checked;s.levels.fire=(document.querySelector('#ember') as HTMLInputElement).checked?Number((document.querySelector('#fire-level') as HTMLSelectElement).value):0;s.cardEvolutions.fire=full;s.cardEvolutions.clone=full;s.clone=(document.querySelector('#ally') as HTMLInputElement).checked?5-t%5:0;s.elapsed=t;s.tick=t%1;s.angle=0;s.swing=t%1.6<.4?.4-t%1.6:0;if(Math.floor(t)!==last){last=Math.floor(t);s.visuals.phantomStrike(t);}s.render();});};

bar.querySelector('#smoke-preview')!.addEventListener('click',()=>{const level=Number((document.querySelector('#fire-level') as HTMLSelectElement).value);s.visuals.smokeBomb(s.x,s.y,145+Math.min(3,level)*28,Math.min(3,level),(document.querySelector('#full') as HTMLInputElement).checked,s.elapsed);});

bar.querySelector('#critical-preview')!.addEventListener('click',()=>s.visuals.criticalHit(s.x+48,s.y-12,s.elapsed));
