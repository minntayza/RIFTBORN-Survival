import {ZAWGYI_ATLAS,zawgyiRigPortrait} from './zawgyi-rig-art';
import {zawgyiMotion,zawgyiWorldPoint} from './zawgyi-motion';
export const ZAWGYI_ART=ZAWGYI_ATLAS;
export const ZAWGYI_SKILLS={
 datlone:{name:'Dat Lone',cooldown:12,icon:'◉',description:'Throw an alchemical sphere. It pulls nearby enemies for 2 seconds, then explodes in alchemical fire. Bosses resist the pull.'},
 flame:{name:'Flame Step',cooldown:11,icon:'♨',description:'Dash forward in golden sparks, leaving a trail of little flames for 2 seconds that burn and slow enemies.'},
 slam:{name:'Staff Slam',cooldown:14,icon:'✦',description:'Leap up and slam your staff down. A 360° shockwave damages and knocks back surrounding enemies, briefly stunning heavy and elite enemies.'}
} as const;
export type ZawgyiSkill=keyof typeof ZAWGYI_SKILLS;
export type ZawgyiLoadout=[ZawgyiSkill,ZawgyiSkill];
export function validZawgyiLoadout(raw:unknown):ZawgyiLoadout{const legacy:Record<string,ZawgyiSkill>={staff:'datlone',leap:'flame',bloom:'slam'};if(Array.isArray(raw)&&raw.length===2){const pair=raw.map(s=>typeof s==='string'?(legacy[s]||s):s);if(pair[0]!==pair[1]&&pair.every(s=>typeof s==='string'&&Object.hasOwn(ZAWGYI_SKILLS,s)))return pair as ZawgyiLoadout;}return ['datlone','flame'];}
export function replaceZawgyiSkill(pair:ZawgyiLoadout,slot:number,skill:ZawgyiSkill):ZawgyiLoadout{const next:[ZawgyiSkill,ZawgyiSkill]=[...pair],other=slot===0?1:0;if(next[other]===skill)next[other]=next[slot];next[slot]=skill;return next;}
export const zawgyiPortrait=zawgyiRigPortrait;
export function mysticStaffPortrait(cls='art-image'){return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Zawgyi red mystic staff"><g transform="rotate(20 64 64)"><rect x="60" y="9" width="8" height="110" rx="4" fill="#b92e38" stroke="#341e27" stroke-width="2"/><path d="M63 18v92" stroke="#ff9380" stroke-width="2"/><rect x="58" y="8" width="12" height="11" rx="3" fill="#f2cc5d" stroke="#744a28" stroke-width="2"/><rect x="58" y="109" width="12" height="11" rx="3" fill="#f2cc5d" stroke="#744a28" stroke-width="2"/></g></svg>`;}
export function zawgyiSkillIcon(id:ZawgyiSkill){const path=id==='datlone'?'<ellipse cx="32" cy="34" rx="24" ry="10" fill="none" stroke="#f3bb65" stroke-width="2" transform="rotate(-24 32 34)"/><circle cx="32" cy="31" r="16" fill="#edab48" stroke="#fff0af" stroke-width="2"/><path d="m32 18 3 9 9 4-9 3-3 10-3-10-9-3 9-4Z" fill="#fff3bb"/><circle cx="48" cy="22" r="3" fill="#fff3bb"/>':id==='flame'?'<path d="M34 9Q44 26 43 27Q47 23 47 19Q59 44 40 51Q18 60 16 39Q15 29 26 22Q24 33 29 34Q36 28 34 9Z" fill="#e46b42" stroke="#ffd78a" stroke-width="2"/><path d="M32 31Q27 39 30 45Q41 48 39 36Q36 40 32 31Z" fill="#fff1b4"/><path d="m9 22 10 2m-12 7 8 1" stroke="#f8d694" stroke-width="2"/>':'<ellipse cx="32" cy="49" rx="23" ry="7" fill="none" stroke="#ffde98" stroke-width="2"/><ellipse cx="32" cy="49" rx="15" ry="4" fill="none" stroke="#f59c75" stroke-width="2"/><path d="M32 12v36" stroke="#d84b4b" stroke-width="6"/><path d="M32 10v5m0 28v6" stroke="#fff0bc" stroke-width="7"/><path d="m17 29 8 7m22-7-8 7" stroke="#ffe4a5" stroke-width="3"/>';
 return `<svg viewBox="0 0 64 64" aria-hidden="true" data-ultimate="zawgyi"><circle cx="32" cy="32" r="28" fill="#433a37" stroke="#e0bd72" stroke-width="2"/>${path}<path d="m51 7 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#ffe6a5"/></svg>`;
}

export function zawgyiStaffTip(x:number,y:number,angle:number,lift=0,attack=0,sequence=0,time=0,moving=false){return zawgyiWorldPoint(zawgyiMotion(time,moving,attack,sequence,-1,angle).tip,x,y,angle,lift);}
