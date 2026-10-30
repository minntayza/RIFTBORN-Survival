import test from 'node:test';
import assert from 'node:assert/strict';
import {LethweiTechniques} from '../src/lethwei-techniques';
import {fighterPose} from '../src/lethwei-rig';
import type {ArenaScene,Enemy} from '../src/combat';
function fixture(levels:Record<string,number>,evolutions:string[]=[]){
 const hits:{damage:number;source:string}[]=[],heals:number[]=[],protection:number[]=[];
 const e={active:true,x:25,y:0,r:15,stagger:0} as Enemy;
 const s={x:0,y:0,hp:30,maxHp:100,weapon:'hempwraps',enemies:[e],u:(id:string)=>levels[id]||0,evolved:(id:string)=>evolutions.includes(id),heal:(n:number)=>heals.push(n),protect:(n:number)=>protection.push(n),notifyCombat:()=>{},moveOnGround:(x:number,y:number,dx:number,dy:number)=>({x:x+dx,y:y+dy}),hit:(_:Enemy,damage:number,_k:number,_b:boolean,_el:boolean,source:string)=>hits.push({damage,source})} as unknown as ArenaScene;
 const t=new LethweiTechniques(s),ring={active:false,x:0,y:0,radius:175};return {s,t,e,hits,heals,protection,ring};
}
test('Nine Limbs counts landed attack sequences once and its evolution adds a claw hit',()=>{
 for(const evolved of [false,true]){const f=fixture({nineweapons:2},evolved?['nineweapons']:[]);
  f.t.onBasicContact(1,0);f.t.onBasicContact(1,0);f.t.onBasicContact(2,0);assert.equal(f.hits.length,0);
  f.t.onBasicContact(3,0);f.t.update(.1,f.ring);assert.equal(f.t.action?.kind,'elbow');f.t.update(.26,f.ring);assert.equal(f.t.action?.kind,'kick');
  assert.equal(f.hits.length,evolved?3:2);assert.equal(f.hits[0].damage,7.5);if(evolved)assert.equal(f.hits[2].source,'Roaring Tiger');
  f.t.clear();f.t.update(1,f.ring);assert.equal(f.t.action,undefined);
 }
});
test('Iron Shins adds speed and a cooldown-limited whole-leg kick; evolution stuns',()=>{
 for(const evolved of [false,true]){const f=fixture({ironshins:2},evolved?['ironshins']:[]);assert.equal(f.t.speedMultiplier,1.2);
  f.t.update(.1,f.ring);f.s.x=4;f.t.update(.1,f.ring);assert.equal(f.hits.length,1);assert.equal(f.hits[0].damage,25);assert.equal(f.e.stagger,evolved?.7:.15);
  f.s.x=8;f.t.update(.1,f.ring);assert.equal(f.hits.length,1);
 }
});
test('Headbutt needs five consecutive punches; Diamond Skull expires after three seconds',()=>{
 const f=fixture({headbutt:1},['headbutt']);for(let i=1;i<=4;i++)f.t.onBasicContact(i,0);assert.equal(f.hits.length,0);
 f.t.onBasicContact(5,0);assert.equal(f.hits[0].source,'Lethwei Headbutt');assert.equal(f.t.action?.kind,'headbutt');assert.equal(f.t.damageMultiplier(f.e),1.25);
 f.t.update(3.01,f.ring);assert.equal(f.t.damageMultiplier(f.e),1);
 const g=fixture({headbutt:1});g.t.onBasicContact(1,0);g.t.update(2.1,g.ring);for(let i=2;i<=5;i++)g.t.onBasicContact(i,0);assert.equal(g.hits.length,0);
});
test('Rope Rebound requires outward movement near an active rope and preserves boost on misses',()=>{
 const f=fixture({ringmaster:2});f.ring.active=true;f.s.x=160;f.t.update(.1,f.ring);f.s.x=170;f.t.update(.1,f.ring);
 assert.equal(f.s.x,124);assert.equal(f.t.reboundMultiplier,2);assert.equal(f.t.consumeRebound(false,false),2);assert.equal(f.t.reboundMultiplier,2);assert.equal(f.t.consumeRebound(true),1);assert.equal(f.t.consumeRebound(false),2);assert.equal(f.t.reboundMultiplier,1);
});
test('Champion healing is shared across punch sequences and requires low health',()=>{
 const f=fixture({goldenbelt:3});f.t.onBasicContact(1,0);f.t.onBasicContact(1,0);f.t.onBasicContact(2,0);assert.deepEqual(f.heals,[3]);
 f.t.update(.49,f.ring);f.t.onBasicContact(3,0);assert.deepEqual(f.heals,[3]);
 f.t.update(.01,f.ring);f.t.onBasicContact(4,0);assert.deepEqual(f.heals,[3,3]);
 f.s.hp=50;f.t.update(.5,f.ring);f.t.onBasicContact(5,0);assert.deepEqual(f.heals,[3,3]);
});
test('Golden Champion leeches only basic punches and gates 1.5s protection for 25s',()=>{
 const g=fixture({goldenbelt:3},['goldenbelt']);
 for(const source of [undefined,'Iron Chin Reflect','Spirit Clone Strike','Ring Ropes','Nine Limbs Combo','Warrior Spirit','Nine-Limb Blitz'])g.t.onDamageDealt(50,source);
 assert.deepEqual(g.heals,[]);g.t.onDamageDealt(50,'Lethwei Basic Punch');assert.deepEqual(g.heals,[5]);
 g.t.onBasicContact(1,0);assert.deepEqual(g.heals,[5]);g.s.hp=40;
 assert.equal(g.t.beforeDamage(15),true);assert.deepEqual(g.protection,[1.5]);assert.equal(g.t.beforeDamage(15),false);
 g.t.update(24.99,g.ring);assert.equal(g.t.beforeDamage(15),false);g.t.update(.01,g.ring);assert.equal(g.t.beforeDamage(15),true);
 g.t.clear();assert.equal(g.t.beforeDamage(15),true);
});
test('Technique poses retain seven parts and whole legs; headbutt moves the whole rig together',()=>{
 const base=fighterPose(),kick=fighterPose(0,false,0,0,undefined,.2,0,{kind:'kick',time:.12,duration:.24,aim:0});assert.equal(kick.length,7);
 const leg=kick.find(p=>p.part==='leftLeg')!;assert.equal(leg.h,65);assert.equal(leg.oy,.08);assert.notEqual(leg.r,base[0].r);
 const head=fighterPose(0,false,0,0,undefined,.2,0,{kind:'headbutt',time:.12,duration:.24,aim:0});for(let i=0;i<base.length;i++){assert.equal(head[i].x-base[i].x,6);assert.equal(head[i].y,base[i].y);}
});
