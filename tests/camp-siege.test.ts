import {test} from 'node:test';
import assert from 'node:assert/strict';
import {campContact,siegeApproach,siegeRecoil} from '../src/camp-siege';
import {campObstacles} from '../src/last-camp-collision';
test('siege impacts land on nearest camp structure in every approach direction',()=>{
 const obstacles=campObstacles(600,380);
 for(let a=0;a<Math.PI*2;a+=Math.PI/8){
  const x=600+Math.cos(a)*210,y=380+Math.sin(a)*210,p=campContact(x,y,obstacles);
  assert.ok(obstacles.some(o=>o.group==='camp'&&p.x>=o.x-o.halfW&&p.x<=o.x+o.halfW&&p.y>=o.y-o.halfH&&p.y<=o.y+o.halfH));
  assert.ok(Math.hypot(p.x-600,p.y-380)>0);
  assert.ok(Math.hypot(x-p.x,y-p.y)<210);
 }
});
test('crowd steering separates overlapping attackers without increasing movement speed',()=>{
 const a={x:400,y:380,r:18,active:true},b={...a};
 const first=siegeApproach(a,600,380,[a,b]),second=siegeApproach(b,600,380,[a,b]);
 assert.ok(first.crowded&&second.crowded);assert.ok(first.y*second.y<0);
 assert.ok(Math.abs(Math.hypot(first.x,first.y)-1)<1e-9);
 const solo=siegeApproach(a,600,380,[a]);assert.deepEqual(solo,{x:1,y:0,crowded:false});
});
test('zombies pull back then strike, robots recoil, and reduced motion stays still',()=>{
 assert.ok(siegeRecoil(.3,Infinity,false)<0);assert.ok(siegeRecoil(0,.14,false)>0);
 assert.ok(siegeRecoil(0,.14,true)<0);assert.equal(siegeRecoil(0,.6,false),0);
 assert.equal(siegeRecoil(.3,.14,false,true),0);
});


test('seeded random roles match across runs, scale from 25% to 40%, and respect hard caps',async()=>{
 const {targetsCamp,campAttackChance,campAttackLimit,campAttackLane,campAttackStation}=await import('../src/camp-siege');
 const {seededRandom}=await import('../src/retention');
 assert.equal(campAttackChance(1),.25);assert.equal(campAttackChance(10),.4);assert.equal(campAttackChance(40),.4);
 const assign=()=>{const random=seededRandom(45);let count=0;return Array.from({length:50},()=>{const selected=targetsCamp('basic',1,random(),count);if(selected)count++;return selected;});};
 assert.deepEqual(assign(),assign());assert.equal(assign().filter(Boolean).length,3);
 for(const wave of [1,5,10]){assert.equal(targetsCamp('brute',wave,0,campAttackLimit(wave)),false);assert.equal(targetsCamp('basic',wave,.99,0),false);for(const boss of ['boss','shooterBoss','commander'])assert.equal(targetsCamp(boss,wave,0,0),false);}
 const lanes:number[]=[];for(let i=0;i<4;i++)lanes.push(campAttackLane(900,380,600,380,lanes));assert.equal(new Set(lanes).size,4);
 for(const lane of lanes){const p=campAttackStation(lane,18,600,380,campObstacles(600,380));assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));}
});

test('assigned perimeter lanes remain reachable around camp obstacles',async()=>{
 const {LastCamp}=await import('../src/last-camp');
 const {campAttackStation}=await import('../src/camp-siege');
 const c=new LastCamp();
 for(let lane=0;lane<12;lane++){
  const a=lane*Math.PI/6,r=18,target=campAttackStation(lane,r,c.x,c.y,c.obstacles);
  let p=c.constrain(c.x+Math.cos(a)*300,c.y+Math.sin(a)*300,r),arrived=false;
  for(let step=0;step<1400;step++){
   if(c.attackDistance(p.x,p.y)<r+18&&Math.hypot(p.x-target.x,p.y-target.y)<r+45){arrived=true;break;}
   const heading=c.steer(p.x,p.y,target.x,target.y,r);p=c.move(p.x,p.y,Math.cos(heading)*1.5,Math.sin(heading)*1.5,r);
  }
  assert.ok(arrived,'lane '+lane+' must reach camp striking range');
 }
});
