import {cycleRunMapView} from './map-view';
import {fullscreenButton,bindFullscreenControls,enterGameFullscreen} from './fullscreen';
import './fullscreen.css';
import {FOX_RONIN_REWARD,claimChallengeReward} from './challenge-rewards';
import {challengeRewardsUi,challengeGiftButton,challengeRunProgress} from './challenge-rewards-ui';
import './challenge-rewards.css';
import {observeGameViewport} from './viewport';
import {createAccounts} from './accounts';
import {progressBundle,acceptProgress} from './save';
import {combatPortrait} from './combat-portrait';
import {campRewardView} from './camp-reward-view';
import {dailyAppearance} from './daily-appearance';
import {campScore,campWave,type CampReward} from './last-camp';
import {HERO_ABILITIES,ABILITY_CHOICES,isAbilityHero,validHeroAbilities,replaceHeroAbility,heroAbilityIcon,type AbilityHero,type HeroAbilityId} from './hero-abilities';
import {ZAWGYI_SKILLS,validZawgyiLoadout,replaceZawgyiSkill,zawgyiSkillIcon,type ZawgyiSkill} from './zawgyi';
import {PYUSAWHTI_SKILLS,validPyusawhtiLoadout,replacePyusawhtiSkill,pyusawhtiSkillIcon,type PyusawhtiSkill} from './pyusawhti';
import {LETHWEI_SKILLS,validLethweiLoadout,replaceLethweiSkill,lethweiSkillIcon,type LethweiSkill} from './lethwei';
import {KYANSITTHA_SKILLS,validKyansitthaLoadout,replaceKyansitthaSkill,kyansitthaSkillIcon,type KyansitthaSkill} from './kyansittha';
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
import {weaponAwakeningUi} from './weapon-awakening-ui';
import {dailySetup,incomingThreats,edgePosition,type RunMode,type BuildId,type RunOptions} from './retention';
import { evolutionOptions, type EvolutionId } from './progression';
import { TouchControls } from './touch';
import { PLAYTEST } from './config';
import { artImage as baseArtImage, ART_NAMES, weaponShopImage as baseWeaponShopImage } from './art';
import type Phaser from 'phaser';
import './style.css';
import {setMusicScene} from './music-preview';
import './combat-layout.css';
import './art-direction.css';
import './dressing-room.css';
import {openSkillPreview} from './loadout-skill-preview';
import './mobile-combat.css';
import './mobile-landscape.css';
import {welcomeMobileLandscape} from './mobile-landscape';
import type { ArenaScene } from './combat';
import { HEROES, WEAPONS, ENEMIES, PERMANENT, type HeroId, type WeaponId } from './config';
import { loadSave, storeSave, purchase, freshSave, compatible } from './save';
import { UPGRADES,upgradeChoices, type Upgrade } from './upgrades';
import { AudioManager } from './audio';
let stopGameViewport:(()=>void)|undefined;
let save = loadSave(), game: Phaser.Game | undefined, scene: ArenaScene | undefined, choices: Upgrade[] = [], waveChoice = false, menuState = 'menu', purchasePending = false;
let selectedMode:RunMode=save.runSetup.mode==='short'?'endless':save.runSetup.mode,selectedBuild:BuildId=save.runSetup.build;
let touchControls: TouchControls | undefined;
let modeSwipeStart:{x:number;y:number}|undefined;
let cosmeticHero:HeroId|'all'='all';
let guideTab='enemies',guideReturn='menu',guideHero:HeroId=save.hero,guideWeapon:WeaponId=save.weapon;

const desktopMenu=matchMedia('(min-width: 701px)');
desktopMenu.addEventListener('change',()=>{const tools=overlay.querySelector<HTMLDetailsElement>('.home-tools');if(tools)tools.open=desktopMenu.matches;});
const audio = new AudioManager(), overlay = document.querySelector<HTMLDivElement>('#overlay')!, hud = document.querySelector<HTMLDivElement>('#hud')!;
// Suppress long-press selection and context menus without blocking touch scrolling.
for(const event of ['contextmenu','selectstart','dragstart'])document.addEventListener(event,e=>{
    if(e.target instanceof Element&&e.target.closest('#game,#hud,#overlay,#touch-controls'))e.preventDefault();
});
const accounts=createAccounts({url:import.meta.env.VITE_SUPABASE_URL,key:import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY},{
 read:()=>progressBundle(save),safe:()=>!scene||scene.ended,
 store:()=>{storeSave(save);},
 apply:(progress,account)=>{if(scene&&!scene.ended)return;PLAYTEST.unlimitedGold=false;PLAYTEST.unlimitedPetals=false;touchControls?.destroy();touchControls=undefined;stopGameViewport?.();stopGameViewport=undefined;game?.destroy(true);game=undefined;scene=undefined;save=acceptProgress(progress);selectedMode=save.runSetup.mode==='short'?'endless':save.runSetup.mode;selectedBuild=save.runSetup.build;storeSave(save);syncAudio();menu();}
});
function artImage(kind:'hero'|'weapon',id:string){const skin=kind==='hero'?equippedSkin(save,id as HeroId):undefined;return skin?(id==='ninja'?ninjaSkinPortrait(skin):id==='gunner'?gunnerSkinPortrait(skin):id==='tank'?tankSkinPortrait(skin):id==='samurai'?samuraiPortrait(true,skin):baseArtImage(kind,id)):baseArtImage(kind,id);}
function weaponShopImage(id:WeaponId){const skin=equippedWeaponSkin(save,id);return skin?(isSamuraiWeapon(id)?samuraiWeaponPortrait(id,skin):isGunnerWeapon(id)?gunnerSkinWeaponPortrait(skin,id):isTankWeapon(id)?tankSkinWeaponPortrait(skin,id):WEAPONS[id].hero==='ninja'?ninjaSkinWeaponPortrait(skin,id as 'katana'|'dual'|'kama'):baseWeaponShopImage(id)):baseWeaponShopImage(id);}
function persist() {
    if (!storeSave(save))
        toast('Browser storage is unavailable. Progress lasts for this session.');
}
function syncAudio() { audio.sound = save.settings.sound; audio.music = false; }
function toast(message: string) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = message; document.body.append(t); setTimeout(() => t.remove(), 3000); }
const button = (label: string, action: string, cls = '') => `<button class="${cls}" data-action="${action}">${label}</button>`;
type ScreenPosition={outer:number;panel:number;focus?:{attribute:string;value:string};card?:number};
let renderedScreen='',renderRevision=0,eventPosition:ScreenPosition|undefined;
function screenPosition(target:Element|null=document.activeElement){
 const control=target?.closest<HTMLElement>('[data-action],[data-setting],[data-control],[data-cosmetic-hero],[data-guide-weapon]');
 const attribute=control&&['data-action','data-setting','data-control','data-cosmetic-hero','data-guide-weapon'].find(a=>control.hasAttribute(a));
 const card=control?.closest('.cosmetic-card');
 return {outer:overlay.scrollTop,panel:overlay.querySelector('.panel')?.scrollTop||0,focus:attribute?{attribute,value:control!.getAttribute(attribute)!}:undefined,card:card?Array.from(overlay.querySelectorAll('.cosmetic-card')).indexOf(card):undefined};
}
// Capture before renderers change classes or replace their screen contents.
for(const event of ['click','change'])overlay.addEventListener(event,e=>{
 const position=screenPosition(e.target instanceof Element?e.target:null);eventPosition=position;
 queueMicrotask(()=>{if(eventPosition===position)eventPosition=undefined;});
},{capture:true});
function shell(content: string, wide = false) {
 const sameScreen=renderedScreen===menuState,position=eventPosition||screenPosition(),revision=++renderRevision;
 renderedScreen=menuState;overlay.style.display='grid';overlay.innerHTML=`<section class="panel ${wide?'wide':''}">${content}</section>`;
 const restore=()=>{
  if(revision!==renderRevision)return;
  if(sameScreen){
   const focus=position.focus;
   if(focus){const control=Array.from(overlay.querySelectorAll<HTMLElement>(`[${focus.attribute}]`)).find(el=>el.getAttribute(focus.attribute)===focus.value)|| (position.card===undefined?undefined:overlay.querySelectorAll('.cosmetic-card')[position.card]?.querySelector<HTMLElement>('button'));control?.focus({preventScroll:true});}
   overlay.scrollTop=position.outer;const panel=overlay.querySelector('.panel');if(panel)panel.scrollTop=position.panel;
  }else{overlay.scrollTop=0;const panel=overlay.querySelector('.panel');if(panel)panel.scrollTop=0;}
 };
 restore();requestAnimationFrame(restore);
}
function header(title: string, sub: string) { return `<div class="eyebrow"><span class="rift-wordmark">RIFTBORN</span> <span>● OFFLINE / SOLO</span></div><h2>${title}</h2><p class="muted">${sub}</p>`; }
function back() { return button('← Back', 'menu', 'quiet'); }
function openChallengeGifts(){
 let dialog=overlay.querySelector<HTMLDialogElement>('#challenge-gifts');
 if(!dialog){overlay.insertAdjacentHTML('beforeend',`<dialog id="challenge-gifts" class="challenge-gift-dialog" aria-label="Challenge Gifts"><button class="gift-dialog-close quiet" data-action="challenge-gifts-close" aria-label="Close Challenge Gifts" autofocus>✕</button>${challengeRewardsUi(save,'Challenge Gifts',undefined,true)}</dialog>`);dialog=overlay.querySelector<HTMLDialogElement>('#challenge-gifts')!;
 dialog.addEventListener('close',()=>{if(menuState==='challenge-gifts')menuState='menu';overlay.querySelector<HTMLButtonElement>('[data-action="challenge-gifts"]')?.focus({preventScroll:true});});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog!.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog!.close();});
 }
 menuState='challenge-gifts';dialog.showModal();
}
function menu() {
 menuState='menu';hud.innerHTML='';overlay.className='';void accounts.resume();
 const daily=dailySetup(),dailyMode=selectedMode==='daily',today=save.daily[daily.date!];
 const appearance=dailyMode?dailyAppearance(save,daily):save,hero=dailyMode?daily.hero!:save.hero,weapon=dailyMode?daily.weapon!:save.weapon;
 const outfitId=appearance.cosmetics.equipped[`character:${hero}`],outfit=COSMETICS.find(c=>c.id===outfitId)?.name;
 const dailyStatus=today?.wins?'Completed today':today?.score?'Try again today':'Not completed yet';
 const modes=`<div class="hub-mode-list" role="radiogroup" aria-label="Choose your game mode">${(['endless','daily'] as const).map(mode=>`<button class="hub-mode mode-${mode} ${selectedMode===mode?'selected':''}" data-action="home-mode:${mode}" role="radio" aria-checked="${selectedMode===mode}" tabindex="${selectedMode===mode?0:-1}"><span class="hub-mode-picture"><img src="/assets/mode-art/${mode}.webp" alt=""/></span><span class="hub-mode-copy"><b>${mode==='daily'?'Daily Challenge':'Endless'}</b><span>${mode==='daily'?'10 waves · Defend the camp':'Growing hordes · No wave limit'}</span><small>${mode==='daily'?`<span class="gold-coin currency-coin petal-coin" aria-hidden="true">✿</span> Petal rewards · ${dailyStatus}`:'Face the horde. Beat your best.'}</small></span><span class="hub-mode-check" aria-hidden="true">${selectedMode===mode?'✓':'○'}</span></button>`).join('')}</div>`;
 shell(`<main class="landing-screen quick-start home-clean home-action home-hub hero-${hero} ${dailyMode?'home-daily-showcase':''}">
 <header class="home-header"><span class="home-brand rift-wordmark">RIFTBORN</span><div class="hub-wallets"><span class="hub-wallet"><b><span class="gold-coin currency-coin" aria-hidden="true">✦</span> ${PLAYTEST.unlimitedGold?'∞':save.gold.toLocaleString()}</b><small>Gold</small></span><span class="hub-wallet petals"><b><span class="gold-coin currency-coin petal-coin" aria-hidden="true">✿</span> ${PLAYTEST.unlimitedPetals?'∞':save.petals.toLocaleString()}</b><small>Petals</small></span>${button('Shop','shop','quiet')}${accounts.button()}</div></header>
 <section class="home-showcase" aria-label="${dailyMode?'Today’s defender':'Your equipped survivor'}">${challengeGiftButton(save)}<div class="home-survivor-poster" aria-hidden="true">${combatPortrait(appearance,hero)}</div><span class="camp-art-loading" role="status">Loading survivor…</span><canvas id="home-scene" role="img" aria-label="${HEROES[hero].name} holding the equipped ${WEAPONS[weapon].name}"></canvas><div class="hub-survivor"><div><small class="home-defender-label">${dailyMode?'✦ TODAY’S DEFENDER':'YOUR SURVIVOR'}</small><h2>${HEROES[hero].name}</h2>${dailyMode?'<span class="home-daily-mission">10 waves · Defend the camp</span>':''}<p>${WEAPONS[weapon].name}${outfit?` · ${outfit}`:''}</p><div class="camp-equipped-skills">${hero==='zawgyi'?validZawgyiLoadout(appearance.zawgyiSkills).map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${ZAWGYI_SKILLS[id].name}</span>`).join(''):hero==='pyusawhti'?validPyusawhtiLoadout(appearance.pyusawhtiSkills).map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${PYUSAWHTI_SKILLS[id].name}</span>`).join(''):hero==='lethwei'?validLethweiLoadout(appearance.lethweiSkills).map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${LETHWEI_SKILLS[id].name}</span>`).join(''):hero==='kyansittha'?validKyansitthaLoadout(appearance.kyansitthaSkills).map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${KYANSITTHA_SKILLS[id].name}</span>`).join(''):isAbilityHero(hero)?validHeroAbilities(hero,appearance.heroAbilities[hero]).map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${HERO_ABILITIES[id].name}</span>`).join(''):`<span><kbd>Space</kbd> ${HEROES[hero].ability} · ${HEROES[hero].cooldown}s</span>`}</div></div>${button(dailyMode?'View daily loadout':'Change loadout',dailyMode?'daily-loadout':'loadout','quiet')}</div></section>
 <section class="landing-copy hub-run-setup"><h1 class="rift-title rift-wordmark">RIFTBORN</h1>${modes}
 <div class="hub-launch">${button(dailyMode?'PLAY DAILY CHALLENGE →':'PLAY ENDLESS →','quick-play','primary')}<small>${dailyMode?`${HEROES[hero].name} · Defend the beacon · ${dailyStatus}${today?.score?` · Best score ${today.score.toLocaleString()}`:''}`:save.bestWave?`Personal best · Wave ${save.bestWave}`:'Your first stand starts here.'}</small></div>

 ${dailyMode?`<div class="home-daily-practice">${button('▶ Practice one wave','daily-practice','quiet')}<small>Free practice · Your saved equipment stays unchanged</small></div>`:''}
 </section>
 <footer class="hub-footer"><nav aria-label="More game options">${button('Cosmetics','tab:cosmetics','quiet')}${button('Field Guide','guide','quiet')}${button('Settings','settings','quiet')}${fullscreenButton()}<a class="quiet" href="/privacy.html" target="_blank" rel="noopener">Privacy</a><a class="quiet" href="/terms.html" target="_blank" rel="noopener">Terms</a></nav><details class="hub-records"><summary>Personal records</summary>${save.bestWave||save.bestKills||save.bestTime?'<div class="records">':'<p class="camp-first-run">Your story starts here. Survive your first run to set a personal best.</p><div class="records" hidden>'}<div><b>${save.bestWave||'—'}</b><small>BEST WAVE</small></div><div><b>${format(save.bestTime)}</b><small>LONGEST STAND</small></div><div><b>${save.bestKills}</b><small>MOST KILLS</small></div><div><b>${save.shortWins}</b><small>WINS</small></div></div></details></footer></main>`,true);
 overlay.querySelector('.panel')?.classList.add('landing-panel');
 const canvas=overlay.querySelector<HTMLCanvasElement>('#home-scene');if(canvas)void startHomeScene(canvas,hero,weapon,false,{character:cosmeticColor(appearance,'character',hero),weapon:cosmeticColor(appearance,'weapon',weapon)},equippedSkin(appearance,hero),equippedWeaponSkin(appearance,weapon));
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
 const cards=`<div class="mode-choice-grid mission-card-grid" role="radiogroup" aria-label="Game modes">${MODE_ORDER.map(m=>`<button class="mode-choice mode-${m} ${m===selectedMode?'is-selected':''}" data-action="choose-mode:${m}" role="radio" aria-checked="${m===selectedMode}" tabindex="${m===selectedMode?0:-1}" aria-label="Choose ${m==='endless'?'Endless':'Daily Challenge'}"><span class="mode-choice-art"><img src="/assets/mode-art/${m}.webp" alt=""/><span class="mission-mascot">${mascot(m==='daily')}</span>${m===selectedMode?'<span class="mode-choice-badge">Selected ✓</span>':''}</span><span class="mode-choice-body"><strong>${titles[m]}</strong><span class="mission-caption">${m==='endless'?'Survive without limits.':'Today’s challenge awaits.'}</span><span class="mission-tags"><span>${m==='endless'?'Growing hordes':'10 waves'}</span><span>${m==='endless'?'Build your survivor':'<span class="gold-coin currency-coin petal-coin" aria-hidden="true">✿</span> Petal rewards'}</span></span><b>Choose ${m==='endless'?'Endless':'Daily'} <span aria-hidden="true">→</span></b></span></button>`).join('')}</div>`;
 shell(`${header('Choose your mode','Two ways to make your next stand.')}${cards}<div class="actions">${button('← Back to loadout','loadout','quiet')}</div>`,true);overlay.querySelector('.panel')?.classList.add('mode-picker-panel','mode-card-redesign');
}
type DressTab='survivor'|'weapon'|'style'|'skills';
let dressTab:DressTab='style',dressStyle:'character'|'weapon'='character',dressPreview:string|undefined;
function dressHero(){return selectedMode==='daily'?dailySetup().hero!:save.hero;}
function dressSkinArt(design:typeof COSMETICS[number]){
 const s={...save,cosmetics:{...save.cosmetics,equipped:{...save.cosmetics.equipped,[`${design.kind}:${design.target}`]:design.id}}};
 if(design.kind==='character')return combatPortrait(s,design.target as HeroId);
 const id=design.target as WeaponId,url=design.asset;
 return url?(isSamuraiWeapon(id)?samuraiWeaponPortrait(id,url):isGunnerWeapon(id)?gunnerSkinWeaponPortrait(url,id):isTankWeapon(id)?tankSkinWeaponPortrait(url,id):ninjaSkinWeaponPortrait(url,id as 'katana'|'dual'|'kama')):baseWeaponShopImage(id);
}
function dressSkills(hero:HeroId,previewSave:typeof save){
 const ids=hero==='zawgyi'?Object.keys(ZAWGYI_SKILLS):hero==='pyusawhti'?Object.keys(PYUSAWHTI_SKILLS):hero==='lethwei'?Object.keys(LETHWEI_SKILLS):hero==='kyansittha'?Object.keys(KYANSITTHA_SKILLS):isAbilityHero(hero)?[...ABILITY_CHOICES[hero]]:[];
 if(!ids.length)return `<div class="dress-solo">${abilityIcons.ninja}<h3>${HEROES[hero].ability}</h3><p>${HEROES[hero].description}</p><button data-action="dress-preview-skill">▶ Try ability</button><small>Ninja has one signature ability.</small></div>`;
 const pair:string[]=hero==='zawgyi'?[...validZawgyiLoadout(save.zawgyiSkills)]:hero==='pyusawhti'?[...validPyusawhtiLoadout(save.pyusawhtiSkills)]:hero==='lethwei'?[...validLethweiLoadout(save.lethweiSkills)]:hero==='kyansittha'?[...validKyansitthaLoadout(save.kyansitthaSkills)]:[...validHeroAbilities(hero as AbilityHero,save.heroAbilities[hero as AbilityHero])];
 const skill=(id:string)=>hero==='zawgyi'?ZAWGYI_SKILLS[id as ZawgyiSkill]:hero==='pyusawhti'?PYUSAWHTI_SKILLS[id as PyusawhtiSkill]:hero==='lethwei'?LETHWEI_SKILLS[id as LethweiSkill]:hero==='kyansittha'?KYANSITTHA_SKILLS[id as KyansitthaSkill]:HERO_ABILITIES[id as HeroAbilityId];
 const icon=(id:string)=>hero==='zawgyi'?zawgyiSkillIcon(id as ZawgyiSkill):hero==='pyusawhti'?pyusawhtiSkillIcon(id as PyusawhtiSkill):hero==='lethwei'?lethweiSkillIcon(id as LethweiSkill):hero==='kyansittha'?kyansitthaSkillIcon(id as KyansitthaSkill):outfitUltimateIcon(previewSave,hero,ABILITY_CHOICES[hero as AbilityHero][0]===id?abilityIcons[hero]:heroAbilityIcon(id as HeroAbilityId));
 const current=skill(pair[activeSkillSlot]);
 return `<div class="dress-title"><h3>Choose your skills</h3><small>2 equipped</small></div><div class="dress-slots" aria-label="Skill slot to change">${pair.map((id,i)=>`<button data-action="skill-slot:${i}" aria-pressed="${activeSkillSlot===i}"><small>SLOT ${i+1} · ${i?'E':'Q / SPACE'}</small><b>${skill(id).name}</b></button>`).join('')}</div><div class="dress-grid dress-skill-grid">${ids.map(id=>{const position=pair.indexOf(id);return `<button class="dress-tile" data-action="${hero==='zawgyi'?'equip-skill':hero==='pyusawhti'?'equip-pyusawhti-skill':hero==='lethwei'?'equip-lethwei-skill':hero==='kyansittha'?'equip-kyansittha-skill':'equip-hero-skill'}:${id}" aria-pressed="${pair[activeSkillSlot]===id}" ${position>=0?'disabled':''}><span class="dress-skill-icon">${icon(id)}</span><b>${skill(id).name}</b><small>${position>=0?'Equipped · Slot '+(position+1):'Equip to slot '+(activeSkillSlot+1)}</small></button>`;}).join('')}</div><div class="dress-skill-detail"><div><b>${current.name} <small>· ${current.cooldown}s</small></b><p>${current.description.split('. ')[0]}${current.description.split('. ')[0].endsWith('.')?'':'.'}</p><details><summary>Full effect</summary><p>${current.description}</p></details></div><button data-action="dress-preview-skill">▶ Try skill</button></div>`;
}
function runLoadout(){
 menuState='run-loadout';const dailyMode=selectedMode==='daily',daily=dailyMode?dailySetup():undefined,hero=daily?.hero||save.hero,weapon=daily?.weapon||save.weapon;
 let previewSave=daily?dailyAppearance(save,daily):save;
 const previewDesign=dressPreview?COSMETICS.find(c=>c.id===dressPreview):undefined;
 if(previewDesign&&!dailyMode)previewSave={...save,cosmetics:{...save.cosmetics,equipped:{...save.cosmetics.equipped,[`${previewDesign.kind}:${previewDesign.target}`]:previewDesign.id}}};
 const outfitId=previewSave.cosmetics.equipped[`character:${hero}`],outfit=COSMETICS.find(c=>c.id===outfitId)?.name||'Original outfit';
 const tile=(name:string,art:string,action:string,selected:boolean,note:string,disabled=false)=>`<button class="dress-tile" data-action="${action}" aria-pressed="${selected}" ${disabled?'disabled':''}><span class="dress-tile-art" aria-hidden="true">${art}</span><b>${name}</b><small>${note}</small>${selected?'<span class="dress-check" aria-hidden="true">✓</span>':''}</button>`;
 let choices='';
 if(dailyMode&&dressTab!=='skills')choices=`<div class="dress-daily"><span class="dress-daily-portrait">${combatPortrait(previewSave,hero)}</span><h3>Today’s shared loadout</h3><p>${HEROES[hero].name} · ${WEAPONS[weapon].name}</p><small>Everyone defends the camp with the same survivor, weapon, and outfit. Your personal equipment stays saved.</small><button data-action="dress-endless">Customize Endless loadout →</button></div>`;
 else if(dressTab==='survivor')choices=`<div class="dress-title"><h3>Your survivors</h3></div><div class="dress-grid">${(Object.keys(HEROES) as HeroId[]).map(id=>tile(HEROES[id].name,combatPortrait(save,id),`dress-hero:${id}`,hero===id,save.heroes.includes(id)?'Owned':id==='lethwei'?'Clear Wave 15 · Challenge reward':`Locked · ${HEROES[id].price} gold`,!save.heroes.includes(id))).join('')}</div><details class="dress-info"><summary>About ${HEROES[hero].name}</summary><p>${HEROES[hero].description}</p><p>${HERO_IDENTITIES[hero].name} · ${HERO_IDENTITIES[hero].benefit}</p><p>Health ${HEROES[hero].hp} · Speed ${HEROES[hero].speed}</p></details>${button('Unlock survivors in shop','shop','quiet')}`;
 else if(dressTab==='weapon')choices=`<div class="dress-title"><h3>Pick your weapon</h3></div><div class="dress-grid">${(Object.keys(WEAPONS) as WeaponId[]).filter(id=>compatible(hero,id)).map(id=>tile(WEAPONS[id].name,weaponShopImage(id),`dress-weapon:${id}`,weapon===id,save.weapons.includes(id)?'Owned':`Locked · ${WEAPONS[id].price} gold`,!save.weapons.includes(id))).join('')}</div><details class="dress-info"><summary>About ${WEAPONS[weapon].name}</summary><p>Damage ${Math.round(WEAPONS[weapon].damage*HEROES[hero].damage)} · Range ${WEAPONS[weapon].range} · Interval ${WEAPONS[weapon].cooldown}s</p></details>${(hero==='pyusawhti'||hero==='lethwei')?'':button('Unlock weapons in shop','shop','quiet')}`;
 else if(dressTab==='skills')choices=dressSkills(hero,previewSave);
 else{
 const target=dressStyle==='character'?hero:weapon,key=`${dressStyle}:${target}`,equipped=save.cosmetics.equipped[key],designs=COSMETICS.filter(c=>c.kind===dressStyle&&c.target===target);
 choices=`<div class="dress-title"><h3>Make it yours</h3><div class="dress-switch" aria-label="Cosmetic type"><button data-action="dress-style:character" aria-pressed="${dressStyle==='character'}">Outfits</button><button data-action="dress-style:weapon" aria-pressed="${dressStyle==='weapon'}">Weapon skins</button></div></div><div class="dress-grid">${tile('Original',dressStyle==='character'?baseArtImage('hero',hero):baseWeaponShopImage(weapon),'dress-default',!equipped&&!dressPreview,'Always owned')}${designs.map(c=>tile(c.name,dressSkinArt(c),`dress-cosmetic:${c.id}`,dressPreview===c.id||!dressPreview&&equipped===c.id,save.cosmetics.owned.includes(c.id)?equipped===c.id?'Equipped':'Owned':c.id===FOX_RONIN_REWARD?'First Daily clear · Free outfit':`Preview · <span class="gold-coin currency-coin petal-coin" aria-hidden="true">✿</span> ${c.price}`)).join('')}</div>${previewDesign?`<div class="dress-purchase"><div><b>${previewDesign.name}</b><small>${save.cosmetics.owned.includes(previewDesign.id)?'Owned':previewDesign.id===FOX_RONIN_REWARD?'Clear your first Daily Challenge · Free reward':`<span class="gold-coin currency-coin petal-coin" aria-hidden="true">✿</span> ${previewDesign.price} · ${PLAYTEST.unlimitedPetals?'∞':save.petals.toLocaleString()} available`}</small></div>${(!save.cosmetics.owned.includes(previewDesign.id)&&previewDesign.id===FOX_RONIN_REWARD?button('Play Daily →','reward-daily','primary'):button(save.cosmetics.owned.includes(previewDesign.id)?'Equip':`Buy & equip · <span class="gold-coin currency-coin petal-coin" aria-hidden="true">✿</span> ${previewDesign.price}`,'dress-buy','primary'))}${button('Cancel','dress-cancel','quiet')}</div>`:'<p class="dress-hint">✦ Mix any outfit with any weapon skin.</p>'}${designs.length?'':'<p class="dress-hint">This equipment uses its original design.</p>'}`;
 }
 shell(`<main class="dressing-room"><header class="dress-header"><b><span class="rift-wordmark">RIFTBORN</span> <span>/ LOADOUT</span></b><div><span aria-label="Gold"><span class="gold-coin currency-coin" aria-hidden="true">✦</span> ${PLAYTEST.unlimitedGold?'∞':save.gold.toLocaleString()}</span><span aria-label="Petals"><span class="gold-coin currency-coin petal-coin" aria-hidden="true">✿</span> ${PLAYTEST.unlimitedPetals?'∞':save.petals.toLocaleString()}</span>${accounts.button()}</div></header><div class="dress-body"><section class="dress-stage" aria-label="Equipped survivor preview"><small>${dailyMode?'TODAY’S DEFENDER':'MAKE YOUR NEXT STAND'}</small><h2>${HEROES[hero].name}</h2><p class="dress-outfit">${outfit}</p><div class="dress-canvas"><span class="camp-art-loading" role="status">Loading survivor…</span><canvas id="loadout-survivor" role="img" aria-label="${HEROES[hero].name} holding ${WEAPONS[weapon].name}"></canvas></div><div class="dress-chips"><span>${WEAPONS[weapon].name}</span><span>${hero==='ninja'?'1 signature ability':'2 skills equipped'}</span></div><p class="dress-status" role="status">${dressPreview?'Preview only · Not equipped':dailyMode?'Daily loadout · Your gear stays saved':'Your look, your way.'}</p></section><section class="dress-options" aria-label="Loadout choices"><div class="dress-tabs" role="tablist" aria-label="Loadout category">${(['survivor','weapon','style','skills'] as DressTab[]).map(t=>`<button id="dress-tab-${t}" role="tab" aria-controls="dress-choices" aria-selected="${dressTab===t}" data-action="dress-tab:${t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div><div id="dress-choices" role="tabpanel" aria-labelledby="dress-tab-${dressTab}">${choices}</div></section></div><footer class="dress-footer">${button('← Back','menu','quiet')}<small>${dressPreview?'Previewing · Changes not saved':'Changes saved automatically'}</small><button class="dress-mode" id="loadout-mode-trigger" data-action="loadout-mode-toggle" aria-haspopup="true" aria-controls="loadout-mode-menu" aria-expanded="false"><span>${dailyMode?'Daily Challenge':'Endless'}</span><span aria-hidden="true">⌄</span></button><div id="loadout-mode-menu" class="loadout-mode-menu" popover="auto" role="group" aria-label="Choose game mode"><small>CHOOSE YOUR CHALLENGE</small>${(['endless','daily'] as const).map(mode=>`<button data-action="loadout-mode:${mode}" aria-pressed="${selectedMode===mode}"><span class="mode-option-symbol" aria-hidden="true">${mode==='endless'?'∞':'☀'}</span><span><b>${mode==='endless'?'Endless':'Daily Challenge'}</b><small>${mode==='endless'?'Survive growing hordes · No wave limit':'10 waves · Defend the camp'}</small></span><span class="mode-option-check" aria-hidden="true">${selectedMode===mode?'✓':''}</span></button>`).join('')}</div>${button(dailyMode?'Play Daily →':'Play Endless →','begin','primary')}</footer></main>`,true);
 overlay.querySelector('.panel')?.classList.add('dress-panel');
 const canvas=overlay.querySelector<HTMLCanvasElement>('#loadout-survivor');if(canvas)void startHomeScene(canvas,hero,weapon,true,{character:cosmeticColor(previewSave,'character',hero),weapon:cosmeticColor(previewSave,'weapon',weapon)},equippedSkin(previewSave,hero),equippedWeaponSkin(previewSave,weapon));
}

function abilityChoiceIcon(hero:AbilityHero,id:HeroAbilityId){return ABILITY_CHOICES[hero][0]===id?outfitUltimateIcon(save,hero,abilityIcons[hero]):outfitUltimateIcon(save,hero,heroAbilityIcon(id));}
function heroSkillsGuide(){const hero=guideHero;const entries=isAbilityHero(hero)?ABILITY_CHOICES[hero].map(id=>({id,...HERO_ABILITIES[id],art:abilityChoiceIcon(hero,id)})):hero==='zawgyi'?Object.entries(ZAWGYI_SKILLS).map(([id,v])=>({id,...v,art:zawgyiSkillIcon(id as ZawgyiSkill)})):hero==='pyusawhti'?Object.entries(PYUSAWHTI_SKILLS).map(([id,v])=>({id,...v,art:pyusawhtiSkillIcon(id as PyusawhtiSkill)})):hero==='lethwei'?Object.entries(LETHWEI_SKILLS).map(([id,v])=>({id,...v,art:lethweiSkillIcon(id as LethweiSkill)})):hero==='kyansittha'?Object.entries(KYANSITTHA_SKILLS).map(([id,v])=>({id,...v,art:kyansitthaSkillIcon(id as KyansitthaSkill)})):[{id:'ninja',name:HEROES.ninja.ability,cooldown:HEROES.ninja.cooldown,description:HEROES.ninja.description,art:abilityIcons.ninja}];return `<section class="camp-skills"><h3>${HEROES[hero].name} abilities</h3><p>${hero==='ninja'?'Use Space to activate Shadow Dash.':'Equip two distinct skills in Your Loadout. Q / Space activates slot 1; E activates slot 2. Each has an independent cooldown.'}</p><div class="camp-skill-cards">${entries.map(v=>`<article>${v.art}<h4>${v.name}</h4><small>${v.cooldown}s base cooldown</small><p>${v.description}</p></article>`).join('')}</div></section>`;}
let activeSkillSlot:0|1=0;
let rewardPreviewReturn='menu';
function characters() { menuState = 'characters'; shell(`${header('Choose your survivor', 'Each survivor changes how you fight. Unlock new styles in the armoury.')}<div class="cards character-cards">${Object.entries(HEROES).map(([id, h]) => { const owned = save.heroes.includes(id as HeroId); return `<button class="character ${save.hero === id ? 'selected' : ''}" data-action="hero:${id}" ${!owned ? 'disabled' : ''}><div class="character-icon" style="--hero:#${h.color.toString(16)}">${artImage('hero', id)}</div><small>${h.tag}</small><h3>${h.name}</h3><p>${h.description}</p><div class="hero-identity"><b>${HERO_IDENTITIES[id as HeroId].icon} ${HERO_IDENTITIES[id as HeroId].name}</b><small>${HERO_IDENTITIES[id as HeroId].trigger} → ${HERO_IDENTITIES[id as HeroId].benefit}</small></div><div class="mini-stats"><span>♥ ${h.hp}</span><span>↗ ${h.speed}</span><span>⚔ ×${h.damage}</span></div><strong>${owned ? (save.hero === id ? 'SELECTED' : 'SELECT') : id==='lethwei'?'CLEAR WAVE 15':`LOCKED · <span class="gold-coin currency-coin" aria-hidden="true">✦</span> ${h.price}`}</strong></button>`; }).join('')}</div><div class="actions">${back()}${button('Visit shop', 'shop')}${button('Choose weapon →', 'weapons', 'primary')}</div>`, true); }
function weapons() { menuState = 'weapons'; shell(`${header('Your weapon, your rules', `Choose compatible equipment for ${HEROES[save.hero].name}.`)}<div class="cards weapon-select-cards">${Object.entries(WEAPONS).filter(([id]) => compatible(save.hero, id as WeaponId)).map(([id, w]) => `<button class="upgrade weapon-select-card weapon-${w.hero} ${save.weapon === id ? 'selected' : ''}" style="--weapon-glow:#${HEROES[w.hero as HeroId].color.toString(16)}" data-action="weapon:${id}" ${save.weapons.includes(id as WeaponId) ? '' : 'disabled'}><div class="weapon-art">${weaponShopImage(id as WeaponId)}</div><small>${ART_NAMES[id as WeaponId]}</small><h3>${w.name}</h3><p>${Math.round(w.damage*HEROES[save.hero].damage)} base damage · ${w.cooldown}s weapon interval<br>${w.range} range</p><p class="equipment-compare">${save.weapon===id?'Current weapon':`Compared with ${WEAPONS[save.weapon].name}:<br>${(Math.round(w.damage*HEROES[save.hero].damage)-Math.round(WEAPONS[save.weapon].damage*HEROES[save.hero].damage))>=0?'+':''}${(Math.round(w.damage*HEROES[save.hero].damage)-Math.round(WEAPONS[save.weapon].damage*HEROES[save.hero].damage))} base damage · ${(w.cooldown-WEAPONS[save.weapon].cooldown).toFixed(2)}s interval · ${w.range-WEAPONS[save.weapon].range>=0?'+':''}${w.range-WEAPONS[save.weapon].range} range`}</p><strong>${save.weapons.includes(id as WeaponId) ? save.weapon === id ? 'EQUIPPED' : 'EQUIP' : `LOCKED · <span class="gold-coin currency-coin" aria-hidden="true">✦</span> ${w.price}`}</strong></button>`).join('')}</div><div class="actions">${weaponReturnToLoadout?button('← Back to loadout','loadout','quiet'):button('← Survivors', 'characters', 'quiet')}${button('Armoury', 'shop')}${button('Evolution previews','guide-weapons','quiet')}${weaponReturnToLoadout?'':button('Enter the arena →', 'play', 'primary')}</div>`, true); }
function shop(tab = 'heroes') {
    menuState = 'shop';
    const names = { heroes: 'Characters', weapons: 'Weapons', cosmetics: 'Cosmetics' };
    let items = '';
    if (tab === 'heroes')
        items = Object.entries(HEROES).map(([id, h]) => `<article class="shop-item survivor-shop-item ${save.hero===id?'shop-selected':''}"><span class="shop-item-state">${save.hero===id?'✓ SELECTED':save.heroes.includes(id as HeroId)?'OWNED':id==='lethwei'?'CHALLENGE EXCLUSIVE':'NEW SURVIVOR'}</span><span class="card-icon" style="color:#${h.color.toString(16)}">${artImage('hero', id)}</span><h3>${h.name}</h3><p>${h.description}</p><small>♥ ${h.hp} · ↗ ${h.speed} · ⚔ ×${h.damage}<br>${h.ability} · ${h.cooldown}s<br>Weapons: ${Object.values(WEAPONS).filter(w => w.hero === id).map(w => w.name).join(', ')}</small>${save.heroes.includes(id as HeroId) ? (save.hero===id?'<span class="shop-current-label">✓ Your survivor</span>':button('Select survivor', `hero:${id}`)) : id==='lethwei'?'<p class="reward-unlock-note">Clear Wave 15 · Earned through battle</p>'+button('Take on Endless →','reward-endless','quiet'):button(`Unlock · <span class="gold-coin currency-coin" aria-hidden="true">✦</span> ${h.price}`, `buy:heroes:${id}`, save.gold >= h.price ? 'primary' : '')}</article>`).join('');
    if (tab === 'weapons') {
        const colors:Record<HeroId,string>={zawgyi:'#f0bf67',ninja:'#c28aff',samurai:'#ff777f',gunner:'#ffc65e',tank:'#5be6e3',pyusawhti:'#d4a017',lethwei:'#bd3a42',kyansittha:'#4a8505'};
        items = Object.entries(WEAPONS).map(([id, w]) => {
            const hero=w.hero as HeroId,owned=save.weapons.includes(id as WeaponId),equipped=save.weapon===id,canEquip=owned&&save.hero===hero;
            const action=equipped?'<span class="weapon-owned owned">✓ EQUIPPED</span>':canEquip?button('EQUIP WEAPON',`weapon:${id}`,'weapon-equip'):owned?'<span class="weapon-owned owned">✓ OWNED</span>':button(`UNLOCK · <span class="gold-coin currency-coin" aria-hidden="true">✦</span> ${w.price}`,`buy:weapons:${id}`,save.gold>=w.price?'primary':'weapon-unlock');
            return `<article class="shop-item weapon-shop-item weapon-${hero} ${equipped?'weapon-equipped':''}" style="--weapon-glow:${colors[hero]}"><div class="weapon-art"><span class="weapon-art-halo"></span>${weaponShopImage(id as WeaponId)}<span class="weapon-tag">${HEROES[hero].name}</span>${equipped?'<span class="weapon-equipped-tag">CURRENT</span>':''}</div><div class="weapon-shop-copy"><small class="weapon-class">${ART_NAMES[id as WeaponId]}</small><h3>${w.name}</h3><p>${w.damage} damage · ${w.range} range<br>${w.cooldown}s attack interval</p><div class="weapon-owner">FOR ${HEROES[hero].name.toUpperCase()}</div></div>${action}</article>`;
        }).join('');
    }
    if (tab === 'cosmetics')
        items = `<div class="cosmetic-intro"><h3>Make it yours</h3><p>Unique outfits, faces, and matching weapon designs. Style only — your stats stay the same.</p><label>Preview survivor <select aria-label="Cosmetic survivor" data-cosmetic-hero><option value="all" ${cosmeticHero==='all'?'selected':''}>All survivors &amp; weapons</option>${Object.entries(HEROES).map(([id,h])=>`<option value="${id}" ${id===cosmeticHero?'selected':''}>${h.name}</option>`).join('')}</select></label></div>`+['character','weapon'].map(kind=>`<section class="cosmetic-group"><h3>${kind==='character'?'Character outfits':'Weapon designs'}</h3><div class="cosmetic-cards">${COSMETICS.filter(c=>c.kind===kind&&(cosmeticHero==='all'||(kind==='character'?c.target===cosmeticHero:WEAPONS[c.target as WeaponId].hero===cosmeticHero))).map(c=>{const owned=save.cosmetics.owned.includes(c.id),equipped=save.cosmetics.equipped[`${c.kind}:${c.target}`]===c.id,baseHero=c.kind==='character'?c.target as HeroId:WEAPONS[c.target as WeaponId].hero as HeroId,locked=!save.heroes.includes(baseHero)||(c.kind==='weapon'&&!save.weapons.includes(c.target as WeaponId));return `<article class="shop-item cosmetic-card" style="--finish:#${c.color.toString(16)}"><div class="cosmetic-art" style="filter:${c.asset?'none':c.filter}">${kind==='character'?(c.asset?(c.target==='ninja'?ninjaSkinPortrait(c.asset):c.target==='gunner'?gunnerSkinPortrait(c.asset):c.target==='tank'?tankSkinPortrait(c.asset):samuraiPortrait(true,c.asset)):artImage('hero',c.target as HeroId)):(c.asset&&isSamuraiWeapon(c.target)?samuraiWeaponPortrait(c.target,c.asset):c.asset&&isGunnerWeapon(c.target)?gunnerSkinWeaponPortrait(c.asset,c.target):c.asset&&isTankWeapon(c.target)?tankSkinWeaponPortrait(c.asset,c.target):c.asset&&WEAPONS[c.target as WeaponId].hero==='ninja'?ninjaSkinWeaponPortrait(c.asset,c.target as 'katana'|'dual'|'kama'):weaponShopImage(c.target as WeaponId))}</div><h3>${c.name}</h3><small>${kind==='character'?(c.asset?'Unique outfit & face':'Character color'):(c.asset?'Unique weapon design':'Weapon finish')}</small>${locked?'<small class="cosmetic-unlock-note">Design can be selected now. Unlock base equipment to use in a run.</small>':''}${equipped?button('✓ Selected · Remove',`cosmetic-reset:${c.kind}:${c.target}`,'active'):owned?button('Equip',`cosmetic-equip:${c.id}`):c.id===FOX_RONIN_REWARD?'<p>First Daily clear · Free Samurai outfit</p>'+button('Play Daily →','reward-daily','quiet'):button(`<span class="gold-coin currency-coin petal-coin" aria-hidden="true">✿</span> ${c.price} · Buy`, `cosmetic-buy:${c.id}`,'primary')}</article>`;}).join('')}</div></section>`).join('');
    shell(`${header('Gear up for your next stand','Find your survivor. Pick your weapon. Build your advantage.')}<div class="shop-top"><div class="shop-wallets" aria-label="Your currencies"><span class="coin"><span class="gold-coin currency-coin" aria-hidden="true">✦</span> ${PLAYTEST.unlimitedGold ? '∞' : save.gold.toLocaleString()} GOLD</span><span class="petal-wallet"><span class="gold-coin currency-coin petal-coin" aria-hidden="true">✿</span> ${PLAYTEST.unlimitedPetals?'∞':save.petals.toLocaleString()} PETALS</span></div><nav aria-label="Shop categories">${Object.entries(names).map(([id, name]) => button(name, `tab:${id}`, tab === id ? 'active' : 'quiet')).join('')}</nav></div>${challengeRewardsUi(save,"Earn by playing")}<div class="shop-grid shop-collection-${tab} ${tab==='weapons'?'weapon-shop-grid':''}">${items}</div><div class="actions">${back()}${button('Choose survivor', 'characters')}${button('Enter the arena →', 'play', 'primary')}</div>`, true);
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
 shell(`${header('Make it your game','Your sound. Your controls. Your next stand.')}<div class="preferences-grid"><section class="preference-group"><div class="preference-heading"><span aria-hidden="true">♫</span><div><small>SET THE MOOD</small><h3>Sound & atmosphere</h3></div></div>${toggle('sound','Sound effects','Hear every hit, shot and enemy attack.')}${toggle('shake','Screen shake','Add impact to powerful attacks. Turn off for a calmer view.')}</section><section class="preference-group"><div class="preference-heading"><span aria-hidden="true">✥</span><div><small>FIND YOUR COMFORT</small><h3>Touch controls</h3></div></div>${toggle('aimAssist','Aim assistance','Help aim your attacks when playing on mobile.')}<label class="preference-row"><span class="preference-copy"><b>Joystick side</b><small>Choose which thumb handles movement.</small></span><select aria-label="Joystick side" data-control="joystickSide"><option value="left" ${save.settings.joystickSide==='left'?'selected':''}>Left</option><option value="right" ${save.settings.joystickSide==='right'?'selected':''}>Right</option></select></label><label class="preference-row"><span class="preference-copy"><b>Joystick size</b><small>Pick a size that feels easy to reach.</small></span><select aria-label="Joystick size" data-control="joystickSize">${[95,115,135].map(n=>`<option value="${n}" ${save.settings.joystickSize===n?'selected':''}>${n===95?'Compact':n===115?'Standard':'Large'}</option>`).join('')}</select></label><label class="preference-row"><span class="preference-copy"><b>Ranged skill casting</b><small>Gunner’s bomb and beacon. Hold Q/E or drag a skill button to aim; release to cast.</small></span><select aria-label="Ranged skill casting" data-control="skillCast"><option value="hold" ${save.settings.skillCast!=='quick'?'selected':''}>Aim on hold</option><option value="quick" ${save.settings.skillCast==='quick'?'selected':''}>Quick cast</option></select></label><p class="preference-note">Cancel aiming with Esc, right-click, or the Cancel area. Movement stays active.</p></section></div><div class="preferences-footer"><span>✓ Changes save automatically<small>Progress is stored in this browser.</small></span>${button(scene&&!scene.ended?'← Back to pause':'← Back to menu',scene&&!scene.ended?'pause':'menu','primary')}</div><details class="preferences-reset"><summary>Progress management</summary><div><p>Start over by clearing your saved progress in this browser.</p>${button('Reset progress','reset','danger')}</div></details>`,true);
 overlay.querySelector('.panel')?.classList.add('preferences-panel');
}
let lastRunOptions:RunOptions|undefined,loadGeneration=0,loadingTimer:ReturnType<typeof setTimeout>|undefined;
function refreshSkillSelection(focus:string){const scroll=overlay.scrollTop;runLoadout();overlay.scrollTop=scroll;overlay.querySelector<HTMLButtonElement>(`[data-action="${focus}"]`)?.focus({preventScroll:true});}
function loadingFailed(generation:number){if(generation!==loadGeneration||menuState!=='loading')return;clearTimeout(loadingTimer);menuState='load-error';touchControls?.destroy();stopGameViewport?.();stopGameViewport=undefined;game?.destroy(true);game=undefined;scene=undefined;shell(`${header('The arena could not load','Your loadout and progress are safe. Retry, or return to camp.')}<div class="actions">${button('Retry','load-retry','primary')}${button('Back to camp','menu','quiet')}</div>`);}
async function start(options:RunOptions={mode:selectedMode,build:selectedBuild,technique:'standard'}) { if(menuState==='loading')return;if(navigator.userActivation?.isActive)void enterGameFullscreen();const generation=++loadGeneration;lastRunOptions={...options};clearTimeout(loadingTimer);loadingTimer=setTimeout(()=>loadingFailed(generation),25000);if(!options.practice)save.runSetup={mode:options.mode,build:options.build};touchControls?.destroy(); stopGameViewport?.();stopGameViewport=undefined;game?.destroy(true); scene = undefined;hud.innerHTML='';overlay.className='';menuState='loading';shell('<div class="arena-loading" role="status" aria-live="polite"><div class="eyebrow"><span class="rift-wordmark">RIFTBORN</span></div><h2>Preparing your stand…</h2><p>Loading the arena and your survivor.</p><progress aria-label="Arena loading" max="100"></progress><small data-load-progress>Opening the arena…</small><button class="quiet" data-action="menu">Back to camp</button></div>'); syncAudio(); audio.unlock(); let runtime;try{runtime=await Promise.all([import('phaser'),import('./combat')]);}catch{loadingFailed(generation);return;}if(menuState!=='loading'||generation!==loadGeneration)return;const [{default:Phaser},{ArenaScene}]=runtime;const s = new ArenaScene(save, audio, showChoices, results, pause, options); scene = s;
 s.onLoading=(progress)=>{const bar=overlay.querySelector<HTMLProgressElement>('progress');if(bar)bar.value=Math.round(progress*100);const label=overlay.querySelector('[data-load-progress]');if(label)label.textContent=progress>=1?'Preparing the first frame…':`${Math.round(progress*100)}%`;};
 s.onArenaReady=()=>requestAnimationFrame(()=>{if(scene!==s||menuState!=='loading')return;clearTimeout(loadingTimer);overlay.style.display='none';overlay.className='ingame';menuState='game';});
 s.onLoadingError=()=>loadingFailed(generation);
 touchControls=new TouchControls((event)=>{if(s.skillAim?.startTouch(0,event))return;if(!s.paused&&!s.ended&&s.countdown<=0)s.activate(touchControls!.state.x,touchControls!.state.y);});touchControls.setLayout(save.settings.joystickSide,save.settings.joystickSize);s.touch=touchControls.state; game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: 1200, height: 760, backgroundColor: '#101b28', scene: [s], scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }, render: { antialias: true }, audio: { noAudio: true } }); const runningGame=game;stopGameViewport=observeGameViewport(document.getElementById('game')!, (width,height)=>{if(game!==runningGame)return;touchControls?.reset();runningGame.scale.resize(width,height);}); persist(); }
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
    const skills=scene.hero==='zawgyi'?validZawgyiLoadout(save.zawgyiSkills).map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${ZAWGYI_SKILLS[id].name}</span>`).join(''):scene.hero==='pyusawhti'?validPyusawhtiLoadout(save.pyusawhtiSkills).map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${PYUSAWHTI_SKILLS[id].name}</span>`).join(''):scene.hero==='lethwei'?validLethweiLoadout(save.lethweiSkills).map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${LETHWEI_SKILLS[id].name}</span>`).join(''):scene.hero==='kyansittha'?validKyansitthaLoadout(save.kyansitthaSkills).map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${KYANSITTHA_SKILLS[id].name}</span>`).join(''):scene.heroAbilities?scene.heroAbilities.equipped.map((id,i)=>`<span><kbd>${i===0?'Q / Space':'E'}</kbd> ${HERO_ABILITIES[id].name}</span>`).join(''):`<span><kbd>Space</kbd> ${HEROES[scene.hero].ability}</span>`;
    shell(`<div class="camp-pause-heading"><span class="camp-pause-portrait" aria-hidden="true">${artImage('hero',scene.hero)}</span><div><small>LAST SAFE CAMP · PAUSED</small><h2>Catch your breath.</h2><p>Your stand continues when you’re ready.</p></div></div><div class="camp-pause-records" aria-label="Current run"><div><span>Gold earned</span><b><span class="gold-coin currency-coin" aria-hidden="true">✦</span> ${scene.stats.gold}</b></div><div><span>Enemies defeated</span><b>${scene.stats.kills}</b></div><div><span>Time survived</span><b>${format(scene.elapsed)}</b></div></div><details class="camp-pause-controls"><summary>Controls &amp; equipped skills</summary><div><span><kbd>WASD / ↑ ↓ ← →</kbd> Move</span><span><kbd>Mouse</kbd> Aim · attacks fire automatically</span>${skills}<span><kbd>1–3</kbd> Choose upgrade <kbd>M</kbd> Sound</span></div></details><div class="camp-pause-quick">${button(`Sound ${save.settings.sound?'on':'off'}`,'pause-sound','quiet')}${button(`Map view ${save.settings.mapView||1}×`,'pause-map','quiet')}${fullscreenButton()}</div><div class="camp-pause-actions">${button('Resume run →','resume','primary')}<div>${button('Settings','settings','quiet')}${button('End run','end','danger')}</div></div>`);
    overlay.querySelector('.panel')?.classList.add('camp-pause');
}
function resume() { scene!.paused = false; overlay.style.display = 'none'; menuState = 'game'; }
function showChoices(wave = false) { if(wave){waveClear();return;} waveChoice = false; menuState = 'choice'; choices = upgradeChoices(scene!.hero, scene!.levels,scene!.cardRandom,scene!.weapon,scene!.stats.wave,scene!.cardEvolutions,scene!.zawgyi?.equipped); for(const u of choices)if(u.evolves)save.archive['card:'+u.evolves]=Math.max(save.archive['card:'+u.evolves]||0,1) as 1|2;renderChoices(); persist(); }
function finishIntermission(){if(!scene||scene.ended)return;overlay.style.display='none';menuState='game';scene.nextWave();persist();}
function evolutionMenu(){const s=scene!;for(const e of evolutionOptions(s.hero))save.archive[`weapon:${s.weapon}:${e.id}`]=Math.max(save.archive[`weapon:${s.weapon}:${e.id}`]||0,1) as 1|2;persist();menuState='evolution';shell(weaponAwakeningUi(s.hero,s.weapon,s.stats.wave,s.awakened,s.options.mode==='daily'),true);overlay.querySelector('.panel')?.classList.add('weapon-awakening-panel');}
function waveClear(){
 persist();
 if(scene!.challengeUnlocks.length){menuState='reward-unlocked';shell(challengeRewardsUi(save,'Rewards ready to claim!',scene!.challengeUnlocks.splice(0))+button('Keep fighting →','reward-continue','primary'),true);return;}
 if(scene!.camp){menuState='camp-reward';shell(campRewardView(scene!.camp,scene!.stats.wave),true);overlay.querySelector('.panel')?.classList.add('camp-choice-panel');return;}

 if(scene!.evolutionDue)evolutionMenu();else finishIntermission();
}
function renderChoices() { const s = scene!; const rewardReveal=scene!.challengeUnlocks.length?challengeRewardsUi(save,'Rewards ready to claim!',scene!.challengeUnlocks.splice(0)):''; const title=waveChoice?header(`Wave ${s.stats.wave} survived`,'Recover. Adapt. The next horde is coming.'):`<div class="choice-heading"><b>SKILL CHOICE</b><small>LEVEL ${s.level} · PICK ONE</small></div>`; shell(`${title}${rewardReveal} ${waveChoice ? `<div class="wave-recap"><span>${s.waveStats.time.toFixed(1)}s <small>CLEAR TIME</small></span><span>${s.waveStats.kills} <small>KILLS</small></span><span><span class="gold-coin currency-coin" aria-hidden="true">✦</span> ${s.waveStats.gold} <small>GOLD</small></span><span>${Math.round(s.waveStats.damage)} <small>DAMAGE TAKEN</small></span></div><p class="badges">${s.waveStats.time < 45 ? '✦ QUICK CLEAR · +15% GOLD' : ''} ${s.waveStats.damage === 0 ? '◇ PERFECT CLEAR · +1 REROLL' : ''}</p>` : ''}<div class="cards upgrade-cards">${choices.map((u,i)=>visualUpgradeCard(u,i,s.hero,s.weapon,s.levels[u.id]||0,upgradeBuildHint(u,s.levels))).join('')}</div><div class="actions"><span class="muted">${button('Evolution guide','guide-cards','quiet')}</span>${button(`↻ Reroll (${s.rerolls} left)`, 'reroll', 'quiet')}</div>`, true); overlay.querySelector('.panel')?.classList.add('levelup-panel');const reroll=overlay.querySelector<HTMLButtonElement>('[data-action=reroll]');if(reroll)reroll.disabled=s.rerolls<=0; }
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
 if(s.options.practice){menuState='practice-results';shell(`${header(s.victory?'Practice complete':'Practice finished','No currency, records, purchases, or daily score were changed.')}<p class="muted">${HEROES[s.hero].name} · ${WEAPONS[s.weapon].name} · ${r.kills} enemies stopped · Camp ${Math.ceil(s.camp!.hp)}/${s.camp!.max}</p><div class="actions">${button('Practice again','retry','quiet')}${button('Play the daily challenge','practice-to-daily','primary')}${button('Back to camp','menu','quiet')}</div>`,true);return;}

 if(menuState==='results')return;menuState = 'results';audio.play(s.victory?'clear':'over');if(s.victory&&(s.options.mode==='short'||s.options.mode==='daily'))save.shortWins++;const scoreBreakdown=s.camp?campScore(r.kills,r.wave,s.victory,r.time,s.camp):undefined,dailyScore=scoreBreakdown?.total??(r.kills*10+s.objectives*100+(s.victory?1000:0)+r.wave*50);if(s.options.mode==='daily'&&s.options.date){const old=save.daily[s.options.date]||{score:0,wins:0};save.daily[s.options.date]={score:Math.max(old.score,dailyScore),wins:old.wins+Number(s.victory)};} const record = r.wave > save.bestWave || r.kills > save.bestKills || r.time > save.bestTime; const previous = save.bestWave; save.bestWave = Math.max(save.bestWave, r.wave); save.bestTime = Math.max(save.bestTime, Math.floor(r.time)); save.bestKills = Math.max(save.bestKills, r.kills); persist();
 const earnedRewards=s.challengeUnlocks.length?challengeRewardsUi(save,'Rewards ready to claim!',s.challengeUnlocks.splice(0)):'';
 const top=Object.entries(s.levels).sort((a,b)=>b[1]-a[1])[0];
 const metric=(value:string|number,label:string,icon:string)=>`<div class="camp-result-metric"><span aria-hidden="true">${icon}</span><b>${value}</b><small>${label}</small></div>`;
 shell(`${earnedRewards}<header class="camp-result-heading"><small>LAST SAFE CAMP · ${s.options.mode==='daily'?'DAILY CHALLENGE':'ENDLESS'}</small><h2>${s.victory?'Area secured!':'Run complete'}</h2>${record?'<span class="camp-result-badge">✦ New personal best</span>':`<span class="camp-result-best">Best wave · ${Math.max(previous,r.wave)}</span>`}</header>
 <div class="camp-result-survivor"><span class="camp-result-portrait" aria-hidden="true">${artImage('hero',s.hero)}</span><div><b>${HEROES[s.hero].name}</b><span>${WEAPONS[s.weapon].name}</span></div><span class="camp-result-outcome">${s.victory?'✓ Mission complete':'Stand recorded'}</span></div>
 <section class="camp-result-metrics" aria-label="Run summary">${metric(r.wave,s.victory?'Waves cleared':'Wave reached','⚑')}${metric(format(r.time),'Time survived','◷')}${metric(r.kills,'Enemies defeated','⚔')}</section>
 <section class="camp-result-rewards" aria-label="Rewards kept"><div><span aria-hidden="true"><span class="gold-coin currency-coin" aria-hidden="true">✦</span></span><b>+${r.gold.toLocaleString()}</b><small>Gold kept</small></div><div class="petals"><span aria-hidden="true"><span class="gold-coin currency-coin petal-coin" aria-hidden="true">✿</span></span><b>+${(r.petals||0).toLocaleString()}</b><small>Petals kept</small></div></section>
 ${scoreBreakdown?`<section class="daily-score-parts" aria-label="Daily score breakdown">${Object.entries(scoreBreakdown.parts).map(([key,value])=>`<div><span>${({combat:'Enemies defeated',waves:'Waves cleared',victory:'Victory bonus',preservation:'Camp health preserved',siege:'Siege enemies stopped',speed:'Clear-time bonus'} as Record<string,string>)[key]}</span><b>+${value.toLocaleString()}</b></div>`).join('')}</section><p class="muted">Camp ${Math.ceil(s.camp!.fraction*100)}% · ${s.camp!.siegeStopped} siege stopped · ${s.victory?'Clear time':'Time survived'} ${format(r.time)}</p>`:''}
 ${s.options.mode==='daily'?`<div class="camp-result-daily"><span>Daily score <b>${dailyScore.toLocaleString()}</b></span><span>Personal best <b>${save.daily[s.options.date!]?.score.toLocaleString()||dailyScore.toLocaleString()}</b></span></div>`:''}
 ${challengeRunProgress(save,r.wave,s.victory,s.options.mode==='daily')}
 <div class="camp-result-actions">${button('Play again →','retry','primary')}<div>${button('Change loadout','loadout','quiet')}${button('Back to camp','menu','quiet')}</div></div>
 <details class="camp-result-details"><summary>More run details</summary><dl><div><dt>Damage dealt</dt><dd>${Math.round(r.dealt).toLocaleString()}</dd></div><div><dt>Damage taken</dt><dd>${Math.round(r.taken).toLocaleString()}</dd></div><div><dt>Highest combo</dt><dd>${r.combo}</dd></div><div><dt>Objectives</dt><dd>${s.objectives}</dd></div><div><dt>Elites &amp; bosses</dt><dd>${r.elites}</dd></div><div><dt>Top upgrade</dt><dd>${top?`${UPGRADES.find(u=>u.id===top[0])?.name||top[0]} ×${top[1]}`:'None'}</dd></div></dl>${s.victory?'':`<p class="camp-result-tip"><b>Next attempt</b>${deathTip(s.lastCause)}</p>`}</details>`,true);
 overlay.querySelector('.panel')?.classList.add('camp-results');
}

function format(seconds: number) { return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`; }
overlay.addEventListener('keydown',event=>{
 const target=event.target as HTMLElement;if(!target.matches('.dress-tabs [role="tab"]')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();const tabs:DressTab[]=['survivor','weapon','style','skills'],index=tabs.indexOf(dressTab);
 dressTab=event.key==='Home'?tabs[0]:event.key==='End'?tabs[3]:tabs[(index+(event.key==='ArrowRight'?1:3))%4];dressPreview=undefined;runLoadout();overlay.querySelector<HTMLButtonElement>(`#dress-tab-${dressTab}`)?.focus({preventScroll:true});
});
overlay.addEventListener('click', e => {
    if((e.target as Element).closest('[data-account-open]')){accounts.open();return;}
    const el = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!el || el.disabled)
        return;
    audio.unlock();
    const [a, b, c] = el.dataset.action!.split(':');
    if(a==='loadout-mode-toggle'){
     const menu=overlay.querySelector<HTMLElement>('#loadout-mode-menu')!,trigger=el;
     if(menu.matches(':popover-open')){menu.hidePopover();return;}
     const r=trigger.getBoundingClientRect();menu.style.left=Math.max(12,Math.min(r.left,innerWidth-304))+'px';menu.style.bottom=Math.max(12,innerHeight-r.top+8)+'px';
     menu.ontoggle=()=>trigger.setAttribute('aria-expanded',String(menu.matches(':popover-open')));
     menu.showPopover();return;
    }
    if(a==='loadout-mode'&&(b==='endless'||b==='daily')){
     selectedMode=b;dressPreview=undefined;save.runSetup={mode:selectedMode,build:selectedBuild};persist();runLoadout();
     overlay.querySelector<HTMLButtonElement>('#loadout-mode-trigger')?.focus({preventScroll:true});return;
    }
    if(a==='reward-open-gifts'){menu();openChallengeGifts();return;}
    if(a==='reward-claim'){const id=b==='lethwei'?'lethwei':FOX_RONIN_REWARD;if(claimChallengeReward(save,id)){persist();audio.play('buy');menu();openChallengeGifts();toast((id==='lethwei'?'Lethwei Master':'Fox Ronin')+' claimed!');}return;}
    if(a==='challenge-gifts'){openChallengeGifts();return;}
    if(a==='challenge-gifts-close'){overlay.querySelector<HTMLDialogElement>('#challenge-gifts')?.close();return;}
    if(a==='reward-preview'){rewardPreviewReturn=menuState;const id=b==='lethwei'?'lethwei':FOX_RONIN_REWARD;shell(challengeRewardsUi(save,b==='lethwei'?'Meet Lethwei Master':'Meet Fox Ronin',[id])+button('← Back','reward-preview-close','quiet'),true);return;}
    if(a==='reward-preview-close'){if(rewardPreviewReturn==='challenge-gifts'){menu();openChallengeGifts();}else if(rewardPreviewReturn==='run-loadout')runLoadout();else if(rewardPreviewReturn==='shop')shop();else menu();return;}
    if(a==='reward-continue'){waveClear();return;}
    if(a==='reward-daily'||a==='reward-endless'){dressPreview=undefined;selectedMode=a==='reward-daily'?'daily':'endless';save.runSetup={mode:selectedMode,build:selectedBuild};persist();runMenu(selectedMode);return;}
    if(a==='reward-loadout'){selectedMode='endless';dressPreview=undefined;if(b==='lethwei'&&save.heroes.includes('lethwei')){save.hero='lethwei';save.weapon='hempwraps';dressTab='survivor';}else{dressTab='style';dressStyle='character';if(save.heroes.includes('samurai')){save.hero='samurai';save.weapon='nodachi';dressPreview=FOX_RONIN_REWARD;}else toast('Fox Ronin is yours. Unlock Samurai to wear this outfit.');}persist();runLoadout();return;}

    if(a==='evolve'&&menuState==='evolution'&&evolutionOptions(scene!.hero).some(e=>e.id===b)){scene!.evolve(b as EvolutionId);finishIntermission();}
    if(a==='cosmetic-buy'){if(buyCosmetic(save,el.dataset.action!.slice('cosmetic-buy:'.length))){persist();shop('cosmetics');}}
    if(a==='cosmetic-equip'){
        const id=el.dataset.action!.slice('cosmetic-equip:'.length),design=COSMETICS.find(c=>c.id===id);
        if(equipCosmetic(save,id)){
            persist();shop('cosmetics');
            const hero=design!.kind==='character'?design!.target as HeroId:WEAPONS[design!.target as WeaponId].hero as HeroId;
            const available=save.heroes.includes(hero)&&(design!.kind==='character'||save.weapons.includes(design!.target as WeaponId));
            toast(available?'Cosmetic equipped. Your survivor and weapon are ready in Your Loadout.':'Design selected and saved. Unlock its survivor and weapon in the shop to use it in a run.');
        }else toast('Buy this cosmetic before equipping it.');
    }
    if(a==='cosmetic-reset'){delete save.cosmetics.equipped[`${b}:${c}`];persist();shop('cosmetics');}
    if(a==='dress-tab'&&['survivor','weapon','style','skills'].includes(b)){dressTab=b as DressTab;dressPreview=undefined;runLoadout();overlay.querySelector<HTMLButtonElement>(`#dress-tab-${b}`)?.focus({preventScroll:true});}
    if(a==='dress-style'&&(b==='character'||b==='weapon')){dressStyle=b;dressPreview=undefined;runLoadout();}
    if(a==='dress-endless'){selectedMode='endless';save.runSetup.mode='endless';persist();dressPreview=undefined;runLoadout();}
    if(a==='dress-hero'&&selectedMode!=='daily'&&save.heroes.includes(b as HeroId)){save.hero=b as HeroId;if(!compatible(save.hero,save.weapon))save.weapon=save.weapons.find(w=>compatible(save.hero,w))!;dressPreview=undefined;persist();runLoadout();}
    if(a==='dress-weapon'&&selectedMode!=='daily'&&save.weapons.includes(b as WeaponId)&&compatible(save.hero,b as WeaponId)){save.weapon=b as WeaponId;dressPreview=undefined;persist();runLoadout();}
    if(a==='dress-cosmetic'&&selectedMode!=='daily'){const id=el.dataset.action!.slice('dress-cosmetic:'.length),design=COSMETICS.find(c=>c.id===id);if(design&&design.kind===dressStyle&&design.target===(dressStyle==='character'?save.hero:save.weapon)){if(save.cosmetics.owned.includes(id)){equipCosmetic(save,id);dressPreview=undefined;persist();}else dressPreview=id;runLoadout();}}
    if(a==='dress-default'&&selectedMode!=='daily'){delete save.cosmetics.equipped[`${dressStyle}:${dressStyle==='character'?save.hero:save.weapon}`];dressPreview=undefined;persist();runLoadout();}
    if(a==='dress-cancel'){dressPreview=undefined;runLoadout();}
    if(a==='dress-buy'&&dressPreview&&selectedMode!=='daily'){const id=dressPreview;if(save.cosmetics.owned.includes(id)||buyCosmetic(save,id)){equipCosmetic(save,id);dressPreview=undefined;persist();runLoadout();audio.play('buy');}else toast('Not enough Petals for this design.');}
    if(a==='dress-preview-skill'){const daily=selectedMode==='daily'?dailySetup():undefined;void openSkillPreview(daily?dailyAppearance(save,daily):save,daily?.hero||save.hero,daily?.weapon||save.weapon,activeSkillSlot,el);}
    if(a==='loadout')runLoadout();
    if(a==='skill-slot'&&(b==='0'||b==='1')){activeSkillSlot=Number(b) as 0|1;refreshSkillSelection(`skill-slot:${b}`);}
    if(a==='equip-hero-skill'&&isAbilityHero(dressHero())&&ABILITY_CHOICES[dressHero() as AbilityHero].includes(b as HeroAbilityId)){const hero=dressHero() as AbilityHero;save.heroAbilities[hero]=replaceHeroAbility(validHeroAbilities(hero,save.heroAbilities[hero]),activeSkillSlot,b as HeroAbilityId);persist();refreshSkillSelection(`skill-slot:${activeSkillSlot}`);}
    if(a==='equip-skill'&&Object.hasOwn(ZAWGYI_SKILLS,b)){save.zawgyiSkills=replaceZawgyiSkill(validZawgyiLoadout(save.zawgyiSkills),activeSkillSlot,b as ZawgyiSkill);persist();refreshSkillSelection(`skill-slot:${activeSkillSlot}`);}
    if(a==='equip-pyusawhti-skill'&&Object.hasOwn(PYUSAWHTI_SKILLS,b)){save.pyusawhtiSkills=replacePyusawhtiSkill(validPyusawhtiLoadout(save.pyusawhtiSkills),activeSkillSlot,b as PyusawhtiSkill);persist();refreshSkillSelection(`skill-slot:${activeSkillSlot}`);}
    if(a==='equip-lethwei-skill'&&Object.hasOwn(LETHWEI_SKILLS,b)){save.lethweiSkills=replaceLethweiSkill(validLethweiLoadout(save.lethweiSkills),activeSkillSlot,b as LethweiSkill);persist();refreshSkillSelection(`skill-slot:${activeSkillSlot}`);}
    if(a==='equip-kyansittha-skill'&&Object.hasOwn(KYANSITTHA_SKILLS,b)){save.kyansitthaSkills=replaceKyansitthaSkill(validKyansitthaLoadout(save.kyansitthaSkills),activeSkillSlot,b as KyansitthaSkill);persist();refreshSkillSelection(`skill-slot:${activeSkillSlot}`);}
    if(a==='load-retry'&&lastRunOptions)void start(lastRunOptions);
    if(a==='preview-retry'){if(menuState==='run-loadout')runLoadout();else menu();}

    if(a==='home-mode'&&(b==='daily'||b==='endless')){selectedMode=b;save.runSetup={mode:selectedMode,build:selectedBuild};persist();menu();overlay.querySelector<HTMLButtonElement>(`[data-action="home-mode:${b}"]`)?.focus({preventScroll:true});}
    if(a==='camp-reward'&&menuState==='camp-reward'&&scene?.camp?.reward(b as CampReward,scene.stats.wave)){if(b==='defense')scene.campArt?.summon(scene.camp.guardianLevel===1);else audio.play('buy');if(scene.evolutionDue)evolutionMenu();else finishIntermission();}
    if(a==='daily-practice')start({...dailySetup(),practice:true});
    if(a==='practice-to-daily')start(dailySetup());
    if(a==='daily-loadout'){selectedMode='daily';runLoadout();}
    if(a==='quick-play')start(selectedMode==='daily'?dailySetup():{mode:selectedMode,build:selectedBuild,technique:'standard'});
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
    if(a==='begin')start(selectedMode==='daily'?dailySetup():{mode:selectedMode,build:selectedBuild,technique:'standard'});
    if(a==='retry'&&scene)start({...scene.options});
    if (a === 'menu') {
        ++loadGeneration;clearTimeout(loadingTimer);
        touchControls?.destroy();touchControls=undefined;stopGameViewport?.();stopGameViewport=undefined;game?.destroy(true);
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
    if((a==='pause-sound'||a==='pause-map')&&scene?.paused&&menuState==='pause'){if(a==='pause-sound'){save.settings.sound=!save.settings.sound;syncAudio();persist();}else toggleMapView(true);menuState='settings';pause();return;}
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
        if (!PLAYTEST.unlimitedGold && save.gold < cost) {
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
        choices = upgradeChoices(scene!.hero, scene!.levels,scene!.cardRandom,scene!.weapon,scene!.stats.wave,scene!.cardEvolutions,scene!.zawgyi?.equipped);
        renderChoices();
    }
    if (a === 'end' && scene && !scene.ended) {
        scene!.ended = true;
        scene!.stats.time = scene!.elapsed;
        results();
    }
    if (a === 'reset' && confirm('Erase all gold, unlocks, and records?')) {
        touchControls?.destroy();touchControls=undefined;stopGameViewport?.();stopGameViewport=undefined;game?.destroy(true);
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
overlay.addEventListener('change',e=>{const el=e.target as HTMLSelectElement;if(el.dataset.control==='skillCast'){save.settings.skillCast=el.value==='quick'?'quick':'hold';if(scene)scene.save.settings.skillCast=save.settings.skillCast;scene?.skillAim?.cancel();}else if(el.dataset.control==='joystickSide')save.settings.joystickSide=el.value==='right'?'right':'left';else if(el.dataset.control==='joystickSize')save.settings.joystickSize=[95,115,135].includes(Number(el.value))?Number(el.value):115;else return;touchControls?.setLayout(save.settings.joystickSide,save.settings.joystickSize);persist();});
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
function toggleMapView(fromPause=false){if(!scene||scene.paused&&!fromPause||scene.ended)return;cycleRunMapView(save.settings,scene.save.settings);scene.applyMapView();hud.querySelector<HTMLElement>('.combat-hud')?.setAttribute('data-map-view',String(save.settings.mapView));persist();}
// Respond before the periodic HUD render can replace a pressed button.
hud.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    const paired=(e.target as Element).closest<HTMLElement>('[data-hud^="hero-skill-"]');if(paired){e.preventDefault();if(scene?.skillAim?.startTouch(Number(paired.dataset.hud!.slice(-1)),e))return;if(scene?.hero==='tank')scene.requestAbility(Number(paired.dataset.hud!.slice(-1)),scene.touch?.x||0,scene.touch?.y||0);else scene?.heroAbilities?.activate(Number(paired.dataset.hud!.slice(-1)),scene.touch?.x||0,scene.touch?.y||0);return;}
    const mystic=(e.target as Element).closest<HTMLElement>('[data-hud^="zawgyi-"]');if(mystic){e.preventDefault();if(scene?.skillAim?.startTouch(Number(mystic.dataset.hud!.slice(-1)),e))return;const slot=Number(mystic.dataset.hud!.slice(-1)),tx=scene?.touch?.x||0,ty=scene?.touch?.y||0;if(scene?.hero==='zawgyi')scene.zawgyi?.activate(slot,tx,ty);else if(scene?.hero==='pyusawhti')scene.pyusawhti?.activate(slot,tx,ty);else if(scene?.hero==='lethwei')scene.lethwei?.activate(slot,tx,ty);else if(scene?.hero==='kyansittha')scene.kyansittha?.activate(slot,tx,ty);return;}
    if((e.target as Element).closest('[data-hud="mapView"]')){e.preventDefault();toggleMapView();return;}
    const button=(e.target as Element).closest<HTMLButtonElement>('[data-hud="ability"]');
    if(!button||button.disabled||!scene||scene.paused||scene.ended||scene.countdown>0)return;
    e.preventDefault();
    if(!scene.skillAim?.startTouch(0,e))scene.activate(scene.touch?.x||0,scene.touch?.y||0);
});
hud.addEventListener('click',e=>{const action=(e.target as Element).closest<HTMLElement>('[data-hud]')?.dataset.hud;if(!scene||scene.paused||scene.ended)return;if(action?.startsWith('hero-skill-')){if(e.detail===0){if(scene.hero==='tank')scene.requestAbility(Number(action.slice(-1)),scene.touch?.x||0,scene.touch?.y||0);else scene.heroAbilities?.activate(Number(action.slice(-1)),scene.touch?.x||0,scene.touch?.y||0);}}else if(action?.startsWith('zawgyi-')){if(e.detail===0){const slot=Number(action.slice(-1)),tx=scene.touch?.x||0,ty=scene.touch?.y||0;if(scene.hero==='zawgyi')scene.zawgyi?.activate(slot,tx,ty);else if(scene.hero==='pyusawhti')scene.pyusawhti?.activate(slot,tx,ty);else if(scene.hero==='lethwei')scene.lethwei?.activate(slot,tx,ty);else if(scene.hero==='kyansittha')scene.kyansittha?.activate(slot,tx,ty);}}else if(action==='mapView'){if(e.detail===0)toggleMapView();}else if(action==='practice-exit'&&scene.options.practice){scene.ended=true;scene.paused=true;scene.stats.time=scene.elapsed;results();}else if(action==='pause')pause();else if(action==='ability'&&scene.countdown<=0)scene.activate(scene.touch?.x||0,scene.touch?.y||0);});
setInterval(() => {
    const s = scene;
    setMusicScene(scene?.camp&&!scene.ended?(scene.paused?'camp':[...scene.siegeEnemies].some(e=>e.active)?'siege':'camp'):'menu');
    touchControls?.update(!!s&&!s.ended&&!s.paused&&menuState==='game',s&&s.countdown>0?s.countdown:s?.ability||0,HEROES[s?.hero||save.hero].ability,s?HEROES[s.hero].cooldown:1,s?outfitUltimateIcon(s.save,s.hero,abilityIcons[s.hero]):'➤',!!s&&(s.hero==='gunner'?s.overdrive>0:s.hero==='samurai'?s.counter>0:s.hero==='ninja'?s.dash>0:false),!!s&&(!!s.heroAbilities||!!s.zawgyi||!!s.pyusawhti||!!s.lethwei));
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
void accounts.initialize().catch(()=>{});

// Native selects emit change, not the button actions used by the guide tabs.
overlay.addEventListener('change',e=>{
 const select=e.target;
 if(!(select instanceof HTMLSelectElement)||!select.hasAttribute('data-guide-weapon')||!Object.hasOwn(WEAPONS,select.value))return;
 const panel=overlay.querySelector<HTMLElement>('.panel'),scroll=panel?.scrollTop||0;
 guideWeapon=select.value as WeaponId;guide();
 const nextPanel=overlay.querySelector<HTMLElement>('.panel');if(nextPanel)nextPanel.scrollTop=scroll;
 overlay.querySelector<HTMLSelectElement>('[data-guide-weapon]')?.focus({preventScroll:true});
});

overlay.addEventListener('change',e=>{const target=e.target as HTMLSelectElement;if(target.matches('[data-cosmetic-hero]')&&(target.value==='all'||Object.hasOwn(HEROES,target.value))){cosmeticHero=target.value as HeroId|'all';shop('cosmetics');}});



// Radio groups use one tab stop and the standard arrow/Home/End keyboard pattern.
overlay.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key))return;const target=(e.target as HTMLElement).closest<HTMLButtonElement>('[role="radio"]');if(!target)return;const items=Array.from(target.closest('[role="radiogroup"]')!.querySelectorAll<HTMLButtonElement>('[role="radio"]'));const i=items.indexOf(target),next=e.key==='Home'?0:e.key==='End'?items.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+items.length)%items.length;e.preventDefault();items[next].click();});

// Fullscreen covers the document so the HUD, menus and touch controls stay visible.
bindFullscreenControls(()=>toast('Fullscreen is unavailable here. Your game still fills the browser window.'));

welcomeMobileLandscape();
