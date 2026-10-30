import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PyusawhtiCombat} from '../src/pyusawhti-combat';
import type {ArenaScene} from '../src/combat';
function setup(){
 const graphics=new Proxy({},{get:(_target,key)=>key==='setDepth'?()=>graphics:(...args:unknown[])=>{for(const value of args)if(typeof value==='number')assert.ok(Number.isFinite(value),String(key));}});
 const scene={x:100,y:100,angle:0,hero:'pyusawhti',paused:false,ended:false,countdown:0,swing:0,attackSequence:0,weapon:'aungzeyabow',options:{},save:{pyusawhtiSkills:['banepierce','windfocus']},add:{graphics:()=>graphics},u:()=>0,evolved:()=>false,audio:{play:()=>{}},notifyCombat:()=>{},cameras:{main:{shake:()=>{}}},enemies:[],firePatches:[],burst:()=>{}} as unknown as ArenaScene;
 return {scene,combat:new PyusawhtiCombat(scene)};
}
test('Crownpiercer retains its full directional damage corridor and expires cleanly',()=>{
 for(let a=0;a<Math.PI*2;a+=Math.PI/4){const {combat}=setup();assert.ok(combat.activate(0,Math.cos(a),Math.sin(a)));assert.equal(combat.laserBeams[0].width,96);assert.equal(combat.laserBeams[0].length,920);assert.ok(Math.abs(Math.sin(combat.laserBeams[0].angle-a))<1e-8);combat.render(0);combat.update(.16);combat.render(.16);combat.update(1);assert.equal(combat.laserBeams.length,0);combat.render(1);}
});
test('Moonwind retains movement and attack bonuses, and renders safely with shots in every direction',()=>{
 const {scene,combat}=setup();combat.activate(1);assert.equal(combat.speedMultiplier,1.25);assert.equal(combat.attackRateMultiplier,1.8);
 for(let a=0;a<Math.PI*2;a+=Math.PI/4){scene.angle=a;scene.swing=0;combat.bowAttack();combat.update(.08);combat.render(a);}
 combat.clear();assert.equal(combat.arrows.length,0);assert.equal(combat.windFocusTime,0);combat.render(2);
});

test('spell pose locks to its projectile direction in all eight directions, including while moving',()=>{
 for(let i=0;i<8;i++){
  const angle=i*Math.PI/4,{scene,combat}=setup();
  scene.angle=angle+Math.PI/2;
  assert.ok(combat.activate(0,Math.cos(angle),Math.sin(angle)));
  const committed=combat.lockedAim!;
  assert.ok(Math.abs(Math.sin(committed-angle))<1e-8);
  const origin=combat.arrows[0];
  assert.equal(combat.laserBeams[0].angle,committed);
  assert.equal(origin.angle,committed);
  scene.x+=15;scene.y-=10;scene.angle=angle+Math.PI;
  assert.equal(combat.lockedAim,committed);
  // A self buff must not turn the bow away from an ongoing committed shot.
  combat.activate(1,-Math.cos(angle),-Math.sin(angle));
  assert.equal(combat.lockedAim,committed);
  scene.swing=0;assert.equal(combat.lockedAim,undefined);
 }
});

test('normal arrows and their recovery pose share committed aim',()=>{
 const {scene,combat}=setup();
 scene.angle=-Math.PI/4;combat.bowAttack();
 scene.angle=Math.PI;combat.releasePendingShots(.075);
 assert.equal(combat.lockedAim,-Math.PI/4);
 assert.equal(combat.arrows[0].angle,combat.lockedAim);
});
