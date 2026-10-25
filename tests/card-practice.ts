import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {HEROES,WEAPONS,type HeroId,type WeaponId} from '../src/config';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {HERO_ABILITIES} from '../src/hero-abilities';
import {ZAWGYI_SKILLS,validZawgyiLoadout} from '../src/zawgyi';
import {observeGameViewport} from '../src/viewport';
const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const hero=el<HTMLSelectElement>('hero'),weapon=el<HTMLSelectElement>('weapon'),card=el<HTMLSelectElement>('card'),arts=el<HTMLSelectElement>('arts');
let scene:ArenaScene|undefined,game:Phaser.Game|undefined,stopResize:(()=>void)|undefined,view:1|2=1,launchId=0;
hero.innerHTML=Object.entries(HEROES).map(([id,h])=>`<option value="${id}">${h.name}</option>`).join('');hero.value='zawgyi';
function choices(){const selected=card.value;card.innerHTML=UPGRADES.filter(u=>(!u.hero||u.hero===hero.value)&&!(weapon.value==='hammer'&&['stamina','block','reflect','spikes'].includes(u.id))&&(!u.hero||u.hero!=='zawgyi'||!({twindatlone:'datlone',lotusflame:'flame',earthshaker:'slam'} as Record<string,string>)[u.id]||arts.value.split(',').includes(({twindatlone:'datlone',lotusflame:'flame',earthshaker:'slam'} as Record<string,string>)[u.id]))).map(u=>`<option value="${u.id}">${u.hero?'✦ ':''}${u.name}</option>`).join('');if(Array.from(card.options).some(o=>o.value===selected))card.value=selected;arts.hidden=hero.value!=='zawgyi';(document.querySelector('label[for="arts"]') as HTMLElement).hidden=arts.hidden;}
function weapons(){weapon.innerHTML=Object.entries(WEAPONS).filter(([,w])=>w.hero===hero.value).map(([id,w])=>`<option value="${id}">${w.name}</option>`).join('');}
function targets(){const s=scene;if(!s?.visuals)return;for(let i=0;i<10;i++){const e=s.spawn(i===0?'brute':i%4===0?'armoured':'basic');if(e){const angle=i*Math.PI*2/10,r=i%2?150:85;Object.assign(e,{x:s.x+Math.cos(angle)*r,y:s.y+Math.sin(angle)*r,hp:180,max:180,speed:22,damage:3});}}}
function refresh(){const s=scene,u=UPGRADES.find(u=>u.id===card.value);if(!u)return;const level=s?.levels[u.id]||0,evolved=!!s?.cardEvolutions[u.id];el('description').textContent=evolved?CARD_EVOLUTIONS[u.id].effect:u.description;el('rank').textContent=evolved?'✦ EVOLVED':`Level ${Math.min(level,u.max)} / ${u.max}`;el<HTMLButtonElement>('add').disabled=!s?.visuals||level>=u.max;el<HTMLButtonElement>('max').disabled=!s?.visuals||level>=u.max;el<HTMLButtonElement>('evolve').disabled=!s?.visuals||level<u.max||evolved||!CARD_EVOLUTIONS[u.id];el('build').innerHTML=UPGRADES.filter(c=>(s?.levels[c.id]||0)>0).map(c=>`<li>${s?.cardEvolutions[c.id]?CARD_EVOLUTIONS[c.id].name:c.name} · ${s?.cardEvolutions[c.id]?'Evolved':s?.levels[c.id]}</li>`).join('')||'<li>No cards · base gameplay</li>';if(s?.visuals)el('status').textContent=`HP ${Math.ceil(s.hp)}/${Math.ceil(s.maxHp)} · ${s.stats.kills} kills · Wave ${s.stats.wave}${s.paused?' · PAUSED':''}`;}
function launch(){const generation=++launchId;stopResize?.();game?.destroy(true);scene=undefined;const save=freshSave();save.hero=hero.value as HeroId;save.weapon=weapon.value as WeaponId;save.zawgyiSkills=validZawgyiLoadout(arts.value.split(','));save.settings.sound=save.settings.music=save.settings.shake=false;save.settings.mapView=view;save.settings.mapViewChosen=true;const audio=new AudioManager();audio.sound=audio.music=false;
 const s=new ArenaScene(save,audio,()=>{s.xp=0;s.paused=false;},()=>{if(generation===launchId)launch();},()=>{s.paused=!s.paused;});scene=s;
 s.onArenaReady=()=>{if(generation!==launchId)return;s.plan=[];s.spawnIndex=0;s.waveTime=-1e6;s.countdown=0;s.xpNeed=1e9;s.enemies.forEach(e=>e.active=false);targets();const skills=s.zawgyi?s.zawgyi.equipped.map(id=>ZAWGYI_SKILLS[id].name):s.heroAbilities?s.heroAbilities.equipped.map(id=>HERO_ABILITIES[id].name):[HEROES[s.hero].ability];el('skills').innerHTML=skills.map((name,i)=>`<button data-skill="${i}">${name}</button>`).join('');refresh();};s.onLoadingError=()=>el('status').textContent='Artwork failed to load. Reload to retry.';
 const host=el('game');game=new Phaser.Game({type:Phaser.AUTO,parent:host,width:host.clientWidth,height:host.clientHeight,scene:[s],audio:{noAudio:true},banner:false,scale:{mode:Phaser.Scale.RESIZE}});stopResize=observeGameViewport(host,(w,h)=>game?.scale.resize(w,h));refresh();}
hero.addEventListener('change',()=>{weapons();choices();launch();});weapon.addEventListener('change',()=>{choices();launch();});arts.addEventListener('change',()=>{choices();launch();});card.addEventListener('change',refresh);
el('add').onclick=()=>{const s=scene,u=UPGRADES.find(u=>u.id===card.value);if(s?.visuals&&u&&(s.levels[u.id]||0)<u.max)s.apply(u.id);refresh();};
el('max').onclick=()=>{const s=scene,u=UPGRADES.find(u=>u.id===card.value);if(s?.visuals&&u)while((s.levels[u.id]||0)<u.max)s.apply(u.id);refresh();};
el('evolve').onclick=()=>{scene?.apply('evolve:'+card.value);refresh();};el('reset').onclick=launch;el('enemies').onclick=targets;
el('hurt').onclick=()=>{if(scene)scene.hp=Math.max(1,scene.maxHp*.6);refresh();};
el('xp').onclick=()=>{const s=scene;if(s?.visuals)for(let i=0;i<6;i++)s.drop(s.x+Math.cos(i)*24,s.y+Math.sin(i)*24,5,false);};
el('shots').onclick=()=>{const s=scene;if(s?.visuals)for(let i=-1;i<=1;i++)s.shoot(s.x+220,s.y+i*35,Math.atan2(-i*35,-220),3,true);};
el('wave').onclick=()=>{const s=scene;if(s?.visuals){s.stats.wave=Math.min(9,s.stats.wave+1);s.startWave();s.plan=[];s.spawnIndex=0;s.waveTime=-1e6;s.countdown=0;targets();}refresh();};
el('zoom').onclick=()=>{view=view===1?2:1;if(scene?.visuals){scene.save.settings.mapView=view;scene.applyMapView();}el('zoom').textContent=`Map ${view}×`;};
el('pause').onclick=()=>{if(scene)scene.paused=!scene.paused;el('pause').textContent=scene?.paused?'Resume':'Pause';refresh();};
el('skills').onclick=e=>{const b=(e.target as Element).closest<HTMLElement>('[data-skill]'),s=scene;if(!b||!s?.visuals||s.paused)return;const slot=Number(b.dataset.skill);if(s.zawgyi){s.zawgyi.cooldowns[slot as 0|1]=0;s.zawgyi.activate(slot,1,0);}else if(s.heroAbilities){s.heroAbilities.cooldowns[slot as 0|1]=0;s.heroAbilities.activate(slot,1,0);}else{s.ability=0;s.activate(1,0);}};
weapons();choices();launch();setInterval(refresh,200);
