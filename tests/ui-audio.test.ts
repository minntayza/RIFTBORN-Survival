import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioManager} from '../src/audio';
import {UI_SOUND_CUES,cueCooldown} from '../src/ui-audio';
test('reward and UI motifs are short, gentle and distinct',()=>{
 const signatures=new Set<string>();
 for(const [kind,notes] of Object.entries(UI_SOUND_CUES)){
  assert.ok(notes.length>0&&notes.length<=6,kind);assert.ok(Math.max(...notes.map(n=>n.at+n.duration))<1,kind);
  assert.ok(notes.every(n=>n.hz>50&&n.hz<2000&&n.gain>0&&n.gain<=.03),kind);signatures.add(JSON.stringify(notes));
 }
 assert.equal(signatures.size,Object.keys(UI_SOUND_CUES).length);assert.equal(cueCooldown('camp-warning'),5000);assert.ok(cueCooldown('skill-ready')>=650);
});
test('picking cancels pending reveal notes, and muting suppresses scheduled notes',t=>{
 t.mock.timers.enable({apis:['setTimeout']});let now=0;t.mock.method(performance,'now',()=>now);
 const audio=new AudioManager(),notes:number[]=[];audio.tone=hz=>{notes.push(hz);};
 audio.play('card-reveal');assert.deepEqual(notes,[587]);now=50;audio.play('card-pick');t.mock.timers.tick(1000);assert.deepEqual(notes,[587,294,880,1175]);
 now=2000;audio.play('evolution-reveal');const count=notes.length;audio.sound=false;t.mock.timers.tick(1000);assert.equal(notes.length,count);audio.play('reward-unlock');assert.equal(notes.length,count);
});
test('camp warning and skill ready cues cannot spam during repeated updates',t=>{
 t.mock.timers.enable({apis:['setTimeout']});let now=0;t.mock.method(performance,'now',()=>now);
 const audio=new AudioManager(),notes:number[]=[];audio.tone=hz=>{notes.push(hz);};
 for(let i=0;i<20;i++){now=i*20;audio.play('camp-warning');}t.mock.timers.tick(1000);assert.deepEqual(notes,[294,262]);
 notes.length=0;now=1000;for(let i=0;i<10;i++)audio.play('skill-ready');t.mock.timers.tick(1000);assert.deepEqual(notes,[880,1175]);
});
