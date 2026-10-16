import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceZombieRig,crowdSeparation,zombieVisualScale,type RigState} from '../src/zombie-rig';
import {rigPose,ZOMBIE_SPRITES} from '../src/zombie-sprites';
const fresh=():RigState=>({x:0,y:0,time:0,phase:0,moving:0,facing:1,candidate:1,held:0});
test('all nine rigs have invariant head/torso joints while feet and arms move',()=>{
 for(const id of ZOMBIE_SPRITES){
  const still=rigPose(id,0,0);
  for(let f=0;f<24;f++){const pose=rigPose(id,f/24,1);assert.deepEqual(pose.head,still.head);assert.deepEqual(pose.torso,still.torso);}
  assert.notDeepEqual(rigPose(id,.25,1).leftLeg,still.leftLeg);
 }
 assert.equal(rigPose('rifle',.25,1).leftArm.angle,rigPose('rifle',.75,1).leftArm.angle);
});
test('facing ignores center-line jitter and needs a sustained opposite direction',()=>{
 const s=fresh();for(let i=1;i<20;i++)advanceZombieRig(s,'basic',0,0,i*.05,15,i%2?2:-2,100,false);assert.equal(s.facing,1);
 advanceZombieRig(s,'basic',0,0,1,15,-100,0,false);assert.equal(s.facing,1);
 for(let i=1;i<7;i++)advanceZombieRig(s,'basic',0,0,1+i*.05,15,-100,0,false);assert.equal(s.facing,-1);
});
test('real displacement advances steps, rest settles, attack freezes phase and teleports do not count',()=>{
 const s=fresh();for(let i=1;i<=8;i++)advanceZombieRig(s,'basic',i,0,i*.05,15,100,0,false);assert.ok(s.phase>0);assert.equal(s.moving,1);
 const phase=s.phase;advanceZombieRig(s,'basic',9,0,.45,15,100,0,true);assert.equal(s.phase,phase);
 advanceZombieRig(s,'basic',1000,0,.5,15,100,0,false);assert.equal(s.phase,phase);
 let stopped;for(let i=1;i<8;i++)stopped=advanceZombieRig(s,'basic',1000,0,.5+i*.05,15,100,0,false);
 assert.equal(stopped!.frame,0);assert.equal(stopped!.level,0);
});
test('crowd separation resolves stacks gently with bounded correction',()=>{
 assert.deepEqual(crowdSeparation(100,0,15,15,1/60),{x:0,y:0});
 for(const distance of [0,1,20,31]){const p=crowdSeparation(distance,0,15,15,1/60);assert.ok(p.x>0&&p.x<=36/60);assert.equal(p.y,0);}
});

test('zombie dog keeps a horizontal body with four canine limb joints and diagonal strides',()=>{
 const a=rigPose('runner',.25,1),b=rigPose('runner',.75,1);
 assert.ok(a.head.x>a.torso.x+25);assert.ok(a.head.y<a.torso.y);
 assert.equal(new Set([a.leftArm.x,a.rightArm.x,a.leftLeg.x,a.rightLeg.x]).size,4);
 assert.ok(a.leftArm.angle*a.rightLeg.angle>0);assert.ok(a.rightArm.angle*a.leftLeg.angle>0);
 assert.ok(a.leftArm.angle*b.leftArm.angle<0);assert.deepEqual(a.head,b.head);assert.deepEqual(a.torso,b.torso);
});

test('dog gets a larger visual silhouette without changing other zombies or zoom rules',()=>{
 assert.equal(zombieVisualScale('runner',1.05),1.2);
 assert.equal(zombieVisualScale('runner',.525),1.17*1.2);
 assert.equal(zombieVisualScale('basic',1.05),1);assert.equal(zombieVisualScale('basic',.525),1.17);
});
