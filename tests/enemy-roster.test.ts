import test from 'node:test';
import assert from 'node:assert/strict';
import {ENEMIES,type EnemyId} from '../src/config';
import {rosterSpawn,ZOMBIE_ROSTER} from '../src/enemy-roster';
import {zombieDesigns} from '../src/enemy-guide';
import {wavePlan} from '../src/waves';
import {ROBOT_ROLES,spawnFaction} from '../src/robot-enemies';
test('unlisted zombie spawns are omitted without replacements; retired Pulse robots are omitted',()=>{
 assert.deepEqual(zombieDesigns.map(d=>d.id),[...ZOMBIE_ROSTER]);
 for(const id of Object.keys(ENEMIES) as EnemyId[]){assert.equal(rosterSpawn(id,'zombie'),(ZOMBIE_ROSTER as readonly string[]).includes(id)?id:undefined);assert.equal(rosterSpawn(id,'robot'),ROBOT_ROLES[id]==='pulse'?undefined:id);}
 for(const id of ZOMBIE_ROSTER)assert.equal(rosterSpawn(id,'zombie'),id);
});
test('late-wave mixed encounters cannot introduce unlisted zombies',()=>{
 let seed=46;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let wave=11;wave<=100;wave++){let serial=0;for(const pack of wavePlan(wave,random))for(let i=0;i<pack.count;i++){const faction=spawnFaction(wave,serial++,pack.type),id=rosterSpawn(pack.type,faction);if(faction==='zombie'&&id!==undefined)assert.ok((ZOMBIE_ROSTER as readonly string[]).includes(id),`${wave}: ${id}`);else if(faction==='zombie')assert.equal(id,undefined);else assert.equal(id,ROBOT_ROLES[pack.type]==='pulse'?undefined:pack.type);}}
});

test('all pink Pulse variants are blocked, including the oversized Overseer',()=>{for(const id of ['spitter','rifle','bioScreer','shooterBoss'] as const)assert.equal(rosterSpawn(id,'robot'),undefined);assert.equal(rosterSpawn('boss','robot'),'boss');assert.equal(rosterSpawn('commander','robot'),'commander');});
