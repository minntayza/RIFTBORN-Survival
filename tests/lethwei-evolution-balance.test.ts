import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LethweiCombat} from '../src/lethwei-combat';
import type {ArenaScene,Enemy} from '../src/combat';
function fixture(evolved=true){
 const hits:{damage:number;source:string}[]=[],graphics={setDepth(){return this;}};
 const enemy={active:true,x:0,y:0,r:12,hp:1e6,stagger:0} as Enemy;
 const s={x:0,y:0,hp:100,maxHp:100,angle:0,hero:'lethwei',weapon:'hempwraps',paused:false,ended:false,countdown:0,options:{},save:{lethweiSkills:['lethweiring','blitz']},enemies:[enemy],add:{graphics:()=>graphics},u:(id:string)=>['ironshins','ringmaster'].includes(id)?3:0,evolved:(id:string)=>evolved&&['ironshins','ringmaster'].includes(id),audio:{play:()=>{}},notifyCombat:()=>{},burst:()=>{},cameras:{main:{shake:()=>{}}},hit:(_:Enemy,damage:number,_knock:number,_b:boolean,_el:boolean,source:string)=>hits.push({damage,source}),moveOnGround:(x:number,y:number,dx:number,dy:number)=>({x:x+dx,y:y+dy})} as unknown as ArenaScene;
 return {s,c:new LethweiCombat(s),enemy,hits};
}
test('Indomitable Stride has directional reach and a cooldown across frame rates',()=>{
 for(const dt of [1/30,1/60,1/120]){
  const {s,c,enemy,hits}=fixture();let stunTime=0;
  for(let t=0;t<6;t+=dt){s.x+=dt*30;enemy.x=s.x+90;enemy.y=s.y; // trigger needs nearby contact, not merely being inside shockwave range
   if(t<dt*2||hits.length>0)enemy.x=s.x+30;
   enemy.stagger=Math.max(0,enemy.stagger-dt);c.update(dt);if(enemy.stagger>0)stunTime+=dt;
  }
  const kicks=hits.filter(h=>h.source==='Iron Shins');assert.equal(kicks.length,4);assert.ok(kicks.every(h=>h.damage===37.5));assert.ok(stunTime>2.6&&stunTime<3.1);
  console.log(JSON.stringify({case:'Stride six-second chase',fps:Math.round(1/dt),kicks:kicks.length,rawDamage:kicks.reduce((n,h)=>n+h.damage,0),stunSeconds:+stunTime.toFixed(2)}));
 }
});
test('Colosseum doubles clone output, respects its six-second window and grants 20% protection',()=>{
 const totals:number[]=[];
 for(const evolved of [false,true]){
  const {s,c,enemy,hits}=fixture(evolved);c.activate(0);assert.equal(c.clones.length,evolved?2:1);assert.equal(c.damageReductionMultiplier,.8);
  for(let i=0;i<600;i++)c.update(.01);
  const punches=hits.filter(h=>h.source==='Spirit Clone Strike');totals.push(punches.reduce((n,h)=>n+h.damage,0));
  c.update(.02);assert.equal(c.ring.active,false);assert.equal(c.clones.length,0);assert.equal(c.damageReductionMultiplier,1);
  const count=hits.length;c.update(1);assert.equal(hits.length,count);
  console.log(JSON.stringify({case:evolved?'Colosseum':'Base ring',clonePunches:punches.length,rawDamage:totals.at(-1),duration:6}));
 }
 assert.equal(totals[1],totals[0]*2);
});
test('Ropes can repeatedly damage a stationary boundary target; clones and kicks do not trigger basic-contact combos',()=>{
 const {s,c,enemy,hits}=fixture();c.activate(0);enemy.x=175;
 for(let i=0;i<300;i++){enemy.x=175;c.update(.01);}
 const ropes=hits.filter(h=>h.source==='Ring Ropes');assert.equal(ropes.length,5);assert.equal(ropes.reduce((n,h)=>n+h.damage,0),90);
 s.x=176;assert.equal(c.damageReductionMultiplier,1);
 assert.ok(!hits.some(h=>h.source==='Nine Limbs Combo'||h.source==='Lethwei Headbutt'));
 console.log(JSON.stringify({case:'Boundary pressure',ropeHits:ropes.length,rawDamage:90,seconds:3}));
});
