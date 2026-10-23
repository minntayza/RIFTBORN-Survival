import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TankActiveTimeline,TANK_ACTIVE_BUDGET,TANK_EVENT_LIFE,TANK_SLAM_RADIUS,tankTheme,tankChargeSegments,tankSecondaryCount,tankMotionPoint,tankSkillWeaponPose} from '../src/tank-active-motion';
import {TankActiveEffects} from '../src/tank-active-fx';
import {ABILITY_TUNING as T,WEAPONS} from '../src/config';
import {weaponPose} from '../src/weapon-effects';
import {tankEquipmentPose} from '../src/tank-redesign';
import type Phaser from 'phaser';
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
test('ground contact is immediate, planted and fixed at the real world center while Tank moves away',()=>{
 const v=new TankActiveTimeline();v.impact('slam',{x:40,y:70},TANK_SLAM_RADIUS,0);assert.equal(v.events[0].age,0);assert.equal(v.motion(false,false,false).slam,1);assert.equal(v.motion(false,false,false).frame,0);v.observe({x:100,y:100},false);v.tick(.1);assert.deepEqual([v.events[0].x,v.events[0].y,v.events[0].radius],[40,70,155]);assert.equal(v.motion(false,false,false).lean,0);v.tick(.4);assert.equal(v.events.length,0);
});
test('movement, steering and bounded footprints use actual distance; stationarity adds no steps',()=>{
 const v=new TankActiveTimeline();v.beginMarch({x:0,y:0},0);for(let i=0;i<50;i++){v.tick(.02);v.observe({x:0,y:0},true);}assert.equal(v.events.length,0);
 for(let i=1;i<=100;i++){v.tick(.02);v.observe({x:i*4,y:0},true);}assert.ok(v.events.filter(e=>e.kind==='step').length>0);assert.ok(v.events.filter(e=>e.kind==='step').length<=6);assert.ok(v.motion(false,true,false).lean>0);
 v.tick(.2);v.observe({x:360,y:0},true);assert.ok(v.motion(false,true,false).lean<0);assert.equal(v.motion(false,true,true).lean,0);assert.equal(v.motion(false,true,true).frame,-1);
});
test('all transient effects have finite lifetimes and stress cannot exceed the fixed budget',()=>{
 const v=new TankActiveTimeline();for(let i=0;i<1000;i++){v.absorb({x:i,y:0},0);v.impact('release',{x:0,y:0},180,0,80);v.impact('slam',{x:0,y:0},155,0);v.impact('stomp',{x:0,y:0},145,0);v.pushed({x:i,y:0},0);}assert.ok(v.events.length<=TANK_ACTIVE_BUDGET);assert.ok(v.events.filter(e=>e.kind==='absorb').length<=8);v.tick(Math.max(...Object.values(TANK_EVENT_LIFE))+.01);assert.equal(v.events.length,0);v.clear();assert.equal(v.time,0);assert.equal(v.motion(false,false,false).slam,0);
});
test('charge reflects stored energy rather than absorbed projectile count; wide/reduced reduce secondary detail',()=>{
 assert.deepEqual([0,1,16,17,64,80,100].map(tankChargeSegments),[0,1,1,2,4,5,5]);assert.equal(tankSecondaryCount(false,false),6);assert.equal(tankSecondaryCount(true,false),2);assert.equal(tankSecondaryCount(true,true),0);assert.equal(tankTheme('jade'),'forge');assert.equal(tankTheme(), 'default');
});
test('each weapon supports finite mirrored skill poses, without changing combat data or source poses',()=>{
 const before=JSON.stringify({T,WEAPONS});for(const outfit of ['default','royal','forge','polar'])for(const weapon of ['hammer','shield','spiked'] as const)for(const facing of [0,Math.PI]){
  const url=outfit==='default'?'':`/tank-v3/${outfit}.png`,source=tankEquipmentPose(weaponPose(weapon,50,70,facing,0,false,0,false,false,1,1,'tank'),50,70,Math.cos(facing)<0?-1:1,url,weapon==='hammer'),snapshot=JSON.stringify(source);
  for(const mode of ['slam','brace','march']){const m={slam:mode==='slam'?1:0,brace:mode==='brace',march:mode==='march',moving:true,frame:0,lean:.075,reduced:false},pose=tankSkillWeaponPose(source,50,70,facing,url,weapon==='hammer',m);for(const p of [pose.grip,pose.tip])assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
   // Applying the same lean is an isometry, so it cannot detach a grip or shoulder.
   const a=tankMotionPoint(pose.grip,50,70,m.lean),b=tankMotionPoint({x:50,y:70},50,70,m.lean);near(Math.hypot(a.x-b.x,a.y-b.y),Math.hypot(pose.grip.x-50,pose.grip.y-70));assert.equal(JSON.stringify(source),snapshot);
  }
 }assert.equal(JSON.stringify({T,WEAPONS}),before);
});
test('frontal outline matches the real absorption sector, and release never draws a lingering protection arc',()=>{
 const calls:{name:string;args:number[]}[]=[],depths:number[]=[];const make=()=>{const g:any=new Proxy({},{get:(_t,k)=>{if(k==='setDepth')return(n:number)=>{depths.push(n);return g;};return(...args:number[])=>{calls.push({name:String(k),args});return g;};}});return g;};const fx=new TankActiveEffects({add:{graphics:make}} as unknown as Phaser.Scene),v=new TankActiveTimeline(),s={x:10,y:20,angle:Math.PI/2,theme:'default' as const,energy:40,bulwark:true,march:false,wide:false,reduced:false};fx.render(v,s);const arcs=calls.filter(c=>c.name==='arc');assert.equal(arcs.length,2);for(const {args} of arcs){near(args[2],T.bulwark.radius);near(args[3],s.angle-T.bulwark.halfAngle);near(args[4],s.angle+T.bulwark.halfAngle);}assert.ok(depths.every(n=>n<6));calls.length=0;v.impact('release',s,T.bulwark.radiusBurst,s.angle,80);fx.render(v,{...s,bulwark:false});assert.equal(calls.filter(c=>c.name==='arc').length,0);fx.destroy();
});

test('repeated rendering preserves the same movement pose; next stationary tick stops it',()=>{const v=new TankActiveTimeline();v.beginMarch({x:0,y:0},0);v.tick(.1);v.observe({x:10,y:0},true);const m=v.motion(false,true,false);v.observe({x:10,y:0},true);assert.deepEqual(v.motion(false,true,false),m);v.tick(.1);v.observe({x:10,y:0},true);assert.equal(v.motion(false,true,false).lean,0);v.impact('stomp',{x:10,y:0},145,0);assert.equal(v.motion(false,false,false).frame,0);v.tick(.25);assert.equal(v.motion(false,false,false).slam,0);});
