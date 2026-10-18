import {weaponPose} from '../src/weapon-effects';
import test from 'node:test';
import assert from 'node:assert/strict';
import {samuraiReachPath,stormCrescent,samuraiStormLaunch,SamuraiSkillEffects} from '../src/samurai-skill-fx';

test('Long Reach grows the actual swing envelope and mirrors cleanly on all Samurai weapons',()=>{
 for(const weapon of ['nodachi','cursed','naginata'] as const){
  let previous=0;
  for(const rank of [0,1,2,3,4]){
   const right=samuraiReachPath(weapon,0,0,0,2,1+rank*.25,1),left=samuraiReachPath(weapon,0,0,Math.PI,2,1+rank*.25,1);
   const extent=Math.max(...right.map(p=>Math.hypot(p.x,p.y)));
   assert.ok(extent>previous);previous=extent;
   for(let i=0;i<right.length;i++){assert.ok(Math.abs(right[i].x+left[i].x)<1e-8);assert.ok(Math.abs(right[i].y-left[i].y)<1e-8);}
  }
 }
});
test('Storm Blade primary silhouette stays inside its real projectile radius',()=>{
 for(const aim of [0,Math.PI/2,Math.PI,-2.2])for(const p of stormCrescent(250,370,aim))assert.ok(Math.hypot(p.x-250,p.y-370)<=30);
});
test('all skill effects remain finite, bounded and expire, including reduced motion',()=>{
 let calls=0;const graphics=new Proxy({}, {get:()=> (...args:unknown[])=>{calls++;for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg));return graphics;}});
 const fx=new SamuraiSkillEffects({add:{graphics:()=>graphics}} as never);
 for(let i=0;i<60;i++){fx.dragon(10,20,0,295,3,0);fx.counter(10,20,210,2,0);fx.oath(10,20,0,3);fx.windHit(10,20,0);fx.reach('nodachi',10,20,0,2,1.75,1,0);}
 const enemies=Array.from({length:200},(_,i)=>({x:i,y:0,r:15,bleed:3,active:true}));
 for(const reduced of [false,true]){calls=0;fx.render(10,20,.1,.7,1.2,{range:3,bleed:3,counter:2},{bleed:true,counter:true},enemies,reduced);assert.ok(calls<5000);}
 calls=0;fx.render(10,20,4,0,1.2,{range:3,bleed:0,counter:2},{bleed:false,counter:false},[],false);assert.equal(calls,1,'Only clearing remains after effects expire');
});

test('Storm Blade launches forward on the aim line in every direction',()=>{
 for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2,.7,-2.3]){
  const p=samuraiStormLaunch(150,240,angle),dx=p.x-150,dy=p.y-240;
  assert.ok(Math.abs(dx*Math.sin(angle)-dy*Math.cos(angle))<1e-8,'No sideways offset from sword recovery');
  assert.ok(dx*Math.cos(angle)+dy*Math.sin(angle)>0,'Always in front of Samurai');
  assert.ok(Math.abs(Math.hypot(dx,dy)-28)<1e-8);
 }
});

test('Long Reach lengthens Samurai weapons without increasing thickness or moving the grip',()=>{
 for(const id of ['nodachi','cursed','naginata'] as const)for(const aim of [0,Math.PI,.8])for(const phase of [0,.3,.55,.9]){
  const base=weaponPose(id,0,0,aim,phase,true,0,false,false,1,1,'samurai');
  for(const reach of [1.25,1.5,1.75,2]){
   const p=weaponPose(id,0,0,aim,phase,true,0,false,false,reach,1,'samurai');
   assert.equal(p.thickness,base.thickness);assert.equal(p.size,base.size*reach);assert.deepEqual(p.grip,base.grip);
   const lateral=(q:typeof p)=>-(q.tip.x-q.grip.x)*Math.sin(q.rotation)+(q.tip.y-q.grip.y)*Math.cos(q.rotation);
   assert.ok(Math.abs(lateral(p)-lateral(base))<1e-8);
  }
 }
});
