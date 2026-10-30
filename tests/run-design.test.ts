import test from 'node:test';
import assert from 'node:assert/strict';
import {encounterRhythm,weaponMilestone,HERO_IDENTITIES,deathTip} from '../src/run-design';
import {wavePlan} from '../src/waves';
import {freshSave,validateSave} from '../src/save';
import {cardEvolutionGuide,weaponEvolutionGuide} from '../src/guide-ui';
import {UPGRADES} from '../src/upgrades';
import {cardBenefit,visualUpgradeCard} from '../src/upgrade-ui';
test('encounters alternate pressure and contain genuine gaps in reinforcements',()=>{
 assert.ok(encounterRhythm(14).density<encounterRhythm(11).density);
 assert.ok(encounterRhythm(15).recovery>encounterRhythm(11).recovery);
 for(let w=8;w<=35;w++)for(const s of wavePlan(w,()=>.5))assert.ok(!(s.time>=12&&s.time<15)&&!(s.time>=26&&s.time<29));
});
test('weapon milestones awaken at ten and complete the same element at twenty',()=>{
 assert.equal(weaponMilestone(9,false,false),undefined);assert.equal(weaponMilestone(10,false,false),'awakening');assert.equal(weaponMilestone(19,true,false),undefined);assert.equal(weaponMilestone(20,true,false),'full');assert.equal(weaponMilestone(40,true,true),undefined);
 assert.equal(new Set(Object.values(HERO_IDENTITIES).map(h=>h.trigger)).size,Object.keys(HERO_IDENTITIES).length);
});
test('archive migration preserves old saves and sanitizes discovery states',()=>{
 const save=freshSave();save.archive={'card:damage':2,'weapon:katana:reach':1};const restored=validateSave(save);assert.deepEqual(restored.archive,save.archive);assert.deepEqual(validateSave({version:1}).archive,{});
 assert.deepEqual(validateSave({...save,archive:{'card:damage':8,'bad value':2}}).archive,{});
});
test('field guide previews locked card and weapon evolutions with real requirements',()=>{
 const save=freshSave(),cards=cardEvolutionGuide(save,'ninja'),weapons=weaponEvolutionGuide(save,'katana');
 assert.match(cards,/Ruin/);assert.match(cards,/MAX/);assert.match(cards,/Wave 11/);assert.match(cards,/UNDI/);assert.match(weapons,/WAVE 10 AWAKENING/);assert.match(weapons,/WAVE 20 FULL EVOLUTION/);
 save.archive['card:damage']=2;assert.match(cardEvolutionGuide(save,'ninja'),/✓ USED/);
 for(const u of UPGRADES){assert.ok(cardBenefit(u).length<65);assert.match(visualUpgradeCard(u,0,'ninja','katana',0),/aria-label="Choose/);}
});
test('death advice follows the attack that defeated the player',()=>{assert.match(deathTip('Siege Gunner volley'),/aim lines/);assert.match(deathTip('Zombie General slam'),/charge lane/);assert.match(deathTip('Pike guard'),/sideways/);});

test('daily awakening is playable after wave five and never offers full evolution',()=>{
 assert.equal(weaponMilestone(4,false,false,true),undefined);
 assert.equal(weaponMilestone(5,false,false,true),'awakening');
 assert.equal(weaponMilestone(10,true,false,true),undefined);
 assert.equal(weaponMilestone(20,true,false,true),undefined);
});
