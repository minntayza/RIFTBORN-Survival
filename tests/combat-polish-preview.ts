import '../src/style.css';
import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {HEROES,type HeroId,type WeaponId} from '../src/config';
import {combatHud,abilityIcons} from '../src/combat-hud';
import {updateHud} from '../src/hud-dom';
import {TouchControls} from '../src/touch';
let game:Phaser.Game|undefined,s:ArenaScene|undefined,touch:TouchControls|undefined,wide=false,touchMode=false;
const defaults:Record<HeroId,WeaponId>={ninja:'katana',samurai:'nodachi',gunner:'pistols',tank:'shield',zawgyi:'mysticstaff'},proof=document.querySelector('#proof')!,lines:string[]=[];
function assert(value:unknown,message:string){if(!value)throw Error(message);}
async function launch(hero:HeroId,verify=false){game?.destroy(true);touch?.destroy();await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));return new Promise<void>((resolve,reject)=>{
 const save=freshSave();save.hero=hero;save.heroes.push(hero);save.weapon=defaults[hero];save.settings.sound=false;save.settings.music=false;save.settings.shake=false;save.settings.mapView=wide?2:1;
 const audio=new AudioManager();audio.sound=false;audio.music=false;
 const scene=new ArenaScene(save,audio,()=>{scene.xp=0;scene.paused=false;},()=>{},()=>{});s=scene;
 scene.onArenaReady=()=>{try{scene.plan=[];scene.enemies=[];scene.xpNeed=100000;scene.random=()=>.99;scene.protect(1e6);
 if(verify){scene.angle=0;const e=scene.spawn('basic')!;Object.assign(e,{x:scene.x+55,y:scene.y,hp:10000,max:10000,speed:0,damage:0});const ammo=scene.ammo;scene.basicAttack();if(hero==='gunner')assert(scene.ammo===ammo-1,'Gunner does not fire');else if(hero!=='zawgyi'){assert(scene.pendingStrikes[0]?.angle===0,'Melee strike loses its aim');const first=scene.pendingStrikes[0];scene.angle=Math.PI;scene.update(0,16);assert(Math.abs(scene.angle)<.001,'Melee body turns away during swing');assert(first.sequence===scene.attackSequence,'Strike loses its swing sequence');}
 scene.requestAbility(0,1,0);scene.update(0,20);assert(hero==='zawgyi'?scene.zawgyi!.cooldowns[0]>0:scene.ability>0,'Buffered ability never activates');scene.paused=true;lines.push('PASS · '+HEROES[hero].name+' attack + skill input');proof.textContent=lines.join('\n');
 }else addEnemies();resolve();}catch(error){proof.textContent+='\nFAIL · '+error;reject(error);}};
 game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:innerWidth,height:innerHeight,scene:[scene],scale:{mode:Phaser.Scale.RESIZE},audio:{noAudio:true},banner:false});
 touch=new TouchControls(()=>scene.requestAbility(0,touch!.state.x,touch!.state.y));touch.state.enabled=touchMode;scene.touch=touch.state;
 });}
function addEnemies(){if(!s)return;for(let i=0;i<9;i++){const e=s.spawn(i%3?'basic':'armoured');if(e){e.x=s.x+Math.cos(i*2.4)*(100+i*15);e.y=s.y+Math.sin(i*2.4)*(90+i*12);e.damage=0;e.hp=e.max=300;e.speed=8;}}}
const hud=document.querySelector<HTMLElement>('#hud')!;
hud.addEventListener('pointerdown',event=>{const button=(event.target as Element).closest<HTMLElement>('[data-hud]');if(!button||!s)return;event.preventDefault();const id=button.dataset.hud!;if(id==='ability')s.requestAbility(0,touch?.state.x||0,touch?.state.y||0);if(id.startsWith('zawgyi-'))s.requestAbility(Number(id.slice(-1)),touch?.state.x||0,touch?.state.y||0);if(id==='mapView'){wide=!wide;s.save.settings.mapView=wide?2:1;s.applyMapView();}});
setInterval(()=>{if(!s||!touch||!s.visuals)return;updateHud(hud,combatHud(s,touchMode));const active=s.dash>0||s.counter>0||s.overdrive>0;touch.update(!s.paused&&!s.ended,s.ability,HEROES[s.hero].ability,HEROES[s.hero].cooldown,abilityIcons[s.hero],active);},80);
document.querySelector('#hero')!.addEventListener('change',e=>void launch((e.target as HTMLSelectElement).value as HeroId));
document.querySelector('#zoom')!.addEventListener('click',e=>{wide=!wide;if(s){s.save.settings.mapView=wide?2:1;s.applyMapView();}(e.target as HTMLElement).textContent=`Map · ${wide?2:1}×`;});
document.querySelector('#touch')!.addEventListener('click',()=>{touchMode=!touchMode;if(touch)touch.state.enabled=touchMode;});
document.querySelector('#spawn')!.addEventListener('click',addEnemies);
try{for(const hero of Object.keys(defaults) as HeroId[])await launch(hero,true);await launch('ninja');}catch(e){proof.textContent+='\n'+e;}

document.querySelector('#hide-tools')!.addEventListener('click',()=>{(document.querySelector('#polish-tools') as HTMLElement).style.display='none';(proof as HTMLElement).style.display='none';});
