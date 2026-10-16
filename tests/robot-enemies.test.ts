import test from 'node:test';
import assert from 'node:assert/strict';
import {ENEMIES,type EnemyId} from '../src/config';
import {wavePlan} from '../src/waves';
import {enemyFaction,enemyName,ROBOTS,ROBOT_ROLES,robotShapes,robotSvg,robotMovementType,robotStats,robotProtection} from '../src/robot-enemies';
import {WALK_PROFILES} from '../src/zombie-walk';
test('waves 1–10 stay zombie, every later scheduled and reinforcement role has a robot mapping',()=>{
 for(let w=1;w<=10;w++)assert.equal(enemyFaction(w),'zombie');
 for(const w of [11,12,13,15,20,21,100,999]){
  assert.equal(enemyFaction(w),'robot');
  for(const spawn of wavePlan(w,()=>.5))assert.ok(ROBOT_ROLES[spawn.type]);
 }
 for(const type of Object.keys(ENEMIES) as EnemyId[]){
  assert.ok(ROBOTS[ROBOT_ROLES[type]]);assert.ok(WALK_PROFILES[robotMovementType(type)]);
  assert.equal(enemyName(type,'zombie'),ENEMIES[type].name);
  assert.ok(!/Zombie|Butcher|Pike|Gunner|Dog|Wanderer/.test(enemyName(type,'robot')));
 }
});
test('all seven simple colorful robot designs are distinct and complete in the guide and gameplay',()=>{
 const kinds=Object.keys(ROBOTS) as (keyof typeof ROBOTS)[];
 assert.equal(kinds.length,7);assert.equal(new Set(kinds.map(robotSvg)).size,7);
 for(const kind of kinds){
  const svg=robotSvg(kind);assert.match(svg,/colorful 2D robot/);assert.ok(!/NaN|undefined/.test(svg));
  assert.ok(robotShapes(kind).length>=6);assert.ok(robotShapes(kind).every(s=>s.fill.startsWith('#')));
 }
});

test('robot roles escalate health and damage with heavy and scout tradeoffs',()=>{
 for(const type of Object.keys(ENEMIES) as EnemyId[]){assert.ok(robotStats(type).health>1);assert.ok(robotStats(type).damage>1);}
 assert.ok(robotStats('runner').speed>1);assert.ok(robotStats('brute').speed<1);
});
test('shield support only protects nearby active robot allies and never stacks',()=>{
 const target={x:0,y:0,type:'basic' as EnemyId,faction:'robot' as const};
 const guard={x:80,y:0,type:'armoured' as EnemyId,faction:'robot' as const,active:true};
 assert.equal(robotProtection(target,[guard]),.85);assert.equal(robotProtection(target,[guard,{...guard}]),.85);
 assert.equal(robotProtection(target,[{...guard,x:120}]),1);assert.equal(robotProtection(target,[{...guard,active:false}]),1);
 assert.equal(robotProtection({...target,faction:'zombie'},[guard]),1);assert.equal(robotProtection(guard,[guard]),1);
});
