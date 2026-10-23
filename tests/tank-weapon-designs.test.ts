import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {COSMETICS,buyCosmetic,equipCosmetic,equippedSkin,equippedWeaponSkin} from '../src/cosmetics';
import {freshSave,validateSave} from '../src/save';
import {TANK_WEAPON_THEMES,TANK_DESIGN_WEAPONS,tankWeaponDesign,tankWeaponSetAsset} from '../src/tank-weapon-designs';
test('all nine owned Tank weapons resolve to the right theme and an isolated atlas cell',()=>{
 for(const [i,theme] of TANK_WEAPON_THEMES.entries())for(const id of TANK_DESIGN_WEAPONS){
  const c=COSMETICS.find(c=>c.id===`weapon:${id}:${['sakura','jade','starlight'][i]}`)!;
  assert.equal(c.asset,tankWeaponSetAsset(theme));assert.ok(existsSync(`public${c.asset}`));
  const {draw,grip,crop,cell}=tankWeaponDesign(theme,id);
  assert.equal(cell,TANK_DESIGN_WEAPONS.indexOf(id));assert.ok(draw.x>0&&draw.y>0&&draw.x+draw.w<128&&draw.y+draw.h<128);
  assert.ok(Math.abs(draw.w/draw.h-crop[2]/crop[3])<1e-8);
  assert.ok(Math.abs(draw.x+grip.x*draw.w-64)<1e-8&&Math.abs(draw.y+grip.y*draw.h-64)<1e-8);
 }
});
test('new Tank weapon art preserves old purchases, selections and independent outfit choices',()=>{
 const s=freshSave();s.heroes.push('tank');s.weapons.push('hammer','shield','spiked');
 buyCosmetic(s,'character:tank:jade');equipCosmetic(s,'character:tank:jade');const outfit=equippedSkin(s,'tank');
 for(const id of TANK_DESIGN_WEAPONS)for(const finish of ['sakura','jade','starlight']){
  const key=`weapon:${id}:${finish}`;buyCosmetic(s,key);assert.ok(equipCosmetic(s,key));assert.equal(equippedSkin(s,'tank'),outfit);
  const restored=validateSave(JSON.parse(JSON.stringify(s)));assert.ok(restored.cosmetics.owned.includes(key));assert.equal(restored.cosmetics.equipped[`weapon:${id}`],key);assert.equal(equippedWeaponSkin(restored,id),equippedWeaponSkin(s,id));
 }
 const selected={...s.cosmetics.equipped};buyCosmetic(s,'character:tank:starlight');equipCosmetic(s,'character:tank:starlight');for(const id of TANK_DESIGN_WEAPONS)assert.equal(s.cosmetics.equipped[`weapon:${id}`],selected[`weapon:${id}`]);
});
