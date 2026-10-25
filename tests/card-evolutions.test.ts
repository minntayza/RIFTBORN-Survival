import test from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES,upgradeChoices} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {wavePlan} from '../src/waves';
import {seededRandom} from '../src/retention';
test('Royal Dat Lone and Azure Lotus have named evolutions at three ranks',()=>{for(const id of ['twindatlone','lotusflame','celestial']){assert.equal(UPGRADES.find(u=>u.id===id)!.max,3);assert.ok(CARD_EVOLUTIONS[id]?.effect);}});
test('maxed cards evolve on the next level-up at any wave',()=>{
 const levels={damage:5};for(const wave of [1,2,5,10,11]){assert.ok(upgradeChoices('ninja',levels,()=>0,'katana',wave,{}).some(u=>u.evolves==='damage'));assert.ok(upgradeChoices('ninja',{damage:4},()=>0,'katana',wave,{}).every(u=>!u.evolves));}
 const options=upgradeChoices('ninja',levels,()=>0,'katana',11,{});assert.ok(options.some(u=>u.evolves==='damage'));assert.ok(options.some(u=>!u.evolves));assert.ok(upgradeChoices('ninja',levels,()=>0,'katana',50,{damage:true}).every(u=>u.evolves!=='damage'));
});
test('mini bosses spawn after wave 10 and alternate before major bosses',()=>{
 for(let w=1;w<=8;w++)assert.ok(wavePlan(w).every(s=>!['shooterBoss','commander'].includes(s.type)));
 assert.ok(wavePlan(11,seededRandom(1)).some(s=>s.type==='shooterBoss'));assert.ok(wavePlan(13,seededRandom(1)).some(s=>s.type==='commander'));assert.ok(wavePlan(15).some(s=>s.type==='boss'));
});
