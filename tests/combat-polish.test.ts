import test from 'node:test';
import assert from 'node:assert/strict';
import {SkillInputBuffer,effectBudget} from '../src/combat-polish';
test('brief lockouts buffer one skill press and preserve its direction',()=>{const b=new SkillInputBuffer(),casts:unknown[]=[];b.request(1,-.6,.8,100);b.consume(120,()=>false);b.consume(180,(...args)=>{casts.push(args);return true;});b.consume(190,()=>{throw Error('Duplicate cast');});assert.deepEqual(casts,[[1,-.6,.8]]);});
test('old inputs expire and clearing prevents casts after pause',()=>{const b=new SkillInputBuffer();b.request(0,1,0,0);b.consume(181,()=>{throw Error('Expired press cast');});b.request(0,0,1,200);b.clear();b.consume(201,()=>{throw Error('Cleared press cast');});});
test('wide views, crowds and reduced motion limit decoration without hiding all feedback',()=>{assert.equal(effectBudget(false,false,0).particles,7);assert.equal(effectBudget(true,false,0).particles,3);assert.equal(effectBudget(false,false,40).particles,3);assert.equal(effectBudget(true,true,100).particles,1);assert.equal(effectBudget(true,true,100).ghosts,0);});
