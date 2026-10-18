import test from 'node:test';
import assert from 'node:assert/strict';
import {tankBodyPose,tankPortrait} from '../src/tank-art';
import {weaponPose,meleeContact} from '../src/weapon-effects';
import {ninjaArm} from '../src/ninja-arm';
test('Tank keeps head and shoulders fixed while legs walk',()=>{for(let t=0;t<1;t+=.05)assert.deepEqual(tankBodyPose(t).body,tankBodyPose(0).body);assert.notEqual(tankBodyPose(.25).legs[0].angle,0);assert.match(tankPortrait(),/cute-tank-parts-v1/);});
test('Tank hands reach all shield and hammer attack grips with fixed shoulders',()=>{for(const id of ['shield','spiked','hammer'] as const)for(let a=-Math.PI;a<Math.PI;a+=.2)for(let t=0;t<=1;t+=.05){const p=weaponPose(id,0,0,a,t,true,0,false,false,1,1,'tank'),flip=Math.cos(a)<0?-1:1;const arm=ninjaArm({x:8*flip,y:5},p.grip,flip);assert.ok(Math.hypot(arm.hand.x-p.grip.x,arm.hand.y-p.grip.y)<.01);}});
test('Bash winds back then extends and collision follows visible shield',()=>{const pose=(t:number)=>weaponPose('shield',0,0,0,t,true,0,false,false,1,1,'tank');assert.ok(pose(.2).grip.x<pose(0).grip.x);assert.ok(pose(.5).grip.x>pose(0).grip.x);assert.ok(meleeContact('shield',0,0,0,pose(.5).tip,3,0,1,1,'tank'));assert.equal(meleeContact('shield',0,0,0,{x:500,y:0},3,0,1,1,'tank'),false);});

import {tankWeaponMetrics,tankWeaponPortrait} from '../src/tank-weapons';
import {samuraiSupportHand} from '../src/samurai-motion';
import {artImage,weaponShopImage} from '../src/art';
test('Tank weapon cards and icons share combat artwork',()=>{for(const id of ['shield','spiked','hammer'] as const){assert.match(tankWeaponPortrait(id),/tank-weapons-v1/);assert.match(artImage('weapon',id),/tank-weapons-v1/);assert.match(weaponShopImage(id),/tank-weapons-v1/);}});
test('Hammer support hand holds the handle through every swing and aim',()=>{for(let a=-Math.PI;a<Math.PI;a+=.2)for(let t=0;t<=1;t+=.05){const p=weaponPose('hammer',0,0,a,t,true,0,false,false,1,1,'tank'),hand=samuraiSupportHand(p.grip,p.rotation),flip=Math.cos(a)<0?-1:1,rig=ninjaArm({x:-9*flip,y:5},hand,-flip);assert.ok(Math.hypot(rig.hand.x-hand.x,rig.hand.y-hand.y)<.01);}});
test('Tank contact points match weapon artwork and shields mirror upright',()=>{for(const id of ['shield','spiked','hammer'] as const){const p=weaponPose(id,0,0,0,0,false,0,false,false,1,1,'tank'),m=tankWeaponMetrics(id);assert.ok(Math.abs(p.tip.x-p.grip.x-(Math.cos(p.rotation)*m.tip.x-Math.sin(p.rotation)*m.tip.y)*p.size/128)<.001);}for(const id of ['shield','spiked'] as const){const l=weaponPose(id,0,0,Math.PI,0,false,0,false,false,1,1,'tank'),r=weaponPose(id,0,0,0,0,false,0,false,false,1,1,'tank');assert.equal(l.flipY,true);assert.ok(Math.abs(l.tip.y-r.tip.y)<.001);}});

import {tankRestArms} from '../src/tank-art';
test('Tank shop elbows bend down from both shoulders',()=>{for(const rig of tankRestArms()){assert.ok(rig.elbow.y>rig.shoulder.y);assert.ok(rig.wrist.y>rig.elbow.y);assert.ok(rig.grip.y>rig.wrist.y);}});
