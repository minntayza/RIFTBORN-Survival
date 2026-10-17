import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {ROBOT_ROLES} from '../src/robot-enemies';
import {isCuteRobot} from '../src/cute-robots';
import {ENEMIES,type EnemyId} from '../src/config';
const scene=new ArenaScene(freshSave(),new AudioManager(),()=>{},()=>{},()=>{});
const create=scene.create.bind(scene);scene.create=()=>{create();scene.paused=true;
 for(const type of Object.keys(ENEMIES) as EnemyId[])if(isCuteRobot(ROBOT_ROLES[type]))for(const frame of [0,8,31,48])for(const suffix of ['','-small']){const key=`robot-unit-${type}-${frame}${suffix}`;scene.visuals.prepareTexture(key);if(!scene.textures.exists(key))throw Error(`Missing ${key}`);}
 for(const type of ['brute','cleaver','abomination'] as const){
  const e=scene.spawn(type,0,.5,'robot')!;scene.x=600;scene.y=400;e.x=550;e.y=400;e.attack=0;scene.updateEnemies(.01);
  if(e.skillAction!=='slam'||e.skillAge!==0)throw Error(`Crusher ${type} did not start its arm skill`);
  for(const frame of [0,10,20,35])for(const suffix of ['','-small'])scene.visuals.prepareTexture(`skill-robot-${type}-slam-${frame}${suffix}`);
  scene.visuals.render([e],'ninja','katana',600,400,0,1,0,0,0,false,0,10);
  const visible=scene.children.list.filter((child):child is Phaser.GameObjects.Image=>child instanceof Phaser.GameObjects.Image).some(child=>child.visible&&child.texture.key===`skill-robot-${type}-slam-0`);if(!visible)throw Error(`Crusher ${type} skill texture not rendered`);
  const windup=e.skillWindup;for(let n=0;n<Math.ceil((windup+.1)/.01);n++)scene.updateEnemies(.01);if(e.telegraph>0)throw Error('Crusher strike did not resolve');e.active=false;
 }
 document.querySelector('#results')!.textContent='PASS: all four robot roles and variants load on demand. Every Crusher variant starts, renders and resolves its slam skill in ArenaScene.';
};new Phaser.Game({type:Phaser.CANVAS,parent:'fixture',width:600,height:400,scene:[scene],audio:{noAudio:true}});
