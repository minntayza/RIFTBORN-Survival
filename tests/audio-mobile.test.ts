import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioManager} from '../src/audio';
import {CombatHaptics} from '../src/haptics';
test('mobile effects request playback routing and resume interrupted audio without new contexts',()=>{
 const saved=Object.getOwnPropertyDescriptors(globalThis);let resumes=0,created=0;const session={type:'auto'};
 class Context {state='suspended';constructor(){created++;}resume(){resumes++;this.state='running';return Promise.resolve();}}
 try{
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{audioSession:session}});
  Object.defineProperty(globalThis,'AudioContext',{configurable:true,value:Context});
  Object.defineProperty(globalThis,'window',{configurable:true,value:{setInterval:()=>1}});
  const a=new AudioManager();a.unlock();assert.equal(session.type,'playback');assert.equal(resumes,1);a.unlock();assert.equal(resumes,1);assert.equal(created,1);
  (a.context as unknown as Context).state='interrupted';a.unlock();assert.equal(resumes,2);assert.equal(created,1);
 }finally{for(const key of ['navigator','AudioContext','window']){if(saved[key])Object.defineProperty(globalThis,key,saved[key]);else Reflect.deleteProperty(globalThis,key);}}
});
test('hit haptics are bounded, optional, and safe on unsupported phones',()=>{
 const old=Object.getOwnPropertyDescriptor(globalThis,'navigator');const pulses:number[]=[];
 try{
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{}});const h=new CombatHaptics();assert.equal(h.pulse('hit',0),false);
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{vibrate:(n:number)=>{pulses.push(n);return true;}}});
  assert.equal(h.pulse('katana',0),false);assert.equal(h.pulse('hit',0),true);assert.equal(h.pulse('hit',50),false);assert.equal(h.pulse('critical',120),true);h.enabled=false;assert.equal(h.pulse('hurt',300),false);assert.deepEqual(pulses,[10,24]);
  const a=new AudioManager();a.sound=false;let contacts=0;a.haptics.pulse=()=>{contacts++;return true;};a.play('hit');assert.equal(contacts,1);
 }finally{if(old)Object.defineProperty(globalThis,'navigator',old);else Reflect.deleteProperty(globalThis,'navigator');}
});
