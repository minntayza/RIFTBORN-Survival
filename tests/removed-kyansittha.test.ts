import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HEROES,WEAPONS} from '../src/config';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {freshSave,validateSave,purchase} from '../src/save';
import {dailySetup} from '../src/retention';
test('retired character, weapons, upgrades and evolutions are absent from game catalogs',()=>{
 assert.equal(Object.hasOwn(HEROES,'kyansittha'),false);
 for(const id of ['arindamaspear','baganpike','royallance'])assert.equal(Object.hasOwn(WEAPONS,id),false);
 assert.equal(UPGRADES.some(u=>u.hero==='kyansittha'),false);
 for(const id of ['arindamapower','royalguard','spearwhirl','baganvalour','thunderthrust'])assert.equal(Object.hasOwn(CARD_EVOLUTIONS,id),false);
 const s=freshSave();s.gold=9999;assert.equal(purchase(s,'heroes','kyansittha'),false);assert.equal(purchase(s,'weapons','arindamaspear'),false);
});
test('legacy equipped character falls back safely while preserving unrelated progress',()=>{
 const s=freshSave();s.hero='kyansittha';s.weapon='arindamaspear';s.heroes.push('kyansittha','samurai');s.weapons.push('arindamaspear','baganpike','royallance');s.gold=321;s.petals=45;s.bestClearedWave=12;
 const next=validateSave(s);assert.equal(next.hero,'ninja');assert.equal(next.weapon,'katana');assert.ok(next.heroes.includes('samurai'));assert.equal(next.heroes.includes('kyansittha'),false);assert.ok(!next.weapons.some(w=>['arindamaspear','baganpike','royallance'].includes(w)));assert.equal(next.gold,321);assert.equal(next.petals,45);assert.equal(next.bestClearedWave,12);
});
test('daily challenge rotation only selects active survivors and weapons',()=>{
 for(let day=1;day<=90;day++){const date=new Date(Date.UTC(2026,0,day)).toISOString().slice(0,10),setup=dailySetup(date);assert.notEqual(setup.hero,'kyansittha');assert.ok(Object.hasOwn(HEROES,setup.hero!));assert.ok(Object.hasOwn(WEAPONS,setup.weapon!));}
});
