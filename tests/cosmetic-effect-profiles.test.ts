import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshSave} from '../src/save';
import {COSMETICS} from '../src/cosmetics';
import {WEAPONS,type WeaponId} from '../src/config';
import {cosmeticEffectProfile} from '../src/cosmetic-effect-profiles';
test('all 36 cosmetic weapons have profiles; twelve sets have distinct motifs',()=>{const s=freshSave(),motifs=new Set<string>();const weapons=COSMETICS.filter(c=>c.kind==='weapon');assert.equal(weapons.length,36);for(const c of weapons){s.cosmetics.owned.push(c.id);s.cosmetics.equipped[`weapon:${c.target}`]=c.id;const p=cosmeticEffectProfile(s,c.target as WeaponId);assert.ok(p,c.name);assert.equal(p.id,c.id);motifs.add(p.motif);}assert.equal(motifs.size,12);});
test('default, unowned and wrong-weapon selections have no cosmetic effects',()=>{const s=freshSave();assert.equal(cosmeticEffectProfile(s,'katana'),undefined);s.cosmetics.equipped['weapon:katana']='weapon:katana:jade';assert.equal(cosmeticEffectProfile(s,'katana'),undefined);s.cosmetics.owned.push('weapon:dual:jade');s.cosmetics.equipped['weapon:katana']='weapon:dual:jade';assert.equal(cosmeticEffectProfile(s,'katana'),undefined);});
test('profile selection never mutates combat stats, ownership, or save data',()=>{const s=freshSave();s.cosmetics.owned.push('weapon:hammer:jade');s.cosmetics.equipped['weapon:hammer']='weapon:hammer:jade';const before=JSON.stringify(s),weapons=JSON.stringify(WEAPONS);for(let i=0;i<100;i++)assert.equal(cosmeticEffectProfile(s,'hammer')?.motif,'rune');assert.equal(JSON.stringify(s),before);assert.equal(JSON.stringify(WEAPONS),weapons);});
