import test from 'node:test';
import assert from 'node:assert/strict';
import {freshSave,validateSave,purchase,compatible} from '../src/save';
import {ZAWGYI_SKILLS,validZawgyiLoadout,replaceZawgyiSkill,type ZawgyiLoadout} from '../src/zawgyi';
import {upgradeChoices} from '../src/upgrades';
import {seededRandom} from '../src/retention';

test('old saves receive two valid arts and Zawgyi’s starter staff',()=>{const s=validateSave({version:1,heroes:['ninja'],gold:75});assert.deepEqual(s.zawgyiSkills,['datlone','flame']);assert.ok(s.weapons.includes('mysticstaff'));assert.equal(s.gold,75);assert.equal(s.hero,'ninja');});
test('buying Zawgyi equips a compatible owned staff and survives reload validation',()=>{const s=freshSave();s.gold=1400;assert.ok(purchase(s,'heroes','zawgyi'));s.hero='zawgyi';s.weapon='mysticstaff';s.zawgyiSkills=['slam','flame'];const restored=validateSave(JSON.parse(JSON.stringify(s)));assert.equal(restored.hero,'zawgyi');assert.equal(restored.weapon,'mysticstaff');assert.deepEqual(restored.zawgyiSkills,['slam','flame']);assert.equal(compatible('ninja','mysticstaff'),false);});
test('all six ordered pairs work; duplicates and invalid pairs fall back safely',()=>{const ids=Object.keys(ZAWGYI_SKILLS);for(const a of ids)for(const b of ids)if(a!==b)assert.deepEqual(validZawgyiLoadout([a,b]),[a,b]);for(const invalid of [null,[],['datlone'],['datlone','datlone'],['nope','slam'],['__proto__','slam']])assert.deepEqual(validZawgyiLoadout(invalid),['datlone','flame']);});
test('changing either slot swaps an existing skill instead of duplicating it',()=>{assert.deepEqual(replaceZawgyiSkill(['datlone','flame'],0,'flame'),['flame','datlone']);assert.deepEqual(replaceZawgyiSkill(['datlone','flame'],1,'slam'),['datlone','slam']);});
test('Zawgyi receives three distinct applicable level-up choices',()=>{for(let seed=1;seed<20;seed++){const choices=upgradeChoices('zawgyi',{},seededRandom(seed),'mysticstaff');assert.equal(choices.length,3);assert.equal(new Set(choices.map(c=>c.id)).size,3);assert.ok(choices.every(c=>!c.hero||c.hero==='zawgyi'));}});

test('earlier Zawgyi skill selections migrate to the new arts without losing their order',()=>{assert.deepEqual(validZawgyiLoadout(['staff','leap']),['datlone','flame']);assert.deepEqual(validZawgyiLoadout(['bloom','staff']),['slam','datlone']);});
