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

test('iPhone and iPad browsers get installation guidance, Android stays on native fullscreen',async()=>{
 const {isIOSDevice}=await import('../src/fullscreen');
 assert.ok(isIOSDevice({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/130 Mobile',platform:'iPhone',maxTouchPoints:5}));
 assert.ok(isIOSDevice({userAgent:'Macintosh',platform:'MacIntel',maxTouchPoints:5}));
 assert.equal(isIOSDevice({userAgent:'Android Chrome',platform:'Linux',maxTouchPoints:5}),false);
 assert.equal(isIOSDevice({userAgent:'Macintosh',platform:'MacIntel',maxTouchPoints:0}),false);
});
test('home screen launch has a manifest and Apple standalone metadata',async()=>{
 const {readFileSync,existsSync}=await import('node:fs');const index=readFileSync('index.html','utf8'),manifest=JSON.parse(readFileSync('public/manifest.webmanifest','utf8'));
 assert.match(index,/apple-mobile-web-app-capable" content="yes/);assert.match(index,/manifest.webmanifest/);assert.equal(manifest.display,'standalone');assert.equal(manifest.orientation,'landscape');for(const icon of manifest.icons)assert.ok(existsSync('public'+icon.src));
});
