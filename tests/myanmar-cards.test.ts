import test from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES,upgradeChoices} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {myanmarCardArt} from '../src/myanmar-card-art';
import {seededRandom} from '../src/retention';
import {upgradeValues,upgradeVisual,cardBenefit} from '../src/upgrade-ui';
import {WEAPONS,type HeroId,type WeaponId} from '../src/config';
import {isLethweiWeapon,meleeContact,weaponPose} from '../src/weapon-effects';

const defaultHeroWeapon: Record<HeroId, WeaponId> = {
 pyusawhti: 'aungzeyabow',
 lethwei: 'hempwraps',
 kyansittha: 'arindamaspear',
 ninja: 'katana',
 samurai: 'nodachi',
 gunner: 'pistols',
 tank: 'shield',
 zawgyi: 'mysticstaff'
};

test('pyusawhti, lethwei, and kyansittha each have 5 unique cards and evolutions',()=>{
 const myanmarHeroes: HeroId[] = ['pyusawhti','lethwei','kyansittha'];
 for(const hero of myanmarHeroes){
  const cards = UPGRADES.filter(u=>u.hero===hero);
  assert.equal(cards.length, 5, `${hero} should have exactly 5 signature cards`);
  for(const c of cards){
   assert.equal(c.max, 3, `${c.id} should have max 3 levels`);
   const evo = CARD_EVOLUTIONS[c.id];
   assert.ok(evo, `Evolution must exist for ${c.id}`);
   assert.ok(evo.name.length > 0, `Evolution name required for ${c.id}`);
   assert.ok(evo.effect.length > 0, `Evolution effect required for ${c.id}`);
   
   const art = myanmarCardArt(c.id);
   assert.ok(art.includes('<svg'), `SVG art must exist for ${c.id}`);

   const vals = upgradeValues(c, 0);
   assert.notEqual(vals.after, 'UNLOCKED');

   const benefit = cardBenefit(c);
   assert.ok(benefit.length > 0 && benefit.length < 65, `cardBenefit must fit card UI for ${c.id}`);

   const vis = upgradeVisual(c, hero, defaultHeroWeapon[hero]);
   assert.ok(vis.includes('data:image/svg+xml') || vis.includes('<svg'), `Visual must render for ${c.id}`);
  }
 }
});

test('level-up choices for pyusawhti, lethwei, and kyansittha offer signature cards without crashing',()=>{
 const myanmarHeroes: HeroId[] = ['pyusawhti','lethwei','kyansittha'];
 for(const hero of myanmarHeroes){
  for(let seed=0;seed<20;seed++){
   const choices = upgradeChoices(hero, {}, seededRandom(seed), defaultHeroWeapon[hero], 1, {});
   assert.equal(choices.length, 3, `Should offer 3 choices for ${hero}`);
   assert.ok(choices.some(u=>u.hero===hero), `Should include a signature card in early choices for ${hero}`);
  }
 }
});

test('myanmar hero cards are exclusive and never offered to other classes',()=>{
 const nonMyanmarHeroes: HeroId[] = ['ninja','samurai','gunner','tank','zawgyi'];
 const myanmarHeroSet = new Set(['pyusawhti','lethwei','kyansittha']);
 for(const hero of nonMyanmarHeroes){
  for(let seed=0;seed<25;seed++){
   const choices = upgradeChoices(hero, {}, seededRandom(seed));
   assert.ok(choices.every(u=>!u.hero || !myanmarHeroSet.has(u.hero)), `No Myanmar cards offered to ${hero}`);
  }
 }
});

test('lethwei master weapons have extended attack reach and punch forward extension',()=>{
 for(const id of ['hempwraps','ironwraps','tigerwraps'] as const){
  assert.ok(isLethweiWeapon(id));
  assert.ok(WEAPONS[id].range >= 120, `${id} range must be at least 120 for comfortable gameplay`);
  // Forward punch extension check
  const rest = weaponPose(id, 0, 0, 0, 0, false);
  const strike = weaponPose(id, 0, 0, 0, 0.5, true);
  assert.ok(strike.tip.x > rest.tip.x + 20, `${id} must lunge forward during strike`);
  // Hits zombie at 75px distance comfortably
  assert.equal(meleeContact(id, 0, 0, 0, {x: 75, y: 0}, 14), true, `${id} should hit enemy at 75px distance`);
 }
});
