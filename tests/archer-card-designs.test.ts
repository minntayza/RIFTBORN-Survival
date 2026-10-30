import {test} from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {upgradeVisual} from '../src/upgrade-ui';
import {evolutionCardArt} from '../src/evolution-art';
import {archerCardArt} from '../src/archer-card-art';
test('five Archer King cards and evolutions use one matched set without leaking to other heroes',()=>{
 for(const id of ['arrowstorm','windfocuscard','sunburstcard','beasthunter','piercingeye']){const u=UPGRADES.find(u=>u.id===id)!;assert.match(upgradeVisual(u,'pyusawhti','aungzeyabow'),/archer-upgrades-v2.png/);assert.match(evolutionCardArt('pyusawhti',id),/archer-upgrades-v2.png/);assert.match(archerCardArt(id),new RegExp(`data-archer-card="${id}"`));assert.ok(CARD_EVOLUTIONS[id]);assert.equal(evolutionCardArt('ninja',id),'');}
 assert.match(evolutionCardArt('pyusawhti','health'),/common-evolutions-v1.png/);assert.equal(archerCardArt('nineweapons'),'');
});
