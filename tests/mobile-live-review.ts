import {observeGameViewport} from '../src/viewport';
import '../src/style.css';
import '../src/combat-layout.css';
import '../src/art-direction.css';
import '../src/mobile-combat.css';
import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {AudioManager} from '../src/audio';
import {freshSave} from '../src/save';
import {combatHud,abilityIcons} from '../src/combat-hud';
import {updateHud} from '../src/hud-dom';
import {TouchControls} from '../src/touch';
const params=new URLSearchParams(location.search);
let scene:ArenaScene,game:Phaser.Game|undefined,touch:TouchControls|undefined,right=params.get('side')==='right',state=0;let stopViewport:(()=>void)|undefined;
const hud=document.querySelector<HTMLElement>('#hud')!;
function render(){if(!scene?.visuals||!touch)return;updateHud(hud,combatHud(scene,true,right));touch.update(true,scene.ability,'Shadow Dash',6,abilityIcons[scene.hero],state===2,!!scene.heroAbilities);}
function start(hero:'ninja'|'samurai'|'tank'){stopViewport?.();game?.destroy(true);touch?.destroy();const save=freshSave();save.hero=hero;save.weapon=hero==='ninja'?'katana':hero==='tank'?'shield':'nodachi';save.settings.sound=false;save.settings.music=false;save.settings.mapView=params.get('map')==='2'?2:1;scene=new ArenaScene(save,new AudioManager(),()=>{},()=>{},()=>{},{mode:params.get('mode')==='daily'?'daily':'endless',build:'assault',technique:'standard'});touch=new TouchControls(()=>{scene.ability=6;render();});touch.state.enabled=true;touch.setLayout(right?'right':'left',135);scene.touch=touch.state;
scene.onArenaReady=()=>{scene.paused=true;scene.countdown=0;scene.hp=82;scene.xp=14;scene.xpNeed=30;scene.level=4;scene.stats.wave=3;render();scene.events.on('postupdate',()=>scene.render());setTimeout(()=>{const stick=touch!.element.querySelector<HTMLElement>('.touch-stick')!;stick.setPointerCapture=()=>{};verifyUpdates();reportLayout();},100);};
game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:innerWidth,height:innerHeight,scene:[scene],audio:{noAudio:true},banner:false,scale:{mode:Phaser.Scale.RESIZE}});stopViewport=observeGameViewport(document.querySelector<HTMLElement>('#game')!, (width,height)=>{touch?.reset();game?.scale.resize(width,height);requestAnimationFrame(reportLayout);});}
hud.addEventListener('pointerdown',e=>{const action=(e.target as Element).closest<HTMLElement>('[data-hud]')?.dataset.hud;if(action==='mapView'){scene.save.settings.mapView=scene.save.settings.mapView===2?1:2;scene.applyMapView();render();}else if(action?.startsWith('hero-skill-')){scene.heroAbilities!.cooldowns[Number(action.slice(-1))]=5;render();}});
document.querySelector('#hero')!.addEventListener('change',e=>start((e.target as HTMLSelectElement).value as 'samurai'|'ninja'|'tank'));
document.querySelector('#side')!.addEventListener('click',()=>{right=!right;touch?.setLayout(right?'right':'left',135);render();});
document.querySelector('#states')!.addEventListener('click',()=>{state=(state+1)%3;scene.ability=state===1?4:0;if(scene.heroAbilities){scene.heroAbilities.cooldowns.splice(0,2,state===1?4:0,0);scene.counter=state===2?.2:0;}render();});
document.querySelector('#live')!.addEventListener('click',()=>{scene.paused=!scene.paused;document.querySelector('#live')!.textContent=scene.paused?'Resume live combat':'Pause live combat';});
setInterval(()=>{render();const out=document.querySelector('#live-proof');if(out)out.textContent=`Position ${Math.round(scene.x)},${Math.round(scene.y)} · HP ${Math.ceil(scene.hp)} · Kills ${scene.stats.kills}`;},100);start(params.get('hero')==='ninja'?'ninja':params.get('hero')==='tank'?'tank':'samurai');
// Exercise the actual stable-node renderer while a movement pointer and skill focus are live.
function verifyUpdates(){if(!touch||!scene.visuals)return;const stick=touch.element.querySelector<HTMLElement>('.touch-stick')!,button=hud.querySelector<HTMLButtonElement>('.zawgyi-skill')||touch.element.querySelector<HTMLButtonElement>('.touch-ability')!;
const r=stick.getBoundingClientRect();stick.dispatchEvent(new PointerEvent('pointerdown',{pointerId:91,clientX:r.x+r.width*.8,clientY:r.y+r.height/2,bubbles:true,cancelable:true}));button.focus();const moving=touch.state.x;
for(let i=0;i<10;i++)render();const stable=button.isConnected&&document.activeElement===button&&touch.state.x===moving&&moving>0;
button.dispatchEvent(new PointerEvent('pointerdown',{pointerId:92,bubbles:true,cancelable:true}));const simultaneous=touch.state.x===moving&&(scene.heroAbilities?scene.heroAbilities.cooldowns[0]>0:scene.ability>0);stick.dispatchEvent(new PointerEvent('pointerup',{pointerId:91,bubbles:true}));document.querySelector('#proof')!.textContent=stable&&simultaneous?'PASS · focus, held movement and skill input survive 10 HUD updates':'FAIL · update retention';}
// Synthetic pointer capture has no browser pointer; skip capture only in this isolated fixture.


function reportLayout(){const buttons=Array.from(document.querySelectorAll<HTMLElement>('.zawgyi-skill,.touch-ability')).filter(e=>getComputedStyle(e).display!=='none'),stick=touch!.element.querySelector<HTMLElement>('.touch-stick')!.getBoundingClientRect();const rects=buttons.map(e=>e.getBoundingClientRect());const overlap=rects.some(r=>Math.hypot(r.x+r.width/2-stick.x-stick.width/2,r.y+r.height/2-stick.y-stick.height/2)<(r.width+stick.width)/2);const ok=buttons.length===(scene.hero==='ninja'?1:2)&&rects.every(r=>r.width>=44&&r.x>=0&&r.right<=innerWidth&&r.y>=0&&r.bottom<=innerHeight)&&!overlap&&document.querySelector('#proof')!.textContent!.startsWith('PASS');parent.postMessage({mobileHud:ok,case:params.get('case'),size:[innerWidth,innerHeight],diameter:rects[0]?.width},location.origin);}

document.querySelector('#camp-warning')!.addEventListener('click',()=>{if(!scene.camp)return;scene.camp.hurt(70,scene.elapsed);const e=scene.spawn('brute',1,.5,'zombie');if(e){e.x=scene.camp.x+160;e.y=scene.camp.y;scene.siegeEnemies.add(e);scene.siegeWindups.set(e,.8);}const boss=scene.spawn('boss',0,.5,'zombie');if(boss){boss.x=scene.x+180;boss.y=scene.y+100;}render();});
document.querySelector('#camp-calm')!.addEventListener('click',()=>{if(!scene.camp)return;scene.camp.hp=600;scene.camp.hitAt=-10;scene.enemies.forEach(e=>e.active=false);scene.siegeEnemies.clear();scene.siegeWindups.clear();render();});

document.querySelector('#hide-checks')!.addEventListener('click',()=>{(document.querySelector('#tools') as HTMLElement).style.display='none';});
