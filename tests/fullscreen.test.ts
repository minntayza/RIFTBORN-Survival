import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canGameFullscreen,enterGameFullscreen,isGameFullscreen,toggleGameFullscreen} from '../src/fullscreen';
test('fullscreen enters the document root, exits, and does not repeat entry',async()=>{
 let calls=0;const d:any={fullscreenElement:null,documentElement:{async requestFullscreen(){calls++;assert.equal(this,d.documentElement);d.fullscreenElement=this;}},async exitFullscreen(){assert.equal(this,d);d.fullscreenElement=null;}};
 assert.ok(canGameFullscreen(d));assert.ok(await enterGameFullscreen(d));assert.ok(isGameFullscreen(d));assert.ok(await enterGameFullscreen(d));assert.equal(calls,1);assert.ok(await toggleGameFullscreen(d));assert.equal(isGameFullscreen(d),false);
});
test('older WebKit fullscreen API is supported',async()=>{
 const d:any={webkitFullscreenElement:null,documentElement:{webkitRequestFullscreen(){d.webkitFullscreenElement=this;}},webkitExitFullscreen(){d.webkitFullscreenElement=null;}};
 assert.ok(await enterGameFullscreen(d));assert.ok(isGameFullscreen(d));assert.ok(await toggleGameFullscreen(d));assert.equal(isGameFullscreen(d),false);
});
test('unsupported and blocked fullscreen gracefully return without a false active state',async()=>{
 const unsupported:any={documentElement:{}};assert.equal(canGameFullscreen(unsupported),false);assert.equal(await enterGameFullscreen(unsupported),false);
 const blocked:any={documentElement:{async requestFullscreen(){throw new Error('permission denied');}}};assert.equal(await enterGameFullscreen(blocked),false);assert.equal(isGameFullscreen(blocked),false);
});
