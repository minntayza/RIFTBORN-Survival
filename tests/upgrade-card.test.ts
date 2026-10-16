import test from 'node:test';
import assert from 'node:assert/strict';
import {visualUpgradeCard} from '../src/upgrade-ui';
import {UPGRADES} from '../src/upgrades';
import {HEROES,WEAPONS,type HeroId,type WeaponId} from '../src/config';
import {artImage,heroFigureImage} from '../src/art';
test('four explanatory cards use the selected hero and compatible equipped weapon with real level values',()=>{
 for(const hero of Object.keys(HEROES) as HeroId[]){
  const weapon=Object.keys(WEAPONS).find(w=>WEAPONS[w as WeaponId].hero===hero) as WeaponId;
  for(const id of ['pierce','wide','health','regen']){
   const u=UPGRADES.find(u=>u.id===id)!,html=visualUpgradeCard(u,2,hero,weapon,2);
   assert.ok(html.includes(heroFigureImage(hero)));assert.match(html,/LEVEL 2/);assert.match(html,/→<\/span> 3/);assert.match(html,/data-action="upgrade:2"/);assert.match(html,/explain-card/);
   if(['pierce','wide'].includes(id))assert.ok(html.includes(artImage('weapon',weapon)));
   assert.ok(!html.includes('choice-stars'));
  }
 }
 const regeneration=visualUpgradeCard(UPGRADES.find(u=>u.id==='regen')!,0,'tank','hammer',2);assert.match(regeneration,/3 HP\/sec/);
});
