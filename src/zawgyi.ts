import {skillIcon} from './skill-icons';
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
export function zawgyiSkillIcon(id:ZawgyiSkill){return skillIcon(id==='slam'?'staffslam':id,'zawgyi');}

export function zawgyiStaffTip(x:number,y:number,angle:number,lift=0,attack=0,sequence=0,time=0,moving=false){return zawgyiWorldPoint(zawgyiMotion(time,moving,attack,sequence,-1,angle).tip,x,y,angle,lift);}
