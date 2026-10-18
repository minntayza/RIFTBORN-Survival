import test from 'node:test';
import assert from 'node:assert/strict';
import {extraLoadedRounds,gunnerRoundStyle,reloadFraction,GunnerSkillEffects} from '../src/gunner-skill-fx';
test('Deep Pockets slots follow real bonus capacity and loaded ammunition',()=>{
 for(const base of [6,12,28])for(const rank of [0,1,2,3,4]){
  const max=base+rank*4;assert.deepEqual(extraLoadedRounds(max,max,rank),{slots:rank*4,loaded:rank*4});
  assert.equal(extraLoadedRounds(base,max,rank).loaded,0);assert.equal(extraLoadedRounds(0,max,rank).loaded,0);
  if(rank)assert.equal(extraLoadedRounds(max-1,max,rank).loaded,rank*4-1);
 }
});
test('bullets distinguish real pierce, bounce and explosive states without enlarging contact cores',()=>{
 const normal=gunnerRoundStyle('pistols',{explosive:false}),pierce=gunnerRoundStyle('pistols',{explosive:false,piercingRound:true}),bounce=gunnerRoundStyle('pistols',{explosive:false,bounces:1}),explosive=gunnerRoundStyle('pistols',{explosive:true,piercingRound:true,bounces:1});
 assert.equal(new Set([normal.color,pierce.color,bounce.color,explosive.color]).size,4);
 for(const weapon of ['pistols','smg','shotgun'] as const)assert.ok(gunnerRoundStyle(weapon,{explosive:true}).core<=6);
 assert.ok(gunnerRoundStyle('shotgun',{explosive:false}).tail<normal.tail);
});
test('reload animation progress follows shortened reload durations without overshooting',()=>{
 for(const duration of [1.2,.96,.72,.48]){assert.equal(reloadFraction(duration,duration),0);assert.equal(reloadFraction(duration/2,duration),.5);assert.equal(reloadFraction(0,duration),1);}
 assert.equal(reloadFraction(-1,0),1);assert.equal(reloadFraction(5,1),0);
});
test('Gunner effects stay finite and bounded under shotgun chains, then expire',()=>{
 let calls=0;const graphics=new Proxy({}, {get:()=> (...args:unknown[])=>{calls++;for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg));return graphics;}});
 const fx=new GunnerSkillEffects({add:{graphics:()=>graphics}} as never);
 for(let i=0;i<200;i++){fx.verdict(i*30,0,120,0);fx.bounce(10,20,0,Math.PI/2,0);fx.pierce(10,20,0,0);fx.muzzle(10,20,0,0);fx.refill(10,20,0);}
 const state={x:0,y:0,angle:0,time:.08,weapon:'pistols' as const,ammo:24,maxAmmo:28,magazine:4,quickHands:3,reload:.4,reloadDuration:.48,overdrive:0};
 for(const reduced of [false,true]){calls=0;fx.render(state,reduced);assert.ok(calls<5000);fx.round({x:0,y:0,vx:650,vy:0,explosive:true,piercingRound:true,bounces:2},'pistols',.1,reduced);}
 calls=0;fx.render({...state,time:4,magazine:0,reload:0});assert.equal(calls,1);
});
