import test from 'node:test';
import assert from 'node:assert/strict';
import {bossMarks} from '../src/boss-skills';
import {zombieShapes,zombiePortrait} from '../src/zombie-art';
import {rigPose,ZOMBIE_SPRITES} from '../src/zombie-sprites';
test('general rupture travels forward while sentinel cross leaves diagonal escape gaps',()=>{
 const grave=bossMarks('boss',0,'zombie',0,0,200,0);
 assert.equal(grave.length,3);assert.deepEqual(grave.map(m=>m.x),[200,305,410]);assert.ok(grave[2].delay>grave[0].delay);
 const cross=bossMarks('boss',0,'robot',0,0,200,0);assert.equal(cross.length,5);assert.ok(cross.every(m=>m.style==='reactor'));
 for(const mark of [...grave,...cross])assert.ok(mark.delay>=1.15&&mark.radius>0&&mark.damage===1);
 assert.equal(bossMarks('boss',2,'zombie',0,0,200,0).length,0);
});
test('mortar only occurs on third gunner attack and rally cannot cause damage',()=>{
 for(const phase of [0,1,3,4])assert.equal(bossMarks('shooterBoss',phase,'zombie',0,0,200,0).length,0);
 assert.equal(bossMarks('shooterBoss',2,'zombie',0,0,200,0).length,3);
 assert.equal(bossMarks('commander',0,'zombie',0,0,200,0)[0].damage,0);
});
test('every illustrated zombie has independent limbs and identical portrait shapes',()=>{
 const art=new Set<string>();
 for(const id of ZOMBIE_SPRITES){const shapes=zombieShapes(id);art.add(JSON.stringify(shapes));
 for(const part of ['head','torso','leftArm','rightArm','leftLeg','rightLeg'])assert.ok(shapes.some(s=>s.part===part));
 const portrait=zombiePortrait(id,rigPose(id,0,0));assert.ok(!/NaN|undefined/.test(portrait));
 for(const shape of shapes)if(!(id==='rifle'&&['leftArm','rightArm'].includes(shape.part)))assert.ok(portrait.includes(shape.d));
 }assert.equal(art.size,9);
});
