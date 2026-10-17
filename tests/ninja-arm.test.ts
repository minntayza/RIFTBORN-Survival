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
