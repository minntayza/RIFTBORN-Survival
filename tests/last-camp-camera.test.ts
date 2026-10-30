import test from 'node:test';
import assert from 'node:assert/strict';
import {campCamera} from '../src/last-camp-camera';
test('desktop and portrait daily cameras stay within the courtyard at every zoom',()=>{
 for(const [w,h] of [[1976,1100],[1280,720],[2560,1080],[390,844],[300,700]])for(const view of [1,1.5,2])for(const x of [50,600,1150])for(const y of [-15,380,775]){
 const p=campCamera(w,h,view,x,y,600,380),hw=w/(2*p.zoom),hh=h/(2*p.zoom);
 assert.ok(p.x-hw>=-40-.00001);assert.ok(p.x+hw<=1240+.00001);assert.ok(p.y-hh>=-100-.00001);assert.ok(p.y+hh<=860+.00001);
 }
});
test('compact landscape zoom is relative to a full courtyard at 1.5x',()=>{const base=400/960;assert.equal(campCamera(600,400,1.5,600,380,600,380).zoom,base);assert.equal(campCamera(600,400,1,600,380,600,380).zoom,base*1.5);assert.equal(campCamera(600,400,2,600,380,600,380).zoom,base*.75);});

test('intermediate view uses proportional camera zoom',()=>{assert.ok(Math.abs(campCamera(600,400,1.5,600,380,600,380).zoom-400/960)<1e-9);});

test('all daily view levels remain visibly distinct on large and mobile screens',()=>{
 for(const [w,h]of [[1710,1073],[932,430],[844,390],[390,844]]){
 const zoom=[1,1.5,2].map(v=>campCamera(w,h,v,600,520,600,380).zoom);
 assert.ok(zoom[0]>zoom[1]&&zoom[1]>zoom[2]);
 }
});

 test('landscape phone default includes every entrance and stays centered while moving',()=>{
 for(const [w,h] of [[932,430],[844,390],[667,375]])for(const [x,y] of [[600,520],[50,20],[1150,775]]){
  const p=campCamera(w,h,1.5,x,y,600,380),hw=w/(2*p.zoom),hh=h/(2*p.zoom);
  assert.equal(p.x,600);assert.equal(p.y,380);
  for(const gate of [{x:-40,y:380},{x:1240,y:380},{x:600,y:-100},{x:600,y:860}]){assert.ok(gate.x>=p.x-hw-.001&&gate.x<=p.x+hw+.001);assert.ok(gate.y>=p.y-hh-.001&&gate.y<=p.y+hh+.001);}
 }
});
