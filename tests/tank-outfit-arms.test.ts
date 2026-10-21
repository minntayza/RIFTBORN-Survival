import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tankOutfitArmPose,tankSkinPortrait} from '../src/tank-cosmetics';
import {connectedArmRegion} from '../src/connected-arms';
import {TANK_SKINS} from '../src/cosmetics';
test('Tank cosmetic arms share standard shoulder and grip anchors',()=>{for(const side of [0,1]){const p=tankOutfitArmPose(side),region=connectedArmRegion('tank',side);assert.equal(region[2],160);assert.equal(region[3],235);const localX=((side===0?.4:.6)-p.originX)*p.width,localY=(.88-p.originY)*p.height;const grip={x:p.x+localX*Math.cos(p.rotation)-localY*Math.sin(p.rotation),y:p.y+localX*Math.sin(p.rotation)+localY*Math.cos(p.rotation)};assert.ok(Math.abs(grip.x-(side===0?93:35))<.001);assert.ok(Math.abs(grip.y-84)<.001);assert.equal(p.y,49);assert.ok(p.height<50);}});
test('each Tank outfit portrait draws exactly two complete connected arms',()=>{for(const skin of Object.values(TANK_SKINS)){const svg=tankSkinPortrait(skin.asset);assert.equal((svg.match(/data-outfit-arm=/g)||[]).length,2);assert.ok(svg.includes('data-outfit-arm="0"'));assert.ok(svg.includes('data-outfit-arm="1"'));}});
