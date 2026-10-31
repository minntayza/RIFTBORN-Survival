import {test} from 'node:test';
import assert from 'node:assert/strict';
import {wavePlan} from '../src/waves';
const plan=(wave:number,endless:boolean)=>wavePlan(wave,()=>.37,undefined,endless);
const total=(packs:ReturnType<typeof wavePlan>)=>packs.reduce((n,p)=>n+p.count,0);
test('Endless trades basic enemies for riflemen without adding enemies',()=>{
 for(const [wave,rifles] of [[5,3],[6,4],[7,6],[8,8],[9,10]]){
  const before=plan(wave,false),after=plan(wave,true);
  assert.equal(total(after),total(before));
  assert.equal(after.filter(p=>p.type==='rifle').reduce((n,p)=>n+p.count,0),rifles);
 }
});
test('late Endless waves exchange melee units for explicitly robot Pulse Shooters',()=>{
 for(const [wave,count] of [[13,6],[14,8]]){
  const before=plan(wave,false),after=plan(wave,true);
  assert.equal(total(after),total(before));
  assert.equal(after.filter(p=>p.type==='rifle'&&p.faction==='robot').reduce((n,p)=>n+p.count,0),count);
  assert.deepEqual(after.filter(p=>['boss','commander','shooterBoss'].includes(p.type)),before.filter(p=>['boss','commander','shooterBoss'].includes(p.type)));
 }
});
test('other waves retain their composition',()=>{
 for(const wave of [1,2,3,4,10,11,12,15,20])assert.deepEqual(plan(wave,true),plan(wave,false));
});
