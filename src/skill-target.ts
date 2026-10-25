import {ABILITY_TUNING as T} from './config';
export type SkillPoint={x:number;y:number};
export type TargetSkill='beacon'|'breach';
export const targetSkill=(id:string):id is TargetSkill=>id==='beacon'||id==='breach';
export const skillRange=(id:TargetSkill)=>id==='beacon'?T.beacon.deployRange:T.breach.throwRange;
export function clampSkillTarget(origin:SkillPoint,target:SkillPoint,range:number){const dx=target.x-origin.x,dy=target.y-origin.y,d=Math.hypot(dx,dy);if(!Number.isFinite(d))return {...origin};const factor=d>range?range/d:1;return {x:origin.x+dx*factor,y:origin.y+dy*factor};}
export function resolveSkillTarget(origin:SkillPoint,target:SkillPoint,id:TargetSkill,move:(x:number,y:number,dx:number,dy:number,r:number)=>SkillPoint){const p=clampSkillTarget(origin,target,skillRange(id));return move(origin.x,origin.y,p.x-origin.x,p.y-origin.y,12);}
