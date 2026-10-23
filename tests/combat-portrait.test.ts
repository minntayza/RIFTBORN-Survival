import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshSave} from '../src/save';
import {COSMETICS} from '../src/cosmetics';
import {combatPortrait} from '../src/combat-portrait';
import {artImage} from '../src/art';
import type {HeroId} from '../src/config';
test('HUD portrait follows all twelve equipped outfits, independently of weapon selection',()=>{
 const save=freshSave();
 for(const outfit of COSMETICS.filter(c=>c.kind==='character')){
  const hero=outfit.target as HeroId;save.cosmetics.equipped[`character:${hero}`]=outfit.id;
  const markup=combatPortrait(save,hero);assert.ok(markup.includes(outfit.asset!.replace('.png','')));assert.ok(markup.includes('class="art-image"'));
  save.cosmetics.equipped['weapon:katana']='weapon:katana:jade';assert.equal(combatPortrait(save,hero),markup);
  delete save.cosmetics.equipped[`character:${hero}`];assert.equal(combatPortrait(save,hero),artImage('hero',hero));
 }
 assert.equal(combatPortrait(save,'zawgyi'),artImage('hero','zawgyi'));
});
