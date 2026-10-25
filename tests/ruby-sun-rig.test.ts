import test from 'node:test';
import assert from 'node:assert/strict';
import type Phaser from 'phaser';
import {ZawgyiRig} from '../src/zawgyi-rig';
import {zawgyiMotion,zawgyiWorldPoint,ZAWGYI_SCALE} from '../src/zawgyi-motion';
import {ZAWGYI_SLAM} from '../src/zawgyi-slam-motion';
import {RUBY_SUN} from '../src/ruby-sun-art';
test('Ruby Sun preserves grip and both end positions in idle, walking, both sweep directions and slam, mirrored too',()=>{
 const images:{values:Record<string,unknown[]>;sprite:object}[]=[];
 const graphic=new Proxy({}, {get:()=>()=>graphic});
 const scene={textures:{exists:()=>true,get:()=>({getSourceImage:()=>({})})},add:{graphics:()=>graphic,image:()=>{const values:Record<string,unknown[]>={};const sprite=new Proxy({}, {get:(_,name:string)=>(...args:unknown[])=>{values[name]=args;return sprite;}});images.push({values,sprite});return sprite;}}};
 const rig=new ZawgyiRig(scene as unknown as Phaser.Scene);
 for(const aim of [0,Math.PI])for(const [moving,attack,sequence,slam] of [[false,0,0,-1],[true,0,0,-1],[false,.12,1,-1],[false,.12,2,-1],[false,0,0,ZAWGYI_SLAM.impact]] as const){
  rig.render(400,300,aim,.17,moving,attack,sequence,0,0,slam,true,2);
  const poses=zawgyiMotion(.17,moving,attack,sequence,slam,aim).parts;
  for(let i=0;i<poses.length;i++){
   const p=poses[i],v=images[i].values,world=zawgyiWorldPoint(p,400,300,aim);
   assert.deepEqual(v.setPosition,[world.x,world.y]);assert.deepEqual(v.setOrigin,[aim===Math.PI?1-p.ox:p.ox,p.oy]);
   assert.deepEqual(v.setDisplaySize,[(p.part==='staff'?RUBY_SUN.width:p.width)*ZAWGYI_SCALE,p.height*ZAWGYI_SCALE]);
   if(p.part==='staff'){
    assert.deepEqual(v.setTexture,['zawgyi-ruby-sun-filtered']);
    for(const end of [0,1]){const offset=(end-p.oy)*p.height*ZAWGYI_SCALE,rotation=p.rotation*(aim===Math.PI?-1:1),point={x:world.x-Math.sin(rotation)*offset,y:world.y+Math.cos(rotation)*offset};const expected=zawgyiWorldPoint(end?zawgyiMotion(.17,moving,attack,sequence,slam,aim).contact:zawgyiMotion(.17,moving,attack,sequence,slam,aim).tip,400,300,aim);assert.ok(Math.hypot(point.x-expected.x,point.y-expected.y)<1e-8);}
   }
  }
 }
 rig.render(400,300,0,0,false,0,0,0,0,-1,false,0);assert.deepEqual(images[4].values.setTexture,['zawgyi-part-staff']);assert.equal(images.length,6);
});
