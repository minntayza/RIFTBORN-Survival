import {bossMotion,type BossAction} from './boss-motion';
import {zombieShapes,zombiePortrait,rifleShapes} from './zombie-art';
import type {EnemyId} from './config';
import {WALK_FRAMES,WALK_PROFILES,type WalkingZombie} from './zombie-walk';
import frames from './zombie-rig-frames.json';
export const ZOMBIE_SPRITES=['basic','runner','spitter','armoured','brute','elite','rifle','commander','boss'] as const satisfies readonly EnemyId[];
export const ZOMBIE_ATLASES=(['swarm','heavy','officers'] as const).map(group=>({key:`zombie-parts-${group}`,url:`/assets/enemies/zombie-${group}-parts-${group==='swarm'?'v3':'v2'}.png`,frames:frames[group]}));
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
  leftArm:{x:id==='brute'?43:49,y:61,angle:-.12+step*p.arms*.018*strength},
  rightArm:{x:id==='brute'?85:79,y:61,angle:.12-step*p.arms*.018*strength*(id==='boss'?.45:1)},
  leftLeg:{x:55,y:79,angle:step*(id==='brute'?.11:id==='commander'?.13:.19)*strength,offset:Math.max(0,step)*(heavy?-2:-3)*strength},
  rightLeg:{x:73,y:79,angle:-step*(id==='brute'?.11:id==='commander'?.13:.19)*strength*(1-p.drag*.5),offset:Math.max(0,-step)*(heavy?-2:-3)*strength*(1-p.drag)}
 };
}
export function zombieWalkCanvases(source:HTMLImageElement,id:EnemyId):HTMLCanvasElement[]|undefined{
 const loc=zombieSpriteLocation(id);if(!loc)return undefined;
 let saved=cache.get(source);if(!saved){saved=new Map();cache.set(source,saved);}const prior=saved.get(id);if(prior)return prior;
 const poses:HTMLCanvasElement[]=[];
 const shapes=zombieShapes(id as WalkingZombie);
 const order=['rightLeg','leftLeg','rightArm','leftArm','torso','head'] as const;
 const paths=shapes.map(s=>({...s,path:new Path2D(s.d)}));
 for(let index=0;index<=WALK_FRAMES*2+12;index++){
  const strength=index===0?0:index>WALK_FRAMES?.4:1,phase=index===0?0:(index-1)%WALK_FRAMES/WALK_FRAMES;
  const pose=rigPose(id as WalkingZombie,phase,strength),c=document.createElement('canvas');c.width=c.height=128;
  const attack=index>WALK_FRAMES*2?(index-WALK_FRAMES*2)/12:0;
  if(attack){
   pose.leftArm.angle-=attack*(id==='boss'?1.6:id==='commander'?2:.7);
   pose.rightArm.angle+=attack*(id==='brute'?1.2:.45);
  }
  const g=c.getContext('2d')!;g.translate(64,64);g.scale(1.16,1.16);g.translate(-64,-64);g.lineJoin='round';
  for(const part of order){
   if(id==='rifle'&&(part==='leftArm'||part==='rightArm'))continue;
   const j=pose[part];g.save();g.translate(j.x,j.y+('offset' in j?j.offset||0:0));g.rotate(j.angle);if(part==='head'&&id==='spitter'&&attack)g.scale(1+attack*.12,1+attack*.08);
   for(const shape of paths)if(shape.part===part){g.fillStyle=shape.fill;g.strokeStyle=shape.stroke;g.lineWidth=shape.width;g.fill(shape.path);g.stroke(shape.path);}
   g.restore();
  }
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
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;g.translate(64,64);g.scale(1.16,1.16);g.translate(-64,-64);g.lineJoin='round';
 for(const shape of rifleShapes()){const p=new Path2D(shape.d);g.fillStyle=shape.fill;g.strokeStyle='#14202a';g.lineWidth=1.5;g.fill(p);g.stroke(p);}return c;
}

// Static guide portraits use the same cutout artwork and joints as gameplay.
export function rigPortraitSvg(id:WalkingZombie){
 const image=zombiePortrait(id,rigPose(id,0,0));
 return id==='rifle'?image.replace('</g></svg>',rifleShapes().map(s=>`<path d="${s.d}" fill="${s.fill}" stroke="#14202a" stroke-width="1.5" stroke-linejoin="round"/>`).join('')+'</g></svg>'):image;
}

export function zombieBossCanvas(id:'boss'|'commander'|'shooterBoss',action:BossAction,frame:number){
 const base=id==='shooterBoss'?'rifle':id;
 const pose=rigPose(base,0,0),windup=id==='shooterBoss'?.9:1.15;
 const m=bossMotion(frame/35*(windup+.65),windup,action);
 for(const part of ['torso','head','leftArm','rightArm'] as const){pose[part].y+=m.crouch;pose[part].x+=m.recoil;}
 pose.torso.angle=m.lean;pose.head.angle=m.lean*.4;
 pose.leftLeg.angle=-.08*m.brace;pose.rightLeg.angle=.08*m.brace;
 if(action==='slam'){pose.leftArm.angle=2.65*m.lift-.35*m.contact;pose.rightArm.angle=-.55*m.lift;pose.leftArm.y+=m.contact*3;}
 if(action==='rally'){pose.rightArm.angle=-2.7*m.lift-.8*m.contact;pose.leftArm.angle=.25*m.brace;}
 if(action==='charge'){pose.leftArm.angle=-.6*m.brace;pose.rightArm.angle=.45*m.brace;}
 if(action==='fire'){pose.leftArm.angle=-1.2-.55*m.lift;pose.rightArm.angle=1.3;}
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;g.lineJoin='round';
 const shapes=zombieShapes(base);
 for(const part of ['rightLeg','leftLeg','rightArm','leftArm','torso','head'] as const){
 const j=pose[part];g.save();g.translate(j.x,j.y);g.rotate(j.angle);
 for(const s of shapes)if(s.part===part){const path=new Path2D(s.d);g.fillStyle=s.fill;g.strokeStyle=s.stroke;g.lineWidth=s.width;g.fill(path);g.stroke(path);}g.restore();
 }
 if(id==='shooterBoss'){
  g.save();g.translate(76+m.recoil,67+m.crouch);g.rotate(-m.lift*.8);
  g.fillStyle='#475f6d';g.strokeStyle='#14202a';g.lineWidth=2;g.fillRect(-12,-8,38,17);g.strokeRect(-12,-8,38,17);
  for(const y of [-5,5]){g.fillStyle='#a7b4af';g.fillRect(20,y-2,25,4);g.strokeRect(20,y-2,25,4);}g.restore();
 }
 return c;
}
