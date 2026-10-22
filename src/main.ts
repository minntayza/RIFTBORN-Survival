import {HERO_ABILITIES,ABILITY_CHOICES,isAbilityHero,validHeroAbilities,replaceHeroAbility,heroAbilityIcon,type AbilityHero,type HeroAbilityId} from './hero-abilities';
import {ZAWGYI_SKILLS,validZawgyiLoadout,replaceZawgyiSkill,zawgyiSkillIcon,type ZawgyiSkill} from './zawgyi';
import {outfitUltimateIcon} from './outfit-effect-profiles';
import {tankSkinPortrait,tankSkinWeaponPortrait} from './tank-cosmetics';
import {isTankWeapon} from './tank-weapons';
import {gunnerSkinPortrait,gunnerSkinWeaponPortrait} from './gunner-cosmetics';
import {isGunnerWeapon} from './gunner-weapons';
import {ninjaSkinPortrait,ninjaSkinWeaponPortrait} from './ninja-cosmetics';
import {samuraiWeaponPortrait,isSamuraiWeapon} from './samurai-weapons';
import {samuraiPortrait} from './samurai-art';
import {COSMETICS,buyCosmetic,equipCosmetic,cosmeticColor,equippedSkin,equippedWeaponSkin} from './cosmetics';
import {enemyGallery,mountEnemyGallery,guideEntries,type GuideSection} from './field-guide';
import {startHomeScene} from './home-scene';
import {updateHud} from './hud-dom';
import {combatHud,abilityIcons} from './combat-hud';
import {cardEvolutionGuide,weaponEvolutionGuide} from './guide-ui';
import {CARD_EVOLUTIONS} from './card-evolutions';
import {HERO_IDENTITIES,EVOLUTION_STAGES,encounterRhythm,deathTip} from './run-design';
import {visualUpgradeCard,upgradeBuildHint} from './upgrade-ui';
import {evolutionPreview} from './evolution-preview';
import {dailySetup,incomingThreats,edgePosition,type RunMode,type BuildId,type RunOptions} from './retention';
import { evolutionOptions, type EvolutionId } from './progression';
import { TouchControls } from './touch';
import { PLAYTEST } from './config';
import { artImage as baseArtImage, ART_NAMES, weaponShopImage as baseWeaponShopImage } from './art';
import type Phaser from 'phaser';
import './style.css';
import './music-preview';
import './combat-layout.css';
import './art-direction.css';
import './mobile-combat.css';
import type { ArenaScene } from './combat';
import { HEROES, WEAPONS, ENEMIES, PERMANENT, type HeroId, type WeaponId } from './config';
import { loadSave, storeSave, purchase, freshSave, compatible } from './save';
import { UPGRADES,upgradeChoices, type Upgrade } from './upgrades';
import { AudioManager } from './audio';
let save = loadSave(), game: Phaser.Game | undefined, scene: ArenaScene | undefined, choices: Upgrade[] = [], waveChoice = false, menuState = 'menu', purchasePending = false;
if (PLAYTEST.unlimitedGold) save.gold = PLAYTEST.goldReserve;
let selectedMode:RunMode=save.runSetup.mode==='short'?'endless':save.runSetup.mode,selectedBuild:BuildId=save.runSetup.build;
let touchControls: TouchControls | undefined;
let modeSwipeStart:{x:number;y:number}|undefined;
let guideTab='enemies',guideReturn='menu',guideHero:HeroId=save.hero,guideWeapon:WeaponId=save.weapon;

const desktopMenu=matchMedia('(min-width: 701px)');
desktopMenu.addEventListener('change',()=>{const tools=overlay.querySelector<HTMLDetailsElement>('.home-tools');if(tools)tools.open=desktopMenu.matches;});
const audio = new AudioManager(), overlay = document.querySelector<HTMLDivElement>('#overlay')!, hud = document.querySelector<HTMLDivElement>('#hud')!;
// Suppress long-press selection and context menus without blocking touch scrolling.
for(const event of ['contextmenu','selectstart','dragstart'])document.addEventListener(event,e=>{
    if(e.target instanceof Element&&e.target.closest('#game,#hud,#overlay,#touch-controls'))e.preventDefault();
});
function artImage(kind:'hero'|'weapon',id:string){const skin=kind==='hero'?equippedSkin(save,id as HeroId):undefined;return skin?(id==='ninja'?ninjaSkinPortrait(skin):id==='gunner'?gunnerSkinPortrait(skin):id==='tank'?tankSkinPortrait(skin):id==='samurai'?samuraiPortrait(true,skin):baseArtImage(kind,id)):baseArtImage(kind,id);}
function weaponShopImage(id:WeaponId){const skin=equippedWeaponSkin(save,id);return skin?(isSamuraiWeapon(id)?samuraiWeaponPortrait(id,skin):isGunnerWeapon(id)?gunnerSkinWeaponPortrait(skin,id):isTankWeapon(id)?tankSkinWeaponPortrait(skin,id):WEAPONS[id].hero==='ninja'?ninjaSkinWeaponPortrait(skin,id as 'katana'|'dual'|'kama'):baseWeaponShopImage(id)):baseWeaponShopImage(id);}
function persist() { if (PLAYTEST.unlimitedGold) save.gold = PLAYTEST.goldReserve;
    if (!storeSave(save))
        toast('Browser storage is unavailable. Progress lasts for this session.');
}
function syncAudio() { audio.sound = save.settings.sound; audio.music = false; }
function toast(message: string) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = message; document.body.append(t); setTimeout(() => t.remove(), 3000); }
const button = (label: string, action: string, cls = '') => `<button class="${cls}" data-action="${action}">${label}</button>`;
function shell(content: string, wide = false) { overlay.style.display = 'grid'; overlay.innerHTML = `<section class="panel ${wide ? 'wide' : ''}">${content}</section>`; }
function header(title: string, sub: string) { return `<div class="eyebrow">ZOMBIE LAST STAND <span>● OFFLINE / SOLO</span></div><h2>${title}</h2><p class="muted">${sub}</p>`; }
function back() { return button('← Back', 'menu', 'quiet'); }
function menu() {
 menuState='menu';hud.innerHTML='';overlay.className='';
 const daily=dailySetup(),dailyMode=selectedMode==='daily',today=save.daily[daily.date!];
 const outfitId=save.cosmetics.equipped[`character:${save.hero}`],outfit=COSMETICS.find(c=>c.id===outfitId)?.name;
 const dailyStatus=today?.wins?'Completed today':today?.score?'Try again today':'Not completed yet';
 const modes=`<div class="hub-mode-list" role="radiogroup" aria-label="Choose your game mode">${(['endless','daily'] as const).map(mode=>`<button class="hub-mode mode-${mode} ${selectedMode===mode?'selected':''}" data-action="home-mode:${mode}" role="radio" aria-checked="${selectedMode===mode}" tabindex="${selectedMode===mode?0:-1}"><span class="hub-mode-picture"><img src="/assets/mode-art/${mode}.webp" alt=""/></span><span class="hub-mode-copy"><b>${mode==='daily'?'Daily Challenge':'Endless'}</b><span>${mode==='daily'?'10 waves · Rotating bosses':'Growing hordes · No wave limit'}</span><small>${mode==='daily'?`✿ Petal rewards · ${dailyStatus}`:'Face the horde. Beat your best.'}</small></span><span class="hub-mode-check" aria-hidden="true">${selectedMode===mode?'✓':'○'}</span></button>`).join('')}</div>`;
 shell(`<main class="landing-screen quick-start home-clean home-action home-hub hero-${save.hero}">
 <header class="home-header"><span class="home-brand">ZLS <small>LAST STAND</small></span><div class="hub-wallets"><span class="hub-wallet"><b>◈ ${PLAYTEST.unlimitedGold?'∞':save.gold.toLocaleString()}</b><small>Gold</small></span><span class="hub-wallet petals"><b>✿ ${PLAYTEST.unlimitedPetals?'∞':save.petals.toLocaleString()}</b><small>Petals</small></span>${button('Shop','shop','quiet')}</div></header>
 <section class="home-showcase" aria-label="Your equipped survivor"><div class="home-survivor-poster" aria-hidden="true">${artImage('hero',save.hero)}</div><span class="camp-art-loading" role="status">Loading survivor…</span><canvas id="home-scene" role="img" aria-label="${HEROES[save.hero].name} holding the equipped ${WEAPONS[save.weapon].name}"></canvas><div class="hub-survivor"><div><small>YOUR SURVIVOR</small><h2>${HEROES[save.hero].name}</h2><p>${WEAPONS[save.weapon].name}${outfit?` · ${outfit}`:''}</p><div class="camp-equipped-skills">${save.hero==='zawgyi'?validZawgyiLoadout(save.zawgyiSkills).map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${ZAWGYI_SKILLS[id].name}</span>`).join(''):isAbilityHero(save.hero)?validHeroAbilities(save.hero,save.heroAbilities[save.hero]).map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${HERO_ABILITIES[id].name}</span>`).join(''):`<span><kbd>Space</kbd> ${HEROES[save.hero].ability} · ${HEROES[save.hero].cooldown}s</span>`}</div></div>${button('Change loadout','loadout','quiet')}</div></section>
 <section class="landing-copy hub-run-setup"><div class="landing-eyebrow">THE LAST SAFE CAMP</div><h1>One more stand.</h1><p class="hub-intro">Choose your mission. Make it back.</p>${modes}
 <div class="hub-launch">${button(dailyMode?'PLAY DAILY CHALLENGE →':'PLAY ENDLESS →','quick-play','primary')}<small>${dailyMode?`${dailyStatus}${today?.score?` · Best score ${today.score.toLocaleString()}`:''}`:save.bestWave?`Personal best · Wave ${save.bestWave}`:'Your first stand starts here.'}</small></div>

 </section>
 <footer class="hub-footer"><nav aria-label="More game options">${button('Cosmetics','tab:cosmetics','quiet')}${button('Field Guide','guide','quiet')}${button('Settings','settings','quiet')}</nav><details class="hub-records"><summary>Personal records</summary>${save.bestWave||save.bestKills||save.bestTime?'<div class="records">':'<p class="camp-first-run">Your story starts here. Survive your first run to set a personal best.</p><div class="records" hidden>'}<div><b>${save.bestWave||'—'}</b><small>BEST WAVE</small></div><div><b>${format(save.bestTime)}</b><small>LONGEST STAND</small></div><div><b>${save.bestKills}</b><small>MOST KILLS</small></div><div><b>${save.shortWins}</b><small>WINS</small></div></div></details></footer></main>`,true);
 overlay.querySelector('.panel')?.classList.add('landing-panel');
 const canvas=overlay.querySelector<HTMLCanvasElement>('#home-scene');if(canvas)void startHomeScene(canvas,save.hero,save.weapon,false,{character:cosmeticColor(save,'character',save.hero),weapon:cosmeticColor(save,'weapon',save.weapon)},equippedSkin(save),equippedWeaponSkin(save,save.weapon));
}
let weaponReturnToLoadout=false;
const MODE_ORDER:RunMode[]=['endless','daily'];
function modeIllustration(mode:RunMode){
 const scenes={
  short:{sky:'#242a45',light:'#9c86d8',ground:'#536b5e',building:'<path d="M318 247V142l58-42 58 42v105h-25v-55h-66v55z" fill="#83869f" stroke="#171d28" stroke-width="7" stroke-linejoin="round"/><path d="M341 151h71v22h-71zm18 49h35v47h-35z" fill="#d8dbe7" stroke="#171d28" stroke-width="5"/><path d="M286 247v-38h-30v-25h38l19 19v44m141 0v-44l19-19h37v25h-29v38" fill="#a5a9ba" stroke="#171d28" stroke-width="7" stroke-linejoin="round"/><path d="M304 211h151" stroke="#9c86d8" stroke-width="10"/>'},
  endless:{sky:'#20243c',light:'#8790b9',ground:'#526b5c',building:'<path d="M341 247V112h24V75h63v37h24v135z" fill="#888ba4" stroke="#171d28" stroke-width="7" stroke-linejoin="round"/><path d="M366 126h61v14h-61zm0 30h61v14h-61zm0 30h61v14h-61zm0 30h61v17h-61z" fill="#d4d9e4" stroke="#171d28" stroke-width="4"/><path d="m365 75 31-43 31 43" fill="#666b85" stroke="#171d28" stroke-width="7" stroke-linejoin="round"/><path d="M311 247v-80h28v80m113 0v-80h28v80" fill="#a0a7b8" stroke="#171d28" stroke-width="6"/>'},
  daily:{sky:'#252a45',light:'#9c86d8',ground:'#526b5c',building:'<path d="M323 247v-83l64-42 64 42v83z" fill="#9296ac" stroke="#171d28" stroke-width="7" stroke-linejoin="round"/><path d="M344 165h86m-73 21h60m-60 20h60" stroke="#d8dbe7" stroke-width="8"/><path d="M369 216h36v31h-36z" fill="#9c86d8" stroke="#171d28" stroke-width="5"/><path d="M387 122V74m0 0-31-26m31 26 31-26" fill="none" stroke="#171d28" stroke-width="7" stroke-linecap="round"/><circle cx="387" cy="73" r="9" fill="#8a9ac5" stroke="#171d28" stroke-width="5"/><path d="M351 70q-21-20 0-40m72 40q21-20 0-40" fill="none" stroke="#9c86d8" stroke-width="5" stroke-linecap="round"/>'}
 } as const;
 const s=scenes[mode];
 return `<svg viewBox="0 0 760 280" role="img" aria-label="${mode==='short'?'Cartoon city street':mode==='endless'?'Cartoon iron factory':'Cartoon radio outpost'}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mode-sky-${mode}" x2="0" y2="1"><stop stop-color="${s.sky}"/><stop offset="1" stop-color="#34324f"/></linearGradient><radialGradient id="mode-glow-${mode}"><stop stop-color="${s.light}" stop-opacity=".26"/><stop offset="1" stop-color="${s.light}" stop-opacity="0"/></radialGradient></defs><rect width="760" height="280" fill="url(#mode-sky-${mode})"/><ellipse cx="390" cy="128" rx="250" ry="120" fill="url(#mode-glow-${mode})"/><circle cx="585" cy="61" r="22" fill="${s.light}" stroke="#171d28" stroke-width="4"/><path d="M0 221h88v-86h53v65h65V96h50v125h64v-83h43v83h94v-72h55v72h76v-95h60v95h112v59H0z" fill="#373d57" stroke="#171d28" stroke-width="6" stroke-linejoin="round"/>${s.building}<path d="M0 248h760v32H0z" fill="${s.ground}" stroke="#171d28" stroke-width="6"/><path d="M0 250h760" stroke="#9c86d8" stroke-width="5"/><g fill="#9c86d8" stroke="#171d28" stroke-width="2"><circle cx="106" cy="45" r="4"/><circle cx="198" cy="75" r="4"/><circle cx="641" cy="118" r="4"/><circle cx="540" cy="35" r="4"/><circle cx="255" cy="39" r="4"/></g></svg>`;
}

function runMenu(mode:RunMode='endless'){
 mode=mode==='short'?'endless':mode;selectedMode=mode;save.runSetup={mode:selectedMode,build:selectedBuild};persist();menuState='run-menu';
 const titles={short:'WILD STREETS',endless:'ENDLESS',daily:'DAILY CHALLENGE'};
 const mascot=(daily:boolean)=>`<svg viewBox="0 0 96 80" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${daily?'<rect x="20" y="15" width="58" height="54" rx="12" fill="#cbb9f2" stroke="#243139" stroke-width="4"/><path d="M22 32h54M35 10v13m29-13v13" fill="none" stroke="#243139" stroke-width="5" stroke-linecap="round"/><path d="m47 39 4 8 9 1-6 6 2 9-9-4-8 4 1-9-6-6 9-1z" fill="#fff0a9" stroke="#665a84" stroke-width="2"/>':'<path d="M48 42c-27-33-48 16-25 18 20 4 25-42 48-35 25 10 3 48-23 17" fill="none" stroke="#243139" stroke-width="22" stroke-linecap="round"/><path d="M48 42c-27-33-48 16-25 18 20 4 25-42 48-35 25 10 3 48-23 17" fill="none" stroke="#f3d588" stroke-width="13" stroke-linecap="round"/>'}<circle cx="39" cy="${daily?40:38}" r="2.4" fill="#243139"/><circle cx="56" cy="${daily?40:38}" r="2.4" fill="#243139"/>${daily?'':'<path d="M43 45q5 6 10 0" fill="none" stroke="#243139" stroke-width="2.5" stroke-linecap="round"/>'}<circle cx="32" cy="46" r="3" fill="#f39ca4"/><circle cx="64" cy="46" r="3" fill="#f39ca4"/><path d="m84 10 2 5 6 2-6 2-2 5-2-5-5-2 5-2z" fill="#fff0ad"/></svg>`;
 const cards=`<div class="mode-choice-grid mission-card-grid" role="radiogroup" aria-label="Game modes">${MODE_ORDER.map(m=>`<button class="mode-choice mode-${m} ${m===selectedMode?'is-selected':''}" data-action="choose-mode:${m}" role="radio" aria-checked="${m===selectedMode}" tabindex="${m===selectedMode?0:-1}" aria-label="Choose ${m==='endless'?'Endless':'Daily Challenge'}"><span class="mode-choice-art"><img src="/assets/mode-art/${m}.webp" alt=""/><span class="mission-mascot">${mascot(m==='daily')}</span>${m===selectedMode?'<span class="mode-choice-badge">Selected ✓</span>':''}</span><span class="mode-choice-body"><strong>${titles[m]}</strong><span class="mission-caption">${m==='endless'?'Survive without limits.':'Today’s challenge awaits.'}</span><span class="mission-tags"><span>${m==='endless'?'Growing hordes':'10 waves'}</span><span>${m==='endless'?'Build your survivor':'✿ Petal rewards'}</span></span><b>Choose ${m==='endless'?'Endless':'Daily'} <span aria-hidden="true">→</span></b></span></button>`).join('')}</div>`;
 shell(`${header('Choose your mode','Two ways to make your next stand.')}${cards}<div class="actions">${button('← Back to loadout','loadout','quiet')}</div>`,true);overlay.querySelector('.panel')?.classList.add('mode-picker-panel','mode-card-redesign');
}
function runLoadout(){
 menuState='run-loadout';const dailyMode=selectedMode==='daily';
 const hero=save.hero,weapon=save.weapon;
 const modeName=selectedMode==='short'?'LAST STAND':dailyMode?'DAILY CHALLENGE':'ENDLESS';
 const modeTitle={short:'THE 10-WAVE GAUNTLET',endless:'ENDLESS',daily:'10 WAVES · ROTATING BOSSES'}[selectedMode];
 const heroData=HEROES[hero],identity=HERO_IDENTITIES[hero];
 const survivor=`<section class="loadout-summary" style="--survivor-color:#${heroData.color.toString(16)}"><div class="loadout-portrait"><span class="camp-art-loading" role="status">Loading survivor…</span><canvas id="loadout-survivor" role="img" aria-label="${heroData.name} holding ${WEAPONS[weapon].name}"></canvas></div><div class="loadout-fields"><div class="loadout-field"><div><small>SURVIVOR</small><h3>${heroData.name}</h3></div><button data-action="characters" aria-label="Change survivor">Change</button></div><div class="loadout-field"><div><small>WEAPON</small><b>${WEAPONS[weapon!].name}</b></div><button data-action="weapons" aria-label="Change weapon">Change</button></div><div class="loadout-ability"><small>${hero==='zawgyi'?'MYSTIC ARTS':isAbilityHero(hero)?'EQUIPPED ABILITIES':'ULTIMATE'}</small><span>${isAbilityHero(hero)?'Two equipped skills':heroData.ability}</span><small>${hero==='zawgyi'||isAbilityHero(hero)?'Choose below':heroData.cooldown+'s cooldown'}</small></div></div><div class="loadout-stats"><span>Base damage <b>${Math.round(WEAPONS[weapon!].damage*heroData.damage)}</b></span><span>Base health <b>${heroData.hp}</b></span><span>Base speed <b>${heroData.speed}</b></span></div></section><details class="loadout-details"><summary>Ability &amp; passive details</summary><p>${heroData.description}</p><p><b>${identity.name}</b> · ${identity.trigger} → ${identity.benefit}</p></details>`;

 shell(`${header('Your loadout','Your choices are saved automatically.')}<div class="loadout-mode"><div><small>MISSION · ${modeName}</small><span>${modeTitle}</span></div><button class="quiet" data-action="modes">Change mode</button></div>${survivor}${hero==='zawgyi'?zawgyiLoadout():isAbilityHero(hero)?heroSkillLoadout(hero):''}<div class="actions">${button('Back','menu','quiet')}${button(dailyMode?'Play Daily Challenge →':'Play Endless →','begin','primary')}</div>`,true);overlay.querySelector('.panel')?.classList.add('survivor-select-panel','loadout-compact','camp-loadout');
 const preview=overlay.querySelector<HTMLCanvasElement>('#loadout-survivor');if(preview)void startHomeScene(preview,hero,weapon,true,{character:cosmeticColor(save,'character',hero),weapon:cosmeticColor(save,'weapon',weapon)},equippedSkin(save),equippedWeaponSkin(save,save.weapon));
}

function zawgyiLoadout(){const pair=validZawgyiLoadout(save.zawgyiSkills);return `<section class="zawgyi-loadout camp-skills"><div><small>ZAWGYI’S MYSTIC ARTS</small><h3>Two arts. Your way.</h3><p>Choose a slot, then a skill. Equipping the other slot’s skill swaps them.</p></div><div class="camp-skill-slots" role="group" aria-label="Skill slot to change">${pair.map((id,i)=>`<button data-action="skill-slot:${i}" aria-pressed="${activeSkillSlot===i}"><kbd>${i===0?'Q / Space':'E'}</kbd><b>${ZAWGYI_SKILLS[id].name}</b><small>${activeSkillSlot===i?'Editing this slot':'Change this slot'}</small></button>`).join('')}</div><div class="camp-skill-cards">${Object.entries(ZAWGYI_SKILLS).map(([id,skill])=>{const slot=pair.indexOf(id as ZawgyiSkill);return `<article class="${slot>=0?'equipped':''}">${zawgyiSkillIcon(id as ZawgyiSkill)}<h4>${skill.name}</h4><small>${skill.cooldown}s cooldown · ${slot<0?'Available':`Equipped · ${slot===0?'Q / Space':'E'}`}</small><p>${id==='datlone'?'Gather the horde, then burst into alchemical fire.':id==='flame'?'Dash to safety with a burning, slowing trail.':'Clear space with a crushing circular shockwave.'}</p><details><summary>Full effect</summary><p>${skill.description}</p></details><button data-action="equip-skill:${id}" ${pair[activeSkillSlot]===id?'disabled':''}>${pair[activeSkillSlot]===id?'✓ Equipped':`Equip ${activeSkillSlot===0?'Q / Space':'E'}`}</button></article>`;}).join('')}</div></section>`;}
function abilityChoiceIcon(hero:AbilityHero,id:HeroAbilityId){return ABILITY_CHOICES[hero][0]===id?outfitUltimateIcon(save,hero,abilityIcons[hero]):heroAbilityIcon(id);}
function heroSkillLoadout(hero:AbilityHero){const pair=validHeroAbilities(hero,save.heroAbilities[hero]);return `<section class="zawgyi-loadout camp-skills"><div><small>${HEROES[hero].name.toUpperCase()} · ACTIVE ABILITIES</small><h3>Two skills. Your way.</h3><p>Choose a slot, then a skill. Equipping the other slot’s skill swaps them.</p></div><div class="camp-skill-slots" role="group" aria-label="Skill slot to change">${pair.map((id,i)=>`<button data-action="skill-slot:${i}" aria-pressed="${activeSkillSlot===i}"><kbd>${i===0?'Q / Space':'E'}</kbd><b>${HERO_ABILITIES[id].name}</b><small>${activeSkillSlot===i?'Editing this slot':'Change this slot'}</small></button>`).join('')}</div><div class="camp-skill-cards">${ABILITY_CHOICES[hero].map(id=>{const skill=HERO_ABILITIES[id],slot=pair.indexOf(id);return `<article class="${slot>=0?'equipped':''}">${abilityChoiceIcon(hero,id)}<h4>${skill.name}</h4><small>${skill.cooldown}s base cooldown · ${slot<0?'Available':`Equipped · ${slot===0?'Q / Space':'E'}`}</small><p>${skill.description.split('. ')[0]}.</p><details><summary>Full effect</summary><p>${skill.description}</p></details><button data-action="equip-hero-skill:${id}" ${pair[activeSkillSlot]===id?'disabled':''}>${pair[activeSkillSlot]===id?'✓ Equipped':`Equip ${activeSkillSlot===0?'Q / Space':'E'}`}</button></article>`;}).join('')}</div></section>`;}
function heroSkillsGuide(){const hero=guideHero;const entries=isAbilityHero(hero)?ABILITY_CHOICES[hero].map(id=>({id,...HERO_ABILITIES[id],art:abilityChoiceIcon(hero,id)})):hero==='zawgyi'?Object.entries(ZAWGYI_SKILLS).map(([id,v])=>({id,...v,art:zawgyiSkillIcon(id as ZawgyiSkill)})):[{id:'ninja',name:HEROES.ninja.ability,cooldown:HEROES.ninja.cooldown,description:HEROES.ninja.description,art:abilityIcons.ninja}];return `<section class="camp-skills"><h3>${HEROES[hero].name} abilities</h3><p>${hero==='ninja'?'Use Space to activate Shadow Dash.':'Equip two distinct skills in Your Loadout. Q / Space activates slot 1; E activates slot 2. Each has an independent cooldown.'}</p><div class="camp-skill-cards">${entries.map(v=>`<article>${v.art}<h4>${v.name}</h4><small>${v.cooldown}s base cooldown</small><p>${v.description}</p></article>`).join('')}</div></section>`;}
let activeSkillSlot:0|1=0;
function characters() { menuState = 'characters'; shell(`${header('Choose your survivor', 'Each survivor changes how you fight. Unlock new styles in the armoury.')}<div class="cards character-cards">${Object.entries(HEROES).map(([id, h]) => { const owned = save.heroes.includes(id as HeroId); return `<button class="character ${save.hero === id ? 'selected' : ''}" data-action="hero:${id}" ${!owned ? 'disabled' : ''}><div class="character-icon" style="--hero:#${h.color.toString(16)}">${artImage('hero', id)}</div><small>${h.tag}</small><h3>${h.name}</h3><p>${h.description}</p><div class="hero-identity"><b>${HERO_IDENTITIES[id as HeroId].icon} ${HERO_IDENTITIES[id as HeroId].name}</b><small>${HERO_IDENTITIES[id as HeroId].trigger} → ${HERO_IDENTITIES[id as HeroId].benefit}</small></div><div class="mini-stats"><span>♥ ${h.hp}</span><span>↗ ${h.speed}</span><span>⚔ ×${h.damage}</span></div><strong>${owned ? (save.hero === id ? 'SELECTED' : 'SELECT') : `LOCKED · ◈ ${h.price}`}</strong></button>`; }).join('')}</div><div class="actions">${back()}${button('Visit shop', 'shop')}${button('Choose weapon →', 'weapons', 'primary')}</div>`, true); }
function weapons() { menuState = 'weapons'; shell(`${header('Your weapon, your rules', `Choose compatible equipment for ${HEROES[save.hero].name}.`)}<div class="cards weapon-select-cards">${Object.entries(WEAPONS).filter(([id]) => compatible(save.hero, id as WeaponId)).map(([id, w]) => `<button class="upgrade weapon-select-card weapon-${w.hero} ${save.weapon === id ? 'selected' : ''}" style="--weapon-glow:#${HEROES[w.hero as HeroId].color.toString(16)}" data-action="weapon:${id}" ${save.weapons.includes(id as WeaponId) ? '' : 'disabled'}><div class="weapon-art">${weaponShopImage(id as WeaponId)}</div><small>${ART_NAMES[id as WeaponId]}</small><h3>${w.name}</h3><p>${Math.round(w.damage*HEROES[save.hero].damage)} base damage · ${w.cooldown}s weapon interval<br>${w.range} range</p><p class="equipment-compare">${save.weapon===id?'Current weapon':`Compared with ${WEAPONS[save.weapon].name}:<br>${(Math.round(w.damage*HEROES[save.hero].damage)-Math.round(WEAPONS[save.weapon].damage*HEROES[save.hero].damage))>=0?'+':''}${(Math.round(w.damage*HEROES[save.hero].damage)-Math.round(WEAPONS[save.weapon].damage*HEROES[save.hero].damage))} base damage · ${(w.cooldown-WEAPONS[save.weapon].cooldown).toFixed(2)}s interval · ${w.range-WEAPONS[save.weapon].range>=0?'+':''}${w.range-WEAPONS[save.weapon].range} range`}</p><strong>${save.weapons.includes(id as WeaponId) ? save.weapon === id ? 'EQUIPPED' : 'EQUIP' : `LOCKED · ◈ ${w.price}`}</strong></button>`).join('')}</div><div class="actions">${weaponReturnToLoadout?button('← Back to loadout','loadout','quiet'):button('← Survivors', 'characters', 'quiet')}${button('Armoury', 'shop')}${button('Evolution previews','guide-weapons','quiet')}${weaponReturnToLoadout?'':button('Enter the arena →', 'play', 'primary')}</div>`, true); }
function shop(tab = 'heroes') {
    menuState = 'shop';
    const names = { heroes: 'Characters', weapons: 'Weapons', cosmetics: 'Cosmetics' };
    let items = '';
    if (tab === 'heroes')
        items = Object.entries(HEROES).map(([id, h]) => `<article class="shop-item survivor-shop-item ${save.hero===id?'shop-selected':''}"><span class="shop-item-state">${save.hero===id?'✓ SELECTED':save.heroes.includes(id as HeroId)?'OWNED':'NEW SURVIVOR'}</span><span class="card-icon" style="color:#${h.color.toString(16)}">${artImage('hero', id)}</span><h3>${h.name}</h3><p>${h.description}</p><small>♥ ${h.hp} · ↗ ${h.speed} · ⚔ ×${h.damage}<br>${h.ability} · ${h.cooldown}s<br>Weapons: ${Object.values(WEAPONS).filter(w => w.hero === id).map(w => w.name).join(', ')}</small>${save.heroes.includes(id as HeroId) ? (save.hero===id?'<span class="shop-current-label">✓ Your survivor</span>':button('Select survivor', `hero:${id}`)) : button(`Unlock · ◈ ${h.price}`, `buy:heroes:${id}`, save.gold >= h.price ? 'primary' : '')}</article>`).join('');
    if (tab === 'weapons') {
        const colors:Record<HeroId,string>={zawgyi:'#f0bf67',ninja:'#c28aff',samurai:'#ff777f',gunner:'#ffc65e',tank:'#5be6e3'};
        items = Object.entries(WEAPONS).map(([id, w]) => {
            const hero=w.hero as HeroId,owned=save.weapons.includes(id as WeaponId),equipped=save.weapon===id,canEquip=owned&&save.hero===hero;
            const action=equipped?'<span class="weapon-owned owned">✓ EQUIPPED</span>':canEquip?button('EQUIP WEAPON',`weapon:${id}`,'weapon-equip'):owned?'<span class="weapon-owned owned">✓ OWNED</span>':button(`UNLOCK · ◈ ${w.price}`,`buy:weapons:${id}`,save.gold>=w.price?'primary':'weapon-unlock');
            return `<article class="shop-item weapon-shop-item weapon-${hero} ${equipped?'weapon-equipped':''}" style="--weapon-glow:${colors[hero]}"><div class="weapon-art"><span class="weapon-art-halo"></span>${weaponShopImage(id as WeaponId)}<span class="weapon-tag">${HEROES[hero].name}</span>${equipped?'<span class="weapon-equipped-tag">CURRENT</span>':''}</div><div class="weapon-shop-copy"><small class="weapon-class">${ART_NAMES[id as WeaponId]}</small><h3>${w.name}</h3><p>${w.damage} damage · ${w.range} range<br>${w.cooldown}s attack interval</p><div class="weapon-owner">FOR ${HEROES[hero].name.toUpperCase()}</div></div>${action}</article>`;
        }).join('');
    }
    if (tab === 'cosmetics')
        items = `<div class="cosmetic-intro"><h3>Make it yours</h3><p>Unique outfits, faces, and matching weapon designs. Style only — your stats stay the same.</p><label>Preview survivor <select aria-label="Cosmetic survivor" data-cosmetic-hero>${Object.entries(HEROES).map(([id,h])=>`<option value="${id}" ${id===guideHero?'selected':''}>${h.name}</option>`).join('')}</select></label></div>`+['character','weapon'].map(kind=>`<section class="cosmetic-group"><h3>${kind==='character'?'Character outfits':'Weapon designs'}</h3><div class="cosmetic-cards">${COSMETICS.filter(c=>c.kind===kind&&(kind==='character'?c.target===guideHero:WEAPONS[c.target as WeaponId].hero===guideHero)).map(c=>{const owned=save.cosmetics.owned.includes(c.id),equipped=save.cosmetics.equipped[`${c.kind}:${c.target}`]===c.id;return `<article class="shop-item cosmetic-card" style="--finish:#${c.color.toString(16)}"><div class="cosmetic-art" style="filter:${c.asset?'none':c.filter}">${kind==='character'?(c.asset?(c.target==='ninja'?ninjaSkinPortrait(c.asset):c.target==='gunner'?gunnerSkinPortrait(c.asset):c.target==='tank'?tankSkinPortrait(c.asset):samuraiPortrait(true,c.asset)):artImage('hero',c.target as HeroId)):(c.asset&&isSamuraiWeapon(c.target)?samuraiWeaponPortrait(c.target,c.asset):c.asset&&isGunnerWeapon(c.target)?gunnerSkinWeaponPortrait(c.asset,c.target):c.asset&&isTankWeapon(c.target)?tankSkinWeaponPortrait(c.asset,c.target):c.asset&&WEAPONS[c.target as WeaponId].hero==='ninja'?ninjaSkinWeaponPortrait(c.asset,c.target as 'katana'|'dual'|'kama'):weaponShopImage(c.target as WeaponId))}</div><h3>${c.name}</h3><small>${kind==='character'?(c.asset?'Unique outfit & face':'Character color'):(c.asset?'Unique weapon design':'Weapon finish')}</small>${equipped?button('✓ Equipped',`cosmetic-reset:${c.kind}:${c.target}`,'active'):owned?button('Equip',`cosmetic-equip:${c.id}`):button(`✿ ${c.price} · Buy`, `cosmetic-buy:${c.id}`,'primary')}</article>`;}).join('')}</div></section>`).join('');
    shell(`${header('Gear up for your next stand','Find your survivor. Pick your weapon. Build your advantage.')}<div class="shop-top"><span class="coin">◈ ${PLAYTEST.unlimitedGold ? '∞' : save.gold.toLocaleString()} GOLD</span><span class="petal-wallet">✿ ${PLAYTEST.unlimitedPetals?'∞':save.petals.toLocaleString()} PETALS</span><nav aria-label="Shop categories">${Object.entries(names).map(([id, name]) => button(name, `tab:${id}`, tab === id ? 'active' : 'quiet')).join('')}</nav></div><div class="shop-grid shop-collection-${tab} ${tab==='weapons'?'weapon-shop-grid':''}">${items}</div><div class="actions">${back()}${button('Choose survivor', 'characters')}${button('Enter the arena →', 'play', 'primary')}</div>`, true);
    overlay.querySelector('.panel')?.classList.add('armoury-panel');
    overlay.querySelectorAll<HTMLButtonElement>('.shop-top nav button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.action===`tab:${tab}`)));
}
function levelUpCardPreview(hero:HeroId){
 const weapon=Object.entries(WEAPONS).find(([,w])=>w.hero===hero&&w.price===0)![0] as WeaponId;
 const cards=UPGRADES.filter(u=>!u.hero||u.hero===hero),shared=cards.length-UPGRADES.filter(u=>u.hero===hero).length;
 return `<section class="levelup-preview"><div class="levelup-preview-intro"><b>${cards.length} REGULAR LEVEL-UP CARD TYPES</b><p>${shared} shared cards and ${cards.length-shared} ${HEROES[hero].name}-specific cards. These are shown at level 1; card choices during a run vary.</p></div><div class="cards upgrade-cards levelup-preview-grid">${cards.map((u,i)=>visualUpgradeCard(u,i,hero,weapon,0,'',true)).join('')}</div></section>`;
}

function guide(){
 menuState='guide';const content=guideTab==='abilities'?heroSkillsGuide():guideTab==='cards'?cardEvolutionGuide(save,guideHero):guideTab==='levelups'?levelUpCardPreview(guideHero):guideTab==='weapons'?weaponEvolutionGuide(save,guideWeapon):enemyGallery((['enemies','robots','bosses'].includes(guideTab)?guideTab:'enemies') as GuideSection);
 shell(`${header('Field guide','Meet the horde. Learn their tells. Make your next stand count.')}<nav class="guide-tabs field-main-tabs" aria-label="Enemy collections">${[['enemies','Zombies'],['robots','Robots'],['bosses','Bosses'],['abilities','Hero skills']].map(([id,name])=>button(`${name} <span>${id==='abilities'?Object.keys(HEROES).length:guideEntries(id as GuideSection).length}</span>`,'guide-tab:'+id,id===guideTab?'active':'quiet')).join('')}</nav><details class="field-build-library" ${['cards','levelups','weapons'].includes(guideTab)?'open':''}><summary>Build library <span>Cards &amp; weapon evolutions</span></summary><nav class="guide-tabs field-library-tabs" aria-label="Build collections">${[['cards','Card evolutions'],['levelups','Level-up cards'],['weapons','Weapon evolutions']].map(([id,name])=>button(name,'guide-tab:'+id,id===guideTab?'active':'quiet')).join('')}</nav></details>${guideTab==='abilities'||guideTab==='cards'||guideTab==='levelups'?`<nav class="guide-filters">${Object.entries(HEROES).map(([id,h])=>button(h.name,'guide-hero:'+id,guideHero===id?'active':'quiet')).join('')}</nav>`:guideTab==='weapons'?`<label class="guide-filter">WEAPON <select data-guide-weapon aria-label="Weapon evolution preview">${Object.entries(HEROES).map(([hero,h])=>`<optgroup label="${h.name}">${Object.entries(WEAPONS).filter(([,w])=>w.hero===hero).map(([id,w])=>`<option value="${id}" ${guideWeapon===id?'selected':''}>${w.name}</option>`).join('')}</optgroup>`).join('')}</select></label>`:''}<section class="${['cards','levelups','weapons'].includes(guideTab)?'field-build-content':''}">${content}</section><div class="actions">${button('← Back','guide-back','quiet')}</div>`,true);
 overlay.querySelector('.panel')?.classList.add('field-guide-panel');overlay.querySelectorAll<HTMLButtonElement>('.field-main-tabs button,.field-library-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.action===`guide-tab:${guideTab}`)));mountEnemyGallery(overlay);
}
function openGuide(tab='enemies'){
 guideReturn=menuState;guideTab=tab;guideHero=scene&&!scene.ended?scene.hero:save.hero;guideWeapon=scene&&!scene.ended?scene.weapon:save.weapon;
 if(scene&&!scene.ended)scene.paused=true;guide();
}

function settings() {
 menuState='settings';
 const toggle=(key:'sound'|'music'|'shake'|'aimAssist',title:string,description:string)=>`<label class="preference-row"><span class="preference-copy"><b>${title}</b><small>${description}</small></span><input class="preference-switch" type="checkbox" aria-label="${title}" data-setting="${key}" ${save.settings[key]?'checked':''}></label>`;
 shell(`${header('Make it your game','Your sound. Your controls. Your next stand.')}<div class="preferences-grid"><section class="preference-group"><div class="preference-heading"><span aria-hidden="true">♫</span><div><small>SET THE MOOD</small><h3>Sound & atmosphere</h3></div></div>${toggle('sound','Sound effects','Hear every hit, shot and enemy attack.')}${toggle('shake','Screen shake','Add impact to powerful attacks. Turn off for a calmer view.')}</section><section class="preference-group"><div class="preference-heading"><span aria-hidden="true">✥</span><div><small>FIND YOUR COMFORT</small><h3>Touch controls</h3></div></div>${toggle('aimAssist','Aim assistance','Help aim your attacks when playing on mobile.')}<label class="preference-row"><span class="preference-copy"><b>Joystick side</b><small>Choose which thumb handles movement.</small></span><select aria-label="Joystick side" data-control="joystickSide"><option value="left" ${save.settings.joystickSide==='left'?'selected':''}>Left</option><option value="right" ${save.settings.joystickSide==='right'?'selected':''}>Right</option></select></label><label class="preference-row"><span class="preference-copy"><b>Joystick size</b><small>Pick a size that feels easy to reach.</small></span><select aria-label="Joystick size" data-control="joystickSize">${[95,115,135].map(n=>`<option value="${n}" ${save.settings.joystickSize===n?'selected':''}>${n===95?'Compact':n===115?'Standard':'Large'}</option>`).join('')}</select></label><p class="preference-note">These controls apply on touch screens.</p></section></div><div class="preferences-footer"><span>✓ Changes save automatically<small>Progress is stored in this browser.</small></span>${button(scene&&!scene.ended?'← Back to pause':'← Back to menu',scene&&!scene.ended?'pause':'menu','primary')}</div><details class="preferences-reset"><summary>Progress management</summary><div><p>Start over by clearing your saved progress in this browser.</p>${button('Reset progress','reset','danger')}</div></details>`,true);
 overlay.querySelector('.panel')?.classList.add('preferences-panel');
}
let lastRunOptions:RunOptions|undefined,loadGeneration=0,loadingTimer:ReturnType<typeof setTimeout>|undefined;
function refreshSkillSelection(focus:string){const scroll=overlay.scrollTop;runLoadout();overlay.scrollTop=scroll;overlay.querySelector<HTMLButtonElement>(`[data-action="${focus}"]`)?.focus({preventScroll:true});}
function loadingFailed(generation:number){if(generation!==loadGeneration||menuState!=='loading')return;clearTimeout(loadingTimer);menuState='load-error';touchControls?.destroy();game?.destroy(true);game=undefined;scene=undefined;shell(`${header('The arena could not load','Your loadout and progress are safe. Retry, or return to camp.')}<div class="actions">${button('Retry','load-retry','primary')}${button('Back to camp','menu','quiet')}</div>`);}
async function start(options:RunOptions={mode:selectedMode,build:selectedBuild,technique:'standard'}) { if(menuState==='loading')return;const generation=++loadGeneration;lastRunOptions={...options};clearTimeout(loadingTimer);loadingTimer=setTimeout(()=>loadingFailed(generation),25000);save.runSetup={mode:options.mode,build:options.build};touchControls?.destroy(); game?.destroy(true); scene = undefined;hud.innerHTML='';overlay.className='';menuState='loading';shell('<div class="arena-loading" role="status" aria-live="polite"><div class="eyebrow">ZOMBIE LAST STAND</div><h2>Preparing your stand…</h2><p>Loading the arena and your survivor.</p><progress aria-label="Arena loading" max="100"></progress><small data-load-progress>Opening the arena…</small><button class="quiet" data-action="menu">Back to camp</button></div>'); syncAudio(); audio.unlock(); let runtime;try{runtime=await Promise.all([import('phaser'),import('./combat')]);}catch{loadingFailed(generation);return;}if(menuState!=='loading'||generation!==loadGeneration)return;const [{default:Phaser},{ArenaScene}]=runtime;const s = new ArenaScene(save, audio, showChoices, results, pause, options); scene = s;
 s.onLoading=(progress)=>{const bar=overlay.querySelector<HTMLProgressElement>('progress');if(bar)bar.value=Math.round(progress*100);const label=overlay.querySelector('[data-load-progress]');if(label)label.textContent=progress>=1?'Preparing the first frame…':`${Math.round(progress*100)}%`;};
 s.onArenaReady=()=>requestAnimationFrame(()=>{if(scene!==s||menuState!=='loading')return;clearTimeout(loadingTimer);overlay.style.display='none';overlay.className='ingame';menuState='game';});
 s.onLoadingError=()=>loadingFailed(generation);
 touchControls=new TouchControls(()=>{if(!s.paused&&!s.ended&&s.countdown<=0)s.activate(touchControls!.state.x,touchControls!.state.y);});touchControls.setLayout(save.settings.joystickSide,save.settings.joystickSize);s.touch=touchControls.state; game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: 1200, height: 760, backgroundColor: '#101b28', scene: [s], scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }, render: { antialias: true }, audio: { noAudio: true } }); persist(); }
function pause() {
    if (!scene || scene.ended)
        return;
    if (scene.paused && menuState === 'pause') {
        resume();
        return;
    }
    if (scene.paused && menuState !== 'settings')
        return;
    scene.paused = true;
    menuState = 'pause';
    const skills=scene.hero==='zawgyi'?validZawgyiLoadout(save.zawgyiSkills).map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${ZAWGYI_SKILLS[id].name}</span>`).join(''):scene.heroAbilities?scene.heroAbilities.equipped.map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${HERO_ABILITIES[id].name}</span>`).join(''):`<span><kbd>Space</kbd> ${HEROES[scene.hero].ability}</span>`;
    shell(`<div class="camp-pause-heading"><span class="camp-pause-portrait" aria-hidden="true">${artImage('hero',scene.hero)}</span><div><small>LAST SAFE CAMP · PAUSED</small><h2>Catch your breath.</h2><p>Your stand continues when you’re ready.</p></div></div><div class="camp-pause-records" aria-label="Current run"><div><span>Gold earned</span><b>◈ ${scene.stats.gold}</b></div><div><span>Enemies defeated</span><b>${scene.stats.kills}</b></div><div><span>Time survived</span><b>${format(scene.elapsed)}</b></div></div><details class="camp-pause-controls"><summary>Controls &amp; equipped skills</summary><div><span><kbd>WASD / ↑ ↓ ← →</kbd> Move</span><span><kbd>Mouse</kbd> Aim · attacks fire automatically</span>${skills}<span><kbd>1–3</kbd> Choose upgrade <kbd>M</kbd> Sound</span></div></details><div class="camp-pause-actions">${button('Resume run →','resume','primary')}<div>${button('Settings','settings','quiet')}${button('End run','end','danger')}</div></div>`);
    overlay.querySelector('.panel')?.classList.add('camp-pause');
}
function resume() { scene!.paused = false; overlay.style.display = 'none'; menuState = 'game'; }
function showChoices(wave = false) { if(wave){waveClear();return;} waveChoice = false; menuState = 'choice'; choices = upgradeChoices(scene!.hero, scene!.levels,scene!.cardRandom,scene!.weapon,scene!.stats.wave,scene!.cardEvolutions); for(const u of choices)if(u.evolves)save.archive['card:'+u.evolves]=Math.max(save.archive['card:'+u.evolves]||0,1) as 1|2;renderChoices(); persist(); }
function finishIntermission(){if(!scene||scene.ended)return;overlay.style.display='none';menuState='game';scene.nextWave();persist();}
function evolutionMenu(){const s=scene!;for(const e of evolutionOptions(s.hero))save.archive[`weapon:${s.weapon}:${e.id}`]=Math.max(save.archive[`weapon:${s.weapon}:${e.id}`]||0,1) as 1|2;persist();menuState='evolution';shell(`${header(s.awakened?'Full weapon evolution':'Weapon awakening',`Wave ${s.stats.wave} milestone · ${WEAPONS[s.weapon].name}`)}<div class="cards upgrade-cards">${evolutionOptions(s.hero).filter(e=>!s.awakened||e.id===s.awakened).map(e=>`<button class="upgrade" data-action="evolve:${e.id}">${evolutionPreview(s.hero,e.id,s.awakened?2:1,s.weapon)}<small>EVOLUTION ${(s.evolution[e.id]||0)+1}</small><h3>${e.name}</h3><p>${s.awakened?EVOLUTION_STAGES[e.id].full:EVOLUTION_STAGES[e.id].awakening}</p><strong>${s.awakened?'FULLY EVOLVE →':'AWAKEN →'}</strong></button>`).join('')}</div>${button('Preview both stages in Field Guide','guide-weapons','quiet')}`,true);}
function waveClear(){
 persist();

 if(scene!.evolutionDue)evolutionMenu();else finishIntermission();
}
function renderChoices() { const s = scene!; const title=waveChoice?header(`Wave ${s.stats.wave} survived`,'Recover. Adapt. The next horde is coming.'):`<div class="choice-heading"><b>SKILL CHOICE</b><small>LEVEL ${s.level} · PICK ONE</small></div>`; shell(`${title} ${waveChoice ? `<div class="wave-recap"><span>${s.waveStats.time.toFixed(1)}s <small>CLEAR TIME</small></span><span>${s.waveStats.kills} <small>KILLS</small></span><span>◈ ${s.waveStats.gold} <small>GOLD</small></span><span>${Math.round(s.waveStats.damage)} <small>DAMAGE TAKEN</small></span></div><p class="badges">${s.waveStats.time < 45 ? '✦ QUICK CLEAR · +15% GOLD' : ''} ${s.waveStats.damage === 0 ? '◇ PERFECT CLEAR · +1 REROLL' : ''}</p>` : ''}<div class="cards upgrade-cards">${choices.map((u,i)=>visualUpgradeCard(u,i,s.hero,s.weapon,s.levels[u.id]||0,upgradeBuildHint(u,s.levels))).join('')}</div><div class="actions"><span class="muted">${button('Evolution guide','guide-cards','quiet')}</span>${button(`↻ Reroll (${s.rerolls} left)`, 'reroll', 'quiet')}</div>`, true); overlay.querySelector('.panel')?.classList.add('levelup-panel');const reroll=overlay.querySelector<HTMLButtonElement>('[data-action=reroll]');if(reroll)reroll.disabled=s.rerolls<=0; }
async function pick(index: number) {
    if (menuState !== 'choice' || !choices[index])
        return;
    const selectedScene=scene!,selected=choices[index];menuState='selecting';
    const chosen=overlay.querySelector<HTMLElement>(`[data-action="upgrade:${index}"]`);chosen?.classList.add('card-picked');
    overlay.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=true);
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)await new Promise(resolve=>setTimeout(resolve,220));
    if(scene!==selectedScene||menuState!=='selecting')return;
    scene!.apply(selected.id);scene!.notifyCombat(`${selected.name} · ${selected.evolves?'EVOLVED':'UPGRADED'}`);if(choices[index].evolves)save.archive['card:'+choices[index].evolves]=2;persist();
    if(waveChoice){
        waveChoice=false;
        if(scene!.ended){scene!.paused=true;results();return;}
        if(scene!.evolutionDue){scene!.paused=true;evolutionMenu();return;}
        finishIntermission();return;
    }
    overlay.style.display = 'none';
    menuState = 'game';
}
function results() { const s = scene!, r = s.stats;s.heroAbilities?.clear();

 if(menuState==='results')return;menuState = 'results';audio.play(s.victory?'clear':'over');if(s.victory&&(s.options.mode==='short'||s.options.mode==='daily'))save.shortWins++;const dailyScore=r.kills*10+s.objectives*100+(s.victory?1000:0)+r.wave*50;if(s.options.mode==='daily'&&s.options.date){const old=save.daily[s.options.date]||{score:0,wins:0};save.daily[s.options.date]={score:Math.max(old.score,dailyScore),wins:old.wins+Number(s.victory)};} const record = r.wave > save.bestWave || r.kills > save.bestKills || r.time > save.bestTime; const previous = save.bestWave; save.bestWave = Math.max(save.bestWave, r.wave); save.bestTime = Math.max(save.bestTime, Math.floor(r.time)); save.bestKills = Math.max(save.bestKills, r.kills); persist();
 const top=Object.entries(s.levels).sort((a,b)=>b[1]-a[1])[0];
 const metric=(value:string|number,label:string,icon:string)=>`<div class="camp-result-metric"><span aria-hidden="true">${icon}</span><b>${value}</b><small>${label}</small></div>`;
 shell(`<header class="camp-result-heading"><small>LAST SAFE CAMP · ${s.options.mode==='daily'?'DAILY CHALLENGE':'ENDLESS'}</small><h2>${s.victory?'Area secured!':'Run complete'}</h2>${record?'<span class="camp-result-badge">✦ New personal best</span>':`<span class="camp-result-best">Best wave · ${Math.max(previous,r.wave)}</span>`}</header>
 <div class="camp-result-survivor"><span class="camp-result-portrait" aria-hidden="true">${artImage('hero',s.hero)}</span><div><b>${HEROES[s.hero].name}</b><span>${WEAPONS[s.weapon].name}</span></div><span class="camp-result-outcome">${s.victory?'✓ Mission complete':'Stand recorded'}</span></div>
 <section class="camp-result-metrics" aria-label="Run summary">${metric(r.wave,s.victory?'Waves cleared':'Wave reached','⚑')}${metric(format(r.time),'Time survived','◷')}${metric(r.kills,'Enemies defeated','⚔')}</section>
 <section class="camp-result-rewards" aria-label="Rewards kept"><div><span aria-hidden="true">◈</span><b>+${r.gold.toLocaleString()}</b><small>Gold kept</small></div><div class="petals"><span aria-hidden="true">✿</span><b>+${(r.petals||0).toLocaleString()}</b><small>Petals kept</small></div></section>
 ${s.options.mode==='daily'?`<div class="camp-result-daily"><span>Daily score <b>${dailyScore.toLocaleString()}</b></span><span>Personal best <b>${save.daily[s.options.date!]?.score.toLocaleString()||dailyScore.toLocaleString()}</b></span></div>`:''}
 <div class="camp-result-actions">${button('Play again →','retry','primary')}<div>${button('Change loadout','loadout','quiet')}${button('Back to camp','menu','quiet')}</div></div>
 <details class="camp-result-details"><summary>More run details</summary><dl><div><dt>Damage dealt</dt><dd>${Math.round(r.dealt).toLocaleString()}</dd></div><div><dt>Damage taken</dt><dd>${Math.round(r.taken).toLocaleString()}</dd></div><div><dt>Highest combo</dt><dd>${r.combo}</dd></div><div><dt>Objectives</dt><dd>${s.objectives}</dd></div><div><dt>Elites &amp; bosses</dt><dd>${r.elites}</dd></div><div><dt>Top upgrade</dt><dd>${top?`${UPGRADES.find(u=>u.id===top[0])?.name||top[0]} ×${top[1]}`:'None'}</dd></div></dl>${s.victory?'':`<p class="camp-result-tip"><b>Next attempt</b>${deathTip(s.lastCause)}</p>`}</details>`,true);
 overlay.querySelector('.panel')?.classList.add('camp-results');
}

function format(seconds: number) { return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`; }
overlay.addEventListener('click', e => {
    const el = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!el || el.disabled)
        return;
    audio.unlock();
    const [a, b, c] = el.dataset.action!.split(':');
    if(a==='evolve'&&menuState==='evolution'&&evolutionOptions(scene!.hero).some(e=>e.id===b)){scene!.evolve(b as EvolutionId);finishIntermission();}
    if(a==='cosmetic-buy'){if(buyCosmetic(save,el.dataset.action!.slice('cosmetic-buy:'.length))){persist();shop('cosmetics');}}
    if(a==='cosmetic-equip'){if(equipCosmetic(save,el.dataset.action!.slice('cosmetic-equip:'.length))){persist();shop('cosmetics');toast('Cosmetic equipped. Your weapon is ready in Your Loadout.');}else toast('Unlock this weapon and its survivor in the shop before equipping this design.');}
    if(a==='cosmetic-reset'){delete save.cosmetics.equipped[`${b}:${c}`];persist();shop('cosmetics');}
    if(a==='loadout')runLoadout();
    if(a==='skill-slot'&&(b==='0'||b==='1')){activeSkillSlot=Number(b) as 0|1;refreshSkillSelection(`skill-slot:${b}`);}
    if(a==='equip-hero-skill'&&isAbilityHero(save.hero)&&ABILITY_CHOICES[save.hero].includes(b as HeroAbilityId)){save.heroAbilities[save.hero]=replaceHeroAbility(validHeroAbilities(save.hero,save.heroAbilities[save.hero]),activeSkillSlot,b as HeroAbilityId);persist();refreshSkillSelection(`skill-slot:${activeSkillSlot}`);}
    if(a==='equip-skill'&&Object.hasOwn(ZAWGYI_SKILLS,b)){save.zawgyiSkills=replaceZawgyiSkill(validZawgyiLoadout(save.zawgyiSkills),activeSkillSlot,b as ZawgyiSkill);persist();refreshSkillSelection(`skill-slot:${activeSkillSlot}`);}
    if(a==='load-retry'&&lastRunOptions)void start(lastRunOptions);
    if(a==='preview-retry'){if(menuState==='run-loadout')runLoadout();else menu();}

    if(a==='home-mode'&&(b==='daily'||b==='endless')){selectedMode=b;save.runSetup={mode:selectedMode,build:selectedBuild};persist();menu();overlay.querySelector<HTMLButtonElement>(`[data-action="home-mode:${b}"]`)?.focus({preventScroll:true});}
    if(a==='quick-play')start(selectedMode==='daily'?{...dailySetup(),hero:save.hero,weapon:save.weapon}:{mode:selectedMode,build:selectedBuild,technique:'standard'});
    if(a==='play')runMenu();
    if(a==='daily')runMenu('daily');
    if(a==='mode-enter')runLoadout();
    if(a==='choose-mode'&&MODE_ORDER.includes(b as RunMode)){selectedMode=b as RunMode;save.runSetup={mode:selectedMode,build:selectedBuild};persist();runLoadout();}
    if(a==='modes')runMenu(selectedMode);
    if(a==='mode'&&MODE_ORDER.includes(b as RunMode))runMenu(b as RunMode);
    if(a==='mode-step'){
        const current=MODE_ORDER.indexOf(selectedMode),step=b==='prev'?-1:1;
        runMenu(MODE_ORDER[(current+step+MODE_ORDER.length)%MODE_ORDER.length]);
    }
    if(a==='begin')start(selectedMode==='daily'?{...dailySetup(),hero:save.hero,weapon:save.weapon}:{mode:selectedMode,build:selectedBuild,technique:'standard'});
    if(a==='retry'&&scene)start({...scene.options});
    if (a === 'menu') {
        ++loadGeneration;clearTimeout(loadingTimer);
        touchControls?.destroy();touchControls=undefined;game?.destroy(true);
        game = undefined;
        scene = undefined;
        menu();
    }
    if(a==='guide')openGuide();
    if(a==='guide-cards')openGuide('cards');
    if(a==='guide-weapons')openGuide('weapons');
    if(a==='guide-tab'){guideTab=b;guide();overlay.querySelector<HTMLButtonElement>('.guide-tabs button.active')?.focus();}
    if(a==='guide-hero'&&Object.hasOwn(HEROES,b)){guideHero=b as HeroId;guide();}
    if(a==='guide-weapon'&&Object.hasOwn(WEAPONS,b)){guideWeapon=b as WeaponId;guide();}
    if(a==='guide-back'){if(guideReturn==='choice'){menuState='choice';renderChoices();}else if(guideReturn==='evolution')evolutionMenu();else if(guideReturn==='weapons')weapons();else menu();}
    if(a==='card-info'&&choices[Number(b)]){const u=choices[Number(b)];shell(`${header(u.name,u.description)}${visualUpgradeCard(u,Number(b),scene!.hero,scene!.weapon,scene!.levels[u.id]||0)}<p class="muted">${u.evolves?'Evolution · choose once after maxing the base card.':`Level ${(scene!.levels[u.id]||0)+1} / ${u.max}`}</p>${button('← Back to cards','cards-back','quiet')}`,true);}
    if(a==='cards-back'){menuState='choice';renderChoices();}
    if (a === 'characters') {
        guideReturn=menuState;
        characters();
    }
    if (a === 'weapons'){
        weaponReturnToLoadout=menuState==='run-loadout'||menuState==='characters'&&guideReturn==='run-loadout'||menuState==='weapons'&&weaponReturnToLoadout;
        weapons();
    }
    if (a === 'shop')
        shop();
    if (a === 'tab')
        shop(b);
    if (a === 'settings')
        settings();
    if (a === 'resume')
        resume();
    if (a === 'pause') {
        menuState = 'settings';
        pause();
    }
    if (a === 'hero') {
        if (!save.heroes.includes(b as HeroId))
            return;
        save.hero = b as HeroId;
        if (!compatible(save.hero, save.weapon))
            save.weapon = save.weapons.find(w => compatible(save.hero, w))!;
        persist();
        if(guideReturn==='run-loadout')runLoadout();else if(guideReturn==='menu')menu();else characters();
    }
    if (a === 'weapon') {
        if (!save.weapons.includes(b as WeaponId))
            return;
        const returnToArmoury=menuState==='shop';
        save.weapon = b as WeaponId;
        persist();
        if(returnToArmoury)shop('weapons');else if(weaponReturnToLoadout)runLoadout();else weapons();
    }
    if (a === 'buy') {
        if(b==='permanent')return;
        if (purchasePending)
            return;
        const kind = b as 'heroes' | 'weapons' | 'permanent';
        const cost = kind === 'heroes' ? HEROES[c as HeroId].price : kind === 'weapons' ? WEAPONS[c as WeaponId].price : 250 + 150 * (save.permanent[c] || 0);
        if (save.gold < cost) {
            toast(`Need ${cost - save.gold} more gold. Keep fighting.`);
            return;
        }
        purchasePending = true;
        if (purchase(save, kind, c)) {
            audio.play('buy');
            persist();
            toast('Unlocked. Make it count.');
        }
        else
            toast('Already owned or unavailable.');
        purchasePending = false;
        shop(b);
    }
    if (a === 'upgrade')
        void pick(Number(b));
    if (a === 'reroll') {
        if (scene!.rerolls <= 0) {
            toast('No rerolls remaining.');
            return;
        }
        scene!.rerolls--;
        choices = upgradeChoices(scene!.hero, scene!.levels,scene!.cardRandom,scene!.weapon,scene!.stats.wave,scene!.cardEvolutions);
        renderChoices();
    }
    if (a === 'end' && confirm('End this run? Collected gold is kept.')) {
        scene!.ended = true;
        scene!.stats.time = scene!.elapsed;
        results();
    }
    if (a === 'reset' && confirm('Erase all gold, unlocks, and records?')) {
        touchControls?.destroy();touchControls=undefined;game?.destroy(true);
        game = undefined;
        scene = undefined;
        save = freshSave();
        persist();
        syncAudio();
        menu();
    }
});
overlay.addEventListener('pointerdown',e=>{
    if((e.target as Element).closest('[data-mode-carousel]'))modeSwipeStart={x:e.clientX,y:e.clientY};
});
overlay.addEventListener('pointerup',e=>{
    if(!modeSwipeStart)return;
    const dx=e.clientX-modeSwipeStart.x,dy=e.clientY-modeSwipeStart.y;modeSwipeStart=undefined;
    if(Math.abs(dx)<48||Math.abs(dx)<Math.abs(dy)*1.2)return;
    const current=MODE_ORDER.indexOf(selectedMode),step=dx<0?1:-1;
    runMenu(MODE_ORDER[(current+step+MODE_ORDER.length)%MODE_ORDER.length]);
});
overlay.addEventListener('pointercancel',()=>{modeSwipeStart=undefined;});
overlay.addEventListener('change', e => {
    const el = e.target as HTMLInputElement, k = el.dataset.setting as 'sound' | 'music' | 'shake' | 'aimAssist';
    if (k) {
        save.settings[k] = el.checked;
        syncAudio();
        persist();
    }
});
overlay.addEventListener('change',e=>{const el=e.target as HTMLSelectElement;if(el.dataset.control==='joystickSide')save.settings.joystickSide=el.value==='right'?'right':'left';else if(el.dataset.control==='joystickSize')save.settings.joystickSize=[95,115,135].includes(Number(el.value))?Number(el.value):115;else return;touchControls?.setLayout(save.settings.joystickSide,save.settings.joystickSize);persist();});
document.addEventListener('keydown', e => {
    if (menuState === 'choice' && ['1', '2', '3'].includes(e.key))
        void pick(Number(e.key) - 1);
    // Phaser captures gameplay keys itself. Preventing them here makes its
    // window listener discard the event before the arena can receive it.
});
window.addEventListener('blur', () => {
    if (scene && !scene.ended && !scene.paused)
        pause();
});
window.addEventListener('beforeunload', () => storeSave(save));
function toggleMapView(){if(!scene||scene.paused||scene.ended)return;save.settings.mapView=save.settings.mapView===2?1:2;save.settings.mapViewChosen=true;scene.applyMapView();hud.querySelector<HTMLElement>('.combat-hud')?.setAttribute('data-map-view',String(save.settings.mapView));persist();}
// Respond before the periodic HUD render can replace a pressed button.
hud.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    const paired=(e.target as Element).closest<HTMLElement>('[data-hud^="hero-skill-"]');if(paired){e.preventDefault();scene?.heroAbilities?.activate(Number(paired.dataset.hud!.slice(-1)),scene.touch?.x||0,scene.touch?.y||0);return;}
    const mystic=(e.target as Element).closest<HTMLElement>('[data-hud^="zawgyi-"]');if(mystic){e.preventDefault();scene?.zawgyi?.activate(Number(mystic.dataset.hud!.slice(-1)),scene.touch?.x||0,scene.touch?.y||0);return;}
    if((e.target as Element).closest('[data-hud="mapView"]')){e.preventDefault();toggleMapView();return;}
    const button=(e.target as Element).closest<HTMLButtonElement>('[data-hud="ability"]');
    if(!button||button.disabled||!scene||scene.paused||scene.ended||scene.countdown>0)return;
    e.preventDefault();
    scene.activate(scene.touch?.x||0,scene.touch?.y||0);
});
hud.addEventListener('click',e=>{const action=(e.target as Element).closest<HTMLElement>('[data-hud]')?.dataset.hud;if(!scene||scene.paused||scene.ended)return;if(action?.startsWith('hero-skill-')){if(e.detail===0)scene.heroAbilities?.activate(Number(action.slice(-1)),scene.touch?.x||0,scene.touch?.y||0);}else if(action?.startsWith('zawgyi-')){if(e.detail===0)scene.zawgyi?.activate(Number(action.slice(-1)),scene.touch?.x||0,scene.touch?.y||0);}else if(action==='mapView'){if(e.detail===0)toggleMapView();}else if(action==='pause')pause();else if(action==='ability'&&scene.countdown<=0)scene.activate(scene.touch?.x||0,scene.touch?.y||0);});
setInterval(() => {
    const s = scene;
    touchControls?.update(!!s&&!s.ended&&!s.paused&&menuState==='game',s&&s.countdown>0?s.countdown:s?.ability||0,HEROES[s?.hero||save.hero].ability,s?HEROES[s.hero].cooldown:1,s?outfitUltimateIcon(s.save,s.hero,abilityIcons[s.hero]):'➤',!!s&&(s.hero==='gunner'?s.overdrive>0:s.hero==='samurai'?s.counter>0:s.hero==='ninja'?s.dash>0:false),!!s?.heroAbilities);
    if (!s || s.ended || menuState !== 'game') {
        if (menuState !== 'game')
            hud.innerHTML = '';
        return;
    }
    const view=s.cameras.main.worldView;const width=s.cameras.main.width,height=s.cameras.main.height;const threats=incomingThreats(s.enemies,view).map(t=>{const p=edgePosition(t.angle,width,height);return `<div class="edge-threat ${t.kind} ${t.urgent?'urgent':''}" style="left:${p.x}px;top:${p.y}px" aria-label="${t.kind} approaching, ${t.count} enemies"><span class="threat-arrow" style="transform:rotate(${t.angle}rad)">➤</span><b>${t.kind==='boss'?'BOSS':t.kind==='elite'?'ELITE':t.count}</b></div>`;}).join('');
    const objectives=s.supplies.filter(c=>c.active).map(c=>({x:c.x,y:c.y,label:'CACHE'}));if(s.eventName==='Hold the zone'&&!s.zone.done)objectives.push({x:s.zone.x,y:s.zone.y,label:'ZONE'});if(s.huntTarget?.active)objectives.push({x:s.huntTarget.x,y:s.huntTarget.y,label:'BOUNTY'});if(s.landmark&&!s.landmark.done)objectives.push({x:s.landmark.x,y:s.landmark.y,label:s.landmark.kind==='cache'?'HEAL':s.landmark.kind==='beacon'?'BEACON · XP':'PATROL · SHIELD'});const objectiveMarkers=objectives.filter(o=>!view.contains(o.x,o.y)).slice(0,3).map(o=>{const angle=Math.atan2(o.y-s.y,o.x-s.x),p=edgePosition(angle,width-70,height-30);return `<div class="edge-objective" style="left:${p.x+35}px;top:${p.y+15}px"><span style="display:inline-block;transform:rotate(${angle}rad)">➤</span> ${o.label}</div>`;}).join('');
    updateHud(hud, `${threats}${objectiveMarkers}${combatHud(s,!!s.touch?.enabled,save.settings.joystickSide==='right')}`);
}, 100);
setInterval(() => {
    if (scene && !scene.ended)
        storeSave(save);
}, 1500);
syncAudio();
menu();

// Native selects emit change, not the button actions used by the guide tabs.
overlay.addEventListener('change',e=>{
 const select=e.target;
 if(!(select instanceof HTMLSelectElement)||!select.hasAttribute('data-guide-weapon')||!Object.hasOwn(WEAPONS,select.value))return;
 const panel=overlay.querySelector<HTMLElement>('.panel'),scroll=panel?.scrollTop||0;
 guideWeapon=select.value as WeaponId;guide();
 const nextPanel=overlay.querySelector<HTMLElement>('.panel');if(nextPanel)nextPanel.scrollTop=scroll;
 overlay.querySelector<HTMLSelectElement>('[data-guide-weapon]')?.focus({preventScroll:true});
});

overlay.addEventListener('change',e=>{const target=e.target as HTMLSelectElement;if(target.matches('[data-cosmetic-hero]')&&Object.hasOwn(HEROES,target.value)){guideHero=target.value as HeroId;shop('cosmetics');}});



// Radio groups use one tab stop and the standard arrow/Home/End keyboard pattern.
overlay.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key))return;const target=(e.target as HTMLElement).closest<HTMLButtonElement>('[role="radio"]');if(!target)return;const items=Array.from(target.closest('[role="radiogroup"]')!.querySelectorAll<HTMLButtonElement>('[role="radio"]'));const i=items.indexOf(target),next=e.key==='Home'?0:e.key==='End'?items.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+items.length)%items.length;e.preventDefault();items[next].click();});
