import test from 'node:test';
import assert from 'node:assert/strict';
import {TankSkillEffects,tankStaminaMeter,tankGuardHalfAngle} from '../src/tank-skill-fx';
test('Iron Lungs meter normalizes each real upgraded capacity',()=>{
 for(const rank of [0,1,2,3,4]){const capacity=100*(1+rank*.4);assert.equal(tankStaminaMeter(capacity,rank).fill,1);assert.equal(tankStaminaMeter(capacity/2,rank).fill,.5);assert.equal(tankStaminaMeter(-1,rank).fill,0);assert.equal(tankStaminaMeter(capacity*2,rank).fill,1);}
});
test('Wide Guard includes an off-centre hit only after the actual angle upgrade',()=>{
 assert.ok(1.2>tankGuardHalfAngle(0));assert.ok(1.2<tankGuardHalfAngle(1));
 let previous=0;for(const rank of [0,1,2,3,4]){const half=tankGuardHalfAngle(rank);assert.ok(half>previous&&half<Math.PI);previous=half;}
});
test('Tank effects stay bounded, finite and expire for each weapon and reduced motion',()=>{
 let calls=0;const graphics=new Proxy({}, {get:()=> (...args:unknown[])=>{calls++;for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg));return graphics;}});
 const fx=new TankSkillEffects({add:{graphics:()=>graphics}} as never);
 for(let i=0;i<100;i++){fx.bash(20,30,0,4,false,0);fx.bash(20,30,0,0,true,0);fx.slam(0,0,155,2,0);fx.slam(0,0,100,4,0,'crown');fx.block(30,0,0,0);fx.reflect(20,0,0,0);}
 const state={x:0,y:0,angle:0,time:.1,weapon:'shield' as const,swing:.1,sequence:2,stamina:200,lungs:4,guard:4,thorns:4,reflect:true};
 for(const weapon of ['shield','spiked','hammer'] as const)for(const reduced of [false,true]){calls=0;fx.render({...state,weapon},reduced);fx.reflectedRound({x:20,y:0,vx:360,vy:0},reduced);assert.ok(calls<5000);}
 calls=0;fx.render({...state,time:4,lungs:0,guard:0,thorns:0,stamina:0,reflect:false});assert.equal(calls,1);
});
