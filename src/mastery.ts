import {HERO_DEFINITIONS,type HeroId} from './config';
import {artImage} from './art';
import type {TechniqueId} from './retention';
export type Technique={id:TechniqueId;name:string;kills:number;effect:string;trigger:string};
export function heroTechniques(hero:HeroId):Technique[]{
 const variants:Record<HeroId,[string,string,string,string]>={
 zawgyi:['Mystic Staff','Spin and cast a magic crescent.','Alchemy Bloom','Grow a healing lotus.'],
 pyusawhti:['Sun Piercer','Arrows explode on impact with radiant sunbursts.','Gale Stride','Move and loose arrows with 25% increased speed.'],
 lethwei:['Golden Belt','Iron Chin reflects double damage back to attackers.','Ring Roar','Ring ropes repel enemies with explosive kinetic force.'],
 kyansittha:['Divine Spearfall','Arindama spear calls down lightning on arrival.','Royal Barrier','Bagan Phalanx barrier duration extended by 3 seconds.'],
 ninja:['Long Dash','Travel farther through enemies.','Shadow Decoy','Leave a decoy for 4 seconds that attracts nearby ordinary zombies.'],
 samurai:['Wide Counter','Successful counters strike a larger circle around you.','Counter Wave','Successful counters launch a piercing crescent forward.'],
 gunner:['Piercing Overdrive','Overdrive shots pierce two extra zombies.','Covering Fire','Fire backward bursts while moving during Overdrive.'],
 tank:['Earthbreaker','Ground Slam reaches farther and slows enemies for longer.','Iron Guard','Ground Slam also grants a shield that blocks two hits.']};
 const [first,firstText,second,secondText]=variants[hero];
 const base:Record<HeroId,string>={zawgyi:'Choose two mystic arts in your loadout.',pyusawhti:'Loose divine arrows and trigger piercing sun bursts.',lethwei:'Bare-knuckle brawl and summon boxing ring clones.',kyansittha:'Impale foes with crescent spear sweeps and phalanx walls.',ninja:'Dash through enemies with brief invulnerability.',samurai:'Time your stance before a hit to block it and retaliate.',gunner:'Instantly reload and fire 60% faster for 3 seconds.',tank:'Slam the ground, pushing nearby zombies away and slowing them for 2 seconds.'};
 return [{id:'standard',name:HERO_DEFINITIONS[hero].ability,kills:0,effect:base[hero],trigger:'When you tap your ability button.'},{id:'swift',name:first,kills:100,effect:firstText,trigger:hero==='samurai'?'After blocking a hit with Perfect Counter.':'When you use '+HERO_DEFINITIONS[hero].ability+'.'},{id:'fortified',name:second,kills:250,effect:secondText,trigger:hero==='samurai'?'After blocking a hit with Perfect Counter.':'When you use '+HERO_DEFINITIONS[hero].ability+'.'}];
}
export function techniqueName(hero:HeroId,id:TechniqueId){return heroTechniques(hero).find(t=>t.id===id)!.name;}
export function techniqueDemo(hero:HeroId,id:TechniqueId){
 return `<div class="technique-demo demo-${hero} demo-${id}" role="img" aria-label="${techniqueName(hero,id)} demonstration"><span class="demo-enemy enemy-one">${artImage('enemy','basic')}</span><span class="demo-enemy enemy-two">${artImage('enemy','runner')}</span><span class="demo-effect"></span><span class="demo-decoy">${artImage('hero',hero)}</span><span class="demo-hero">${artImage('hero',hero)}</span><span class="demo-trail"></span></div>`;
}

// All training is earned on a hero's tree; old shop purchases remain a floor.
export const MASTERY_PATHS=[
 {name:'Survival',skills:['health','defense']},
 {name:'Precision',skills:['damage','magnet']},
 {name:'Momentum',skills:['speed','reroll']}
] as const;
export const TRAINING_THRESHOLDS:Record<string,number[]>={health:[25,75,150],defense:[200,275,350,425,500],damage:[125,225],magnet:[175,250,325,400,475],speed:[275,375],reroll:[450]};
export function masteryTraining(kills:number,id:string,legacy=0){return Math.max(legacy,(TRAINING_THRESHOLDS[id]||[]).filter(n=>kills>=n).length);}
