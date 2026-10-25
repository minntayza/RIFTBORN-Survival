import test from 'node:test';
import assert from 'node:assert/strict';
import {clampSkillTarget,resolveSkillTarget} from '../src/skill-target';
import {freshSave,validateSave} from '../src/save';
test('targets retain nearby distances and clamp diagonal distance from the current player',()=>{assert.deepEqual(clampSkillTarget({x:10,y:20},{x:13,y:24},10),{x:13,y:24});assert.deepEqual(clampSkillTarget({x:10,y:20},{x:70,y:100},10),{x:16,y:28});assert.deepEqual(clampSkillTarget({x:10,y:20},{x:NaN,y:0},10),{x:10,y:20});});
test('the preview and actual cast use the same collision solver and body radius',()=>{let radius=0;const p=resolveSkillTarget({x:10,y:20},{x:400,y:20},'breach',(x,y,dx,dy,r)=>{radius=r;return{x:Math.min(40,x+dx),y:y+dy};});assert.deepEqual(p,{x:40,y:20});assert.equal(radius,12);});
test('casting preferences preserve old saves and validate new values',()=>{const old=freshSave();delete old.settings.skillCast;assert.equal(validateSave(old).settings.skillCast,'hold');old.settings.skillCast='quick';assert.equal(validateSave(old).settings.skillCast,'quick');});
