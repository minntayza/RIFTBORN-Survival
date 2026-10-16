import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceZombieRig,crowdSeparation,type RigState} from '../src/zombie-rig';
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
