import {test} from 'node:test';
import assert from 'node:assert/strict';
import {heroSvg,weaponSvg,enemySvg,artImage} from '../src/art';
import {HEROES,WEAPONS,ENEMIES,type HeroId,type WeaponId,type EnemyId} from '../src/config';
test('every survivor, weapon and enemy has a complete original vector preview',()=>{
 const art=[...Object.keys(HEROES).map(id=>heroSvg(id as HeroId)),...Object.keys(WEAPONS).map(id=>weaponSvg(id as WeaponId)),...Object.keys(ENEMIES).map(id=>enemySvg(id as EnemyId))];
 const expected=Object.keys(HEROES).length+Object.keys(WEAPONS).length+Object.keys(ENEMIES).length;assert.equal(art.length,expected);assert.equal(new Set(art).size,expected);
 for(const source of art){assert.ok(source.startsWith('<svg'));assert.ok(source.endsWith('</svg>'));assert.ok(!/undefined|NaN|https?:\/\//.test(source.replace('http://www.w3.org/2000/svg','')));}
});
test('weapon portraits carry descriptive accessible names and local artwork',()=>{
 for(const id of Object.keys(WEAPONS)){const image=artImage('weapon',id);assert.ok(image.includes(`${WEAPONS[id as WeaponId].name} illustration`));assert.ok(image.includes('data:image/svg+xml,')||(image.includes('role="img"')&&image.includes('href="/assets/characters/')));}
});
