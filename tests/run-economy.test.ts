import test from 'node:test';
import assert from 'node:assert/strict';
import {waveGoldBudget,cappedWaveGold} from '../src/run-economy';
import {wavePetals} from '../src/retention';
test('full clears meet the intended mode totals',()=>{
 assert.equal(Array.from({length:15},(_,i)=>waveGoldBudget('endless',i+1)!).reduce((a,b)=>a+b,0),1600);
 assert.equal(Array.from({length:10},(_,i)=>waveGoldBudget('daily',i+1)!).reduce((a,b)=>a+b,0),900);
 assert.equal(Array.from({length:10},(_,i)=>wavePetals('daily',i+1)).reduce<number>((a,b)=>a+b,0),250);
});
test('pickups, bounties and bonuses share a budget and cannot farm past it',()=>{
 for(const mode of ['endless','daily'] as const){
  let paid=0;const budget=waveGoldBudget(mode,5)!;
  for(const amount of [3,9,120,500,900])paid+=cappedWaveGold(mode,5,paid,amount);
  assert.equal(paid,budget);assert.equal(cappedWaveGold(mode,5,paid,100),0);
  assert.equal(cappedWaveGold(mode,5,budget+100,20),0);
 }
});
test('partial runs retain partial earnings; other modes keep their existing payouts',()=>{
 assert.equal(cappedWaveGold('endless',1,0,3),3);
 assert.equal(cappedWaveGold('daily',1,10,5),5);
 assert.equal(waveGoldBudget('short',1),undefined);
 assert.equal(cappedWaveGold('short',1,900,500),500);
});
