import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WEAPONS} from '../src/config';
import {freshSave,validateSave,purchase,compatible} from '../src/save';
test('Lethwei Master has only Pattee Wraps in all runtime weapon catalogs',()=>{
 assert.deepEqual(Object.entries(WEAPONS).filter(([,w])=>w.hero==='lethwei').map(([id])=>id),['hempwraps']);
 assert.equal(WEAPONS.hempwraps.name,'Pattee Wraps');
 for(const id of ['ironwraps','tigerwraps'] as const){
  assert.equal(compatible('lethwei',id),false);
  assert.equal(purchase(freshSave(),'weapons',id),false);
 }
});
test('retired wraps migrate to Pattee Wraps without losing ownership or currency',()=>{
 for(const weapon of ['ironwraps','tigerwraps'] as const){
  const s=validateSave({...freshSave(),hero:'lethwei',heroes:['ninja','lethwei'],weapon,weapons:[weapon],gold:777,petals:88});
  assert.equal(s.hero,'lethwei');assert.equal(s.weapon,'hempwraps');
  assert.ok(s.heroes.includes('lethwei'));assert.ok(!s.weapons.includes(weapon));
  assert.equal(s.gold,777);assert.equal(s.petals,88);
 }
});
