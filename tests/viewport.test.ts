import test from 'node:test';
import assert from 'node:assert/strict';
import {observeGameViewport} from '../src/viewport';
test('viewport observer coalesces rotation, ignores hidden hosts, and removes listeners',()=>{
 const saved=new Map<string,PropertyDescriptor|undefined>();for(const key of ['window','ResizeObserver','requestAnimationFrame','cancelAnimationFrame'])saved.set(key,Object.getOwnPropertyDescriptor(globalThis,key));
 let callback=()=>{},queued:(()=>void)|undefined,disconnected=false,w=390,h=844;const windowEvents=new Map(),visualEvents=new Map(),calls:number[][]=[];
 Object.assign(globalThis,{window:{addEventListener:(k:string,v:unknown)=>windowEvents.set(k,v),removeEventListener:(k:string)=>windowEvents.delete(k),visualViewport:{addEventListener:(k:string,v:unknown)=>visualEvents.set(k,v),removeEventListener:(k:string)=>visualEvents.delete(k)}},ResizeObserver:class{constructor(cb:()=>void){callback=cb;}observe(){}disconnect(){disconnected=true;}},requestAnimationFrame:(cb:()=>void)=>{queued=cb;return 1;},cancelAnimationFrame:()=>{queued=undefined;}});
 try{const stop=observeGameViewport({getBoundingClientRect:()=>({width:w,height:h})} as HTMLElement,(x,y)=>calls.push([x,y]));queued!();assert.deepEqual(calls,[[390,844]]);w=844;h=390;callback();windowEvents.get('resize')();visualEvents.get('resize')();queued!();assert.deepEqual(calls,[[390,844],[844,390]]);callback();queued!();assert.equal(calls.length,2);h=0;callback();queued!();assert.equal(calls.length,2);stop();assert.ok(disconnected);assert.equal(windowEvents.size+visualEvents.size,0);}finally{for(const [key,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}
});
