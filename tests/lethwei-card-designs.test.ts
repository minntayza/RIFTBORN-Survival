import {test} from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {upgradeVisual} from '../src/upgrade-ui';
import {evolutionCardArt} from '../src/evolution-art';
import {lethweiCardArt} from '../src/lethwei-card-art';
test('all five Lethwei unique cards and evolutions use their matched illustrated set',()=>{
 for(const id of ['nineweapons','ironshins','headbutt','ringmaster','goldenbelt']){const u=UPGRADES.find(u=>u.id===id)!;
 assert.match(upgradeVisual(u,'lethwei','hempwraps'),/lethwei-upgrades-v3.png/);
 assert.match(evolutionCardArt('lethwei',id),/lethwei-upgrades-v3.png/);
 assert.match(lethweiCardArt(id),new RegExp(`data-lethwei-card="${id}"`));assert.ok(CARD_EVOLUTIONS[id]);
 assert.equal(evolutionCardArt('ninja',id),'');
 }
 assert.match(evolutionCardArt('lethwei','health'),/common-evolutions-v1.png/);
 assert.equal(lethweiCardArt('arrowstorm'),'');
});
