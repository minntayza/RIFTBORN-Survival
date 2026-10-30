import {test} from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {upgradeVisual} from '../src/upgrade-ui';
import {evolutionCardArt} from '../src/evolution-art';
import {samuraiCardArt} from '../src/samurai-card-art';
test('all five Samurai cards and four existing evolutions use a matched set',()=>{
 for(const id of ['range','bleed','counter','wind','dragon-slash']){const u=UPGRADES.find(u=>u.id===id)!;assert.match(upgradeVisual(u,'samurai','nodachi'),/samurai-upgrades-v1.png/);assert.match(samuraiCardArt(id),new RegExp(`data-samurai-card="${id}"`));
 if(CARD_EVOLUTIONS[id])assert.match(evolutionCardArt('samurai',id),/samurai-upgrades-v1.png/);else assert.equal(evolutionCardArt('samurai',id),'');assert.equal(evolutionCardArt('ninja',id),'');
 }
 assert.equal(CARD_EVOLUTIONS['dragon-slash'],undefined);assert.match(evolutionCardArt('samurai','health'),/common-evolutions-v1.png/);
});
