import test from 'node:test';
import assert from 'node:assert/strict';
import {cachedCanvas} from '../src/texture-cache';
test('run restarts reuse generated artwork and old cache entries are bounded',()=>{
 let made=0;
 const make=()=>{made++;return {width:128,height:128} as HTMLCanvasElement;};
 const first=cachedCanvas('cache-test-first',make);assert.equal(cachedCanvas('cache-test-first',make),first);assert.equal(made,1);
 for(let i=0;i<513;i++)cachedCanvas(`cache-test-${i}`,make);
 assert.notEqual(cachedCanvas('cache-test-first',make),first);
});
