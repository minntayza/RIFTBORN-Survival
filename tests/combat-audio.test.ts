import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {ATTACK_VOICES,combatVoice,voicePitch} from '../src/combat-audio';
import {HEROES,WEAPONS} from '../src/config';
test('all active weapons have a bounded physical attack and every survivor has a distinct contact',()=>{
 for(const [id,weapon] of Object.entries(WEAPONS)){
  const cue=weapon.hero==='zawgyi'?'staff-swish':weapon.hero==='pyusawhti'?'bow-release':id;
  const p=ATTACK_VOICES[cue];assert.ok(p,id);assert.ok(p.duration>=.04&&p.duration<=.25,id);assert.ok(p.gain>0&&p.gain<=.05,id);assert.ok(p.body>25&&p.air>p.body,id);
 }
 const contacts=Object.keys(HEROES).map(hero=>combatVoice('hit',hero));assert.equal(new Set(contacts.map(p=>JSON.stringify(p))).size,Object.keys(HEROES).length);
 assert.equal(combatVoice('xp','ninja'),undefined);
});
test('three variations repeat predictably without extreme pitch shifts',()=>{
 assert.equal(new Set([0,1,2].map(voicePitch)).size,3);for(let i=0;i<12;i++){assert.equal(voicePitch(i),voicePitch(i%3));assert.ok(voicePitch(i)>.9&&voicePitch(i)<1.1);}
});
test('original music is shipped locally and replaces the previous preview',()=>{
 assert.ok(existsSync('public/audio/riftborn-last-light-v1.mp3'));
 const source=readFileSync('src/music-preview.ts','utf8');assert.ok(source.includes('/audio/riftborn-last-light-v1.mp3'));assert.ok(!source.includes('/audio/across-the-ridge-preview.mp3'));assert.ok(source.includes('track.loop = true'));
});
