import type {EnemyId} from './config';
/** The zombie cast shown in the Field Guide. Robot roles use their own roster. */
export const ZOMBIE_ROSTER=['basic','runner','spitter','armoured','brute','elite','rifle','commander','boss'] as const satisfies readonly EnemyId[];
export type GuideZombie=typeof ZOMBIE_ROSTER[number];
/** Unlisted zombies are omitted, never substituted. Robots retain their own roles. */
export function rosterSpawn(type:EnemyId,faction:'zombie'|'robot'):EnemyId|undefined{
 return faction==='robot'||(ZOMBIE_ROSTER as readonly string[]).includes(type)?type:undefined;
}
