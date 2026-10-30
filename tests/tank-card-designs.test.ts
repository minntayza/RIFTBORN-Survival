import {test} from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {upgradeVisual} from '../src/upgrade-ui';
import {evolutionCardArt} from '../src/evolution-art';
import {tankCardArt} from '../src/tank-card-art';
test('Shield Tank cards and evolutions use one matched set without affecting other heroes',()=>{
 for(const id of ['stamina','block','reflect','spikes','rush']){const u=UPGRADES.find(u=>u.id===id)!;assert.match(upgradeVisual(u,'tank','shield'),/tank-upgrades-v1.png/);assert.match(evolutionCardArt('tank',id),/tank-upgrades-v1.png/);assert.match(tankCardArt(id),new RegExp(`data-tank-card="${id}"`));assert.ok(CARD_EVOLUTIONS[id]);assert.equal(evolutionCardArt('gunner',id),'');}
 assert.match(evolutionCardArt('tank','health'),/common-evolutions-v1.png/);assert.equal(tankCardArt('magazine'),'');
});
