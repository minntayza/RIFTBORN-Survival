import '../src/style.css';
import '../src/combat-layout.css';
import '../src/art-direction.css';
import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {combatHud,abilityIcons} from '../src/combat-hud';
import {updateHud} from '../src/hud-dom';
import {TouchControls} from '../src/touch';
import {ABILITY_CHOICES,HERO_ABILITIES,isAbilityHero,type AbilityPair} from '../src/hero-abilities';
import {HeroAbilityCombat} from '../src/hero-ability-combat';
import {ZAWGYI_SKILLS,type ZawgyiSkill} from '../src/zawgyi';
import {HEROES,type HeroId,type WeaponId} from '../src/config';
let game:Phaser.Game|undefined,scene:ArenaScene|undefined,touch:TouchControls|undefined;
let touchMode=matchMedia('(pointer:coarse)').matches;
const heroSelect=document.querySelector<HTMLSelectElement>('#hero')!,pairSelect=document.querySelector<HTMLSelectElement>('#pair')!,status=document.querySelector<HTMLOutputElement>('#status')!,hud=document.querySelector<HTMLElement>('#hud')!;
const weapons:Record<HeroId,WeaponId>={ninja:'katana',samurai:'nodachi',gunner:'pistols',tank:'shield',zawgyi:'mysticstaff',pyusawhti:'aungzeyabow',lethwei:'hempwraps',kyansittha:'arindamaspear'};
function targets(){if(!scene?.visuals)return;for(let i=0;i<6;i++){const e=scene.spawn(i===0?'elite':'basic');if(e)Object.assign(e,{x:scene.x+Math.cos(i)*150,y:scene.y+Math.sin(i)*150,hp:10000,max:10000,speed:0,damage:0});}}
function pairs(hero:HeroId){const ids=hero==='zawgyi'?Object.keys(ZAWGYI_SKILLS):isAbilityHero(hero)?[...ABILITY_CHOICES[hero]]:[];pairSelect.hidden=hero==='ninja';pairSelect.innerHTML=ids.flatMap(a=>ids.filter(b=>b!==a).map(b=>`<option value="${a},${b}">${hero==='zawgyi'?ZAWGYI_SKILLS[a as ZawgyiSkill].name:HERO_ABILITIES[a as keyof typeof HERO_ABILITIES].name} + ${hero==='zawgyi'?ZAWGYI_SKILLS[b as ZawgyiSkill].name:HERO_ABILITIES[b as keyof typeof HERO_ABILITIES].name}</option>`)).join('');}
function equip(){const s=scene;if(!s?.visuals)return;const ids=pairSelect.value.split(',');s.ability=0;s.counter=0;s.strongStop=0;
 if(isAbilityHero(s.hero)){s.heroAbilities?.destroy();s.save.heroAbilities[s.hero]=ids as AbilityPair;s.heroAbilities=new HeroAbilityCombat(s);}
 if(s.hero==='zawgyi'){s.save.zawgyiSkills=ids as [ZawgyiSkill,ZawgyiSkill];s.zawgyi?.equipped.splice(0,2,...s.save.zawgyiSkills);s.zawgyi?.cooldowns.fill(0);}
}
function launch(hero:HeroId){game?.destroy(true);touch?.destroy();scene=undefined;hud.innerHTML='';status.textContent='Loading '+HEROES[hero].name+'…';pairs(hero);
 const save=freshSave();save.hero=hero;save.weapon=weapons[hero];save.settings.sound=false;save.settings.music=false;save.settings.shake=false;
 const audio=new AudioManager();audio.sound=false;audio.music=false;
 const s=new ArenaScene(save,audio,()=>{s.xp=0;s.paused=false;},()=>{status.textContent='Restart practice to continue.';},()=>{s.paused=!s.paused;});scene=s;
 s.onArenaReady=()=>{s.plan=[];s.xpNeed=100000;s.countdown=0;equip();targets();status.textContent=HEROES[hero].name+' ready. Try every pair using the selector.';};
 s.onLoadingError=()=>{status.textContent='Assets could not load. Press Restart to retry.';};
 game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:innerWidth,height:innerHeight,scene:[s],scale:{mode:Phaser.Scale.RESIZE},audio:{noAudio:true},banner:false});
 touch=new TouchControls(()=>s.requestAbility(0,touch!.state.x,touch!.state.y));touch.state.enabled=touchMode;s.touch=touch.state;
}
function cast(target:Element){if(!scene||scene.paused||scene.ended)return;const action=target.closest<HTMLElement>('[data-hud]')?.dataset.hud;if(action==='pause'){scene.paused=true;return;}if(action==='mapView'){scene.save.settings.mapView=scene.save.settings.mapView===2?1:2;scene.applyMapView();return;}if(action==='ability')scene.requestAbility(0,touch?.state.x||0,touch?.state.y||0);if(action?.startsWith('hero-skill-')||action?.startsWith('zawgyi-'))scene.requestAbility(Number(action.slice(-1)),touch?.state.x||0,touch?.state.y||0);}
hud.addEventListener('pointerdown',e=>{e.preventDefault();cast(e.target as Element);});
hud.addEventListener('click',e=>{if(e.detail===0)cast(e.target as Element);});
heroSelect.addEventListener('change',()=>launch(heroSelect.value as HeroId));pairSelect.addEventListener('change',equip);
document.querySelector('#cooldowns')!.addEventListener('click',()=>{const s=scene;if(!s)return;s.ability=0;s.countdown=0;if(s.heroAbilities)s.heroAbilities.cooldowns.fill(0);if(s.zawgyi)s.zawgyi.cooldowns.fill(0);});
document.querySelector('#targets')!.addEventListener('click',targets);
document.querySelector('#hit')!.addEventListener('click',()=>{const s=scene;if(!s?.visuals)return;const enemy=s.enemies.find(e=>e.active);if(!enemy)return;enemy.x=s.x+45;enemy.y=s.y;s.invuln=0;s.hurt(10,enemy,0,'Practice hit',true);});
document.querySelector('#shots')!.addEventListener('click',()=>{const s=scene;if(!s?.visuals)return;for(let i=-1;i<=1;i++)s.shoot(s.x+150,s.y+i*18,Math.PI,5,true);});
document.querySelector('#touch')!.addEventListener('click',()=>{touchMode=!touchMode;if(touch)touch.state.enabled=touchMode;});
document.querySelector('#pause')!.addEventListener('click',()=>{if(scene)scene.paused=!scene.paused;});
document.querySelector('#restart')!.addEventListener('click',()=>launch(heroSelect.value as HeroId));
setInterval(()=>{const s=scene;if(!s?.visuals||!touch)return;s.hp=s.maxHp;s.waveTime=0;updateHud(hud,combatHud(s,touchMode));touch.update(!s.paused&&!s.ended,s.ability,HEROES[s.hero].ability,HEROES[s.hero].cooldown,abilityIcons[s.hero],false,!!s.heroAbilities||s.hero==='zawgyi');},100);
launch('ninja');
