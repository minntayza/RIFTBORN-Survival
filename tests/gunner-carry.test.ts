import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gunnerWeaponPose,gunnerSupportHand} from '../src/gunner-motion';
test('long-gun support hand follows the foregrip through aiming and recoil',()=>{
 for(const id of ['smg','shotgun'] as const)for(const aim of [0,Math.PI,Math.PI/2,-Math.PI/2])for(const phase of [0,.15,.5,1]){
  const pose=gunnerWeaponPose(id,100,100,aim,phase,phase>0&&phase<1),hand=gunnerSupportHand(pose);
  assert.ok(Math.hypot(hand.x-pose.fore.x,hand.y-pose.fore.y)<1e-8);
  assert.ok(Number.isFinite(pose.tip.x)&&Number.isFinite(pose.tip.y));
  assert.ok(Math.hypot(pose.grip.x-100,pose.grip.y-100)<65);
 }
});
