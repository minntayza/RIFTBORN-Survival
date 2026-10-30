import test from 'node:test';
import assert from 'node:assert/strict';
import {WEAPON_EFFECTS,weaponPose,meleeContact} from '../src/weapon-effects';
import {WEAPONS,type WeaponId} from '../src/config';
test('every weapon has a distinct effect profile and a finite contact point',()=>{
 assert.equal(new Set(Object.keys(WEAPONS).map(id=>WEAPON_EFFECTS[id as WeaponId].style)).size,Object.keys(WEAPONS).length);
 for(const id of Object.keys(WEAPONS) as WeaponId[])for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const p=weaponPose(id,600,380,angle,.55,true,1);assert.ok(Number.isFinite(p.tip.x)&&Number.isFinite(p.tip.y));assert.ok(Math.hypot(p.tip.x-p.grip.x,p.tip.y-p.grip.y)>5);assert.ok(p.originX>=0&&p.originX<=1);}
});
test('hammer rotates around a fixed hand grip rather than the head',()=>{const a=weaponPose('hammer',0,0,0,0,false),b=weaponPose('hammer',0,0,0,1,true);assert.ok(Math.hypot(a.grip.x-b.grip.x,a.grip.y-b.grip.y)<1e-9);assert.notDeepEqual(a.tip,b.tip);assert.equal(a.originX,33/128);});
test('shotgun recoil is stronger than SMG and shields bash forward',()=>{const gun=(id:WeaponId)=>weaponPose(id,0,0,0,.5,true).grip.x;assert.ok(gun('shotgun')<gun('smg'));assert.ok(weaponPose('shield',0,0,0,.5,true).grip.x>weaponPose('shield',0,0,0,0,false).grip.x);});

test('melee only hits the visible sweep, not the old broad range',()=>{assert.equal(meleeContact('katana',0,0,0,{x:105,y:0},5),false);assert.equal(meleeContact('katana',0,0,0,{x:50,y:15},12),true);assert.equal(meleeContact('katana',0,0,0,{x:-55,y:0},12),false);});
test('reach upgrades extend the same visual blade used by hit detection',()=>{const p=weaponPose('naginata',0,0,0,.55,true,0,false,false,1.5);assert.ok(p.size>WEAPON_EFFECTS.naginata.size);assert.equal(meleeContact('naginata',0,0,0,p.tip,2,0,1.5),true);});

test('shorter Samurai blades keep grips and width while reducing contact reach',async()=>{
 const {SAMURAI_WEAPON_ART,samuraiWeaponMetrics,samuraiWeaponPortrait}=await import('../src/samurai-weapons');
 for(const [id,range] of [['nodachi',124],['cursed',112],['naginata',152]] as const){
  assert.equal(WEAPONS[id].range,range);
  const art=SAMURAI_WEAPON_ART[id],m=samuraiWeaponMetrics(id);
  assert.equal(m.grip.x,art.origin.x-64);
  const originalLength=-(art.sourceTip.y-art.sourceGrip.y)*art.height/art.rect[3];
  assert.ok(Math.abs(m.tip.x-m.grip.x-originalLength*.8)<1e-8);
  assert.ok(samuraiWeaponPortrait(id).includes('height="92.80000000000001"')||samuraiWeaponPortrait(id).includes('height="92.8"'));
  for(const aim of [0,Math.PI]){const p=weaponPose(id,0,0,aim,.55,true,0,false,false,1,1,'samurai');assert.equal(meleeContact(id,0,0,aim,p.tip,2,0,1,1,'samurai'),true);const distant={x:p.grip.x+(p.tip.x-p.grip.x)*1.6,y:p.grip.y+(p.tip.y-p.grip.y)*1.6};assert.equal(meleeContact(id,0,0,aim,distant,1,0,1,1,'samurai'),false);}
 }
});

test('Lethwei short reach keeps close contact and rejects distant punches',()=>{
 for(const id of ['hempwraps'] as const){
  assert.ok(WEAPONS[id].range<=60);
  assert.ok(meleeContact(id,0,0,0,{x:25,y:5},0));
  assert.equal(meleeContact(id,0,0,0,{x:70,y:5},0),false);
 }
});
