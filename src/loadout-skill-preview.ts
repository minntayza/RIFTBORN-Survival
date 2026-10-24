import type {Save} from './save';
import {HEROES,type HeroId,type WeaponId} from './config';
import {HERO_ABILITIES,isAbilityHero,validHeroAbilities} from './hero-abilities';
import {ZAWGYI_SKILLS,validZawgyiLoadout} from './zawgyi';
import {AudioManager} from './audio';
/** A disposable real arena: no progression callbacks, purchases, or save writes. */
export async function openSkillPreview(source:Save,hero:HeroId,weapon:WeaponId,slot:0|1,returnFocus:HTMLElement){
 if(document.querySelector('.dress-preview-dialog'))return;
 const save=structuredClone({...source,cosmetics:{...source.cosmetics}});save.hero=hero;save.weapon=weapon;save.settings.sound=false;save.settings.music=false;save.settings.shake=false;save.settings.mapView=matchMedia('(max-width:700px)').matches||matchMedia('(pointer:coarse)').matches?2:1;
 const name=hero==='zawgyi'?ZAWGYI_SKILLS[validZawgyiLoadout(save.zawgyiSkills)[slot]].name:isAbilityHero(hero)?HERO_ABILITIES[validHeroAbilities(hero,save.heroAbilities[hero])[slot]].name:HEROES[hero].ability;
 const dialog=document.createElement('dialog');dialog.className='dress-preview-dialog';dialog.setAttribute('aria-label',name+' practice preview');dialog.innerHTML=`<header><div><small>SKILL PRACTICE · NO PROGRESS SAVED</small><h3>${name}</h3></div><button data-close aria-label="Close skill preview">✕</button></header><div class="dress-preview-arena" role="img" aria-label="Live ability practice arena"></div><p role="status">Loading practice…</p><footer><button data-cast disabled>▶ Use skill</button><button data-hit disabled>Test enemy hit</button><button data-shot disabled>Test incoming shots</button></footer>`;document.body.append(dialog);dialog.showModal();let alive=true,game:import('phaser').Game|undefined;
 const status=dialog.querySelector('p')!,cast=dialog.querySelector<HTMLButtonElement>('[data-cast]')!,hit=dialog.querySelector<HTMLButtonElement>('[data-hit]')!,shots=dialog.querySelector<HTMLButtonElement>('[data-shot]')!;
 const close=()=>{if(!alive)return;alive=false;game?.destroy(true);dialog.remove();returnFocus.focus({preventScroll:true});};dialog.addEventListener('close',close);dialog.querySelector('[data-close]')!.addEventListener('click',()=>dialog.close());
 try{
 const [{default:Phaser},{ArenaScene}]=await Promise.all([import('phaser'),import('./combat')]);if(!alive)return;
 const audio=new AudioManager();audio.sound=false;audio.music=false;
 const s=new ArenaScene(save,audio,()=>{s.xp=0;s.paused=false;},()=>{status.textContent='Close and reopen practice to try again.';},()=>dialog.close(),{mode:'endless',build:'assault',technique:'standard'});
 s.onArenaReady=()=>{if(!alive)return;s.plan=[];s.xpNeed=1e9;s.countdown=0;s.invuln=9999;s.angle=0;for(const e of s.enemies)e.active=false;for(let i=0;i<5;i++){const e=s.spawn(i===0?'elite':'basic');if(e)Object.assign(e,{x:s.x+Math.cos(i*1.1)*110,y:s.y+Math.sin(i*1.1)*110,hp:100000,max:100000,speed:0,damage:0});}cast.disabled=hit.disabled=shots.disabled=false;status.textContent='Use the skill, then test a hit or incoming shots. WASD to move.';};
 s.onLoadingError=()=>{status.textContent='Preview could not load. Close and try again.';};
 const host=dialog.querySelector<HTMLElement>('.dress-preview-arena')!;
 game=new Phaser.Game({type:Phaser.AUTO,parent:host,width:host.clientWidth,height:host.clientHeight,scene:[s],audio:{noAudio:true},banner:false});
 cast.onclick=()=>{if(!alive||!s.visuals)return;s.ability=0;if(s.heroAbilities)s.heroAbilities.cooldowns.fill(0);if(s.zawgyi)s.zawgyi.cooldowns.fill(0);s.requestAbility(hero==='ninja'?0:slot,1,0);status.textContent=name+' · Live practice';};
 hit.onclick=()=>{const e=s.enemies.find(e=>e.active);if(e){e.x=s.x+40;e.y=s.y;s.invuln=0;s.hp=s.maxHp;s.hurt(1,e,0,'Practice hit',true);s.hp=s.maxHp;}};
 shots.onclick=()=>{for(let i=-1;i<=1;i++)s.shoot(s.x+130,s.y+i*15,Math.PI,0,true);};
 }catch{if(alive)status.textContent='Preview could not load. Close and try again.';}
}
