import {test} from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {upgradeVisual} from '../src/upgrade-ui';
import {evolutionCardArt} from '../src/evolution-art';
import {zawgyiCardArt} from '../src/zawgyi-card-art';
test('five Zawgyi cards use one illustrated set and existing evolutions retain their motifs',()=>{
 for(const id of ['twindatlone','lotusflame','earthshaker','elixir','celestial']){const u=UPGRADES.find(u=>u.id===id)!;assert.match(upgradeVisual(u,'zawgyi','mysticstaff'),/zawgyi-upgrades-v4.png/);assert.match(zawgyiCardArt(id),new RegExp(`data-zawgyi-card="${id}"`));
 if(CARD_EVOLUTIONS[id])assert.match(evolutionCardArt('zawgyi',id),/zawgyi-upgrades-v4.png/);else assert.equal(evolutionCardArt('zawgyi',id),'');
 }
 assert.equal(CARD_EVOLUTIONS.earthshaker,undefined);assert.equal(CARD_EVOLUTIONS.elixir,undefined);
 assert.match(evolutionCardArt('zawgyi','health'),/common-evolutions-v1.png/);assert.equal(evolutionCardArt('ninja','celestial'),'');
});
