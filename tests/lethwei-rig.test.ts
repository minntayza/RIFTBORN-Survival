import test from 'node:test';
import assert from 'node:assert/strict';
import {fighterPose,fighterJoint,FighterMotion,FIGHTER_REGIONS,FIGHTER_PARTS} from '../src/lethwei-rig';
function wrist(p:ReturnType<typeof fighterPose>[number]){const y=(.82-p.oy)*p.h;return {x:p.x-Math.sin(p.r)*y,y:p.y+Math.cos(p.r)*y};}
test('seven-piece rig has continuous forearm/fist drawings with no separate cuffs',()=>{
 const pose=fighterPose();assert.equal(pose.length,7);assert.equal(FIGHTER_PARTS.length,7);assert.equal(new Set(pose.map(p=>p.part)).size,7);
 assert.ok(pose.every(p=>!p.part.endsWith('Hand')));
 for(const [part,[x,y,w,h]] of Object.entries(FIGHTER_REGIONS)){const width=part.endsWith('Leg')?1536:1254,height=part.endsWith('Leg')?1024:1254;assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=width&&y+h<=height);}
});
test('two bone solver preserves lengths for reachable elbow targets',()=>{
 for(const bend of [-1,1])for(const target of [{x:20,y:20},{x:0,y:40},{x:-20,y:20}]){const elbow=fighterJoint({x:0,y:0},target,23,24,bend);assert.ok(Math.abs(Math.hypot(elbow.x,elbow.y)-23)<1e-8);assert.ok(Math.abs(Math.hypot(target.x-elbow.x,target.y-elbow.y)-24)<1e-8);}
});
test('whole legs pivot only at the thighs and swing in opposite directions',()=>{
 const idle=fighterPose();for(let i=0;i<80;i++){const pose=fighterPose(i/30,true,.1,i%2);for(const side of ['left','right']){const leg=pose.find(p=>p.part===`${side}Leg`)!,base=idle.find(p=>p.part===leg.part)!;assert.deepEqual([leg.x,leg.w,leg.h,leg.ox,leg.oy],[base.x,base.w,base.h,base.ox,base.oy]);}for(const p of pose)for(const n of [p.x,p.y,p.w,p.h,p.r])assert.ok(Number.isFinite(n));}
 assert.ok(fighterPose(.1,true)[0].r*fighterPose(.1,true)[1].r<0);
});
test('punches extend the correct continuous arm and return to guard',()=>{
 const guard=fighterPose();for(const [sequence,side] of [[0,'left'],[1,'right']] as const){const a=wrist(guard.find(p=>p.part===`${side}Forearm`)!),b=wrist(fighterPose(0,false,.1,sequence).find(p=>p.part===`${side}Forearm`)!);assert.ok(b.x>a.x+20);}
 assert.deepEqual(fighterPose(0,false,.2),guard);
});
test('elbow remains attached during walking, aiming and punching',()=>{
 for(let i=0;i<=20;i++)for(const sequence of [0,1])for(const aim of [-1,0,1]){const pose=fighterPose(.1,true,i*.01,sequence,undefined,.2,aim);for(const side of ['left','right']){const upper=pose.find(p=>p.part===`${side}UpperArm`)!,fore=pose.find(p=>p.part===`${side}Forearm`)!;const dy=(.82-upper.oy)*upper.h;assert.ok(Math.hypot(upper.x-Math.sin(upper.r)*dy-fore.x,upper.y+Math.cos(upper.r)*dy-fore.y)<1e-8);}}
});
test('walking eases to rest and gait follows distance independent of render frequency',()=>{
 const a=new FighterMotion(),b=new FighterMotion();a.sample(0,0,0);b.sample(0,0,0);for(let i=1;i<=20;i++)a.sample(i*2,0,i*.02);for(let i=1;i<=10;i++)b.sample(i*4,0,i*.04);assert.ok(Math.abs(a.phase-b.phase)<1e-8);assert.ok(a.stride>0&&a.stride<1);const old=a.stride;for(let i=1;i<=40;i++)a.sample(40,0,.4+i*.02);assert.ok(a.stride<old*.01);
});
test('thigh attachments remain beneath the shorts',()=>{for(const leg of fighterPose().filter(p=>p.part.endsWith('Leg'))){assert.equal(Math.abs(leg.x),11);assert.equal(leg.y,14);assert.equal(leg.h,65);assert.ok(leg.y-leg.oy*leg.h<10);}});

test('full punches align shoulder, elbow and wrist with aim for either arm',()=>{
 for(const sequence of [0,1])for(const aim of [-1.2,-.5,0,.5,1.2]){
  const side=sequence===0?'left':'right',pose=fighterPose(.3,true,.1,sequence,undefined,.2,aim);
  const upper=pose.find(p=>p.part===`${side}UpperArm`)!,fore=pose.find(p=>p.part===`${side}Forearm`)!,hand=wrist(fore);
  const ux=fore.x-upper.x,uy=fore.y-upper.y,fx=hand.x-fore.x,fy=hand.y-fore.y;
  assert.ok(Math.abs(ux*fy-uy*fx)<1e-8);
  assert.ok(Math.abs(Math.hypot(ux,uy)-22)<1e-8);
  assert.ok(Math.abs(Math.hypot(fx,fy)-22)<1e-8);
  assert.ok(Math.abs(Math.atan2(hand.y-upper.y,hand.x-upper.x)-aim)<1e-8);
 }
});
