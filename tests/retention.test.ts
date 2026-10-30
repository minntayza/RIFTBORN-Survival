import test from 'node:test';
import assert from 'node:assert/strict';
import {dailySetup,seededRandom,techniqueUnlocked,earnedWaveGold,incomingThreats,edgePosition} from '../src/retention';
import {validateSave,freshSave} from '../src/save';
import {upgradeChoices,upgradeRole} from '../src/upgrades';
import {wavePlan} from '../src/waves';
test('daily loadout and seeded wave schedules repeat for the UTC date',()=>{
 assert.deepEqual(dailySetup('2026-10-14'),dailySetup('2026-10-14'));
 assert.notEqual(dailySetup('2026-10-14').seed,dailySetup('2026-10-15').seed);
 const a=seededRandom(123),b=seededRandom(123);assert.deepEqual(wavePlan(12,a),wavePlan(12,b));
});
test('each hero receives distinct offence, survival and technique options',()=>{
 for(const hero of ['ninja','samurai','gunner','tank'] as const){const picks=upgradeChoices(hero,{},seededRandom(42));assert.deepEqual(new Set(picks.map(upgradeRole)),new Set(['offence','survival','technique']));assert.equal(new Set(picks.map(p=>p.id)).size,3);}
});
test('mastery unlocks are earned and new save fields survive validation',()=>{
 assert.equal(techniqueUnlocked(99,'swift'),false);assert.equal(techniqueUnlocked(100,'swift'),true);assert.equal(techniqueUnlocked(249,'fortified'),false);assert.equal(techniqueUnlocked(250,'fortified'),true);
 const s=freshSave();s.techniques.ninja='swift';s.mastery.ninja={kills:120};s.shortWins=2;s.daily['2026-10-14']={score:2200,wins:1};assert.deepEqual(validateSave(s).daily,s.daily);assert.equal(validateSave(s).techniques.ninja,'swift');assert.equal(validateSave(s).shortWins,2);
 assert.deepEqual(validateSave({...s,daily:{bad:{score:4,wins:1}}}).daily,{});
});
test('combat and objective gold is earned while failure does not award those bonuses',()=>{
 const failed=earnedWaveGold(5,2,100,0);assert.equal(failed.combat+failed.perfect+failed.objective,0);
 const success=earnedWaveGold(5,18,0,2);assert.ok(success.combat>0&&success.perfect>0&&success.objective>0);
});
test('threat indicators ignore visible and distant normal enemies, group packs, and retain bosses',()=>{
 const view={x:0,y:0,width:390,height:844};const es=[{active:true,x:30,y:30,type:'basic'},{active:true,x:-20,y:400,type:'runner'},{active:true,x:-30,y:410,type:'basic'},{active:true,x:900,y:400,type:'basic'},{active:true,x:1400,y:400,type:'boss'}];
 const threats=incomingThreats(es,view);assert.equal(threats.length,2);assert.equal(threats[0].count,2);assert.equal(threats[1].kind,'boss');assert.ok(threats[0].urgent);
 for(let i=0;i<16;i++){const p=edgePosition(i*Math.PI/8,390,844);assert.ok(p.x>=29&&p.x<=361&&p.y>=109&&p.y<=655);}
});

test('joystick settings survive validation with bounded sizes',()=>{const s=freshSave();s.settings.joystickSide='right';s.settings.joystickSize=135;assert.equal(validateSave(s).settings.joystickSize,135);assert.equal(validateSave(s).settings.joystickSide,'right');s.settings.joystickSize=999;assert.equal(validateSave(s).settings.joystickSize,115);});

test('map view defaults to standard and saves only supported zoom options',()=>{
 assert.equal(freshSave().settings.mapView,1);
 const s=freshSave();s.settings.mapView=2;s.settings.mapViewChosen=true;assert.equal(validateSave(s).settings.mapView,2);
 assert.equal(validateSave({settings:{mapView:99}}).settings.mapView,1);
 assert.equal(validateSave({settings:{}}).settings.mapView,1);
});

test('mobile starts at 1.5x and retains an explicit 1x choice',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'matchMedia');
 Object.defineProperty(globalThis,'matchMedia',{configurable:true,value:()=>({matches:true})});
 try {
  assert.equal(freshSave().settings.mapView,1.5);
  const s=freshSave();s.settings.mapView=1;assert.equal(validateSave(s).settings.mapView,1.5);
  s.settings.mapViewChosen=true;assert.equal(validateSave(s).settings.mapView,1);
 } finally {if(previous)Object.defineProperty(globalThis,'matchMedia',previous);else Reflect.deleteProperty(globalThis,'matchMedia');}
});
