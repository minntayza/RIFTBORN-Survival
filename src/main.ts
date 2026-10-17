import {zombieGuide,robotGuide} from './enemy-guide';
import {updateHud} from './hud-dom';
import {combatHud,buildDetails,abilityIcons} from './combat-hud';
import {cardEvolutionGuide,weaponEvolutionGuide} from './guide-ui';
import {CARD_EVOLUTIONS} from './card-evolutions';
import {HERO_IDENTITIES,EVOLUTION_STAGES,encounterRhythm,deathTip} from './run-design';
import {heroTechniques,techniqueName,techniqueDemo} from './mastery';
import {visualUpgradeCard} from './upgrade-ui';
import {evolutionPreview} from './evolution-preview';
import {BUILDS,dailySetup,masteryMilestones,techniqueUnlocked,incomingThreats,edgePosition,type RunMode,type BuildId,type TechniqueId,type RunOptions} from './retention';
import { evolutionOptions, type EvolutionId } from './progression';
import { TouchControls } from './touch';
import { PLAYTEST } from './config';
import { artImage, ART_NAMES } from './art';
import Phaser from 'phaser';
import './style.css';
import { ArenaScene } from './combat';
import { HEROES, WEAPONS, ENEMIES, PERMANENT, type HeroId, type WeaponId } from './config';
import { loadSave, storeSave, purchase, freshSave, compatible } from './save';
import { UPGRADES,upgradeChoices, type Upgrade } from './upgrades';
import { AudioManager } from './audio';
let save = loadSave(), game: Phaser.Game | undefined, scene: ArenaScene | undefined, choices: Upgrade[] = [], waveChoice = false, menuState = 'menu', purchasePending = false;
if (PLAYTEST.unlimitedGold) save.gold = PLAYTEST.goldReserve;
let selectedMode:RunMode=save.runSetup.mode,selectedBuild:BuildId=save.runSetup.build;
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
function persist() { if (PLAYTEST.unlimitedGold) save.gold = PLAYTEST.goldReserve;
    if (!storeSave(save))
        toast('Browser storage is unavailable. Progress lasts for this session.');
}
function syncAudio() { audio.sound = save.settings.sound; audio.music = save.settings.music; }
function toast(message: string) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = message; document.body.append(t); setTimeout(() => t.remove(), 3000); }
const button = (label: string, action: string, cls = '') => `<button class="${cls}" data-action="${action}">${label}</button>`;
function shell(content: string, wide = false) { overlay.style.display = 'grid'; overlay.innerHTML = `<section class="panel ${wide ? 'wide' : ''}">${content}</section>`; }
function header(title: string, sub: string) { return `<div class="eyebrow">ZOMBIE LAST STAND <span>● OFFLINE / SOLO</span></div><h2>${title}</h2><p class="muted">${sub}</p>`; }
function back() { return button('← Back', 'menu', 'quiet'); }
function menu() {
 menuState='menu';hud.innerHTML='';overlay.className='';
 const survivor=`/assets/main-menu-cutouts/hero-${save.hero}.webp`;
 shell(`<main class="landing-screen quick-start hero-${save.hero}"><div class="landing-scene" aria-hidden="true"><div class="landing-moon"></div><div class="landing-searchlight light-one"></div><div class="landing-searchlight light-two"></div><div class="landing-skyline"></div><div class="landing-fire"></div><div class="landing-zombies"><img src="/assets/main-menu-cutouts/zombie-wanderer.webp" alt=""/><img src="/assets/main-menu-cutouts/zombie-runner.webp" alt=""/><img src="/assets/main-menu-cutouts/zombie-bioscreer.webp" alt=""/></div><div class="landing-embers">✦　 ·　 ✧　 ·　 ✦　 ·　 ·　 ✧</div></div><div class="menu-top"><span class="brand">ZLS / 07</span><span class="coin"><b>◈</b> ${PLAYTEST.unlimitedGold?'∞':save.gold.toLocaleString()} GOLD</span></div><section class="landing-copy"><div class="landing-eyebrow">AN ENDLESS SURVIVAL ROGUELITE</div><h1>ZOMBIE<br><em>LAST STAND</em></h1><p class="intro">An endless world. An endless horde. Make every second count.</p><div class="loadout"><span class="portrait" style="--hero:#${HEROES[save.hero].color.toString(16)}">${artImage('hero',save.hero)}</span><div><b>${HEROES[save.hero].name}</b><small>${WEAPONS[save.weapon].name}</small><small class="loadout-mode-label">${selectedMode==='short'?'Last Stand · 10 waves':selectedMode==='daily'?'Daily Challenge':'Endless'} · ${BUILDS.find(b=>b.id===(selectedMode==='daily'?dailySetup().build:selectedBuild))!.name}</small></div>${button('Change loadout','loadout','loadout-change')}</div><nav class="menu-actions" aria-label="Start a run">${button('PLAY →','quick-play','primary')}<small class="quick-play-hint">${save.bestWave?'Your setup is ready. Make your next stand.':'Move to survive. Attack automatically. Your ability turns the tide.'}</small></nav><div class="home-shop"><span class="home-gold"><b>◈ ${PLAYTEST.unlimitedGold?'∞':save.gold.toLocaleString()}</b><small>GOLD</small></span>${button('Armoury & shop','shop','home-shop-button')}</div><details class="home-tools" ${desktopMenu.matches?'open':''}><summary>More options</summary><nav aria-label="Game options">${button('Survivor mastery','mastery','quiet')}${button('Field Guide','guide','quiet')}${button('Settings','settings','quiet')}</nav></details></section><div class="hero-art"><div class="menu-survivor">${save.hero==='ninja'?artImage('hero','ninja'):`<img src="${survivor}" alt="${HEROES[save.hero].name}"/>`}</div><div class="survivor-lore"><small>${HERO_IDENTITIES[save.hero].icon} ${HEROES[save.hero].tag}</small><b>${HEROES[save.hero].name}</b><p>${HEROES[save.hero].description}</p></div></div><div class="landing-tagline">THE CITY IS GONE.<br>YOUR STAND ISN'T.</div><div class="records"><div><b>♛　${save.bestWave||'—'}</b><small>BEST WAVE</small></div><div><b>◴　${format(save.bestTime)}</b><small>LONGEST STAND</small></div><div><b>⚔　${save.bestKills}</b><small>MOST KILLS</small></div><div><b>🏆　${save.shortWins}</b><small>MISSIONS WON</small></div></div><footer><span><kbd>WASD</kbd> Move, <kbd>JOYSTICK</kbd> Move &amp; aim, auto attack, <kbd>SPACE</kbd> Ability</span><span>HOLD THE LINE.</span></footer></main>`,true);
 overlay.querySelector('.panel')?.classList.add('landing-panel');
}
const MODE_ORDER:RunMode[]=['short','endless','daily'];
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
 selectedMode=mode;save.runSetup={mode:selectedMode,build:selectedBuild};persist();menuState='run-menu';const daily=dailySetup();
 const titles={short:'WILD STREETS',endless:'IRON FORTRESS',daily:'RADIO OUTPOST'};
 const descriptions={short:'The city is in chaos. Survive 10 waves and defeat the General.',endless:'Push into the factory. Survive as long as you can.',daily:'A new fixed challenge every day. Beat your personal best.'};
 const carousel=`<div class="mode-carousel" data-mode-carousel aria-label="Run mode carousel"><button class="mode-arrow" data-action="mode-step:prev" aria-label="Previous mode">◀</button><article class="mode-feature mode-${mode}"><div class="mode-titlebar"><span>${String(MODE_ORDER.indexOf(mode)+1)}. ${titles[mode]}</span></div><div class="mode-art">${modeIllustration(mode)}<span class="mode-date">${mode==='daily'?`${daily.date} UTC`:'AVAILABLE'}</span><span class="mode-zombie">${artImage('enemy','basic')}</span></div><div class="mode-description">${descriptions[mode]}</div><button class="mode-select" data-action="mode-enter">SELECT</button></article><button class="mode-arrow" data-action="mode-step:next" aria-label="Next mode">▶</button></div><div class="mode-dots">${MODE_ORDER.map(m=>`<button aria-label="Select ${m==='short'?'Last Stand':m==='daily'?'Daily Challenge':'Endless'}" aria-pressed="${m===mode}" class="${m===mode?'active':''}" data-action="mode:${m}"></button>`).join('')}</div>`;
 shell(`${header('Choose your mission','Swipe or use the arrows to browse locations.')}${carousel}<div class="actions">${back()}</div>`,true);overlay.querySelector('.panel')?.classList.add('run-selection-panel');
}
function runLoadout(){
 menuState='run-loadout';const dailyMode=selectedMode==='daily',daily=dailySetup();
 const hero=save.hero,weapon=save.weapon,build=dailyMode?daily.build:selectedBuild,kills=save.mastery[hero]?.kills||0;
 const modeName=selectedMode==='short'?'LAST STAND':dailyMode?'DAILY CHALLENGE':'ENDLESS';
 const modeTitle={short:'WILD STREETS',endless:'IRON FORTRESS',daily:'RADIO OUTPOST'}[selectedMode];
 const heroData=HEROES[hero],identity=HERO_IDENTITIES[hero],buildInfo=BUILDS.find(b=>b.id===build)!;
 const survivor=`<section class="survivor-stage" style="--survivor-color:#${heroData.color.toString(16)}"><div class="survivor-stats"><span>⚔ ATK <b>${Math.round(WEAPONS[weapon!].damage*heroData.damage)}</b></span><span>♥ HP <b>${heroData.hp}</b></span><span>↗ SPD <b>${heroData.speed}</b></span></div><div class="gear-slot weapon-slot"><small>WEAPON</small>${artImage('weapon',weapon!)}<b>${WEAPONS[weapon!].name}</b></div><div class="survivor-figure">${artImage('hero',hero)}</div><div class="gear-slot ability-slot"><small>ABILITY</small><b>${heroData.ability}</b><span>${heroData.cooldown}s cooldown</span></div><div class="survivor-stage-name">${heroData.name} · ${identity.name}</div></section><section class="survivor-profile"><div><small>${dailyMode?'TODAY’S SURVIVOR':'YOUR SURVIVOR'}</small><h3>${heroData.name}</h3><p>${heroData.description}</p><p class="profile-passive"><b>${identity.name}</b> · ${identity.trigger} → ${identity.benefit}</p>${!dailyMode?`<small class="technique-line">${techniqueName(hero,save.techniques[hero]||'standard')} · ${kills} mastery kills</small>`:''}</div><button class="profile-change" data-action="characters">CHANGE</button></section>`;
 const buildChoices=dailyMode?`<section class="fixed-build"><span class="build-mark">${buildInfo.icon}</span><div><small>FIXED DAILY BUILD</small><h3>${buildInfo.name}</h3><p>${buildInfo.description}</p><span>STANDARD ABILITY · NO PERMANENT BONUSES</span></div></section>`:`<section class="starting-builds"><div class="run-section-title"><span>STARTING BUILD</span><small>${heroData.name.toUpperCase()}</small></div><div class="cards build-cards">${BUILDS.map(b=>`<button class="upgrade ${b.id===selectedBuild?'selected':''}" data-action="build:${b.id}" aria-pressed="${b.id===selectedBuild}"><span class="build-mark">${b.icon}</span><h3>${b.name}</h3><p>${b.description.split('. Build')[0].replace(/\.$/,'')}</p><small>${b.id===selectedBuild?'SELECTED':'SELECT BUILD'}</small></button>`).join('')}</div></section>`;
 shell(`${header('Change loadout','Choose your survivor, weapon, and mission. Your setup is remembered.') }<div class="loadout-mode"><span>${modeTitle}</span><small>${modeName}</small><button class="quiet" data-action="modes">CHANGE MODE</button></div>${survivor}<div class="loadout-equipment-action">${button('Change weapon','weapons','quiet')}</div>${save.bestWave>=3?buildChoices:'<p class="muted">Assault build · +10% damage. More starting builds unlock after reaching wave 3.</p>'}<div class="actions">${button('← Home','menu','quiet')}${button('Save loadout','menu','primary')}</div>`,true);overlay.querySelector('.panel')?.classList.add('survivor-select-panel');
}
function masteryMenu(){
 menuState='mastery';const hero=save.hero,kills=save.mastery[hero]?.kills||0,techniques=heroTechniques(hero),equipped=save.techniques[hero]||'standard',next=techniques.find(t=>t.kills>kills);
 shell(`${header(`${HEROES[hero].name} mastery`,'Watch each technique. Equip one for your next run.')}<div class="mastery-banner"><span class="portrait">${artImage('hero',hero)}</span><div><h3>${kills} MASTERY KILLS</h3><p>${next?`${next.kills-kills} kills to ${next.name}`:kills<500?`${500-kills} kills to Veteran appearance`:'Veteran mastery complete'}</p><div class="bar xp"><i style="width:${Math.min(100,kills/(next?.kills||500)*100)}%"></i></div></div></div><div class="cards mastery-cards">${techniques.map(t=>`<article class="mastery-technique ${equipped===t.id?'selected':''}">${techniqueDemo(hero,t.id)}<small>${t.kills===0?'BASE ABILITY':kills>=t.kills?'UNLOCKED':`${kills} / ${t.kills} KILLS`}</small><h3>${t.name}</h3><p><b>What happens</b>${t.effect}</p><p><b>When</b>${t.trigger}</p><div class="bar xp"><i style="width:${t.kills?Math.min(100,kills/t.kills*100):100}%"></i></div><button data-action="technique:${t.id}" ${kills<t.kills?'disabled':''} class="${equipped===t.id?'active':''}">${equipped===t.id?'✓ EQUIPPED':kills<t.kills?`${t.kills-kills} KILLS TO UNLOCK`:'EQUIP TECHNIQUE'}</button></article>`).join('')}</div><div class="mastery-bonuses"><h3>Permanent mastery bonuses</h3><span class="${kills>=100?'earned':''}">${kills>=100?'✓':'◇'} 100 kills · +5% maximum health</span><span class="${kills>=250?'earned':''}">${kills>=250?'✓':'◇'} 250 kills · +5% ability damage</span><span class="${kills>=500?'earned':''}">${kills>=500?'✓':'◇'} 500 kills · Veteran tint & insignia</span><small>Bonuses apply automatically when this hero starts a run. Daily challenges use standard abilities without mastery bonuses.</small></div><div class="actions">${back()}${button('Choose survivor','characters')}${button('Choose run →','play','primary')}</div>`,true);
}
function characters() { menuState = 'characters'; shell(`${header('Choose your survivor', 'Each survivor changes how you fight. Unlock new styles in the armoury.')}<div class="cards character-cards">${Object.entries(HEROES).map(([id, h]) => { const owned = save.heroes.includes(id as HeroId); return `<button class="character ${save.hero === id ? 'selected' : ''}" data-action="hero:${id}" ${!owned ? 'disabled' : ''}><div class="character-icon" style="--hero:#${h.color.toString(16)}">${artImage('hero', id)}</div><small>${h.tag}</small><h3>${h.name}</h3><p>${h.description}</p><div class="hero-identity"><b>${HERO_IDENTITIES[id as HeroId].icon} ${HERO_IDENTITIES[id as HeroId].name}</b><small>${HERO_IDENTITIES[id as HeroId].trigger} → ${HERO_IDENTITIES[id as HeroId].benefit}</small></div><div class="mini-stats"><span>♥ ${h.hp}</span><span>↗ ${h.speed}</span><span>⚔ ×${h.damage}</span></div><strong>${owned ? (save.hero === id ? 'SELECTED' : 'SELECT') : `LOCKED · ◈ ${h.price}`}</strong></button>`; }).join('')}</div><div class="actions">${back()}${button('Visit shop', 'shop')}${button('Choose weapon →', 'weapons', 'primary')}</div>`, true); }
function weapons() { menuState = 'weapons'; shell(`${header('Your weapon, your rules', `Choose compatible equipment for ${HEROES[save.hero].name}.`)}<div class="cards">${Object.entries(WEAPONS).filter(([id]) => compatible(save.hero, id as WeaponId)).map(([id, w]) => `<button class="upgrade ${save.weapon === id ? 'selected' : ''}" data-action="weapon:${id}" ${save.weapons.includes(id as WeaponId) ? '' : 'disabled'}><div class="weapon-art">${artImage('weapon', id)}</div><small>${ART_NAMES[id as WeaponId]}</small><h3>${w.name}</h3><p>${w.damage} damage · ${w.cooldown}s attack interval<br>${w.range} range · ${HEROES[save.hero].name}</p><strong>${save.weapons.includes(id as WeaponId) ? save.weapon === id ? 'EQUIPPED' : 'EQUIP' : `LOCKED · ◈ ${w.price}`}</strong></button>`).join('')}</div><div class="actions">${button('← Survivors', 'characters', 'quiet')}${button('Armoury', 'shop')}${button('Evolution previews','guide-weapons','quiet')}${button('Enter the arena →', 'play', 'primary')}</div>`, true); }
function shop(tab = 'heroes') {
    menuState = 'shop';
    const names = { heroes: 'Characters', weapons: 'Weapons', permanent: 'Permanent upgrades', cosmetics: 'Cosmetics' };
    let items = '';
    if (tab === 'heroes')
        items = Object.entries(HEROES).map(([id, h]) => `<article class="shop-item"><span class="card-icon" style="color:#${h.color.toString(16)}">${artImage('hero', id)}</span><h3>${h.name}</h3><p>${h.description}</p><small>♥ ${h.hp} · ↗ ${h.speed} · ⚔ ×${h.damage}<br>${h.ability} · ${h.cooldown}s<br>Weapons: ${Object.values(WEAPONS).filter(w => w.hero === id).map(w => w.name).join(', ')}</small>${save.heroes.includes(id as HeroId) ? button('Owned · Select', `hero:${id}`) : button(`Unlock · ◈ ${h.price}`, `buy:heroes:${id}`, save.gold >= h.price ? 'primary' : '')}</article>`).join('');
    if (tab === 'weapons')
        items = Object.entries(WEAPONS).map(([id, w]) => `<article class="shop-item"><div class="weapon-art">${artImage('weapon', id)}</div><h3>${w.name}</h3><p>For ${HEROES[w.hero as HeroId].name}<br>${w.damage} damage · ${w.range} reach · ${w.cooldown}s cooldown</p>${save.weapons.includes(id as WeaponId) ? '<strong class="owned">✓ OWNED</strong>' : button(`Unlock · ◈ ${w.price}`, `buy:weapons:${id}`, save.gold >= w.price ? 'primary' : '')}</article>`).join('');
    if (tab === 'permanent') {
        const designs: Record<string, {color:string;label:string;description:string;icon:string}> = {
            health:{color:'#ef8b9b',label:'SURVIVAL',description:'A stronger heart for every stand.',icon:'<path d="M32 49 12 29C1 12 23 4 32 20 41 4 63 12 52 29Z"/><path d="m14 30 10 0 5-10 6 20 5-10h11"/>'},
            damage:{color:'#e7b879',label:'OFFENCE',description:'Hone every blade. Empower every shot.',icon:'<path d="m20 43 27-30 6-3-1 9-28 29Z"/><path d="m14 38 15 15M10 54l10-11M8 56l4 4"/><path d="M11 12v9M7 16h9M45 43v12M39 49h12"/>'},
            speed:{color:'#a8a0f3',label:'MOBILITY',description:'Stay one step ahead of the horde.',icon:'<path d="M38 9 18 35h15l-7 21 23-30H34Z"/><path d="M8 25h10M5 36h8M43 47h13"/>'},
            magnet:{color:'#81d1c9',label:'COLLECTION',description:'Bring distant gold within your reach.',icon:'<path d="M15 12v24a17 17 0 0 0 34 0V12H38v24a6 6 0 0 1-12 0V12Z"/><path d="M15 23h11M38 23h11M6 8l-3-4M58 8l3-4"/><circle cx="32" cy="9" r="4"/>'},
            reroll:{color:'#d5b2ed',label:'TACTICS',description:'A fresh choice when the stakes are high.',icon:'<path d="M49 24a19 19 0 0 0-34-5l-5 8M10 13v14h14M15 40a19 19 0 0 0 34 5l5-8M54 51V37H40"/><path d="m32 25 7 7-7 7-7-7Z"/>'}
        };
        items = `<div class="permanent-intro"><span class="permanent-seal">✦</span><div><small>BUILT TO LAST</small><h3>Invest in your next stand.</h3><p>Permanent bonuses follow every survivor into every run.</p></div><span class="training-total">${Object.entries(PERMANENT).reduce((n,[id])=>n+(save.permanent[id]||0),0)} / ${Object.values(PERMANENT).reduce((n,p)=>n+p.cap,0)}<small>TRAINING LEVELS</small></span></div>` + Object.entries(PERMANENT).map(([id,p])=>{
            const level=save.permanent[id]||0,d=designs[id],maxed=level===p.cap;
            const benefit=(n:number)=>id==='reroll'?`+${n} reroll${n===1?'':'s'}`:`+${Math.round(n*p.value*100)}%`;
            return `<article class="shop-item permanent-card ${maxed?'maxed':''}" style="--upgrade-color:${d.color}"><div class="permanent-top"><span class="upgrade-category">${d.label}</span><span class="level-badge">${maxed?'MASTERED':`LEVEL ${level} / ${p.cap}`}</span></div><div class="permanent-emblem"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${d.icon}</svg></div><h3>${p.name}</h3><p>${d.description}</p><div class="level-segments" aria-label="${level} of ${p.cap} levels purchased">${Array.from({length:p.cap},(_,i)=>`<span class="${i<level?'filled':''}"></span>`).join('')}</div><div class="upgrade-benefit"><div><small>CURRENT BONUS</small><b>${benefit(level)}</b></div><span aria-hidden="true">→</span><div><small>${maxed?'MAXIMUM BONUS':'NEXT LEVEL'}</small><b>${benefit(maxed?level:level+1)}</b></div></div><div class="upgrade-cap">${id==='reroll'?'One additional choice reroll per run':`Up to ${benefit(p.cap)} · stacks across every run`}</div>${maxed?'<div class="mastered-label">✓ FULLY TRAINED</div>':button(`Train level ${level+1} <span>◈ ${250+150*level}</span>`,`buy:permanent:${id}`,'train-button')}</article>`;
        }).join('');
    }
    if (tab === 'cosmetics')
        items = '<p class="muted">Field archive coming soon. Character mastery is already tracked in your save.</p>';
    shell(`${header('The armoury', 'Keep the gold. Change the odds.')}<div class="shop-top"><span class="coin">◈ ${PLAYTEST.unlimitedGold ? '∞' : save.gold.toLocaleString()} GOLD</span><nav>${Object.entries(names).map(([id, name]) => button(name, `tab:${id}`, tab === id ? 'active' : 'quiet')).join('')}</nav></div><div class="shop-grid">${items}</div><div class="actions">${back()}${button('Choose survivor', 'characters')}${button('Enter the arena →', 'play', 'primary')}</div>`, true);
}
function levelUpCardPreview(hero:HeroId){
 const weapon=Object.entries(WEAPONS).find(([,w])=>w.hero===hero&&w.price===0)![0] as WeaponId;
 const cards=UPGRADES.filter(u=>!u.hero||u.hero===hero),shared=cards.length-UPGRADES.filter(u=>u.hero===hero).length;
 return `<section class="levelup-preview"><div class="levelup-preview-intro"><b>${cards.length} REGULAR LEVEL-UP CARD TYPES</b><p>${shared} shared cards and ${cards.length-shared} ${HEROES[hero].name}-specific cards. These are shown at level 1; card choices during a run vary.</p></div><div class="cards upgrade-cards levelup-preview-grid">${cards.map((u,i)=>visualUpgradeCard(u,i,hero,weapon,0,'')).join('')}</div></section>`;
}
function guide(){
 menuState='guide';const content=guideTab==='cards'?cardEvolutionGuide(save,guideHero):guideTab==='levelups'?levelUpCardPreview(guideHero):guideTab==='weapons'?weaponEvolutionGuide(save,guideWeapon):guideTab==='robots'?robotGuide():zombieGuide();
 shell(`${header('Field guide','Learn the threats. Preview your next build.')}<nav class="guide-tabs">${[['enemies','Zombies'],['robots','Robots'],['cards','Card evolutions'],['levelups','Level-up cards'],['weapons','Weapon evolutions']].map(([id,name])=>button(name,'guide-tab:'+id,id===guideTab?'active':'quiet')).join('')}</nav>${guideTab==='cards'||guideTab==='levelups'?`<nav class="guide-filters">${Object.entries(HEROES).map(([id,h])=>button(h.name,'guide-hero:'+id,guideHero===id?'active':'quiet')).join('')}</nav>`:guideTab==='weapons'?`<label class="guide-filter">WEAPON <select data-guide-weapon>${Object.entries(WEAPONS).map(([id,w])=>`<option value="${id}" ${guideWeapon===id?'selected':''}>${w.name} · ${HEROES[w.hero as HeroId].name}</option>`).join('')}</select></label>`:''}${content}<div class="actions">${button('← Back','guide-back','quiet')}</div>`,true);
}
function openGuide(tab='enemies'){
 guideReturn=menuState;guideTab=tab;guideHero=scene&&!scene.ended?scene.hero:save.hero;guideWeapon=scene&&!scene.ended?scene.weapon:save.weapon;
 if(scene&&!scene.ended)scene.paused=true;guide();
}

function settings() { menuState = 'settings'; shell(`${header('Field settings', 'Tune your last stand.')}<div class="settings">${(['sound', 'music', 'shake','aimAssist'] as const).map(k => `<label><span>${{ sound: 'Sound effects', music: 'Ambient music', shake: 'Screen shake',aimAssist:'Mobile aim assistance' }[k]}</span><input type="checkbox" data-setting="${k}" ${save.settings[k] ? 'checked' : ''}></label>`).join('')}<label><span>Joystick side</span><select data-control="joystickSide"><option value="left" ${save.settings.joystickSide==='left'?'selected':''}>Left</option><option value="right" ${save.settings.joystickSide==='right'?'selected':''}>Right</option></select></label><label><span>Joystick size</span><select data-control="joystickSize">${[95,115,135].map(n=>`<option value="${n}" ${save.settings.joystickSize===n?'selected':''}>${n===95?'Compact':n===115?'Standard':'Large'}</option>`).join('')}</select></label></div><p class="muted">All art and audio are generated locally. Progress saves automatically in this browser.</p><div class="actions">${button('← Back', scene && !scene.ended ? 'pause' : 'menu', 'quiet')}${button('Reset progress', 'reset', 'danger')}</div>`); }
function start(options:RunOptions={mode:selectedMode,build:selectedBuild,technique:save.techniques[save.hero]||'standard'}) { save.runSetup={mode:options.mode,build:options.build};touchControls?.destroy(); game?.destroy(true); scene = undefined; overlay.style.display = 'none'; overlay.className = 'ingame'; menuState = 'game'; syncAudio(); audio.unlock(); const s = new ArenaScene(save, audio, showChoices, results, pause, options); scene = s; touchControls=new TouchControls(()=>{if(!s.paused&&!s.ended&&s.countdown<=0)s.activate(touchControls!.state.x,touchControls!.state.y);});touchControls.setLayout(save.settings.joystickSide,save.settings.joystickSize);s.touch=touchControls.state; game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: 1200, height: 760, backgroundColor: '#101b28', scene: [s], scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }, render: { antialias: true }, audio: { noAudio: true } }); persist(); }
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
    shell(`${header('Hold your ground', 'The horde can wait.')}<div class="pause-records"><span>◈ ${scene.stats.gold} GOLD</span><span>${scene.stats.kills} KILLS</span><span>${format(scene.elapsed)} SURVIVED</span></div><div class="controls"><p><kbd>WASD / ↑↓←→</kbd> Move</p><p><kbd>MOUSE</kbd> Aim · attacks fire automatically</p><p><kbd>SPACE</kbd> ${HEROES[scene.hero].ability}</p><p><kbd>1–3</kbd> Choose upgrade <kbd>M</kbd> Sound</p></div><div class="actions">${button('Resume →', 'resume', 'primary')}${button('Your Build','build')}${button('Settings', 'settings')}${button('End run', 'end', 'danger')}</div>`);
}
function buildMenu(){if(!scene||scene.ended)return;scene.paused=true;menuState='build';shell(`${header('Your Build','Plan your next upgrade. The run is paused.')}${buildDetails(scene)}<div class="actions">${button('Evolution guide','guide-cards','quiet')}${button('Pause menu','build-pause','quiet')}${button('Resume →','resume','primary')}</div>`,true);}
function resume() { scene!.paused = false; overlay.style.display = 'none'; menuState = 'game'; }
function showChoices(wave = false) { if(wave){waveClear();return;} waveChoice = false; menuState = 'choice'; choices = upgradeChoices(scene!.hero, scene!.levels,scene!.cardRandom,scene!.weapon,scene!.stats.wave,scene!.cardEvolutions); for(const u of choices)if(u.evolves)save.archive['card:'+u.evolves]=Math.max(save.archive['card:'+u.evolves]||0,1) as 1|2;renderChoices(); persist(); }
function finishIntermission(){if(!scene||scene.ended)return;overlay.style.display='none';menuState='game';scene.nextWave();persist();}
function evolutionMenu(){const s=scene!;for(const e of evolutionOptions(s.hero))save.archive[`weapon:${s.weapon}:${e.id}`]=Math.max(save.archive[`weapon:${s.weapon}:${e.id}`]||0,1) as 1|2;persist();menuState='evolution';shell(`${header(s.awakened?'Full weapon evolution':'Weapon awakening',`Wave ${s.stats.wave} milestone · ${WEAPONS[s.weapon].name}`)}<div class="cards upgrade-cards">${evolutionOptions(s.hero).filter(e=>!s.awakened||e.id===s.awakened).map(e=>`<button class="upgrade" data-action="evolve:${e.id}">${evolutionPreview(s.hero,e.id,s.awakened?2:1,s.weapon)}<small>EVOLUTION ${(s.evolution[e.id]||0)+1}</small><h3>${e.name}</h3><p>${s.awakened?EVOLUTION_STAGES[e.id].full:EVOLUTION_STAGES[e.id].awakening}</p><strong>${s.awakened?'FULLY EVOLVE →':'AWAKEN →'}</strong></button>`).join('')}</div>${button('Preview both stages in Field Guide','guide-weapons','quiet')}`,true);}
function waveClear(){
 persist();

 if(scene!.evolutionDue)evolutionMenu();else finishIntermission();
}
function renderChoices() { const s = scene!; const title=waveChoice?header(`Wave ${s.stats.wave} survived`,'Recover. Adapt. The next horde is coming.'):`<div class="choice-heading"><b>SKILL CHOICE</b><small>LEVEL ${s.level} · PICK ONE</small></div>`; shell(`${title} ${waveChoice ? `<div class="wave-recap"><span>${s.waveStats.time.toFixed(1)}s <small>CLEAR TIME</small></span><span>${s.waveStats.kills} <small>KILLS</small></span><span>◈ ${s.waveStats.gold} <small>GOLD</small></span><span>${Math.round(s.waveStats.damage)} <small>DAMAGE TAKEN</small></span></div><p class="badges">${s.waveStats.time < 45 ? '✦ QUICK CLEAR · +15% GOLD' : ''} ${s.waveStats.damage === 0 ? '◇ PERFECT CLEAR · +1 REROLL' : ''}</p>` : ''}<div class="cards upgrade-cards">${choices.map((u,i)=>visualUpgradeCard(u,i,s.hero,s.weapon,s.levels[u.id]||0)).join('')}</div><div class="actions"><span class="muted">${button('Evolution guide','guide-cards','quiet')}</span>${button(`↻ Reroll (${s.rerolls} left)`, 'reroll', 'quiet')}</div>`, true); }
function pick(index: number) {
    if (menuState !== 'choice' || !choices[index])
        return;
    scene!.apply(choices[index].id);if(choices[index].evolves)save.archive['card:'+choices[index].evolves]=2;persist();
    if(waveChoice){
        waveChoice=false;
        if(scene!.ended){scene!.paused=true;results();return;}
        if(scene!.evolutionDue){scene!.paused=true;evolutionMenu();return;}
        finishIntermission();return;
    }
    overlay.style.display = 'none';
    menuState = 'game';
}
function results() { const s = scene!, r = s.stats;

 if(menuState==='results')return;menuState = 'results';audio.play(s.victory?'clear':'over');if(s.victory&&s.options.mode==='short')save.shortWins++;const dailyScore=r.kills*10+s.objectives*100+(s.victory?1000:0)+r.wave*50;if(s.options.mode==='daily'&&s.options.date){const old=save.daily[s.options.date]||{score:0,wins:0};save.daily[s.options.date]={score:Math.max(old.score,dailyScore),wins:old.wins+Number(s.victory)};} const record = r.wave > save.bestWave || r.kills > save.bestKills || r.time > save.bestTime; const previous = save.bestWave; save.bestWave = Math.max(save.bestWave, r.wave); save.bestTime = Math.max(save.bestTime, Math.floor(r.time)); save.bestKills = Math.max(save.bestKills, r.kills); persist(); const next = Object.entries(HEROES).find(([id]) => !save.heroes.includes(id as HeroId)); const strongest=Object.entries(s.damageSources).sort((a,b)=>b[1]-a[1])[0];const top = Object.entries(s.levels).sort((a, b) => b[1] - a[1])[0]; shell(`${header(s.victory?'AREA SECURED · VICTORY':record?'A stand to remember.':'The night takes another.',s.victory?'The general has fallen. Your survivor made it out.':`Defeated by ${s.lastCause}. Your gold and mastery stay.`)}<div class="result-wave">${String(r.wave).padStart(2, '0')}<span>${s.victory?'MISSION COMPLETE':'WAVE REACHED'}</span></div>${record ? '<div class="new-record">✦ NEW PERSONAL RECORD</div>' : `<p class="muted">Previous best · Wave ${previous}</p>`}<div class="result-grid"><div><b>${format(r.time)}</b><small>SURVIVED</small></div><div><b>${r.kills}</b><small>ENEMIES DEFEATED</small></div><div class="gold-result"><b>+${r.gold}</b><small>GOLD KEPT</small></div><div><b>${Math.round(r.dealt).toLocaleString()}</b><small>DAMAGE DEALT</small></div><div><b>${Math.round(r.taken)}</b><small>DAMAGE TAKEN</small></div><div><b>${r.combo}</b><small>HIGHEST COMBO</small></div></div><p class="muted">${s.options.mode==='daily'?`Daily score: ${dailyScore} · Personal best: ${save.daily[s.options.date!].score} · `:''}${s.objectives} objectives completed · ${r.elites} elites & bosses defeated · Most invested upgrade: ${top ? (UPGRADES.find(u=>u.id===top[0])?.name||top[0]) + ' ×' + top[1] : 'none'}</p><div class="run-story"><h3>Your build this run</h3><p><b>${WEAPONS[s.weapon].name}</b> · ${s.awakened?`${evolutionOptions(s.hero).find(e=>e.id===s.awakened)!.name} ${s.fullEvolution?'fully evolved':'awakened'}`:s.earlyAwakened?'Wave 5 awakening earned':'Base weapon'}</p><p>${strongest?`${strongest[0]} contributed ${Math.round(strongest[1]).toLocaleString()} direct damage.`:'Your next stand starts with a fresh build.'} ${s.identity.name} activated ${s.identityProcs} times.</p><p>${Object.keys(s.cardEvolutions).length?'Evolved cards: '+Object.keys(s.cardEvolutions).map(id=>CARD_EVOLUTIONS[id]?.name||id).join(', '):'Choose a different hero or build for your next stand.'}</p>${s.victory?'':`<div class="death-tip"><b>NEXT ATTEMPT</b><p>${deathTip(s.lastCause)}</p></div>`}</div><div class="mastery-result">${s.extractionMastery?`Final XP converted to +${s.extractionMastery} mastery credits · `:''}${HEROES[s.hero].name} mastery · ${save.mastery[s.hero]?.kills||0} credits · ${(()=>{const kills=save.mastery[s.hero]?.kills||0,next=heroTechniques(s.hero).find(t=>t.kills>kills);return next?`${next.kills-kills} kills to ${next.name}`:kills<500?`${500-kills} kills to Veteran appearance`:'Veteran unlocked';})()}</div>${next ? `<div class="unlock-progress"><span>Next survivor: ${next[1].name} <b>${save.gold} / ${next[1].price} gold</b></span><div class="bar"><i style="width:${Math.min(100, save.gold / next[1].price * 100)}%"></i></div></div>` : ''}<div class="actions">${button('Retry this setup →', 'retry', 'primary')}${button('Try another build','play')}${button('Change survivor', 'characters')}${button('Shop', 'shop')}${button('Main menu', 'menu', 'quiet')}</div>`, true); }
function format(seconds: number) { return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`; }
overlay.addEventListener('click', e => {
    const el = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!el || el.disabled)
        return;
    audio.unlock();
    const [a, b, c] = el.dataset.action!.split(':');
    if(a==='evolve'&&menuState==='evolution'&&evolutionOptions(scene!.hero).some(e=>e.id===b)){scene!.evolve(b as EvolutionId);finishIntermission();}
    if(a==='loadout')runLoadout();
    if(a==='quick-play')start(selectedMode==='daily'?{...dailySetup(),hero:save.hero,weapon:save.weapon}:{mode:selectedMode,build:selectedBuild,technique:save.techniques[save.hero]||'standard'});
    if(a==='play')runMenu();
    if(a==='daily')runMenu('daily');
    if(a==='mode-enter')runLoadout();
    if(a==='modes')runMenu(selectedMode);
    if(a==='mode'&&['short','endless','daily'].includes(b))runMenu(b as RunMode);
    if(a==='mode-step'){
        const current=MODE_ORDER.indexOf(selectedMode),step=b==='prev'?-1:1;
        runMenu(MODE_ORDER[(current+step+MODE_ORDER.length)%MODE_ORDER.length]);
    }
    if(a==='build'&&BUILDS.some(build=>build.id===b)){selectedBuild=b as BuildId;save.runSetup={mode:selectedMode,build:selectedBuild};persist();runLoadout();}
    if(a==='begin')start(selectedMode==='daily'?{...dailySetup(),hero:save.hero,weapon:save.weapon}:{mode:selectedMode,build:selectedBuild,technique:save.techniques[save.hero]||'standard'});
    if(a==='retry'&&scene)start({...scene.options});
    if(a==='mastery')masteryMenu();
    if(a==='technique'&&['standard','swift','fortified'].includes(b)&&techniqueUnlocked(save.mastery[save.hero]?.kills||0,b as TechniqueId)){save.techniques[save.hero]=b as TechniqueId;persist();masteryMenu();}
    if (a === 'menu') {
        touchControls?.destroy();touchControls=undefined;game?.destroy(true);
        game = undefined;
        scene = undefined;
        menu();
    }
    if(a==='guide')openGuide();
    if(a==='build')buildMenu();
    if(a==='build-pause'){menuState='settings';pause();}
    if(a==='guide-cards')openGuide('cards');
    if(a==='guide-weapons')openGuide('weapons');
    if(a==='guide-tab'){guideTab=b;guide();}
    if(a==='guide-hero'&&Object.hasOwn(HEROES,b)){guideHero=b as HeroId;guide();}
    if(a==='guide-back'){if(guideReturn==='choice'){menuState='choice';renderChoices();}else if(guideReturn==='evolution')evolutionMenu();else if(guideReturn==='weapons')weapons();else if(guideReturn==='build')buildMenu();else menu();}
    if(a==='card-info'&&choices[Number(b)]){const u=choices[Number(b)];shell(`${header(u.name,u.description)}${visualUpgradeCard(u,Number(b),scene!.hero,scene!.weapon,scene!.levels[u.id]||0)}<p class="muted">${u.evolves?'Evolution · choose once after maxing the base card.':`Level ${(scene!.levels[u.id]||0)+1} / ${u.max}`}</p>${button('← Back to cards','cards-back','quiet')}`,true);}
    if(a==='cards-back'){menuState='choice';renderChoices();}
    if (a === 'characters') {
        guideReturn=menuState;
        characters();
    }
    if (a === 'weapons')
        weapons();
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
        if(guideReturn==='run-loadout')runLoadout();else characters();
    }
    if (a === 'weapon') {
        if (!save.weapons.includes(b as WeaponId))
            return;
        save.weapon = b as WeaponId;
        persist();
        weapons();
    }
    if (a === 'buy') {
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
        pick(Number(b));
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
    if (a === 'reset' && confirm('Erase all gold, unlocks, records, and mastery?')) {
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
overlay.addEventListener('change',e=>{const el=e.target as HTMLSelectElement;if(el.hasAttribute('data-guide-weapon')&&Object.hasOwn(WEAPONS,el.value)){guideWeapon=el.value as WeaponId;guide();}});
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
        pick(Number(e.key) - 1);
    if (scene && !scene.ended && [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key))
        e.preventDefault();
});
window.addEventListener('blur', () => {
    if (scene && !scene.ended && !scene.paused)
        pause();
});
window.addEventListener('beforeunload', () => storeSave(save));
function toggleMapView(){if(!scene||scene.paused||scene.ended)return;save.settings.mapView=save.settings.mapView===2?1:2;save.settings.mapViewChosen=true;scene.applyMapView();persist();}
// Respond before the periodic HUD render can replace a pressed button.
hud.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    if((e.target as Element).closest('[data-hud="mapView"]')){e.preventDefault();toggleMapView();return;}
    const button=(e.target as Element).closest<HTMLButtonElement>('[data-hud="ability"]');
    if(!button||button.disabled||!scene||scene.paused||scene.ended||scene.countdown>0)return;
    e.preventDefault();
    scene.activate(scene.touch?.x||0,scene.touch?.y||0);
});
hud.addEventListener('click',e=>{const action=(e.target as Element).closest<HTMLElement>('[data-hud]')?.dataset.hud;if(!scene||scene.paused||scene.ended)return;if(action==='mapView'){if(e.detail===0)toggleMapView();}else if(action==='build')buildMenu();else if(action==='pause')pause();else if(action==='ability'&&scene.countdown<=0)scene.activate(scene.touch?.x||0,scene.touch?.y||0);});
setInterval(() => {
    const s = scene;
    touchControls?.update(!!s&&!s.ended&&!s.paused&&menuState==='game',s&&s.countdown>0?s.countdown:s?.ability||0,s?techniqueName(s.hero,s.options.technique):HEROES[save.hero].ability,s?HEROES[s.hero].cooldown:1,s?abilityIcons[s.hero]:'➤');
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
