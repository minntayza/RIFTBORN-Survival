import test from 'node:test';
import assert from 'node:assert/strict';
import {campCamera} from '../src/last-camp-camera';
test('daily camera never exposes space beyond courtyard at edges or zoom levels',()=>{
 for(const [w,h] of [[1976,1100],[1280,720],[2560,1080],[390,844],[844,390],[300,700]])for(const view of [1,1.5,2])for(const x of [50,600,1150])for(const y of [-15,380,775]){
 const p=campCamera(w,h,view,x,y,600,380),hw=w/(2*p.zoom),hh=h/(2*p.zoom);
 assert.ok(p.x-hw>=-40-.00001);assert.ok(p.x+hw<=1240+.00001);assert.ok(p.y-hh>=-100-.00001);assert.ok(p.y+hh<=860+.00001);
 }
});
test('preserves requested zoom when it fits inside the artwork',()=>{assert.equal(campCamera(600,400,1,600,380,600,380).zoom,1.05);assert.equal(campCamera(600,400,2,600,380,600,380).zoom,.525);});

test('intermediate view uses proportional camera zoom',()=>{assert.ok(Math.abs(campCamera(600,400,1.5,600,380,600,380).zoom-.7)<1e-9);});
