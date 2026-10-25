import test from 'node:test';
import assert from 'node:assert/strict';
import {Cataclysm} from '../src/cataclysm';
test('Cataclysm snapshots hit positions and ripples smaller blasts once',()=>{
 const chain=new Cataclysm(),enemy={x:10,y:20};chain.trigger([enemy,{x:50,y:60}],100);enemy.x=999;
 assert.deepEqual(chain.tick(.1),[]);
 const first=chain.tick(.03);assert.equal(first.length,1);assert.equal(first[0].x,10);assert.equal(first[0].damage,30);assert.equal(first[0].radius,60);
 assert.equal(chain.tick(.1).length,1);assert.deepEqual(chain.tick(10),[]);
});
test('crowds and multiple explosive pellets have bounded secondary blasts',()=>{
 const chain=new Cataclysm(),crowd=Array.from({length:100},(_,x)=>({x,y:0}));
 chain.trigger(crowd,100);assert.equal(chain.pending.length,6);
 for(let i=0;i<10;i++)chain.trigger(crowd,100);
 assert.equal(chain.pending.length,12);chain.clear();assert.deepEqual(chain.tick(1),[]);
});
