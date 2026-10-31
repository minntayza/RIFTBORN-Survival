import test from 'node:test';
import assert from 'node:assert/strict';
import {campCamera} from '../src/last-camp-camera';
test('daily map fills desktop and mobile viewports without blank margins at every zoom',()=>{
 for(const [w,h] of [[1976,1100],[1280,720],[2560,1080],[390,844],[300,700],[932,430],[844,390],[667,375]])for(const view of [1,1.5,2])for(const x of [50,600,1150])for(const y of [-15,380,775]){
 const p=campCamera(w,h,view,x,y,600,380),hw=w/(2*p.zoom),hh=h/(2*p.zoom);
 assert.ok(p.x-hw>=-40-.00001);assert.ok(p.x+hw<=1240+.00001);assert.ok(p.y-hh>=-100-.00001);assert.ok(p.y+hh<=860+.00001);
 }
});
test('intermediate daily view uses proportional zoom while covering the screen',()=>{assert.ok(Math.abs(campCamera(600,400,1.5,600,380,600,380).zoom-.7)<1e-9);});

test('all daily view levels remain visibly distinct on large and mobile screens',()=>{
 for(const [w,h]of [[1710,1073],[932,430],[844,390],[390,844]]){
 const zoom=[1,1.5,2].map(v=>campCamera(w,h,v,600,520,600,380).zoom);
 assert.ok(zoom[0]>zoom[1]&&zoom[1]>zoom[2]);
 }
});

test('mobile camera follows movement toward the entrance paths while keeping map edges covered',()=>{
 for(const [w,h] of [[932,430],[844,390],[667,375]]){
  const center=campCamera(w,h,1.5,600,380,600,380),south=campCamera(w,h,1.5,600,775,600,380),north=campCamera(w,h,1.5,600,-15,600,380);
  assert.ok(south.y>center.y);assert.ok(north.y<center.y);
 }
});
