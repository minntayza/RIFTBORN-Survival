import test from 'node:test';
import assert from 'node:assert/strict';
import {removeDuplicateThighs} from '../src/lethwei-joins';
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
