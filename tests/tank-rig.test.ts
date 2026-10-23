import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tankRig,tankArmPose,tankEquipmentPose} from '../src/tank-redesign';
import {weaponPose} from '../src/weapon-effects';
import {samuraiSupportHand} from '../src/samurai-motion';
test('tank arm shoulder and painted glove land on their anchors in both facings',()=>{
 for(const facing of [-1,1])for(const side of [0,1])for(let a=-Math.PI;a<=Math.PI;a+=.1){
  const shoulder={x:17*facing,y:-7},hand={x:shoulder.x+Math.cos(a)*26,y:shoulder.y+Math.sin(a)*26},p=tankArmPose(side,shoulder,hand,facing),dx=(side===0?-.02:.02)*p.width*facing,dy=.64*p.height;
  assert.ok(Math.hypot(p.x+dx*Math.cos(p.rotation)-dy*Math.sin(p.rotation)-hand.x,p.y+dx*Math.sin(p.rotation)+dy*Math.cos(p.rotation)-hand.y)<1e-8);
 }
});
test('all tank outfits hold a hammer with constant one-piece arm lengths throughout attacks',()=>{
 for(const name of ['royal','forge','polar'])for(const facing of [-1,1])for(let a=0;a<Math.PI*2;a+=.1){
  const url=`/tank-v3/${name}.png`,source=weaponPose('hammer',0,0,facing<0?Math.PI:0,a/(Math.PI*2),true,0,false,false,1,1,'tank');source.rotation=a;
  const pose=tankEquipmentPose(source,0,0,facing,url,true),hands=[pose.grip,samuraiSupportHand(pose.grip,pose.rotation)];
  tankRig(url).arms.forEach(({pivot:[x,y]},side)=>assert.ok(Math.abs(Math.hypot(hands[side].x-(x-64)*78/128*facing,hands[side].y-(y-64)*78/128)-22)<1e-8));
 }
});

test('tank legs keep a visible gap even at the inward walk extreme',()=>{
 for(const name of ['royal','forge','polar']){
  const rig=tankRig(`/tank-v3/${name}.png`),[w,h]=rig.legSize;
  for(let frame=0;frame<24;frame++){
   const angle=Math.sin(frame/24*Math.PI*2)*.08,extent=Math.cos(angle)*w/2+Math.abs(Math.sin(angle))*(h-4);
   assert.ok(rig.legs[1].pivot[0]-rig.legs[0].pivot[0]-2*extent>3);
  }
 }
});
