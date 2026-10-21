import type {HeroId} from './config';
export const HERO_IDENTITIES:Record<HeroId,{name:string;trigger:string;benefit:string;icon:string}>={
 zawgyi:{name:'Alchemical harmony',trigger:'Land 6 staff hits',benefit:'Restore 5% maximum health.',icon:'✿'},
 ninja:{name:'Momentum',trigger:'Move for 3 seconds',benefit:'Your next attack adds a shadow follow-up.',icon:'↗'},
 samurai:{name:'Resolve',trigger:'Land 5 separate attacks',benefit:'Your next attack adds a wide cutting wave.',icon:'◔'},
 gunner:{name:'Opening shots',trigger:'Finish a magazine reload',benefit:'Your first 3 shots deal 35% more damage.',icon:'▥'},
 tank:{name:'Impact',trigger:'Fight near enemies for 4 seconds',benefit:'Your next hit releases a crushing shockwave.',icon:'◉'}
};
export function encounterRhythm(wave:number){
 if(wave<8)return {name:'Build up',density:1,recovery:4};
 if(wave%5===0)return {name:'Boss encounter',density:.65,recovery:7};
 if(wave%5===4)return {name:'Scavenge',density:.55,recovery:6};
 if(wave%5===2)return {name:'Crossfire',density:.7,recovery:5};
 if(wave%5===3)return {name:'Elite pressure',density:.8,recovery:6};
 return {name:'Horde surge',density:1,recovery:4};
}
export function weaponMilestone(wave:number,awakened:boolean,full:boolean){return !awakened&&wave>=10?'awakening':awakened&&!full&&wave>=20?'full':undefined;}
export const EVOLUTION_STAGES={
 reach:{awakening:'Occasionally chain lightning to 1 nearby enemy.',full:'Chain lightning to 3 enemies; charged attacks pierce crowds.'},
 power:{awakening:'Direct hits ignite enemies briefly.',full:'Fiery attacks explode and leave burning ground on kills.'},
 tempo:{awakening:'Attack 10% faster; every third attack adds a ghost echo.',full:'Attack 20% faster; every attack releases a ghost echo.'}
};
export function deathTip(cause:string){
 if(/gunner|rifle|shot|volley/i.test(cause))return 'Keep moving across aim lines. They lock before the shot fires.';
 if(/general|boss|slam/i.test(cause))return 'Leave the slam circle; sidestep the charge lane after it locks.';
 if(/pike|spear/i.test(cause))return 'Move sideways across a pike thrust rather than retreating along it.';
 if(/butcher|cleaver/i.test(cause))return 'Step outside the broad cleaver arc during its wind-up.';
 return 'Keep an escape route open and move toward gaps before a crowd closes in.';
}
