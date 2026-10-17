import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {WEAPON_EFFECTS} from '../src/weapon-effects';
import {GUNNER_WEAPONS} from '../src/gunner-weapons';
import {gunnerWeaponPose,gunnerSupportHand} from '../src/gunner-motion';
const scene=new ArenaScene(freshSave(),new AudioManager(),()=>{},()=>{},()=>{}),images=()=>scene.children.list.filter((child):child is Phaser.GameObjects.Image=>child instanceof Phaser.GameObjects.Image);
const create=scene.create.bind(scene);scene.create=()=>{create();scene.paused=true;
 for(const id of GUNNER_WEAPONS)for(const aim of [0,Math.PI,Math.PI/2,-Math.PI/2])for(const sequence of [1,2])for(const reload of [0,.6]){
  const phase=.18,state={reload,reloadDuration:1.2,overdrive:1},a=gunnerWeaponPose(id,600,400,aim,phase,id!=='pistols'||sequence%2===0,false,state),b=gunnerWeaponPose(id,600,400,aim,phase,id==='pistols'&&sequence%2!==0,true,state);
  scene.visuals.render([],'gunner',id,600,400,aim,1,WEAPON_EFFECTS[id].duration*(1-phase),0,0,false,0,10,sequence,1,1,state);
  const targets=[a.grip,id==='pistols'?b.grip:gunnerSupportHand(a,state)];for(let index=0;index<2;index++){const hand=images().find(child=>child.visible&&child.texture.key===`gunner-${index===0?'hand':'otherHand'}`),target=targets[index];if(!hand||Math.hypot(hand.x-target.x,hand.y-target.y)>1e-6)throw Error(`${id}: hand ${index} detached`);}
  const body=images().find(child=>child.visible&&child.texture.key.startsWith('cute-gunner-'));if(!body||body.rotation!==0||body.displayHeight!==78||body.flipX!==(Math.cos(aim)<0))throw Error('Gunner body rotates, bobs or faces away');
 }
 scene.hero='gunner';scene.x=600;scene.y=400;scene.angle=0;
 for(const id of GUNNER_WEAPONS){scene.weapon=id;for(const bullet of scene.bullets)bullet.active=false;scene.reload=0;scene.ammo=1;const next=scene.attackSequence+1,pose=gunnerWeaponPose(id,600,400,0,0,true,id==='pistols'&&next%2!==0);scene.basicAttack();const bullets=scene.bullets.filter(b=>b.active&&!b.hostile);if(bullets.length!==(id==='shotgun'?5:1)||bullets.some(b=>Math.hypot(b.x-pose.tip.x,b.y-pose.tip.y)>1e-6))throw Error(`${id}: bullets do not start at artwork muzzle`);if(scene.reload<=0||scene.reload!==scene.reloadDuration)throw Error('Reload duration not passed correctly');}
 scene.paused=false;scene.ability=0;scene.activate(0,0);scene.paused=true;if(scene.overdrive!==3||scene.reload!==0||scene.ammo!==scene.maxAmmo)throw Error('Overdrive/reload behavior changed');
 document.querySelector('#results')!.textContent='PASS: Gunner artwork, two-hand grips, independent pistols, reload arm poses and mirrored facing render correctly. All real bullets start at the new muzzle; reload and Overdrive resolve correctly.';
};new Phaser.Game({type:Phaser.CANVAS,parent:'fixture',width:600,height:400,scene:[scene],audio:{noAudio:true}});
