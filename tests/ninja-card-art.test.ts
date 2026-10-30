import {test} from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {upgradeVisual} from '../src/upgrade-ui';
import {evolutionCardArt} from '../src/evolution-art';
import {ninjaCardArt} from '../src/ninja-card-art';
test('all five Ninja unique cards use one consistent illustrated set',()=>{
 for(const id of ['wide','double','trail','clone','smoke']){const u=UPGRADES.find(u=>u.id===id)!;assert.match(upgradeVisual(u,'ninja','katana'),/ninja-upgrades-v1.png/);assert.match(ninjaCardArt(id),new RegExp(`data-ninja-card="${id}"`));}
});
test('existing Ninja evolutions share their base motifs without changing other hero artwork',()=>{
 for(const id of ['wide','double','trail','clone']){assert.ok(CARD_EVOLUTIONS[id]);assert.match(evolutionCardArt('ninja',id),/ninja-upgrades-v1.png/);assert.equal(evolutionCardArt('samurai',id),'');}
 assert.equal(ninjaCardArt('smoke',true),'');assert.equal(CARD_EVOLUTIONS.smoke,undefined);
 assert.match(evolutionCardArt('ninja','health'),/common-evolutions-v1.png/);
});
