import test from 'node:test';
import assert from 'node:assert/strict';
import {rigidHeroArm} from '../src/hero-arm';
import {weaponPose} from '../src/weapon-effects';
import {gunnerWeaponPose,gunnerSupportHand} from '../src/gunner-motion';
import {samuraiSupportHand} from '../src/samurai-motion';
test('Every weapon arm keeps its shape while rotating only about the shoulder',()=>{
 for(const [hero,weapons] of [['ninja',['katana','dual','kama']],['samurai',['nodachi','cursed','naginata']],['tank',['shield','spiked','hammer']],['gunner',['pistols','shotgun','smg']]] as const)for(const weapon of weapons){
 const lengths=new Map<number,number[]>();
 for(const aim of [0,.7,-.7,Math.PI,Math.PI+.7,-Math.PI/2,Math.PI/2])for(let t=0;t<=1;t+=.05){const f=Math.cos(aim)<0?-1:1,mode=hero==='samurai'?'samurai':hero==='tank'?'tank':true,p=hero==='gunner'?gunnerWeaponPose(weapon as 'pistols'|'shotgun'|'smg',0,0,aim,t,true):weaponPose(weapon,0,0,aim,t,true,0,false,false,1,1,mode),hands=[p.grip];
 if(hero==='samurai'||weapon==='hammer')hands.push(samuraiSupportHand(p.grip,p.rotation));
 if(hero==='gunner'&&weapon!=='pistols')hands.push(gunnerSupportHand(gunnerWeaponPose(weapon as 'shotgun'|'smg',0,0,aim,t,true)));
 if(weapon==='dual')hands.push(weaponPose(weapon,0,0,aim,t,true,0,true,false,1,1,true).grip);
 if(weapon==='pistols')hands.push(gunnerWeaponPose('pistols',0,0,aim,t,true,true).grip);
 hands.forEach((hand,i)=>{const shoulder={x:(i===0?8:-9)*f,y:5},r=rigidHeroArm(shoulder,hand,f),current=[Math.hypot(r.elbow.x-shoulder.x,r.elbow.y-shoulder.y),Math.hypot(r.wrist.x-r.elbow.x,r.wrist.y-r.elbow.y),Math.hypot(r.grip.x-r.wrist.x,r.grip.y-r.wrist.y)];if(!lengths.has(i))lengths.set(i,current);current.forEach((n,j)=>assert.ok(Math.abs(n-lengths.get(i)![j])<1e-6,`${hero} ${weapon} arm ${i} stretched at ${aim}, ${t}`));});
 }
 }
});
