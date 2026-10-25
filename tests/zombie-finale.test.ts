import test from 'node:test';
import assert from 'node:assert/strict';
import {wavePlan,zombieFinaleCleared} from '../src/waves';
import {spawnFaction} from '../src/robot-enemies';
import {seededRandom} from '../src/retention';

test('Endless wave 10 requires the General and Commander, including pending spawns',()=>{
 const plan=wavePlan(10,()=>.5);
 assert.equal(plan.filter(p=>p.type==='boss').reduce((n,p)=>n+p.count,0),1);
 assert.equal(plan.filter(p=>p.type==='commander').reduce((n,p)=>n+p.count,0),1);
 assert.equal(zombieFinaleCleared(true,plan,[]),false);
 const spent=plan.map(p=>({...p,count:0}));
 assert.equal(zombieFinaleCleared(false,spent,[]),false);
 for(const type of ['boss','commander','shooterBoss'] as const)
  assert.equal(zombieFinaleCleared(true,spent,[{type,active:true}]),false);
 assert.equal(zombieFinaleCleared(true,spent,[{type:'commander',active:false},{type:'basic',active:true}]),true);
});

test('post-ten supporting crowds are reduced and every later leader is a robot',()=>{
 for(const wave of [11,12,13,15,20,30]){
  const plan=wavePlan(wave,seededRandom(71));
  const supporting=plan.filter(p=>p.count>1).reduce((n,p)=>n+p.count,0);
  assert.ok(supporting<=48,`${wave}: bounded supporting packs`);
  const oldMinimum=80+(wave-8)*16;
  assert.ok(supporting<oldMinimum/2);
  for(const pack of plan.filter(p=>['boss','commander','shooterBoss'].includes(p.type)))
   for(let serial=0;serial<8;serial++)assert.equal(spawnFaction(wave,serial,pack.type),'robot');
 }
});
