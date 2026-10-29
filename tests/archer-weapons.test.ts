import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WEAPONS} from '../src/config';
import {freshSave,validateSave,compatible} from '../src/save';
test('Archer King has only the Duskstring Bow in runtime catalogs',()=>{
 assert.deepEqual(Object.entries(WEAPONS).filter(([,w])=>w.hero==='pyusawhti').map(([id])=>id),['aungzeyabow']);
 assert.equal(WEAPONS.aungzeyabow.name,'Duskstring Bow');
 assert.equal(compatible('pyusawhti','greatbow'),false);assert.equal(compatible('pyusawhti','solarcrossbow'),false);
});
test('old equipped bows migrate to Duskstring without losing hero or currency',()=>{
 for(const weapon of ['greatbow','solarcrossbow'] as const){
 const original={...freshSave(),hero:'pyusawhti',heroes:['ninja','pyusawhti'],weapons:['aungzeyabow',weapon],weapon,gold:432};
 const save=validateSave(original);assert.equal(save.hero,'pyusawhti');assert.equal(save.weapon,'aungzeyabow');assert.equal(save.gold,432);assert.ok(!save.weapons.includes(weapon));
 }
});
