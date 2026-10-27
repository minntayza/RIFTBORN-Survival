import test from 'node:test';
import assert from 'node:assert/strict';
import {fighterPose,fighterJoint,FighterMotion,FIGHTER_REGIONS,FIGHTER_PARTS} from '../src/lethwei-rig';
test('fighter has nine unique connected parts and valid atlas crops',()=>{
 const pose=fighterPose();assert.equal(pose.length,9);assert.equal(new Set(pose.map(p=>p.part)).size,9);
 assert.equal(FIGHTER_PARTS.length,9);
 for(const [part,[x,y,w,h]] of Object.entries(FIGHTER_REGIONS)){const width=part.endsWith('Leg')?1536:1254,height=part.endsWith('Leg')?1024:1254;assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=width&&y+h<=height);}
});
test('two bone joint preserves upper and lower lengths for reachable hands and feet',()=>{
 for(const bend of [-1,1])for(const target of [{x:20,y:20},{x:0,y:40},{x:-20,y:20}]){
  const elbow=fighterJoint({x:0,y:0},target,23,24,bend);
  assert.ok(Math.abs(Math.hypot(elbow.x,elbow.y)-23)<1e-8);
  assert.ok(Math.abs(Math.hypot(target.x-elbow.x,target.y-elbow.y)-24)<1e-8);
 }
});
test('continuous legs rotate only at the hip with no separate knee or foot parts',()=>{
 const idle=fighterPose();
 for(let i=0;i<80;i++){
  const pose=fighterPose(i/30,true,.1,i%2);
  for(const side of ['left','right']){const leg=pose.find(p=>p.part===`${side}Leg`)!;const base=idle.find(p=>p.part===leg.part)!;assert.deepEqual([leg.x,leg.w,leg.h,leg.ox,leg.oy],[base.x,base.w,base.h,base.ox,base.oy]);}
  for(const p of pose)for(const value of [p.x,p.y,p.w,p.h,p.r])assert.ok(Number.isFinite(value));
 }
 assert.ok(fighterPose(.1,true)[0].r*fighterPose(.1,true)[1].r<0);
});
test('punch extends one fist while the other guards and ends at rest',()=>{
 const guard=fighterPose(0,false),near=fighterPose(0,false,.1,0),far=fighterPose(0,false,.1,1);
 assert.ok(near.find(p=>p.part==='leftHand')!.x>guard.find(p=>p.part==='leftHand')!.x+20);
 assert.equal(near.find(p=>p.part==='rightHand')!.x,guard.find(p=>p.part==='rightHand')!.x);
 assert.ok(far.find(p=>p.part==='rightHand')!.x>guard.find(p=>p.part==='rightHand')!.x+20);
 assert.deepEqual(fighterPose(0,false,.2),guard);
});
test('walking eases in and out, and gait follows distance rather than render frequency',()=>{
 const a=new FighterMotion(),b=new FighterMotion();a.sample(0,0,0);b.sample(0,0,0);
 for(let i=1;i<=20;i++)a.sample(i*2,0,i*.02);
 for(let i=1;i<=10;i++)b.sample(i*4,0,i*.04);
 assert.ok(Math.abs(a.phase-b.phase)<1e-8);assert.ok(a.stride>0&&a.stride<1);
 const old=a.stride;for(let i=1;i<=40;i++)a.sample(40,0,.4+i*.02);
 assert.ok(a.stride<old*.01);
});

test('guard fists face upward while legs remain single continuous pieces',()=>{
 const pose=fighterPose(0,false);
 for(const side of ['left','right'] as const){const hand=pose.find(p=>p.part===`${side}Hand`)!;assert.ok(hand.r<-1.5);assert.ok(hand.y<0);}
 assert.equal(pose.filter(p=>p.part.endsWith('Leg')).length,2);
});

test('thigh pivots sit inside the shorts with enough overlap for the full swing',()=>{
 for(const leg of fighterPose().filter(p=>p.part.endsWith('Leg'))){
  assert.equal(Math.abs(leg.x),11);assert.equal(leg.y,14);assert.equal(leg.h,65);
  assert.ok(leg.y-leg.oy*leg.h<10);
 }
});

test('resting fists sit in a compact cheek-height guard and keep stable wrist pivots',()=>{
 const pose=fighterPose();const near=pose.find(p=>p.part==='leftHand')!,far=pose.find(p=>p.part==='rightHand')!;
 assert.deepEqual([near.x,near.y,far.x,far.y],[-11,-9,30,-11]);
 assert.equal(near.oy,.24);assert.equal(far.oy,.24);assert.equal(near.ox,.38);assert.equal(far.ox,.62);
});

test('forearm wrist tips remain attached to fist pivots throughout punches',()=>{
 for(let i=0;i<=20;i++)for(const sequence of [0,1]){
  const pose=fighterPose(.1,true,i*.01,sequence);
  for(const side of ['left','right'] as const){
   const fore=pose.find(p=>p.part===`${side}Forearm`)!,hand=pose.find(p=>p.part===`${side}Hand`)!;
   const dx=(.58-fore.ox)*fore.w,dy=(.87-fore.oy)*fore.h;
   const x=fore.x+Math.cos(fore.r)*dx-Math.sin(fore.r)*dy,y=fore.y+Math.sin(fore.r)*dx+Math.cos(fore.r)*dy;
   assert.ok(Math.hypot(x-hand.x,y-hand.y)<1e-8);
   const fistAxis=hand.r+Math.atan2(hand.h*.56,hand.w*(side==='left'?.28:-.28));
   assert.ok(Math.abs(Math.sin(fistAxis-Math.atan2(hand.y-fore.y,hand.x-fore.x)))<1e-8);
  }
 }
});
