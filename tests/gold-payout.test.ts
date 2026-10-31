import test from 'node:test';
import assert from 'node:assert/strict';
import {GoldPayout} from '../src/gold-payout';
test('wave gold retains 30% of former payouts',()=>{const p=new GoldPayout();assert.equal(p.grant(100),30);assert.equal(p.grant(500),150);assert.equal(p.grant(1000),300);});
test('small drops retain their fractional gold across a wave instead of rounding each drop',()=>{const p=new GoldPayout();let paid=0;for(let i=0;i<5;i++)paid+=p.grant(8);assert.equal(paid,12);assert.equal(p.grant(3),0);assert.equal(p.grant(1),1);});
test('a wave and its fast-clear bonus are scaled once',()=>{const p=new GoldPayout();const coins=40,clear=100,bonus=Math.round((coins+clear)*.15);assert.equal(p.grant(coins)+p.grant(clear)+p.grant(bonus),Math.floor((coins+clear+bonus)*3/10));});

test('enemy drops and healing gold pay half of the normal payout',()=>{
 for(const base of [100,500,1000]){const p=new GoldPayout();assert.equal(p.grant(base,.5),base*.15);}
});
test('halved odd-value drops retain fractions rather than rounding away gold',()=>{
 const p=new GoldPayout();let total=0;for(let i=0;i<20;i++)total+=p.grant(1,.5);assert.equal(total,3);
});
test('mixed sources keep standard rewards unchanged and scale quick-clear accounting once',()=>{
 const p=new GoldPayout();const reducedCoins=40*.5,unchangedClear=100,bonus=Math.round((reducedCoins+unchangedClear)*.15);
 assert.equal(p.grant(40,.5)+p.grant(unchangedClear)+p.grant(bonus),Math.floor((reducedCoins+unchangedClear+bonus)*.3));
 assert.equal(new GoldPayout().grant(100),30);
});
