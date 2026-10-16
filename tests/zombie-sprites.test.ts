import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {ZOMBIE_SPRITES,ZOMBIE_ATLASES,zombieSpriteLocation,zombieSpriteCanvas} from '../src/zombie-sprites';
test('gameplay atlas covers all nine early zombies and leaves retired enemies on their existing art',()=>{
 assert.equal(new Set(ZOMBIE_SPRITES).size,9);
 for(const id of ['basic','runner','spitter','armoured','brute','elite','rifle','commander','boss'])assert.ok(ZOMBIE_SPRITES.includes(id as typeof ZOMBIE_SPRITES[number]));
 for(const id of ['cleaver','spear','shooterBoss'] as const)assert.equal(zombieSpriteCanvas({} as HTMLImageElement,id,0),undefined);
 for(const atlas of ZOMBIE_ATLASES){
 const path=new URL('../public'+atlas.url,import.meta.url);
 assert.ok(existsSync(path));const png=readFileSync(path);
 assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),atlas.frames.width);
 assert.equal(png.readUInt32BE(20),atlas.frames.height);
 assert.equal(atlas.frames.rows.length,3);
 for(const row of atlas.frames.rows){assert.equal(row.length,6);for(const [x,y,w,h] of row){assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=atlas.frames.width&&y+h<=atlas.frames.height);}}
 assert.equal(png[25],6,'RGBA transparency');
 }
 const cells=ZOMBIE_SPRITES.map(id=>{const loc=zombieSpriteLocation(id)!;return loc.atlas.key+':'+loc.row;});
 assert.equal(new Set(cells).size,9,'each zombie has its own three-pose row');
});
