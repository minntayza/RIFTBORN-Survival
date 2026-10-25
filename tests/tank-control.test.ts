import test from 'node:test';
import assert from 'node:assert/strict';
import {tankTouchAim,tankShieldCommitted} from '../src/tank-control';
import {SkillInputBuffer} from '../src/combat-polish';
test('shield heading holds through thumb jitter and takes the shortest path across the angle seam',()=>{assert.equal(tankTouchAim(1,.04,.03,.016),1);const a=tankTouchAim(Math.PI-.03,-1,-.03,.016);assert.ok(a>Math.PI-.03&&a<Math.PI+.031);let heading=0;for(let i=0;i<6;i++)heading=tankTouchAim(heading,0,1,1/60);assert.ok(Math.abs(heading-Math.PI/2)<.065);assert.equal(tankTouchAim(heading,0,0,.1),heading);assert.equal(tankTouchAim(0,0,1,0),0);});
test('shield commits its windup and contact but steering is free during recovery',()=>{assert.ok(tankShieldCommitted(.8,1));assert.ok(tankShieldCommitted(.46,1));assert.equal(tankShieldCommitted(.44,1),false);assert.equal(tankShieldCommitted(0,1),false);});
test('near-ready Tank skill taps fire once when ready and expire rather than firing late',()=>{const b=new SkillInputBuffer();let casts=0;b.request(0,1,0,1000);b.consume(1100,()=>false);b.consume(1160,()=>{casts++;return true;});b.consume(1170,()=>{casts++;return true;});assert.equal(casts,1);b.request(1,0,1,2000);b.consume(2200,()=>{casts++;return true;});assert.equal(casts,1);});
