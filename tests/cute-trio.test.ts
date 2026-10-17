import test from 'node:test';
import assert from 'node:assert/strict';
import {cutePose,cutePortrait} from '../src/cute-trio';
test('all cute upper-body and hand transforms stay identical across the full walking cycle',()=>{
 for(const id of ['ninja','wanderer','pulse'] as const){
  const still=cutePose(id,0);const upper=still.filter(p=>!p.part.endsWith('Leg'));
  for(let f=0;f<24;f++)assert.deepEqual(cutePose(id,f/24).filter(p=>!p.part.endsWith('Leg')),upper);
  assert.notDeepEqual(cutePose(id,.25).filter(p=>p.part.endsWith('Leg')),cutePose(id,.75).filter(p=>p.part.endsWith('Leg')));
  assert.ok(!/NaN|undefined/.test(cutePortrait(id)));
 }
});
