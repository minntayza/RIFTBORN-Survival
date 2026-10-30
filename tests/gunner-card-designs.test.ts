import {test} from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {upgradeVisual} from '../src/upgrade-ui';
import {evolutionCardArt} from '../src/evolution-art';
import {gunnerCardArt} from '../src/gunner-card-art';
test('all five Gunner cards and evolutions share one illustrated set without changing other heroes',()=>{
 for(const id of ['magazine','pierce','ricochet','explosive','reload']){const u=UPGRADES.find(u=>u.id===id)!;assert.match(upgradeVisual(u,'gunner','pistols'),/gunner-upgrades-v1.png/);assert.match(evolutionCardArt('gunner',id),/gunner-upgrades-v1.png/);assert.match(gunnerCardArt(id),new RegExp(`data-gunner-card="${id}"`));assert.ok(CARD_EVOLUTIONS[id]);assert.equal(evolutionCardArt('ninja',id),'');}
 assert.match(evolutionCardArt('gunner','health'),/common-evolutions-v1.png/);assert.equal(gunnerCardArt('spikes'),'');
});
