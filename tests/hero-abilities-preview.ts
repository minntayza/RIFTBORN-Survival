import '../src/style.css';
import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {HeroAbilityCombat} from '../src/hero-ability-combat';
import {ABILITY_CHOICES,HERO_ABILITIES,type AbilityHero,type AbilityPair} from '../src/hero-abilities';
import {freshSave,validateSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {combatHud,abilityIcons} from '../src/combat-hud';
import {updateHud} from '../src/hud-dom';
import {TouchControls} from '../src/touch';
import type {WeaponId} from '../src/config';
let game:Phaser.Game|undefined,scene:ArenaScene|undefined,touch:TouchControls|undefined,touchMode=false;
const proof=document.querySelector('#proof')!,lines:string[]=[];
const defaults:Record<AbilityHero,WeaponId>={samurai:'nodachi',gunner:'pistols',tank:'shield'};
const pairs=(hero:AbilityHero)=>{const ids=ABILITY_CHOICES[hero];return ids.flatMap(a=>ids.filter(b=>b!==a).map(b=>[a,b] as AbilityPair));};
function assert(ok:unknown,message:string){if(!ok)throw Error(message);}
async function launch(hero:AbilityHero,verify=false){game?.destroy(true);touch?.destroy();await new Promise<void>(r=>requestAnimationFrame(()=>r()));return new Promise<void>((resolve,reject)=>{const save=freshSave();save.hero=hero;save.weapon=defaults[hero];save.settings.sound=false;save.settings.music=false;save.settings.shake=false;const audio=new AudioManager();audio.sound=false;audio.music=false;const s=new ArenaScene(save,audio,()=>{s.xp=0;s.paused=false;},()=>{s.ended=true;s.heroAbilities?.clear();},()=>{s.paused=!s.paused;});scene=s;
 s.onLoadingError=()=>reject(Error('Artwork could not load'));
 s.onArenaReady=()=>{try{s.plan=[];s.enemies=[];s.xpNeed=100000;s.attack=1e6;s.random=()=>.99;s.protect(1e6);s.countdown=0;addEnemies();
 if(verify){for(const pair of pairs(hero)){s.ability=0;s.counter=0;s.overdrive=0;s.heroAbilities?.destroy();s.save.heroAbilities[hero]=pair;s.heroAbilities=new HeroAbilityCombat(s);assert(JSON.stringify(validateSave(s.save).heroAbilities[hero])===JSON.stringify(pair),'Save pairing lost');for(const slot of [0,1]){s.counter=0;s.heroAbilities.drawTime=0;assert(s.heroAbilities.activate(slot,1,0),'Cannot activate '+pair[slot]);assert(s.heroAbilities.cooldowns[slot]>0,'Missing independent cooldown');}s.heroAbilities.clear();assert(!s.heroAbilities.beacon&&!s.heroAbilities.charge&&!s.heroAbilities.marked&&s.heroAbilities.marchTime===0,'Cleanup leaves effects');}

 const bind=(pair:AbilityPair)=>{s.heroAbilities!.destroy();s.save.heroAbilities[hero]=pair;s.heroAbilities=new HeroAbilityCombat(s);s.ability=0;s.counter=0;s.strongStop=0;s.invuln=0;s.hp=s.maxHp;};
 if(hero==='samurai'){bind(['draw','mark']);const target=s.enemies[0];target.x=s.x+90;target.y=s.y;s.heroAbilities!.activate(0,1,0);const hp=s.hp;s.hurt(20,target,0,'Zombie bite',true);assert(s.hp===hp&&s.damageSources['Perfect Draw']>0,'Frontal parry is not wired into real damage');s.heroAbilities!.activate(1);const marked=s.heroAbilities!.marked!;for(let i=0;i<4;i++){s.attackSequence++;s.hit(marked,1,0);}assert(s.damageSources['Duelist’s Mark']>0,'Finisher lacks real damage attribution');s.kill(marked);assert(!s.heroAbilities!.marked,'Marked death does not clear target');}
 if(hero==='gunner'){bind(['beacon','breach']);s.heroAbilities!.activate(0,1,0);const beacon=s.heroAbilities!.beacon!,b=s.shoot(beacon.x,beacon.y,0,25,false,2)!;s.updateBullets(.005);assert(b.beaconRedirected&&b.damage===25,'Beacon does not redirect a real bullet safely');s.heroAbilities!.activate(1,1,0);for(let i=0;i<65;i++)s.heroAbilities!.update(.02);assert(s.damageSources['Breach Charge']>0,'Charge lacks real damage attribution');}
 if(hero==='tank'){bind(['bulwark','march']);s.heroAbilities!.activate(0,1,0);const shot=s.shoot(s.x+40,s.y,Math.PI,25,true)!;s.updateBullets(.01);assert(!shot.active&&s.heroAbilities!.energy===25,'Bulwark does not absorb a real projectile');s.heroAbilities!.activate(1);const hp=s.hp;s.hurt(20,s.enemies[0],Math.PI,'Fixture impact');assert(Math.abs(s.hp-(hp-10))<.001,'March protection is not wired into incoming damage');s.touch!.enabled=true;s.touch!.x=1;s.touch!.y=0;const x=s.x;s.update(0,16);assert(s.x>x,'March cannot steer right');s.touch!.x=0;s.touch!.y=-1;const y=s.y;s.update(0,16);assert(s.y<y,'March locks the steering direction');for(let i=0;i<130;i++)s.heroAbilities!.update(.02);assert(s.damageSources['Magnetic Bulwark']>0&&s.damageSources['Wrecking March']>0,'Tank abilities lack real damage attribution');}
 s.hp=1;s.invuln=0;s.counter=0;s.rewardShield=0;s.waveWard=false;s.hurt(100,undefined,Math.PI,'Fixture death');assert(s.ended&&s.heroAbilities!.marchTime===0&&!s.heroAbilities!.beacon&&!s.heroAbilities!.marked,'Death leaves active effects');s.ended=false;
 lines.push('PASS · '+hero+': real combat damage / projectiles / attribution');
 s.hp=s.maxHp;s.protect(1e6);
 const pair:AbilityPair=hero==='samurai'?['mark','draw']:hero==='gunner'?['beacon','breach']:['bulwark','march'];s.counter=0;s.ability=0;s.strongStop=0;s.save.heroAbilities[hero]=pair;s.heroAbilities!.destroy();s.heroAbilities=new HeroAbilityCombat(s);
 for(const [slot,code] of [[0,'Space'],[1,'KeyE']] as const){s.input.keyboard!.emit('keydown',new KeyboardEvent('keydown',{code}));s.update(0,16);assert(s.heroAbilities.cooldowns[slot]>0,code+' does not activate its equipped slot');}
 s.heroAbilities.clear();s.heroAbilities.cooldowns[0]=s.heroAbilities.cooldowns[1]=0;s.input.keyboard!.emit('keydown',new KeyboardEvent('keydown',{code:'KeyQ'}));s.update(0,16);assert(s.heroAbilities.cooldowns[0]>0,'Q does not alias Space');
 s.paused=true;const clocks=[...s.heroAbilities.cooldowns];s.update(0,100);assert(s.heroAbilities.cooldowns.every((n,i)=>n===clocks[i]),'Pause advances clocks');assert(!s.heroAbilities.activate(1),'Can activate while paused');s.paused=false;s.ended=true;s.heroAbilities.clear();assert(!s.heroAbilities.activate(1),'Can activate after end');s.ended=false;
 assert(Object.keys(s.damageSources).every(key=>typeof s.damageSources[key]==='number'),'Invalid damage attribution');lines.push('PASS · '+hero+': 6 ordered pairs, saves, Space/Q/E, cooldowns, pause/end/cleanup');proof.textContent=lines.join('\n');s.paused=true;
 }else{s.paused=true;populatePairs(hero);proof.textContent=lines.join('\n')+'\nPractice paused · Resume to try both skills.';}
 resolve();}catch(e){s.paused=true;proof.textContent=lines.join('\n')+'\nFAIL · '+e;reject(e);}};
 game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:innerWidth,height:innerHeight,scene:[s],scale:{mode:Phaser.Scale.RESIZE},audio:{noAudio:true},banner:false});touch=new TouchControls(()=>s.requestAbility(0,touch!.state.x,touch!.state.y));touch.state.enabled=touchMode;s.touch=touch.state;
 });}
function addEnemies(){if(!scene)return;for(let i=0;i<6;i++){const e=scene.spawn(i===0?'elite':i===1?'boss':'basic');if(e)Object.assign(e,{x:scene.x+Math.cos(i)*110,y:scene.y+Math.sin(i)*110,hp:10000,max:10000,speed:0,damage:0});}}
function populatePairs(hero:AbilityHero){const select=document.querySelector<HTMLSelectElement>('#pair')!;select.innerHTML=pairs(hero).map(p=>`<option value="${p.join(',')}">${p.map(id=>HERO_ABILITIES[id].name).join(' + ')}</option>`).join('');}
const hud=document.querySelector<HTMLElement>('#hud')!;
hud.addEventListener('pointerdown',e=>{const b=(e.target as Element).closest<HTMLButtonElement>('[data-hud^="hero-skill-"]');if(b){e.preventDefault();scene?.heroAbilities?.activate(Number(b.dataset.hud!.slice(-1)),touch?.state.x||0,touch?.state.y||0);}});
hud.addEventListener('click',e=>{if(e.detail!==0)return;const b=(e.target as Element).closest<HTMLButtonElement>('[data-hud^="hero-skill-"]');if(b)scene?.heroAbilities?.activate(Number(b.dataset.hud!.slice(-1)));});
setInterval(()=>{if(scene?.visuals&&touch){updateHud(hud,combatHud(scene,touchMode));touch.update(!scene.paused&&!scene.ended,0,'',1,abilityIcons[scene.hero],false,true);}},80);
document.querySelector('#hero')!.addEventListener('change',e=>void launch((e.target as HTMLSelectElement).value as AbilityHero));
document.querySelector('#pair')!.addEventListener('change',e=>{if(!scene)return;scene.counter=0;scene.ability=0;scene.heroAbilities?.destroy();scene.save.heroAbilities[scene.hero as AbilityHero]=(e.target as HTMLSelectElement).value.split(',') as AbilityPair;scene.heroAbilities=new HeroAbilityCombat(scene);});
document.querySelector('#reset')!.addEventListener('click',()=>{if(scene?.heroAbilities){scene.ability=0;scene.heroAbilities.cooldowns[0]=scene.heroAbilities.cooldowns[1]=0;}});
document.querySelector('#pause')!.addEventListener('click',e=>{if(scene&&!scene.ended){scene.paused=!scene.paused;(e.target as HTMLElement).textContent=scene.paused?'Resume practice':'Pause practice';}});
document.querySelector('#touch')!.addEventListener('click',()=>{touchMode=!touchMode;if(touch)touch.state.enabled=touchMode;});
document.querySelector('#targets')!.addEventListener('click',addEnemies);
document.querySelector('#end')!.addEventListener('click',()=>{if(scene){scene.ended=true;scene.heroAbilities?.clear();proof.textContent=lines.join('\n')+'\nPractice ended · effects cleared.';}});
document.querySelector('#restart')!.addEventListener('click',()=>void launch(document.querySelector<HTMLSelectElement>('#hero')!.value as AbilityHero));
try{for(const hero of ['samurai','gunner','tank'] as const)await launch(hero,true);await launch('samurai');}catch(e){proof.textContent+='\n'+e;}
