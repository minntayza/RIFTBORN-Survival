import test from 'node:test';
import assert from 'node:assert/strict';
import {removeDuplicateThighs,wrapWristCap} from '../src/lethwei-joins';
test('duplicate thigh artwork disappears below the cloth hem, preserving the hem and unmarked columns',()=>{
 const w=3,h=100,d=new Uint8ClampedArray(w*h*4);
 for(let i=0;i<d.length;i+=4){d[i]=130;d[i+1]=75;d[i+2]=45;d[i+3]=255;}
 const at=(x:number,y:number)=>(y*w+x)*4;
 for(const x of [0,1])for(let y=70;y<=85;y++){const i=at(x,y);d[i]=200;d[i+1]=25;d[i+2]=20;}
 const before=d.slice();removeDuplicateThighs(d,w,h);
 assert.equal(d[at(0,86)+3],255);assert.equal(d[at(0,87)+3],0);
 assert.equal(d[at(1,99)+3],0);assert.equal(d[at(2,99)+3],255);
 assert.deepEqual(d.slice(0,at(0,70)),before.slice(0,at(0,70)));
});

test('wrist caps are cloth-coloured without changing finger skin or alpha',()=>{
 for(const hand of [true,false]){
  const w=10,h=100,d=new Uint8ClampedArray(w*h*4);
  for(let i=0;i<d.length;i+=4){d[i]=240;d[i+1]=160;d[i+2]=90;d[i+3]=220;}
  wrapWristCap(d,w,h,hand);
  const cap=((hand?10:90)*w+5)*4,other=((hand?70:20)*w+5)*4;
  assert.ok(d[cap]-d[cap+1]<15);assert.equal(d[cap+3],220);
  assert.deepEqual(Array.from(d.slice(other,other+4)),[240,160,90,220]);
 }
});
