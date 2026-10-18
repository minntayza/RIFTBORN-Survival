import test from 'node:test';
import assert from 'node:assert/strict';
import {ninjaArm,ninjaSwing,ninjaRecovery} from '../src/ninja-arm';
import {weaponPose} from '../src/weapon-effects';
test('Ninja attack starts and ends in the ready pose without snapping',()=>{
 const idle=weaponPose('katana',0,0,0,0,false,0,false,false,1,1,true);
 for(const t of [0,1]){const p=weaponPose('katana',0,0,0,t,true,0,false,false,1,1,true);assert.deepEqual(p,idle);}
 assert.equal(ninjaSwing(0),0);assert.equal(ninjaSwing(1),0);
});
test('Ninja bones keep their length and sword grip stays attached through the whole swing',()=>{
 for(const aim of [0,.8,1.6,2.4,3.14,-1.6])for(let i=0;i<=100;i++){
 const p=weaponPose('katana',0,0,aim,i/100,true,0,false,false,1,1,true),flip=Math.cos(aim)<0?-1:1;
 const rig=ninjaArm({x:8*flip,y:5},p.grip,flip);
 assert.ok(Math.abs(Math.hypot(rig.elbow.x-rig.shoulder.x,rig.elbow.y-rig.shoulder.y)-13)<1e-6);
 assert.ok(Math.abs(Math.hypot(rig.elbow.x-rig.hand.x,rig.elbow.y-rig.hand.y)-14)<1e-6);
 assert.ok(Math.hypot(rig.hand.x-p.grip.x,rig.hand.y-p.grip.y)<.01);
 }
});

test('cut holds its follow-through and retracts the wrist before returning',()=>{
 assert.ok(ninjaSwing(.2)<0);assert.equal(ninjaSwing(.6),1.05);assert.equal(ninjaSwing(.67),1.05);
 assert.ok(ninjaRecovery(.84)<.8);assert.equal(ninjaRecovery(0),1);assert.ok(Math.abs(ninjaRecovery(1)-1)<1e-6);
});
test('all Ninja weapons keep both hands attached and recover to ready on alternating attacks',()=>{
 for(const id of ['katana','dual','kama'] as const)for(const sequence of [0,1])for(const offhand of id==='dual'?[false,true]:[false])for(const aim of [0,.8,1.6,2.4,3.14,-1.6]){
 const flip=Math.cos(aim)<0?-1:1;
 const idle=weaponPose(id,0,0,aim,0,false,sequence,offhand,false,1,1,true);
 for(const t of [0,1])assert.deepEqual(weaponPose(id,0,0,aim,t,true,sequence,offhand,false,1,1,true),idle);
 for(let i=0;i<=100;i++){
  const p=weaponPose(id,0,0,aim,i/100,true,sequence,offhand,false,1,1,true);
  const rig=ninjaArm({x:(offhand?-9:8)*flip,y:5},p.grip,offhand?-flip:flip);
  assert.ok(Math.hypot(rig.hand.x-p.grip.x,rig.hand.y-p.grip.y)<.01,`${id} hand disconnected at ${i}`);
 }
 }
});

import {ninjaAttackRig,ninjaJointSprite} from '../src/ninja-rig';
test('Ninja painted wrist connects to forearm and grip through all attack poses',()=>{
 for(const id of ['katana','dual','kama'] as const)for(const aim of [0,.8,1.6,2.4,Math.PI,-1.6])for(const offhand of id==='dual'?[false,true]:[false])for(let i=0;i<=100;i++){
 const p=weaponPose(id,0,0,aim,i/100,true,0,offhand,false,1,1,true),f=Math.cos(aim)<0?-1:1,rig=ninjaAttackRig({x:(offhand?-9:8)*f,y:5},p.grip,p.rotation,f,offhand);
 assert.ok(Math.abs(Math.hypot(rig.wrist.x-rig.elbow.x,rig.wrist.y-rig.elbow.y)-Math.hypot(.35,.23)*(offhand?18:21))<1e-6);
 assert.ok(Math.abs(Math.hypot(rig.grip.x-rig.wrist.x,rig.grip.y-rig.wrist.y)-.17*(offhand?18:21))<1e-6);
 assert.ok(Math.hypot(rig.grip.x-p.grip.x,rig.grip.y-p.grip.y)<1e-6);
 const hand=ninjaJointSprite('hand',rig.wrist,rig.grip);assert.ok(hand.width>0&&Number.isFinite(hand.rotation));
 }
});
test('Ninja arm images map painted joint endpoints exactly, rather than generic centers',()=>{
 for(const [part,a,b,sourceA,sourceB,sourceWidth,sourceHeight] of [
 ['upper',{x:8,y:5},{x:4,y:17},{x:150,y:40},{x:166,y:302},252,345],
 ['forearm',{x:4,y:17},{x:18,y:16},{x:101,y:36},{x:103,y:318},202,357],
 ['hand',{x:18,y:16},{x:22,y:16},{x:63,y:270},{x:191,y:134},305,325]
 ] as const){const p=ninjaJointSprite(part,a,b),project=(q:{x:number;y:number})=>{const x=(q.x/sourceWidth-p.originX)*p.width,y=(q.y/sourceHeight-p.originY)*p.height;return {x:p.x+Math.cos(p.rotation)*x-Math.sin(p.rotation)*y,y:p.y+Math.sin(p.rotation)*x+Math.cos(p.rotation)*y};};for(const [actual,expected] of [[project(sourceA),a],[project(sourceB),b]])assert.ok(Math.hypot(actual.x-expected.x,actual.y-expected.y)<1e-6);}
});

test('General-style Ninja elbows follow fixed shoulder rotations, with no inverse folding',()=>{const shoulder={x:8,y:5};for(let a=-Math.PI;a<=Math.PI;a+=.1){const rig=ninjaAttackRig(shoulder,{x:999,y:999},a);assert.ok(Math.abs(Math.hypot(rig.elbow.x-8,rig.elbow.y-5)-Math.hypot(.48,.23)*21)<1e-6);}const a=ninjaAttackRig(shoulder,{x:1,y:1},0),b=ninjaAttackRig(shoulder,{x:900,y:900},0);assert.deepEqual(a,b);});
