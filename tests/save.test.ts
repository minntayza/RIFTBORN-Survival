import test from 'node:test';
import assert from 'node:assert/strict';
import {freshSave,validateSave} from '../src/save';

test('run setup survives validation and older saves get quick-play defaults',()=>{
 const original=freshSave();original.runSetup={mode:'short',build:'guard'};
 assert.deepEqual(validateSave(original).runSetup,{mode:'short',build:'guard'});
 assert.deepEqual(validateSave({version:1}).runSetup,{mode:'endless',build:'assault'});
 assert.deepEqual(validateSave({...original,runSetup:{mode:'invalid',build:'invalid'}}).runSetup,{mode:'endless',build:'assault'});
});
