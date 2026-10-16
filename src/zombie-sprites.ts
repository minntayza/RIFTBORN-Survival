import type {EnemyId} from './config';
import {WALK_FRAMES,WALK_PROFILES,type WalkingZombie} from './zombie-walk';
import frames from './zombie-rig-frames.json';
export const ZOMBIE_SPRITES=['basic','runner','spitter','armoured','brute','elite','rifle','commander','boss'] as const satisfies readonly EnemyId[];
export const ZOMBIE_ATLASES=(['swarm','heavy','officers'] as const).map(group=>({key:`zombie-parts-${group}`,url:`/assets/enemies/zombie-${group}-parts${group==='heavy'?'':'-v2'}.png`,frames:frames[group]}));
export function zombieSpriteLocation(id:EnemyId){const i=ZOMBIE_SPRITES.findIndex(type=>type===id);return i<0?undefined:{atlas:ZOMBIE_ATLASES[Math.floor(i/3)],row:i%3};}
export const RIG_TEXTURE_SIZE=128;
const cache=new WeakMap<HTMLImageElement,Map<EnemyId,HTMLCanvasElement[]>>();
// These coordinates are fixed joints, not masks in a flattened picture. Each
// limb is separate original artwork overlapping a complete torso at its root.
export function rigPose(id:WalkingZombie,phase:number,strength:number){
 const p=WALK_PROFILES[id],step=Math.sin(phase*Math.PI*2);
 if(id==='runner')return {head:{x:91,y:56,angle:0},torso:{x:55,y:70,angle:0},
  leftArm:{x:76,y:81,angle:step*.25*strength},rightArm:{x:83,y:79,angle:-step*.25*strength},
  leftLeg:{x:34,y:81,angle:-step*.28*strength,offset:Math.max(0,step)*-1.5*strength},
  rightLeg:{x:43,y:79,angle:step*.28*strength,offset:Math.max(0,-step)*-1.5*strength}};
 const heavy=['brute','boss','armoured'].includes(id);
 return {head:{x:64,y:id==='brute'?26:25,angle:0},torso:{x:64,y:59,angle:0},
  leftArm:{x:id==='brute'?40:45,y:53,angle:-.12+step*p.arms*.018*strength},
  rightArm:{x:id==='brute'?88:83,y:53,angle:.12-step*p.arms*.018*strength*(id==='boss'?.45:1)},
  leftLeg:{x:55,y:79,angle:step*.15*strength,offset:step*(heavy?2:3)*strength},
  rightLeg:{x:73,y:79,angle:-step*.15*strength,offset:-step*(heavy?2:3)*strength*(1-p.drag)}
 };
}
export function zombieWalkCanvases(source:HTMLImageElement,id:EnemyId):HTMLCanvasElement[]|undefined{
 const loc=zombieSpriteLocation(id);if(!loc)return undefined;
 let saved=cache.get(source);if(!saved){saved=new Map();cache.set(source,saved);}const prior=saved.get(id);if(prior)return prior;
 const parts=loc.atlas.frames.rows[loc.row];
 const poses:HTMLCanvasElement[]=[];
 // idle + full walk + reduced walk for a smooth start/stop. Each size uses the
 // same head and shoulder positions, regardless of phase or zoom.
 for(let index=0;index<=WALK_FRAMES*2;index++){
  const strength=index===0?0:index>WALK_FRAMES?.4:1,phase=index===0?0:(index-1)%WALK_FRAMES/WALK_FRAMES;
  const pose=rigPose(id as WalkingZombie,phase,strength),c=document.createElement('canvas');c.width=c.height=128;
  const g=c.getContext('2d')!;g.translate(64,64);g.scale(1.16,1.16);g.translate(-64,-64);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  const draw=(part:number,x:number,y:number,w:number,h:number,originX=.5,originY=0,angle=0)=>{
   const [sx,sy,sw,sh]=parts[part];g.save();g.translate(x,y);g.rotate(angle);g.drawImage(source,sx,sy,sw,sh,-w*originX,-h*originY,w,h);g.restore();
  };
  if(id==='runner'){
   // Four separate canine legs: diagonal pairs alternate while the dog head
   // and horizontal ribcage remain fixed. No human shoes, arms or clothing.
   draw(5,pose.rightLeg.x,pose.rightLeg.y+pose.rightLeg.offset,14,27,.5,.1,pose.rightLeg.angle);
   draw(3,pose.rightArm.x,pose.rightArm.y,12,27,.5,.1,pose.rightArm.angle);
   draw(4,pose.leftLeg.x,pose.leftLeg.y+pose.leftLeg.offset,14,29,.5,.1,pose.leftLeg.angle);
   draw(2,pose.leftArm.x,pose.leftArm.y,12,29,.5,.1,pose.leftArm.angle);
   draw(1,pose.torso.x,pose.torso.y,70,37,.5,.12);
   draw(0,pose.head.x,pose.head.y,43,41,.5,.12);
   poses.push(c);continue;
  }
  const broad=id==='brute'?1.22:id==='boss'?1.1:1;
  // Legs behind the torso conceal the hip joints and keep the feet planted.
  draw(4,pose.leftLeg.x,pose.leftLeg.y+pose.leftLeg.offset,17,33,.5,.1,pose.leftLeg.angle);
  draw(5,pose.rightLeg.x,pose.rightLeg.y+pose.rightLeg.offset,17,33,.5,.1,pose.rightLeg.angle);
  const a=pose.leftArm,b=pose.rightArm;
  if(id!=='rifle')draw(2,a.x,a.y,id==='boss'?28:id==='brute'?27:20,id==='boss'?53:43,.55,.08,a.angle);
  if(id!=='rifle')draw(3,b.x,b.y,id==='brute'?27:20,43,.45,.08,b.angle);
  draw(1,pose.torso.x,pose.torso.y,43*broad,43,.5,.12);
  draw(0,pose.head.x,pose.head.y,id==='spitter'?49:id==='brute'?43:47,id==='spitter'?47:id==='brute'?43:47,.5,.12);
  poses.push(c);
 }
 saved.set(id,poses);return poses;
}
export function zombieSpriteCanvas(source:HTMLImageElement,id:EnemyId,frame:number){return zombieWalkCanvases(source,id)?.[frame];}
export function minifiedZombieCanvas(canvas:HTMLCanvasElement){
 const small=document.createElement('canvas');small.width=small.height=64;const g=small.getContext('2d')!;
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(canvas,0,0,64,64);return small;
}

export function rifleHandsCanvas(source:HTMLImageElement){
 const loc=zombieSpriteLocation('rifle')!,parts=loc.atlas.frames.rows[loc.row];
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;
 // Both hands travel with the rifle assembly; they never leave the barrel.
 for(const [index,y,angle] of [[2,61,-1.15],[3,71,-1.5]]){
  const [sx,sy,sw,sh]=parts[index];g.save();g.translate(58,y);g.rotate(angle);g.drawImage(source,sx,sy,sw,sh,-7,-3,14,30);g.restore();
 }
 g.lineCap='round';g.strokeStyle='#101a22';g.lineWidth=7;g.beginPath();g.moveTo(67,65);g.lineTo(111,65);g.stroke();
 g.strokeStyle='#84929b';g.lineWidth=2;g.beginPath();g.moveTo(84,64);g.lineTo(112,64);g.stroke();
 g.fillStyle='#9c6842';g.strokeStyle='#111b24';g.lineWidth=2;g.beginPath();g.moveTo(61,62);g.lineTo(85,62);g.lineTo(85,68);g.lineTo(66,68);g.lineTo(60,73);g.closePath();g.fill();g.stroke();
 g.fillStyle='#a7c779';g.fillRect(77,63,5,5);g.strokeStyle='#1b2b25';g.lineWidth=1;g.strokeRect(77,63,5,5);
 return c;
}

// Static guide portraits use the same cutout artwork and joints as gameplay.
export function rigPortraitSvg(id:'basic'|'runner'){
 const loc=zombieSpriteLocation(id)!,data=loc.atlas.frames,parts=data.rows[loc.row],pose=rigPose(id,0,0);
 const piece=(i:number,x:number,y:number,w:number,h:number,ox=.5,oy=0,a=0)=>{const [sx,sy,sw,sh]=parts[i];return `<g transform="translate(${x} ${y}) rotate(${a*180/Math.PI})"><svg x="${-w*ox}" y="${-h*oy}" width="${w}" height="${h}" viewBox="${sx} ${sy} ${sw} ${sh}" preserveAspectRatio="none" overflow="hidden"><image href="${loc.atlas.url}" width="${data.width}" height="${data.height}"/></svg></g>`;};
 const dog=id==='runner';
 const body=dog?
 piece(5,43,79,14,27,.5,.1)+piece(3,83,79,12,27,.5,.1)+piece(4,34,81,14,29,.5,.1)+piece(2,76,81,12,29,.5,.1)+piece(1,55,70,70,37,.5,.12)+piece(0,91,56,43,41,.5,.12):
 piece(4,55,79,17,33,.5,.1)+piece(5,73,79,17,33,.5,.1)+piece(2,45,53,20,43,.55,.08,pose.leftArm.angle)+piece(3,83,53,20,43,.45,.08,pose.rightArm.angle)+piece(1,64,59,43,43,.5,.12)+piece(0,64,25,47,47,.5,.12);
 return `<svg viewBox="0 0 128 128" role="img" aria-label="${dog?'Zombie Dog':'Bald Wanderer'} gameplay illustration"><g transform="translate(64 64) scale(1.16) translate(-64 -64)">${body}</g></svg>`;
}
