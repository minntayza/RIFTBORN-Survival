import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CampGuardian} from '../src/camp-guardian';
test('guardian selects nearest supplied attacker, waits 1.5s and damages on arrival once',()=>{
 const g=new CampGuardian(0,0),near={active:true,hp:100,x:30,y:0},far={active:true,hp:100,x:200,y:0};
 const hit=(e:typeof near,d:number)=>e.hp-=d;
 g.update(.01,0,0,[near,far],hit);assert.equal(g.shots.length,0);
 g.update(.01,.01,1,[far,near],hit);assert.equal(g.shots[0].target,near);assert.equal(near.hp,100);
 g.update(.2,.21,1,[near,far],hit);assert.equal(near.hp,88);assert.equal(g.shots.length,0);
 g.update(.2,.41,1,[near,far],hit);assert.equal(near.hp,88);assert.equal(g.shots.length,0);
 g.update(1.2,1.61,2,[near,far],hit);assert.equal(g.shots[0].damage,20);
});
test('guardian ignores dead and distant targets, and cancels seeds whose target dies',()=>{
 const g=new CampGuardian(0,0),e={active:true,hp:10,x:400,y:0};let hits=0;
 g.update(.1,0,1,[e],()=>hits++);assert.equal(g.shots.length,0);
 e.x=40;g.update(.1,.1,1,[e],()=>hits++);assert.equal(g.shots.length,1);
 e.active=false;g.update(1,1.1,1,[e],()=>hits++);assert.equal(hits,0);assert.equal(g.shots.length,0);
});
