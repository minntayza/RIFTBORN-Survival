import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioManager} from '../src/audio';
test('echo answers crescent at a higher pitch and mute suppresses all skill accents',()=>{
 const audio=new AudioManager(),notes:{frequency:number;duration:number;volume:number}[]=[];
 audio.tone=(frequency,duration=.1,volume=.06)=>{notes.push({frequency,duration,volume});};
 audio.play('crescent-cut');audio.play('echo-slash');
 assert.equal(notes.length,2);assert.ok(notes[1].frequency>notes[0].frequency);
 assert.ok(notes.every(n=>n.duration<=.15&&n.volume<.045));
 audio.sound=false;for(const kind of ['crescent-cut','echo-slash','keen-hit'])audio.play(kind);
 assert.equal(notes.length,2);
});

test('Ninja ultimate has a gentle two-note signature and respects mute',()=>{
 const audio=new AudioManager(),notes:number[]=[];
 audio.tone=frequency=>{notes.push(frequency);};
 audio.play('moon-dash');assert.deepEqual(notes,[880,1320]);
 audio.sound=false;audio.play('moon-dash');assert.equal(notes.length,2);
});
test('Samurai guard, successful counter, dragon and storm have distinct quiet cues and respect mute',()=>{
 const audio=new AudioManager(),notes:{frequency:number;volume:number}[]=[];
 audio.tone=(frequency,_duration=.1,volume=.06)=>{notes.push({frequency,volume});};
 audio.play('lotus-guard');const guard=notes[0].frequency;notes.length=0;
 audio.play('lotus-counter');assert.ok(notes[0].frequency>guard);notes.length=0;
 audio.play('dragon-slash');assert.ok(notes[0].frequency<guard);assert.ok(notes.every(n=>n.volume<=.032));
 audio.sound=false;const count=notes.length;for(const kind of ['lotus-guard','lotus-counter','dragon-slash','storm-blade'])audio.play(kind);assert.equal(notes.length,count);
});

test('Gunner reload completion has a bright gentle cue and all new accents obey mute',()=>{
 const audio=new AudioManager(),notes:{frequency:number;volume:number}[]=[];
 audio.tone=(frequency,_duration=.1,volume=.06)=>{notes.push({frequency,volume});};
 audio.play('reload-swish');const loading=notes[0].frequency;notes.length=0;audio.play('reload-pop');assert.ok(notes[0].frequency>loading);assert.ok(notes.every(n=>n.volume<=.03));
 audio.sound=false;const count=notes.length;for(const kind of ['reload-swish','reload-pop','ricochet-chime','verdict-pop'])audio.play(kind);assert.equal(notes.length,count);
});

test('Tank bonks, blocks and reflected shots have distinct gentle pitches and respect mute',()=>{
 const audio=new AudioManager(),notes:{frequency:number;volume:number}[]=[];
 audio.tone=(frequency,_duration=.1,volume=.06)=>{notes.push({frequency,volume});};
 for(const kind of ['tank-bonk','tank-thump','tank-block','tank-return','tank-slam'])audio.play(kind);
 assert.ok(new Set(notes.map(n=>n.frequency)).size>=5);assert.ok(notes.every(n=>n.volume<=.03));
 audio.sound=false;const count=notes.length;for(const kind of ['tank-bonk','tank-thump','tank-block','tank-return','tank-slam'])audio.play(kind);assert.equal(notes.length,count);
});
