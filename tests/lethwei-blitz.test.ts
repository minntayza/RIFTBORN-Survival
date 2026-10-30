import test from 'node:test';
import assert from 'node:assert/strict';
import {LethweiCombat} from '../src/lethwei-combat';
import type {ArenaScene} from '../src/combat';
test('Blitz has three deliberate contacts independent of frame rate and can be cleared',()=>{
 for(const dt of [1/30,1/60,1/120]){
  const hits:number[]=[];const graphics={setDepth(){return this;}};
  const scene={save:{lethweiSkills:['blitz','lethweiring']},hero:'lethwei',paused:false,ended:false,countdown:0,options:{},angle:0,x:0,y:0,weapon:'hempwraps',attackSequence:0,
   add:{graphics:()=>graphics},u:()=>0,evolved:()=>false,protect:()=>{},audio:{play:()=>{}},notifyCombat:()=>{},burst:()=>{},
   moveOnGround:(x:number,y:number,dx:number,dy:number)=>({x:x+dx,y:y+dy}),enemies:[{active:true,x:0,y:0,r:1000,stagger:0}],hit:(_:unknown,d:number)=>hits.push(d)} as unknown as ArenaScene;
  const combat=new LethweiCombat(scene);assert.ok(combat.activate(0,1,0));assert.ok(Math.abs(combat.blitzTime-.54/1.3)<1e-8);
  for(let t=0;t<.7;t+=dt)combat.update(dt);
  assert.equal(hits.length,3);assert.ok(hits[2]>hits[0]);assert.ok(Math.abs(scene.x-145)<.001);
  combat.clear();assert.equal(combat.blitzTime,0);
 }
});
test('Iron Chin keeps mitigation and reflection, and expires cleanly',()=>{
 const hits:number[]=[];const graphics={setDepth(){return this;}};
 const scene={save:{lethweiSkills:['ironchin','blitz']},hero:'lethwei',paused:false,ended:false,countdown:0,options:{},angle:0,x:0,y:0,hp:100,maxHp:100,
  add:{graphics:()=>graphics},u:()=>0,protect:()=>{},audio:{play:()=>{}},notifyCombat:()=>{},burst:()=>{},
  enemies:[{active:true,x:40,y:0,r:10},{active:true,x:300,y:0,r:10}],hit:(_:unknown,d:number)=>hits.push(d)} as unknown as ArenaScene;
 const combat=new LethweiCombat(scene);assert.ok(combat.activate(0));assert.equal(combat.damageReductionMultiplier,.5);
 combat.onDamageTaken(20);assert.deepEqual(hits,[14]);combat.update(3.5);assert.equal(combat.damageReductionMultiplier,1);
 combat.onDamageTaken(20);assert.equal(hits.length,1);combat.clear();assert.equal(combat.ironChinTime,0);
});

test('Lethwei mitigation never exceeds 60% across all skill stacks',()=>{
 const graphics={setDepth(){return this;}};
 for(const chin of [false,true])for(const ring of [false,true])for(const belt of [false,true]){
  const s={save:{lethweiSkills:['ironchin','lethweiring']},x:0,y:0,hp:20,maxHp:100,u:(id:string)=>id==='goldenbelt'&&belt?3:0,add:{graphics:()=>graphics}} as unknown as ArenaScene;
  const c=new LethweiCombat(s);c.ironChinTime=chin?3:0;c.ring.active=ring;
  const expected=Math.max(.4,(chin?.5:1)*(ring?.8:1)*(belt?.65:1));assert.equal(c.damageReductionMultiplier,expected);
 }
});
test('Iron Chin shares one 0.5s pulse across a crowd; pause and clear respect cooldown',()=>{
 const hits:number[]=[];const graphics={setDepth(){return this;}};
 const scene={save:{lethweiSkills:['ironchin','blitz']},hero:'lethwei',paused:false,ended:false,countdown:0,options:{},angle:0,x:0,y:0,hp:100,maxHp:100,
  add:{graphics:()=>graphics},u:()=>0,protect:()=>{},audio:{play:()=>{}},notifyCombat:()=>{},burst:()=>{},
  enemies:[{active:true,x:40,y:0,r:10},{active:true,x:60,y:0,r:10},{active:true,x:300,y:0,r:10}],hit:(_:unknown,d:number)=>hits.push(d)} as unknown as ArenaScene;
 const c=new LethweiCombat(scene);c.activate(0);c.onDamageTaken(20);c.onDamageTaken(20);assert.deepEqual(hits,[14,14]);
 c.update(.49);c.onDamageTaken(20);assert.equal(hits.length,2);c.update(.01);c.onDamageTaken(20);assert.equal(hits.length,4);
 scene.paused=true;c.update(1);scene.paused=false;c.onDamageTaken(20);assert.equal(hits.length,4);
 c.clear();c.ironChinTime=1;c.onDamageTaken(20);assert.equal(hits.length,6);
});
