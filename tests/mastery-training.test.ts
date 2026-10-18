import test from 'node:test';
import assert from 'node:assert/strict';
import {masteryTraining,TRAINING_THRESHOLDS,MASTERY_PATHS} from '../src/mastery';
import {PERMANENT} from '../src/config';
test('Mastery replaces every training category with capped gradual unlocks',()=>{
 assert.deepEqual(MASTERY_PATHS.flatMap(p=>[...p.skills]).sort(),Object.keys(PERMANENT).sort());
 for(const [id,p] of Object.entries(PERMANENT)){
  assert.equal(TRAINING_THRESHOLDS[id].length,p.cap);
  assert.equal(masteryTraining(0,id),0);
  assert.equal(masteryTraining(500,id),p.cap);
  TRAINING_THRESHOLDS[id].forEach((n,i)=>{assert.equal(masteryTraining(n-1,id),i);assert.equal(masteryTraining(n,id),i+1);});
 }
});
test('Purchased training is preserved without double stacking',()=>{
 assert.equal(masteryTraining(0,'health',3),3);
 assert.equal(masteryTraining(500,'health',3),3);
 assert.equal(masteryTraining(150,'health',1),3);
});
