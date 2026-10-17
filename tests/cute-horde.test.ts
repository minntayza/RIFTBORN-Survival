import test from 'node:test';
import assert from 'node:assert/strict';
import {HORDE_IDS,hordePose,isCuteHorde,rifleHandPose} from '../src/cute-horde';
test('all six horde upper bodies stay fixed throughout walking',()=>{for(const id of HORDE_IDS){const rest=hordePose(id,0);for(let i=0;i<24;i++)assert.deepEqual(hordePose(id,i/24).body,rest.body);assert.notDeepEqual(hordePose(id,.25).legs,rest.legs);assert.equal(rest.legs.length,id==='runner'?4:2);assert.ok(isCuteHorde(id));}assert.equal(isCuteHorde('boss'),false);});
test('dog moves diagonal leg pairs together',()=>{const {legs}=hordePose('runner',.25);assert.equal(legs[0].angle,legs[3].angle);assert.equal(legs[1].angle,legs[2].angle);assert.equal(legs[0].angle,-legs[1].angle);});

test('rifle hands remain fixed and recoil only on firing without moving upper body',()=>{assert.deepEqual(rifleHandPose(),{x:64,y:73,angle:0});assert.ok(rifleHandPose(.5).x<64);assert.ok(rifleHandPose(.5,-1).x>64);assert.equal(rifleHandPose(.5).angle,0);});
