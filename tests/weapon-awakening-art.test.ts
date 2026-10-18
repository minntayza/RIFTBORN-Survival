import test from 'node:test';
import assert from 'node:assert/strict';
import {metalPixel,ELEMENT_COLORS} from '../src/weapon-awakening-art';
test('Metal effects preserve outlines, transparency, gold fittings and purple grips',()=>{
 assert.equal(metalPixel(190,200,210,255),true);
 assert.equal(metalPixel(40,130,150,255),true);
 for(const p of [[10,15,20,255],[180,190,200,0],[100,40,160,255],[240,180,45,255]])assert.equal(metalPixel(...p as [number,number,number,number]),false);
 assert.equal(new Set(Object.values(ELEMENT_COLORS).map(c=>c.join(','))).size,3);
});
