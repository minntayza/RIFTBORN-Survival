import {ROBOT_ROLES} from './robot-enemies';
import type {EnemyId} from './config';
/** The zombie cast shown in the Field Guide. Robot roles use their own roster. */
export const ZOMBIE_ROSTER=['basic','runner','spitter','armoured','brute','elite','rifle','commander','boss'] as const satisfies readonly EnemyId[];
export type GuideZombie=typeof ZOMBIE_ROSTER[number];
/** Omit retired artwork at the shared spawn gate, including summons and scripted waves. */
export function rosterSpawn(type:EnemyId,faction:'zombie'|'robot'):EnemyId|undefined{
 if(faction==='robot')return ROBOT_ROLES[type]==='pulse'?undefined:type;
 return (ZOMBIE_ROSTER as readonly string[]).includes(type)?type:undefined;
}
