import {rigPortraitSvg} from './zombie-sprites';
import {ENEMIES,type EnemyId} from './config';
type Frame=readonly [number,number,number,number];
const zombieDesigns:{id:EnemyId;role:string;cue:string;tip:string;frame:Frame}[]=[
 {id:'basic',role:'Close-range swarm',cue:'Bald green head, torn brown shirt, hunched shoulders.',tip:'Keep an escape route open; avoid getting surrounded.',frame:[20,5,380,300]},
 {id:'runner',role:'Fast canine pursuer',cue:'Four legs, pointed ears, yellow eyes and a ragged tail.',tip:'Watch your flanks and turn toward an open gap.',frame:[450,5,390,300]},
 {id:'spitter',role:'Ranged poison',cue:'Swollen purple throat and green mouth droplet.',tip:'Move sideways when its throat lights up.',frame:[885,5,390,300]},
 {id:'armoured',role:'Armoured front line',cue:'Cracked riot helmet and broad metal plates.',tip:'Armour resists bullets; heavy melee attacks help.',frame:[20,360,380,360]},
 {id:'brute',role:'Heavy melee',cue:'Huge bare fists and oversized shoulders.',tip:'Leave the marked slam area before impact.',frame:[450,360,390,360]},
 {id:'elite',role:'Elite threat',cue:'Ivory bone growths and a ragged burgundy coat.',tip:'Read its modifier and give its attacks room.',frame:[885,360,390,360]},
 {id:'rifle',role:'Ranged rifle',cue:'Olive uniform, cap, rifle held across the chest.',tip:'Its aim line locks before firing; sidestep the shot.',frame:[20,770,400,355]},
 {id:'commander',role:'Reinforcements',cue:'Maroon officer coat, raised hand, belt radio.',tip:'Defeat it to stop reinforcements and break its aura.',frame:[450,770,390,355]},
 {id:'boss',role:'Wave 10 boss',cue:'Gold epaulettes and one massive mutated arm.',tip:'Dodge the locked charge lane and marked slams.',frame:[885,770,400,355]}
];
const robotDesigns:{name:string;role:string;cue:string;plan:string;frame:Frame}[]=[
 {name:'Scrap Walker',role:'Basic pursuer',cue:'Broken gripper, dangling cable, single cyan eye.',plan:'Slow mechanical pursuit with a close-range strike.',frame:[10,30,350,325]},
 {name:'Scout Bot',role:'Fast dash',cue:'Low wheeled body and narrow twin lights.',plan:'Pauses briefly, then commits to a fast dash.',frame:[410,55,300,300]},
 {name:'Pulse Shooter',role:'Ranged attacker',cue:'Large arm-mounted cannon with a cyan barrel.',plan:'Locks an aim line before a pulse shot.',frame:[730,40,340,320]},
 {name:'Shield Unit',role:'Defensive unit',cue:'Broad hand-held shield and exposed rear power pack.',plan:'Front protection creates an opening behind it.',frame:[1135,25,390,335]},
 {name:'Crusher',role:'Heavy melee',cue:'Oversized piston fists and heavy orange shoulders.',plan:'Telegraphed ground slams with a recovery opening.',frame:[10,430,520,455]},
 {name:'Command Unit',role:'Reinforcements',cue:'Backpack antenna, signal lamps, raised hand.',plan:'Signals incoming robot reinforcements.',frame:[545,430,365,455]},
 {name:'Factory Sentinel',role:'Boss',cue:'Four legs, segmented core, cannon and heavy claw.',plan:'Alternates charge, volley, and slam patterns.',frame:[915,425,610,465]}
];
function designArt(sheet:'zombie-redesigns'|'robot-designs',name:string,[x,y,w,h]:Frame){
 const [width,height]=sheet==='zombie-redesigns'?[1300,1209]:[1536,1024];
 const clip=`guide-${sheet}-${x}-${y}`;
 return `<div class="guide-design"><svg viewBox="${x} ${y} ${w} ${h}" role="img" aria-label="${name} redesign illustration" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><image clip-path="url(#${clip})" href="/assets/guide/${sheet}.png" width="${width}" height="${height}"/></svg></div>`;
}
export function zombieGuide(){return `<p class="guide-design-note">Nine zombie redesigns · Matching character designs now appear in gameplay.</p><div class="bestiary design-bestiary">${zombieDesigns.map(d=>{const e=ENEMIES[d.id];return `<article class="enemy-card">${d.id==='basic'||d.id==='runner'?`<div class="guide-design">${rigPortraitSvg(d.id)}</div>`:designArt('zombie-redesigns',e.name,d.frame)}<small>${d.role}</small><h3>${e.name}</h3><p>${d.cue}</p><p class="guide-counter"><b>Counterplay</b> ${d.tip}</p><div class="mini-stats"><span>♥ ${e.hp}</span><span>⚔ ${e.damage}</span><span>↗ ${e.speed}</span></div></article>`;}).join('')}</div>`;}
export function robotGuide(){return `<p class="guide-design-note">Robot design preview · Planned transition in waves 11–12, robots only from wave 13. Robot gameplay and stats are not implemented yet.</p><div class="bestiary design-bestiary">${robotDesigns.map(d=>`<article class="enemy-card robot-guide-card">${designArt('robot-designs',d.name,d.frame)}<small>${d.role} · DESIGN PREVIEW</small><h3>${d.name}</h3><p>${d.cue}</p><p class="guide-counter"><b>Planned behaviour</b> ${d.plan}</p></article>`).join('')}</div>`;}
