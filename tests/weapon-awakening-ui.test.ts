import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {WEAPONS,type HeroId,type WeaponId} from '../src/config';
import {weaponAwakeningUi} from '../src/weapon-awakening-ui';
test('awakening offers the original three choices and real artwork for every weapon',()=>{for(const [weapon,w] of Object.entries(WEAPONS)){const html=weaponAwakeningUi(w.hero as HeroId,weapon as WeaponId,10);assert.equal((html.match(/data-action="evolve:/g)||[]).length,3);for(const match of html.matchAll(/<img src="([^"]+)"/g))assert.ok(existsSync('public'+match[1]),match[1]);for(const id of ['reach','power','tempo'])assert.ok(html.includes(`data-action="evolve:${id}"`));}});
test('full evolution retains the chosen element and correct effect values',()=>{const html=weaponAwakeningUi('zawgyi','mysticstaff',20,'tempo');assert.equal((html.match(/data-action="evolve:/g)||[]).length,1);assert.ok(html.includes('evolve:tempo'));assert.ok(html.includes('+20% attack speed'));assert.ok(html.includes('Every attack adds a ghost echo.'));assert.ok(!html.includes('Choose Lightning'));});
