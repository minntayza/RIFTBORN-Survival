import test from 'node:test';
import assert from 'node:assert/strict';
import {WEAPONS} from '../src/config';
import {ZawgyiCombat} from '../src/zawgyi-combat';
import type {ArenaScene} from '../src/combat';
function fixture(tempo=1,reach=0,power=0){
 const graphics=new Proxy({}, {get:()=>()=>graphics});const hits:number[]=[];let winds=0;
 const s={x:0,y:0,angle:0,swing:0,elapsed:0,attackSequence:0,paused:false,ended:false,earlyPower:false,levels:{},visuals:{},evolution:{tempo,reach,power},save:{zawgyiSkills:['datlone','flame']},enemies:[{x:40,y:0,r:60,active:true,type:'basic'}],add:{graphics:()=>graphics},audio:{play(){}},hit:(_e:unknown,d:number)=>hits.push(d),windSlash(){winds++;},u:()=>0};
 const combat=new ZawgyiCombat(s as unknown as ArenaScene);return {s,combat,hits,winds:()=>winds};
}
test('staff phantom echoes once on the third attack, respects pause and clears delayed damage',()=>{
 const {s,combat,hits}=fixture();combat.staffAttack();combat.staffAttack();combat.staffAttack();s.paused=true;combat.update(1);assert.equal(hits.length,0);s.paused=false;combat.update(.32);assert.equal(hits.filter(d=>d===WEAPONS.mysticstaff.damage*.35).length,1);combat.update(1);assert.equal(hits.filter(d=>d===WEAPONS.mysticstaff.damage*.35).length,1);combat.staffAttack();combat.staffAttack();combat.staffAttack();combat.clear();combat.update(1);assert.equal(hits.filter(d=>d===WEAPONS.mysticstaff.damage*.35).length,1);
});
test('fully awakened lightning staff launches its piercing projectile on contact',()=>{
 const {combat,winds}=fixture(0,2);combat.staffAttack();combat.update(.12);assert.equal(winds(),1);
});

test('full Phantom echoes each staff attack; full Wildfire adds one explosion per swing',()=>{
 const phantom=fixture(2);phantom.combat.staffAttack();phantom.combat.update(.32);assert.equal(phantom.hits.filter(d=>d===WEAPONS.mysticstaff.damage*.35).length,1);
 const fire=fixture(0,0,2);fire.combat.staffAttack();fire.combat.update(.12);assert.equal(fire.hits.filter(d=>d===WEAPONS.mysticstaff.damage*.5).length,1);fire.combat.update(.12);assert.equal(fire.hits.filter(d=>d===WEAPONS.mysticstaff.damage*.5).length,1);
});
