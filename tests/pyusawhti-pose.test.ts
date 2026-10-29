import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pyusawhtiPose,pyusawhtiArrowOrigin,archerShotGeometry} from '../src/pyusawhti-rig';
test('hips stay beneath the skirt through the walking cycle',()=>{
 for(let time=0;time<3;time+=.1){const pose=pyusawhtiPose(time,true);const legs=pose.filter(p=>p.part.startsWith('leg'));assert.equal(legs.length,2);for(const leg of legs){assert.ok(leg.y<=13);assert.equal(Math.abs(leg.x),8);assert.ok(Math.abs(leg.angle)<=.14);}}
});
test('bow shaft and projectile point along every aim direction',()=>{
 for(let aim=-Math.PI;aim<=Math.PI;aim+=.03){
  const shot=archerShotGeometry(aim),sign=shot.flip?-1:1;
  const dx=(shot.arrowTip.x-shot.nock.x)*sign,dy=shot.arrowTip.y-shot.nock.y;
  assert.ok(Math.abs(dx*Math.sin(aim)-dy*Math.cos(aim))<1e-8);
  assert.ok(dx*Math.cos(aim)+dy*Math.sin(aim)>0);
  const origin=pyusawhtiArrowOrigin(100,200,aim);
  assert.ok(Math.abs(origin.x-100-shot.arrowTip.x*.75*sign)<1e-8);
  assert.ok(Math.abs(origin.y-200-shot.arrowTip.y*.75)<1e-8);
  for(const p of pyusawhtiPose(1,true,.5,aim))for(const value of [p.x,p.y,p.w,p.h,p.angle])assert.ok(Number.isFinite(value));
 }
});

test('bow arm and free arm have opposite shoulder assignments with correct mirrored origins',()=>{
 const pose=pyusawhtiPose();const bow=pose.find(p=>p.part==='nearArm')!,free=pose.find(p=>p.part==='farArm')!;
 assert.ok(bow.x<0);assert.ok(free.x>0);assert.equal(bow.mirror,true);assert.equal(free.mirror,true);
});

test('shooting uses connected full-draw stance while preserving centered hip anchors',()=>{
 const idle=pyusawhtiPose(),shot=pyusawhtiPose(0,false,1);
 assert.deepEqual(shot.slice(0,2),idle.slice(0,2));
 assert.equal(shot.length,5);assert.equal(shot[2].part,'body');assert.equal(shot[2].angle,0);assert.equal(shot[4].part,'bowArm');
 assert.ok(!shot.some(p=>p.part==='nearArm'||p.part==='farArm'));
});
