import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ninjaSkinPortrait} from '../src/ninja-cosmetics';
import {MODERN_SHINOBI,MODERN_REGIONS} from '../src/modern-shinobi';
test('Modern Street Shinobi portrait uses the actual gameplay atlas and all five islands',()=>{
 const svg=ninjaSkinPortrait(MODERN_SHINOBI);assert.match(svg,/Modern Street Shinobi full-body/);
 for(const [x,y,w,h] of Object.values(MODERN_REGIONS)){assert.ok(svg.includes(`viewBox="0 0 ${w} ${h}"`));assert.ok(svg.includes(`x="${-x}" y="${-y}"`));}
 assert.match(svg,/data-modern-arm="0"/);assert.match(svg,/data-modern-arm="1"/);assert.match(svg,/modern-portrait-body/);assert.match(svg,/modern-portrait-leftLeg/);
 assert.ok(!svg.includes('viewBox="0 0 400 470"'));assert.ok(!svg.includes('1050 260 160 220'));
});
test('Ancient and Future outfits retain their own portrait assembly',()=>{
 for(const name of ['ancient','future']){const svg=ninjaSkinPortrait(`/assets/cosmetics/ninja-${name}.png`);assert.ok(!svg.includes('data-modern-arm'));assert.match(svg,/Ninja outfit illustration/);}
});
