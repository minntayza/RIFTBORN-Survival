import test from 'node:test';
import assert from 'node:assert/strict';
import {wavePetals} from '../src/retention';
test('Endless grants no Petals including milestone waves',()=>{
 for(let wave=1;wave<=100;wave++)assert.equal(wavePetals('endless',wave),0);
});
test('Daily retains its 250 Petal total, including wave five and ten bonuses',()=>{
 assert.equal(wavePetals('daily',5),40);assert.equal(wavePetals('daily',10),50);
 assert.equal(Array.from({length:10},(_,i)=>wavePetals('daily',i+1)).reduce<number>((a,b)=>a+b,0),250);
});
