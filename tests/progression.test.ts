import test from 'node:test';
import assert from 'node:assert/strict';
import {rollReward,waveEvent,evolutionOptions} from '../src/progression';
import {wavePlan} from '../src/waves';
test('roulette chooses exactly one reward and excludes useless healing',()=>{
 assert.equal(rollReward(50,100,()=>0),'heal');
 assert.equal(rollReward(100,100,()=>0),'damage');
 assert.equal(rollReward(100,100,()=>.999),'speed');
});
test('later waves rotate events with a boss every five waves',()=>{
 assert.equal(waveEvent(10),'Survival');
 assert.deepEqual([11,12,13,14,15].map(waveEvent),['Supply rush','Zombie dog pack','Elite hunt','Hold the zone','Boss encounter']);
 for(const w of [15,20,25,30])assert.ok(wavePlan(w).some(s=>s.type==='boss'));
});
test('evolution options match ranged and melee weapons',()=>{
 assert.match(evolutionOptions('gunner')[0].description,/pierce/);
 assert.match(evolutionOptions('ninja')[0].description,/crescent waves/);
 assert.equal(new Set(evolutionOptions('tank').map(e=>e.id)).size,3);
});

test('removed armed enemies remain late while riflemen enter at seven',()=>{
 const armed=['cleaver','spear'];for(let wave=1;wave<=10;wave++)assert.ok(wavePlan(wave).every(s=>!armed.includes(s.type)));assert.ok(wavePlan(11).some(s=>s.type==='cleaver'));assert.ok(wavePlan(11).every(s=>s.type!=='spear'&&s.type!=='rifle'));assert.ok(wavePlan(12).some(s=>s.type==='spear'));assert.ok(wavePlan(13).some(s=>s.type==='rifle'));
});

test('wave eight onward has larger distributed hordes without extra bosses',()=>{const count=(w:number)=>wavePlan(w,()=>.5).reduce((n,s)=>n+s.count,0);assert.equal(count(7),68);assert.equal(count(8),80);assert.equal(count(9),90);assert.equal(count(10),100);for(const wave of [8,9,10,11,15]){const plan=wavePlan(wave,()=>.5);assert.ok(plan.every(s=>s.time>=0&&s.time<40));assert.ok(plan.filter(s=>s.type==='basic').some(s=>s.time>30));assert.equal(plan.filter(s=>s.type==='boss').length,wave%5===0?1:0);}});
