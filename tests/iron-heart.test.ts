import test from 'node:test';
import assert from 'node:assert/strict';
import {IronHeart} from '../src/iron-heart';
import {AreaGate} from '../src/area-gate';
test('Iron Heart protects for exactly two seconds without refreshing on repeated hits',()=>{
 const armour=new IronHeart();armour.activate();
 assert.equal(armour.absorb(40),10);armour.tick(1.9);
 assert.equal(armour.absorb(40),10);assert.ok(armour.remaining<.11);
 armour.tick(.1);assert.equal(armour.absorb(40),40);
 armour.tick(10);assert.equal(armour.absorb(40),10);assert.equal(armour.remaining,2);
});
test('zero damage does not consume the armour trigger and large steps expire safely',()=>{
 const armour=new IronHeart();assert.equal(armour.absorb(0),0);assert.equal(armour.cooldown,0);
 armour.activate();armour.tick(60);assert.equal(armour.remaining,0);assert.equal(armour.cooldown,0);
});
test('gate requires entering its footprint',()=>{
 const gate=new AreaGate(100,200);assert.equal(gate.entered(100,200),true);
 assert.equal(gate.entered(134,200),true);assert.equal(gate.entered(135,200),false);
});
