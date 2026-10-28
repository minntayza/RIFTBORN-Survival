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
