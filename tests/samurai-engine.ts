import {SAMURAI_WEAPONS,SAMURAI_WEAPON_ART,samuraiWeaponMetrics} from '../src/samurai-weapons';
import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {weaponPose,WEAPON_EFFECTS} from '../src/weapon-effects';
import {samuraiSupportHand} from '../src/samurai-motion';
const scene=new ArenaScene(freshSave(),new AudioManager(),()=>{},()=>{},()=>{});const create=scene.create.bind(scene);scene.create=()=>{create();scene.paused=true;
 for(const id of SAMURAI_WEAPONS){const canvas=scene.textures.get(`samurai-${id}`).getSourceImage() as HTMLCanvasElement,g=canvas.getContext('2d')!,a=SAMURAI_WEAPON_ART[id],rear=a.origin.x-10.5*128/WEAPON_EFFECTS[id].size;
  for(const x of [a.origin.x,rear])if(g.getImageData(Math.round(x),64,1,1).data[3]<180)throw Error(`${id}: hand grip falls outside opaque handle`);
  const tip=samuraiWeaponMetrics(id).tip,pixels=g.getImageData(Math.max(0,Math.round(64+tip.x)-2),Math.max(0,Math.round(64+tip.y)-2),5,5).data;if(!Array.from(pixels).some((v,i)=>i%4===3&&v>150))throw Error(`${id}: contact tip differs from artwork`);
  if(g.getImageData(0,0,1,1).data[3]!==0)throw Error(`${id}: background is not transparent`);
 }

 for(const id of ['nodachi','cursed','naginata'] as const)for(const aim of [0,Math.PI,Math.PI/2,-Math.PI/2])for(const phase of [.2,.45,.8]){
  scene.visuals.render([],'samurai',id,600,400,aim,1,WEAPON_EFFECTS[id].duration*(1-phase),0,0,false,0,10);
  const pose=weaponPose(id,600,400,aim,phase,true,0,false,false,1,1,'samurai'),support=samuraiSupportHand(pose.grip,pose.rotation);
  for(const [texture,target] of [['samurai-hand',pose.grip],['samurai-otherHand',support]] as const){const hand=scene.children.list.filter((child):child is Phaser.GameObjects.Image=>child instanceof Phaser.GameObjects.Image).find(child=>child.visible&&child.texture.key===texture);if(!hand||Math.hypot(hand.x-target.x,hand.y-target.y)>1e-6)throw Error(`${id}: hand detached from weapon`);}
  const body=scene.children.list.filter((child):child is Phaser.GameObjects.Image=>child instanceof Phaser.GameObjects.Image).find(child=>child.visible&&child.texture.key.startsWith('cute-samurai-'));const weapon=scene.children.list.filter((child):child is Phaser.GameObjects.Image=>child instanceof Phaser.GameObjects.Image).find(child=>child.visible&&child.texture.key===`samurai-${id}`);if(!weapon||weapon.flipY!==pose.flipY||Math.hypot(weapon.x-pose.grip.x,weapon.y-pose.grip.y)>1e-6)throw Error('New weapon sprite not attached to hand');if(!body||body.rotation!==0||body.displayHeight!==78||body.flipX!==(Math.cos(aim)>=0))throw Error('Samurai body rotates or bobs');
 }
 scene.visuals.render([],'ninja','katana',600,400,0,2,0,0,0,false,0,10);if(!scene.children.list.filter((child):child is Phaser.GameObjects.Image=>child instanceof Phaser.GameObjects.Image).some(child=>child.visible&&child.texture.key==='ninja-hand'))throw Error('Ninja arms failed to restore');
 document.querySelector('#results')!.textContent='PASS: Samurai uses the new fixed-body artwork; both hands stay attached to all three weapons across aim directions and swing phases. Ninja arm artwork restores. All new weapon sprites have opaque two-hand grip anchors, matching contact tips and transparent backgrounds.';
};new Phaser.Game({type:Phaser.CANVAS,parent:'fixture',width:600,height:400,scene:[scene],audio:{noAudio:true}});
