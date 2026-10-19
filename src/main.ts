import {enemyGallery,mountEnemyGallery,guideEntries,type GuideSection} from './field-guide';
import {startHomeScene} from './home-scene';
import {updateHud} from './hud-dom';
import {combatHud,buildDetails,abilityIcons} from './combat-hud';
import {cardEvolutionGuide,weaponEvolutionGuide} from './guide-ui';
import {CARD_EVOLUTIONS} from './card-evolutions';
import {HERO_IDENTITIES,EVOLUTION_STAGES,encounterRhythm,deathTip} from './run-design';
import {heroTechniques,techniqueName,techniqueDemo,MASTERY_PATHS,TRAINING_THRESHOLDS,masteryTraining} from './mastery';
import {visualUpgradeCard,upgradeBuildHint,upgradeVisual,upgradeValues} from './upgrade-ui';
import {evolutionPreview} from './evolution-preview';
import {BUILDS,dailySetup,masteryMilestones,techniqueUnlocked,incomingThreats,edgePosition,type RunMode,type BuildId,type TechniqueId,type RunOptions} from './retention';
import { evolutionOptions, type EvolutionId } from './progression';
import { TouchControls } from './touch';
import { PLAYTEST } from './config';
import { artImage, ART_NAMES, weaponShopImage } from './art';
import type Phaser from 'phaser';
import './style.css';
import type { ArenaScene } from './combat';
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
 const mode=selectedMode==='short'?'Last Stand · 10 waves':selectedMode==='daily'?'Daily Challenge':'Endless';
 const build=BUILDS.find(b=>b.id===(selectedMode==='daily'?dailySetup().build:selectedBuild))!.name;
 shell(`<main class="landing-screen quick-start home-clean home-action hero-${save.hero}"><div class="landing-scene" aria-hidden="true"></div><header class="home-header"><span class="home-brand">ZLS <small>LAST STAND</small></span><div class="home-wallet"><span class="home-gold"><b>◈ ${PLAYTEST.unlimitedGold?'∞':save.gold.toLocaleString()}</b><small>GOLD</small></span>${button('Shop','shop','home-shop-button')}</div></header><section class="landing-copy"><div class="landing-eyebrow">YOUR NEXT STAND</div><h1>ZOMBIE<br><em>LAST STAND</em></h1><p class="intro">One hero. Endless hordes.<br> How long can you hold the line?</p><div class="loadout"><span class="portrait">${artImage('hero',save.hero)}</span><div><small class="home-label">YOUR SURVIVOR</small><b>${HEROES[save.hero].name}</b><small>${WEAPONS[save.weapon].name}</small></div>${button('Change','loadout','loadout-change')}</div><nav class="menu-actions" aria-label="Start a run"><div class="home-run"><span>${mode}</span><span>${build}</span></div>${button('PLAY NOW →','quick-play','primary')}</nav><details class="home-tools" ${desktopMenu.matches?'open':''}><summary>More options</summary><nav aria-label="Game options">${button('Mastery','mastery','quiet')}${button('Field Guide','guide','quiet')}${button('Settings','settings','quiet')}</nav></details></section><section class="home-showcase" aria-label="Your survivor in action"><div class="home-survivor-poster" aria-hidden="true">${artImage('hero',save.hero)}</div><canvas id="home-scene" role="img" aria-label="${HEROES[save.hero].name} wielding ${WEAPONS[save.weapon].name} against approaching zombies"></canvas><div class="home-showcase-caption"><span>MEET YOUR SURVIVOR</span><b>${HEROES[save.hero].name}</b><small>${WEAPONS[save.weapon].name} · ${HEROES[save.hero].ability}</small></div></section><div class="records" aria-label="Your records"><div><b>${save.bestWave||'—'}</b><small>BEST WAVE</small></div><div><b>${format(save.bestTime)}</b><small>LONGEST STAND</small></div><div><b>${save.bestKills}</b><small>MOST KILLS</small></div><div><b>${save.shortWins}</b><small>WINS</small></div></div><footer><span><kbd>WASD</kbd> Move <span>·</span> Auto attack <span>·</span> <kbd>SPACE</kbd> Ability</span></footer></main>`,true);
 overlay.querySelector('.panel')?.classList.add('landing-panel');
 const canvas=overlay.querySelector<HTMLCanvasElement>('#home-scene');if(canvas)void startHomeScene(canvas,save.hero,save.weapon);
}
let weaponReturnToLoadout=false;
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
 const carousel=`<div class="mode-carousel" data-mode-carousel aria-label="${titles[mode]} mode carousel"><button class="mode-arrow" data-action="mode-step:prev" aria-label="Previous mode">◀</button><article class="mode-feature mode-${mode}"><div class="mode-titlebar"><span>${String(MODE_ORDER.indexOf(mode)+1)}. ${titles[mode]}</span>${mode==='daily'?`<small>${daily.date} UTC</small>`:''}</div><div class="mode-art"><img src="/assets/mode-art/${mode}.webp" alt="${mode==='short'?'City street overrun by zombies':mode==='endless'?'Fortified factory under attack':'Radio outpost at night'}"/></div><div class="mode-description">${descriptions[mode]}</div><button class="mode-select" data-action="mode-enter">SELECT MISSION</button></article><button class="mode-arrow" data-action="mode-step:next" aria-label="Next mode">▶</button></div><div class="mode-dots">${MODE_ORDER.map(m=>`<button aria-label="Select ${m==='short'?'The 10-Wave Gauntlet':m==='daily'?'Daily Radio Outpost':'The Endless Fortress'}" aria-pressed="${m===mode}" class="${m===mode?'active':''}" data-action="mode:${m}"></button>`).join('')}</div>`;
 shell(`${header('Choose your mission','Swipe or use the arrows to browse locations.')}${carousel}<div class="actions">${back()}</div>`,true);overlay.querySelector('.panel')?.classList.add('run-selection-panel');
}
function runLoadout(){
 menuState='run-loadout';const dailyMode=selectedMode==='daily',daily=dailySetup();
 const hero=save.hero,weapon=save.weapon,build=dailyMode?daily.build:selectedBuild,kills=save.mastery[hero]?.kills||0;
 const modeName=selectedMode==='short'?'LAST STAND':dailyMode?'DAILY CHALLENGE':'ENDLESS';
 const modeTitle={short:'THE 10-WAVE GAUNTLET',endless:'THE ENDLESS FORTRESS',daily:'DAILY RADIO OUTPOST'}[selectedMode];
 const heroData=HEROES[hero],identity=HERO_IDENTITIES[hero],buildInfo=BUILDS.find(b=>b.id===build)!;
 const survivor=`<section class="loadout-summary" style="--survivor-color:#${heroData.color.toString(16)}"><div class="loadout-portrait">${artImage('hero',hero)}</div><div class="loadout-fields"><div class="loadout-field"><div><small>SURVIVOR</small><h3>${heroData.name}</h3></div><button data-action="characters" aria-label="Change survivor">Change</button></div><div class="loadout-field"><div><small>WEAPON</small><b>${WEAPONS[weapon!].name}</b></div><button data-action="weapons" aria-label="Change weapon">Change</button></div><div class="loadout-ability"><small>ULTIMATE</small><span>${heroData.ability}</span><small>${heroData.cooldown}s cooldown</small></div></div><div class="loadout-stats"><span>ATK <b>${Math.round(WEAPONS[weapon!].damage*heroData.damage)}</b></span><span>HP <b>${heroData.hp}</b></span><span>SPEED <b>${heroData.speed}</b></span></div></section><details class="loadout-details"><summary>Ability &amp; passive details</summary><p>${heroData.description}</p><p><b>${identity.name}</b> · ${identity.trigger} → ${identity.benefit}</p>${!dailyMode?`<small>${techniqueName(hero,save.techniques[hero]||'standard')} · ${kills} mastery kills</small>`:''}</details>`;
 const buildChoices=dailyMode?`<section class="fixed-build"><span class="build-mark">${buildInfo.icon}</span><div><small>FIXED DAILY BUILD</small><h3>${buildInfo.name}</h3><p>${buildInfo.description}</p><span>STANDARD ABILITY · NO PERMANENT BONUSES</span></div></section>`:`<section class="starting-builds"><div class="run-section-title"><span>STARTING BUILD</span><small>${heroData.name.toUpperCase()}</small></div><div class="cards build-cards">${BUILDS.map(b=>`<button class="upgrade ${b.id===selectedBuild?'selected':''}" data-action="build:${b.id}" aria-pressed="${b.id===selectedBuild}"><span class="build-mark">${b.icon}</span><h3>${b.name}</h3><p>${b.description.split('. Build')[0].replace(/\.$/,'')}</p><small>${b.id===selectedBuild?'SELECTED':'SELECT BUILD'}</small></button>`).join('')}</div></section>`;
 shell(`${header('Your loadout','Your choices are saved automatically.')}<div class="loadout-mode"><div><small>MISSION · ${modeName}</small><span>${modeTitle}</span></div><button class="quiet" data-action="modes">Change mode</button></div>${survivor}${save.bestWave>=3?buildChoices:'<p class="loadout-build-note">Assault · +10% damage. More builds unlock at wave 3.</p>'}<div class="actions">${button('Back','menu','quiet')}${button('Play','begin','primary')}</div>`,true);overlay.querySelector('.panel')?.classList.add('survivor-select-panel','loadout-compact');
}
function masteryMenu(){
 menuState='mastery';const hero=save.hero,kills=save.mastery[hero]?.kills||0,techniques=heroTechniques(hero),equipped=save.techniques[hero]||'standard';
 const next=[...new Set([...Object.values(TRAINING_THRESHOLDS).flat(),100,250,500])].sort((a,b)=>a-b).find(n=>n>kills);
 shell(`${header(`${HEROES[hero].name} mastery`,'Grow your hero, one unlock at a time.')}<div class="tree-root"><span class="portrait">${artImage('hero',hero)}</span><div><small>YOUR JOURNEY</small><h3>${kills.toLocaleString()} mastery kills</h3><p>${next?`${next-kills} more kills to your next unlock`:'All mastery milestones reached'}</p><div class="bar"><i style="width:${Math.min(100,kills/500*100)}%"></i></div></div></div><p class="tree-explainer">Follow each connected path. Bonuses unlock automatically and work together; equip one key skill for your ability. No gold required.</p><div class="mastery-tree">${techniques.map((t,i)=>{const path=MASTERY_PATHS[i],unlocked=kills>=t.kills;const nodes=path.skills.flatMap(id=>TRAINING_THRESHOLDS[id].map((threshold,index)=>({id,threshold,level:index+1}))).sort((a,b)=>a.threshold-b.threshold);return `<section class="mastery-branch"><header><small>PATH ${i+1}</small><h3>${path.name}</h3></header><article class="tree-key ${unlocked?'earned':''} ${equipped===t.id?'equipped':''}"><span class="tree-node-dot" aria-hidden="true">✦</span><small>KEY SKILL · ${t.kills===0?'STARTER':t.kills+' KILLS'}</small>${techniqueDemo(hero,t.id)}<h3>${t.name}</h3><p>${t.effect}</p><small>${t.trigger}</small><button data-action="technique:${t.id}" ${!unlocked?'disabled':''}>${equipped===t.id?'✓ EQUIPPED':unlocked?'Equip skill':`${t.kills-kills} kills to unlock`}</button></article><div class="tree-training">${nodes.map(n=>{const p=PERMANENT[n.id as keyof typeof PERMANENT],legacy=(save.permanent[n.id]||0)>=n.level,earned=masteryTraining(kills,n.id,save.permanent[n.id]||0)>=n.level;return `<article class="tree-bonus ${earned?'earned':''}"><span class="tree-node-dot" aria-hidden="true">${earned?'✓':'◇'}</span><small>${earned?legacy&&kills<n.threshold?'PREVIOUSLY TRAINED':'UNLOCKED':n.threshold+' KILLS'}</small><h4>${p.name} ${n.level}</h4><p>${n.id==='reroll'?'+1 reroll per run':`+${Math.round(n.level*p.value*100)}% ${n.id==='health'?'maximum health':n.id==='defense'?'damage reduction':n.id==='magnet'?'gold pickup reach':n.id==='speed'?'movement speed':'attack damage'} total`}</p></article>`;}).join('')}</div></section>`;}).join('')}</div><div class="tree-veteran ${kills>=500?'earned':''}"><b>${kills>=500?'✓':'◇'} Veteran · 500 kills</b><p>Veteran appearance. Also keep the existing 100-kill health and 250-kill ability damage bonuses.</p></div><p class="tree-explainer">Training earned here applies to this hero. Previously purchased Training stays active for every hero. Daily challenges use standard abilities without mastery or Training bonuses.</p><div class="actions">${back()}${button('Choose survivor','characters')}${button('Choose run →','play','primary')}</div>`,true);
 overlay.querySelector('.panel')?.classList.add('mastery-tree-panel');
}

function characters() { menuState = 'characters'; shell(`${header('Choose your survivor', 'Each survivor changes how you fight. Unlock new styles in the armoury.')}<div class="cards character-cards">${Object.entries(HEROES).map(([id, h]) => { const owned = save.heroes.includes(id as HeroId); return `<button class="character ${save.hero === id ? 'selected' : ''}" data-action="hero:${id}" ${!owned ? 'disabled' : ''}><div class="character-icon" style="--hero:#${h.color.toString(16)}">${artImage('hero', id)}</div><small>${h.tag}</small><h3>${h.name}</h3><p>${h.description}</p><div class="hero-identity"><b>${HERO_IDENTITIES[id as HeroId].icon} ${HERO_IDENTITIES[id as HeroId].name}</b><small>${HERO_IDENTITIES[id as HeroId].trigger} → ${HERO_IDENTITIES[id as HeroId].benefit}</small></div><div class="mini-stats"><span>♥ ${h.hp}</span><span>↗ ${h.speed}</span><span>⚔ ×${h.damage}</span></div><strong>${owned ? (save.hero === id ? 'SELECTED' : 'SELECT') : `LOCKED · ◈ ${h.price}`}</strong></button>`; }).join('')}</div><div class="actions">${back()}${button('Visit shop', 'shop')}${button('Choose weapon →', 'weapons', 'primary')}</div>`, true); }
function weapons() { menuState = 'weapons'; shell(`${header('Your weapon, your rules', `Choose compatible equipment for ${HEROES[save.hero].name}.`)}<div class="cards weapon-select-cards">${Object.entries(WEAPONS).filter(([id]) => compatible(save.hero, id as WeaponId)).map(([id, w]) => `<button class="upgrade weapon-select-card weapon-${w.hero} ${save.weapon === id ? 'selected' : ''}" style="--weapon-glow:#${HEROES[w.hero as HeroId].color.toString(16)}" data-action="weapon:${id}" ${save.weapons.includes(id as WeaponId) ? '' : 'disabled'}><div class="weapon-art">${weaponShopImage(id as WeaponId)}</div><small>${ART_NAMES[id as WeaponId]}</small><h3>${w.name}</h3><p>${w.damage} damage · ${w.cooldown}s attack interval<br>${w.range} range · ${HEROES[save.hero].name}</p><strong>${save.weapons.includes(id as WeaponId) ? save.weapon === id ? 'EQUIPPED' : 'EQUIP' : `LOCKED · ◈ ${w.price}`}</strong></button>`).join('')}</div><div class="actions">${weaponReturnToLoadout?button('← Back to loadout','loadout','quiet'):button('← Survivors', 'characters', 'quiet')}${button('Armoury', 'shop')}${button('Evolution previews','guide-weapons','quiet')}${weaponReturnToLoadout?'':button('Enter the arena →', 'play', 'primary')}</div>`, true); }
function shop(tab = 'heroes') {
    menuState = 'shop';
    const names = { heroes: 'Characters', weapons: 'Weapons', cosmetics: 'Cosmetics' };
    let items = '';
    if (tab === 'heroes')
        items = Object.entries(HEROES).map(([id, h]) => `<article class="shop-item survivor-shop-item ${save.hero===id?'shop-selected':''}"><span class="shop-item-state">${save.hero===id?'✓ SELECTED':save.heroes.includes(id as HeroId)?'OWNED':'NEW SURVIVOR'}</span><span class="card-icon" style="color:#${h.color.toString(16)}">${artImage('hero', id)}</span><h3>${h.name}</h3><p>${h.description}</p><small>♥ ${h.hp} · ↗ ${h.speed} · ⚔ ×${h.damage}<br>${h.ability} · ${h.cooldown}s<br>Weapons: ${Object.values(WEAPONS).filter(w => w.hero === id).map(w => w.name).join(', ')}</small>${save.heroes.includes(id as HeroId) ? (save.hero===id?'<span class="shop-current-label">✓ Your survivor</span>':button('Select survivor', `hero:${id}`)) : button(`Unlock · ◈ ${h.price}`, `buy:heroes:${id}`, save.gold >= h.price ? 'primary' : '')}</article>`).join('');
    if (tab === 'weapons') {
        const colors:Record<HeroId,string>={ninja:'#c28aff',samurai:'#ff777f',gunner:'#ffc65e',tank:'#5be6e3'};
        items = Object.entries(WEAPONS).map(([id, w]) => {
            const hero=w.hero as HeroId,owned=save.weapons.includes(id as WeaponId),equipped=save.weapon===id,canEquip=owned&&save.hero===hero;
            const action=equipped?'<span class="weapon-owned owned">✓ EQUIPPED</span>':canEquip?button('EQUIP WEAPON',`weapon:${id}`,'weapon-equip'):owned?'<span class="weapon-owned owned">✓ OWNED</span>':button(`UNLOCK · ◈ ${w.price}`,`buy:weapons:${id}`,save.gold>=w.price?'primary':'weapon-unlock');
            return `<article class="shop-item weapon-shop-item weapon-${hero} ${equipped?'weapon-equipped':''}" style="--weapon-glow:${colors[hero]}"><div class="weapon-art"><span class="weapon-art-halo"></span>${weaponShopImage(id as WeaponId)}<span class="weapon-tag">${HEROES[hero].name}</span>${equipped?'<span class="weapon-equipped-tag">CURRENT</span>':''}</div><div class="weapon-shop-copy"><small class="weapon-class">${ART_NAMES[id as WeaponId]}</small><h3>${w.name}</h3><p>${w.damage} damage · ${w.range} range<br>${w.cooldown}s attack interval</p><div class="weapon-owner">FOR ${HEROES[hero].name.toUpperCase()}</div></div>${action}</article>`;
        }).join('');
    }
    if (tab === 'cosmetics')
        items = '<div class="shop-empty"><span aria-hidden="true">✦</span><h3>A little more personality</h3><p>Cosmetics are coming soon. For now, explore survivors, find a new weapon, or train for your next run.</p></div>';
    shell(`${header('Gear up for your next stand','Find your survivor. Pick your weapon. Build your advantage.')}<div class="shop-top"><span class="coin">◈ ${PLAYTEST.unlimitedGold ? '∞' : save.gold.toLocaleString()} GOLD</span><nav aria-label="Shop categories">${Object.entries(names).map(([id, name]) => button(name, `tab:${id}`, tab === id ? 'active' : 'quiet')).join('')}</nav></div><div class="shop-grid shop-collection-${tab} ${tab==='weapons'?'weapon-shop-grid':''}">${items}</div><div class="actions">${back()}${button('Choose survivor', 'characters')}${button('Enter the arena →', 'play', 'primary')}</div>`, true);
    overlay.querySelector('.panel')?.classList.add('armoury-panel');
    overlay.querySelectorAll<HTMLButtonElement>('.shop-top nav button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.action===`tab:${tab}`)));
}
function levelUpCardPreview(hero:HeroId){
 const weapon=Object.entries(WEAPONS).find(([,w])=>w.hero===hero&&w.price===0)![0] as WeaponId;
 const cards=UPGRADES.filter(u=>!u.hero||u.hero===hero),shared=cards.length-UPGRADES.filter(u=>u.hero===hero).length;
 return `<section class="levelup-preview"><div class="levelup-preview-intro"><b>${cards.length} REGULAR LEVEL-UP CARD TYPES</b><p>${shared} shared cards and ${cards.length-shared} ${HEROES[hero].name}-specific cards. These are shown at level 1; card choices during a run vary.</p></div><div class="cards upgrade-cards levelup-preview-grid">${cards.map((u,i)=>visualUpgradeCard(u,i,hero,weapon,0,'',true)).join('')}</div></section>`;
}

function guide(){
 menuState='guide';const content=guideTab==='cards'?cardEvolutionGuide(save,guideHero):guideTab==='levelups'?levelUpCardPreview(guideHero):guideTab==='weapons'?weaponEvolutionGuide(save,guideWeapon):enemyGallery((['enemies','robots','bosses'].includes(guideTab)?guideTab:'enemies') as GuideSection);
 shell(`${header('Field guide','Meet the horde. Learn their tells. Make your next stand count.')}<nav class="guide-tabs field-main-tabs" aria-label="Enemy collections">${[['enemies','Zombies'],['robots','Robots'],['bosses','Bosses']].map(([id,name])=>button(`${name} <span>${guideEntries(id as GuideSection).length}</span>`,'guide-tab:'+id,id===guideTab?'active':'quiet')).join('')}</nav><details class="field-build-library" ${['cards','levelups','weapons'].includes(guideTab)?'open':''}><summary>Build library <span>Cards &amp; weapon evolutions</span></summary><nav class="guide-tabs field-library-tabs" aria-label="Build collections">${[['cards','Card evolutions'],['levelups','Level-up cards'],['weapons','Weapon evolutions']].map(([id,name])=>button(name,'guide-tab:'+id,id===guideTab?'active':'quiet')).join('')}</nav></details>${guideTab==='cards'||guideTab==='levelups'?`<nav class="guide-filters">${Object.entries(HEROES).map(([id,h])=>button(h.name,'guide-hero:'+id,guideHero===id?'active':'quiet')).join('')}</nav>`:guideTab==='weapons'?`<label class="guide-filter">WEAPON <select data-guide-weapon aria-label="Weapon evolution preview">${Object.entries(HEROES).map(([hero,h])=>`<optgroup label="${h.name}">${Object.entries(WEAPONS).filter(([,w])=>w.hero===hero).map(([id,w])=>`<option value="${id}" ${guideWeapon===id?'selected':''}>${w.name}</option>`).join('')}</optgroup>`).join('')}</select></label>`:''}<section class="${['cards','levelups','weapons'].includes(guideTab)?'field-build-content':''}">${content}</section><div class="actions">${button('← Back','guide-back','quiet')}</div>`,true);
 overlay.querySelector('.panel')?.classList.add('field-guide-panel');overlay.querySelectorAll<HTMLButtonElement>('.field-main-tabs button,.field-library-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.action===`guide-tab:${guideTab}`)));mountEnemyGallery(overlay);
}
function openGuide(tab='enemies'){
 guideReturn=menuState;guideTab=tab;guideHero=scene&&!scene.ended?scene.hero:save.hero;guideWeapon=scene&&!scene.ended?scene.weapon:save.weapon;
 if(scene&&!scene.ended)scene.paused=true;guide();
}

function settings() {
 menuState='settings';
 const toggle=(key:'sound'|'music'|'shake'|'aimAssist',title:string,description:string)=>`<label class="preference-row"><span class="preference-copy"><b>${title}</b><small>${description}</small></span><input class="preference-switch" type="checkbox" aria-label="${title}" data-setting="${key}" ${save.settings[key]?'checked':''}></label>`;
 shell(`${header('Make it your game','Your sound. Your controls. Your next stand.')}<div class="preferences-grid"><section class="preference-group"><div class="preference-heading"><span aria-hidden="true">♫</span><div><small>SET THE MOOD</small><h3>Sound & atmosphere</h3></div></div>${toggle('sound','Sound effects','Hear every hit, shot and enemy attack.')}${toggle('music','Ambient music','Keep the soundtrack playing during your run.')}${toggle('shake','Screen shake','Add impact to powerful attacks. Turn off for a calmer view.')}</section><section class="preference-group"><div class="preference-heading"><span aria-hidden="true">✥</span><div><small>FIND YOUR COMFORT</small><h3>Touch controls</h3></div></div>${toggle('aimAssist','Aim assistance','Help aim your attacks when playing on mobile.')}<label class="preference-row"><span class="preference-copy"><b>Joystick side</b><small>Choose which thumb handles movement.</small></span><select aria-label="Joystick side" data-control="joystickSide"><option value="left" ${save.settings.joystickSide==='left'?'selected':''}>Left</option><option value="right" ${save.settings.joystickSide==='right'?'selected':''}>Right</option></select></label><label class="preference-row"><span class="preference-copy"><b>Joystick size</b><small>Pick a size that feels easy to reach.</small></span><select aria-label="Joystick size" data-control="joystickSize">${[95,115,135].map(n=>`<option value="${n}" ${save.settings.joystickSize===n?'selected':''}>${n===95?'Compact':n===115?'Standard':'Large'}</option>`).join('')}</select></label><p class="preference-note">These controls apply on touch screens.</p></section></div><div class="preferences-footer"><span>✓ Changes save automatically<small>Progress is stored in this browser.</small></span>${button(scene&&!scene.ended?'← Back to pause':'← Back to menu',scene&&!scene.ended?'pause':'menu','primary')}</div><details class="preferences-reset"><summary>Progress management</summary><div><p>Start over by clearing your saved progress in this browser.</p>${button('Reset progress','reset','danger')}</div></details>`,true);
 overlay.querySelector('.panel')?.classList.add('preferences-panel');
}
async function start(options:RunOptions={mode:selectedMode,build:selectedBuild,technique:save.techniques[save.hero]||'standard'}) { if(menuState==='loading')return;save.runSetup={mode:options.mode,build:options.build};touchControls?.destroy(); game?.destroy(true); scene = undefined;hud.innerHTML='';overlay.className='';menuState='loading';shell('<div class="arena-loading" role="status" aria-live="polite"><div class="eyebrow">ZOMBIE LAST STAND</div><h2>Preparing your stand…</h2><p>Loading the arena and your survivor.</p><progress aria-label="Arena loading" max="100" value="0"></progress><small data-load-progress>0%</small></div>'); syncAudio(); audio.unlock(); let runtime;try{runtime=await Promise.all([import('phaser'),import('./combat')]);}catch{menuState='menu';shell(`${header('Unable to load the arena','Check your connection and try again.')}${button('Back to menu','menu','primary')}`);return;}if(menuState!=='loading')return;const [{default:Phaser},{ArenaScene}]=runtime;const s = new ArenaScene(save, audio, showChoices, results, pause, options); scene = s;
 s.onLoading=(progress)=>{const bar=overlay.querySelector<HTMLProgressElement>('progress');if(bar)bar.value=Math.round(progress*100);const label=overlay.querySelector('[data-load-progress]');if(label)label.textContent=progress>=1?'Preparing the first frame…':`${Math.round(progress*100)}%`;};
 s.onArenaReady=()=>requestAnimationFrame(()=>{if(scene!==s||menuState!=='loading')return;overlay.style.display='none';overlay.className='ingame';menuState='game';});
 s.onLoadingError=()=>{if(scene!==s)return;shell(`${header('The arena could not load','Check your connection, then try again.')}${button('Back to menu','menu','primary')}`);};
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
function renderChoices() { const s = scene!; const title=waveChoice?header(`Wave ${s.stats.wave} survived`,'Recover. Adapt. The next horde is coming.'):`<div class="choice-heading"><b>SKILL CHOICE</b><small>LEVEL ${s.level} · PICK ONE</small></div>`; shell(`${title} ${waveChoice ? `<div class="wave-recap"><span>${s.waveStats.time.toFixed(1)}s <small>CLEAR TIME</small></span><span>${s.waveStats.kills} <small>KILLS</small></span><span>◈ ${s.waveStats.gold} <small>GOLD</small></span><span>${Math.round(s.waveStats.damage)} <small>DAMAGE TAKEN</small></span></div><p class="badges">${s.waveStats.time < 45 ? '✦ QUICK CLEAR · +15% GOLD' : ''} ${s.waveStats.damage === 0 ? '◇ PERFECT CLEAR · +1 REROLL' : ''}</p>` : ''}<div class="cards upgrade-cards">${choices.map((u,i)=>visualUpgradeCard(u,i,s.hero,s.weapon,s.levels[u.id]||0,upgradeBuildHint(u,s.levels))).join('')}</div><div class="actions"><span class="muted">${button('Evolution guide','guide-cards','quiet')}</span>${button(`↻ Reroll (${s.rerolls} left)`, 'reroll', 'quiet')}</div>`, true); overlay.querySelector('.panel')?.classList.add('levelup-panel');const reroll=overlay.querySelector<HTMLButtonElement>('[data-action=reroll]');if(reroll)reroll.disabled=s.rerolls<=0; }
function previewUpgrade(index:number){
 if(menuState!=='choice'||!choices[index])return;
 const s=scene!,u=choices[index],v=upgradeValues(u,s.levels[u.id]||0);
 overlay.querySelector('.upgrade-inspect')?.remove();
 const dialog=document.createElement('dialog');dialog.className='upgrade-inspect';
 dialog.setAttribute('aria-label',u.name+' details');
 dialog.innerHTML=`<button class="inspect-close" aria-label="Close skill preview">×</button>${upgradeVisual(u,s.hero,s.weapon)}<h3>${u.name}</h3><p>${u.description}</p><div class="inspect-values"><span>${v.before}</span><b>→ ${v.after}</b></div><button class="inspect-confirm">Choose ${u.name}</button><small>Choose to apply this upgrade and resume combat.</small>`;
 overlay.append(dialog);
 const close=()=>{dialog.close();dialog.remove();overlay.querySelector<HTMLButtonElement>(`[data-action="upgrade:${index}"]`)?.focus();};
 dialog.querySelector('.inspect-close')!.addEventListener('click',close);
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.querySelector('.inspect-confirm')!.addEventListener('click',()=>{dialog.close();dialog.remove();void pick(index);});
 dialog.showModal();dialog.querySelector<HTMLButtonElement>('.inspect-confirm')?.focus();
}
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
    if(a==='guide-tab'){guideTab=b;guide();overlay.querySelector<HTMLButtonElement>('.guide-tabs button.active')?.focus();}
    if(a==='guide-hero'&&Object.hasOwn(HEROES,b)){guideHero=b as HeroId;guide();}
    if(a==='guide-weapon'&&Object.hasOwn(WEAPONS,b)){guideWeapon=b as WeaponId;guide();}
    if(a==='guide-back'){if(guideReturn==='choice'){menuState='choice';renderChoices();}else if(guideReturn==='evolution')evolutionMenu();else if(guideReturn==='weapons')weapons();else if(guideReturn==='build')buildMenu();else menu();}
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
        previewUpgrade(Number(b));
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
        previewUpgrade(Number(e.key) - 1);
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
    touchControls?.update(!!s&&!s.ended&&!s.paused&&menuState==='game',s&&s.countdown>0?s.countdown:s?.ability||0,s?techniqueName(s.hero,s.options.technique):HEROES[save.hero].ability,s?HEROES[s.hero].cooldown:1,s?abilityIcons[s.hero]:'➤',!!s&&(s.hero==='gunner'?s.overdrive>0:s.hero==='samurai'?s.counter>0:s.hero==='ninja'?s.dash>0:false));
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
