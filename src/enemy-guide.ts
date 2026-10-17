import {commandPortrait} from './cute-command';
import {hordePortrait} from './cute-horde';
import {cutePortrait} from './cute-trio';
import {ROBOTS,robotSvg,type RobotKind} from './robot-enemies';
import {rigPortraitSvg} from './zombie-sprites';
import {ENEMIES,type EnemyId} from './config';
type Frame=readonly [number,number,number,number];
const zombieDesigns:{id:EnemyId;role:string;cue:string;tip:string;frame:Frame}[]=[
 {id:'basic',role:'Close-range swarm',cue:'Bald green head, torn brown shirt, hunched shoulders.',tip:'Keep an escape route open; avoid getting surrounded.',frame:[20,5,380,300]},
 {id:'runner',role:'Fast canine pursuer',cue:'Tan-and-cream fur, green skin, one floppy ear, and four chunky paws.',tip:'Watch your flanks and turn toward an open gap.',frame:[450,5,390,300]},
 {id:'spitter',role:'Ranged poison',cue:'Round purple throat pouch, puffed cheeks, and green drool.',tip:'Move sideways when its throat lights up.',frame:[885,5,390,300]},
 {id:'armoured',role:'Armoured front line',cue:'Oversized blue riot helmet, clear visor, and compact padded armor.',tip:'Armour resists bullets; heavy melee attacks help.',frame:[20,360,380,360]},
 {id:'brute',role:'Heavy melee',cue:'Enormous rounded fists and shoulders with a torn orange vest.',tip:'Leave the marked slam area before impact.',frame:[450,360,390,360]},
 {id:'elite',role:'Elite threat',cue:'Ivory bone growths and a ragged burgundy coat.',tip:'Read its modifier and give its attacks room.',frame:[885,360,390,360]},
 {id:'rifle',role:'Ranged rifle',cue:'Olive uniform, cap, rifle held across the chest.',tip:'It braces before firing; keep moving sideways to avoid the shot.',frame:[20,770,400,355]},
 {id:'commander',role:'Reinforcements',cue:'Maroon officer coat, raised hand, belt radio.',tip:'Defeat it to stop reinforcements and break its aura.',frame:[450,770,390,355]},
 {id:'boss',role:'Wave 10 boss',cue:'Navy general cap, white moustache, crimson cape, and a gold command baton.',tip:'Grave Rupture erupts in three marked circles. Move sideways, then watch for the war cry and locked charge lane.',frame:[885,770,400,355]}
];
function designArt(sheet:'zombie-redesigns'|'robot-designs',name:string,[x,y,w,h]:Frame){
 const [width,height]=sheet==='zombie-redesigns'?[1300,1209]:[1536,1024];
 const clip=`guide-${sheet}-${x}-${y}`;
 return `<div class="guide-design"><svg viewBox="${x} ${y} ${w} ${h}" role="img" aria-label="${name} redesign illustration" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><image clip-path="url(#${clip})" href="/assets/guide/${sheet}.png" width="${width}" height="${height}"/></svg></div>`;
}
const cuteGuideFrames:Partial<Record<EnemyId,{sheet:string;frame:Frame}>>={
 runner:{sheet:'cute-zombie-dog-transparent-v1',frame:[180,20,925,750]},
 spitter:{sheet:'cute-zombie-concepts-transparent-v1',frame:[25,220,470,525]},
 armoured:{sheet:'cute-zombie-concepts-transparent-v1',frame:[550,200,465,545]},
 brute:{sheet:'cute-zombie-concepts-transparent-v1',frame:[1030,60,730,685]}
};
function approvedConcept(id:EnemyId){
 const design=cuteGuideFrames[id];if(!design)return '';
 const [x,y,w,h]=design.frame;
 return `<svg viewBox="${design.frame.join(' ')}" role="img" aria-label="${ENEMIES[id].name} approved concept illustration" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="cute-guide-${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><image clip-path="url(#cute-guide-${id})" href="/assets/guide/${design.sheet}.png" width="1774" height="887"/></svg>`;
}
export function zombieGuide(){return `<p class="guide-design-note">Meet the horde. Spitter, Armoured, Brute, Zombie Dog, Elite, Rifleman, Commander, and General now use these cute designs in gameplay, with stable heads and shoulders. Legs animate while walking; officers move their arms during skills.</p><div class="bestiary design-bestiary">${zombieDesigns.map(d=>{const e=ENEMIES[d.id];return `<article class="enemy-card"><div class="guide-design ${cuteGuideFrames[d.id]?'cute-concept':''}">${cuteGuideFrames[d.id]?approvedConcept(d.id):d.id==='basic'?cutePortrait('wanderer'):d.id==='boss'||d.id==='commander'?commandPortrait(d.id):d.id==='elite'||d.id==='rifle'?hordePortrait(d.id):rigPortraitSvg(d.id as import('./zombie-walk').WalkingZombie)}</div>${cuteGuideFrames[d.id]?'<small class="concept-badge">NEW DESIGN · IN GAME</small>':''}<small>${d.role}</small><h3>${e.name}</h3><p>${d.cue}</p><p class="guide-counter"><b>Counterplay</b> ${d.tip}</p><div class="mini-stats"><span>♥ ${e.hp}</span><span>⚔ ${e.damage}</span><span>↗ ${e.speed}</span></div></article>`;}).join('')}</div>`;}
export function robotGuide(){return `<p class="guide-design-note">Robots appear from wave 11 onward, replacing zombies in the factory and reactor gardens. Heavier armor and stronger attacks make this a tougher squad. Scouts flank, Shield Units protect nearby allies, and Command Units accelerate the advance. Pulse Overseers and Shield Wardens are larger elite variants.</p><div class="bestiary design-bestiary">${(Object.keys(ROBOTS) as RobotKind[]).map(kind=>{const d=ROBOTS[kind];return `<article class="enemy-card robot-guide-card"><div class="guide-design">${kind==='pulse'?cutePortrait('pulse'):robotSvg(kind)}</div><small>${d.role} · WAVE 11+</small><h3>${d.name}</h3><p>${d.cue}</p><p class="guide-counter"><b>Counterplay</b> ${d.tip}</p></article>`;}).join('')}</div>`;}
