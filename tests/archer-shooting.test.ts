import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PyusawhtiCombat} from '../src/pyusawhti-combat';
import {pyusawhtiArrowOrigin} from '../src/pyusawhti-rig';
import type {ArenaScene} from '../src/combat';
test('real bow attacks spawn spread arrows together at the visible bow and retain their firing direction',()=>{
 for(let angle=-Math.PI;angle<Math.PI;angle+=Math.PI/8){
  const graphics={setDepth(){return this;}};
  const scene={x:300,y:400,angle,paused:false,ended:false,swing:0,attackSequence:0,weapon:'aungzeyabow',save:{pyusawhtiSkills:['banepierce','windfocus']},add:{graphics:()=>graphics},u:(id:string)=>id==='arrowstorm'?1:0,evolved:()=>false,audio:{play:()=>{}}} as unknown as ArenaScene;
  const combat=new PyusawhtiCombat(scene);combat.bowAttack();
  const origin=pyusawhtiArrowOrigin(scene.x,scene.y,angle);
  assert.equal(combat.arrows.length,3);
  for(const arrow of combat.arrows){assert.equal(arrow.x,origin.x);assert.equal(arrow.y,origin.y);assert.ok(Math.abs(Math.atan2(arrow.vy,arrow.vx)-Math.atan2(Math.sin(arrow.angle),Math.cos(arrow.angle)))<1e-8);}
  assert.ok(scene.swing>0);assert.equal(scene.attackSequence,1);
 }
});
