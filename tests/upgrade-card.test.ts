import test from 'node:test';
import assert from 'node:assert/strict';
import {visualUpgradeCard,upgradeValues,upgradeBuildHint,evolutionProgress} from '../src/upgrade-ui';
import {UPGRADES,upgradeChoices} from '../src/upgrades';
const card=(id:string)=>UPGRADES.find(u=>u.id===id)!;
test('Choices communicate real before and after values and remain selectable',()=>{
 for(const id of ['health','regen','pierce','wide']){
  const u=card(id),v=upgradeValues(u,2),html=visualUpgradeCard(u,2,'ninja','katana',2);
  assert.ok(html.includes(v.before));assert.ok(html.includes(v.after));assert.match(html,/data-action="upgrade:2"/);assert.match(html,/choice-comparison/);
 }
 assert.match(visualUpgradeCard(card('double'),0,'ninja','katana',0),/SECOND SLASH/);
});
test('Pairing hints require an owned complementary upgrade',()=>{
 assert.equal(upgradeBuildHint(card('ricochet'),{}),'');
 assert.equal(upgradeBuildHint(card('ricochet'),{ricochet:1}),'');
 assert.match(upgradeBuildHint(card('ricochet'),{pierce:1}),/Through the dark/);
});
test('Evolution progress does not promise an immediate evolution before wave 11',()=>{
 assert.match(evolutionProgress(card('damage'),4),/eligible from wave 11/);
 assert.match(evolutionProgress(card('damage'),3),/1 level/);
 assert.doesNotMatch(evolutionProgress(card('smoke'),0),/eligible/);
});
test('Early offers include a signature skill and avoid incompatible shield cards',()=>{
 for(const hero of ['ninja','samurai','gunner','tank'] as const){const choices=upgradeChoices(hero,{},()=>.2,hero==='tank'?'hammer':undefined);assert.equal(choices.length,3);assert.equal(new Set(choices.map(u=>u.id)).size,3);assert.ok(choices.some(u=>u.hero===hero));if(hero==='tank')assert.ok(choices.every(u=>!['block','stamina','reflect','spikes'].includes(u.id)));}
});
