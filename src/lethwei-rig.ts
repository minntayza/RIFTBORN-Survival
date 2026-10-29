import type {LethweiAction} from './lethwei-techniques';
import {removeDuplicateThighs} from './lethwei-joins';
import type Phaser from 'phaser';
export const LETHWEI_NEAR_FOREARM={key:'lethwei-near-forearm-v5',url:'/assets/characters/lethwei-near-forearm-v5.png'};
export const LETHWEI_FOREARMS={key:'lethwei-athletic-arms-v4',url:'/assets/characters/lethwei-athletic-arms-v4.png'};
export const LETHWEI_ART={key:'lethwei-tiger-jointed-v2',url:'/assets/characters/lethwei-tiger-jointed-v2.png'};
export const LETHWEI_LEGS={key:'lethwei-continuous-legs',url:'/assets/characters/lethwei-tiger-rig-v1.png'};
export const FIGHTER_PARTS=['body','leftUpperArm','rightUpperArm','leftForearm','rightForearm','leftLeg','rightLeg'] as const;
export type FighterPart=typeof FIGHTER_PARTS[number];
// Regions are registered to the actual 1254px atlas; joint crops include rounded caps.
export const FIGHTER_REGIONS:Record<FighterPart,[number,number,number,number]>={
 body:[44,8,265,381],leftUpperArm:[411,70,149,273],rightUpperArm:[694,70,146,271],leftForearm:[1024,87,131,257],
 rightForearm:[101,439,129,255],
 leftLeg:[110,610,285,405],rightLeg:[695,610,275,405]
};
type Point={x:number;y:number};
type Pose={part:FighterPart;x:number;y:number;w:number;h:number;ox:number;oy:number;r:number};
export function fighterJoint(a:Point,b:Point,upper:number,lower:number,bend=1){
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(.001,Math.min(upper+lower-.001,Math.hypot(dx,dy)));
 const angle=Math.atan2(dy,dx),offset=Math.acos(Math.max(-1,Math.min(1,(upper*upper+d*d-lower*lower)/(2*upper*d))));
 return {x:a.x+Math.cos(angle+offset*bend)*upper,y:a.y+Math.sin(angle+offset*bend)*upper};
}
export class FighterMotion{
 phase=0;stride=0;private prior:{x:number;y:number;time:number}|undefined;
 sample(x:number,y:number,time:number){
  const old=this.prior;this.prior={x,y,time};if(!old)return {gait:this.phase,stride:this.stride};
  const dt=Math.max(0,Math.min(.1,time-old.time));if(!dt)return {gait:this.phase,stride:this.stride};
  const distance=Math.hypot(x-old.x,y-old.y),moving=distance>.03&&distance<80;
  const target=moving?Math.min(1,distance/dt/130):0;
  this.stride+=(target-this.stride)*(1-Math.exp(-dt*16));
  if(moving)this.phase+=distance/60*Math.PI*2;
  return {gait:this.phase,stride:this.stride};
 }
}
export function fighterPose(time=0,moving=false,attack=0,sequence=0,motion?:{gait:number;stride:number},duration=.2,aim=0,action?:LethweiAction):Pose[]{
 const gait=motion?.gait??time*5,stride=motion?.stride??(moving?1:0),bounce=(1-Math.cos(gait*2))*stride*.4+Math.sin(time*3)*.25*(1-stride);
 const progress=Math.max(0,Math.min(1,1-attack/duration)),punch=attack>0?Math.sin(progress*Math.PI):0;
 const actionPulse=action?Math.sin((1-action.time/action.duration)*Math.PI):0;
 const out:Pose[]=[];
 const piece=(part:FighterPart,p:Point,w:number,h:number,ox=.5,oy=.12,r=0)=>out.push({part,...p,w,h,ox,oy,r});
 const segment=(part:FighterPart,a:Point,b:Point,width:number)=>{
  const forearm=part.includes('Forearm'),ox=.5,oy=forearm?.1:.18,endX=.5,endY=.82;
  const localX=(endX-ox)*width,length=Math.hypot(b.x-a.x,b.y-a.y);
  const height=Math.sqrt(Math.max(1,length*length-localX*localX))/(endY-oy);
  piece(part,a,width,height,ox,oy,Math.atan2(b.y-a.y,b.x-a.x)-Math.atan2((endY-oy)*height,localX));
 };
 // Each leg is a continuous drawing: only the hip pivot rotates.
 for(const [side,index] of [['left',0],['right',1]] as const){
  const phase=gait+index*Math.PI,swing=Math.sin(phase)*stride,lift=Math.max(0,Math.sin(phase))*stride*1.1;
  piece(`${side}Leg`,{x:index?11:-11,y:14-bounce-lift},index?38:39,65,index?.36:.62,.08,action?.kind==='kick'&&index===0?-1.15*actionPulse:swing*.065);
 }
 const arm=(side:'left'|'right',near:boolean)=>{
  const active=(sequence%2===0)===near,extension=active?punch:0;
  const shoulder={x:near?-21:20,y:-12-bounce};
  const guard={x:near?-11:30,y:(near?-9:-11)-bounce};
  // Reach along the aim line from the shoulder, rather than lifting an offset guard target.
  const target={x:shoulder.x+Math.cos(aim)*44,y:shoulder.y+Math.sin(aim)*44};
  const hand={x:guard.x+(target.x-guard.x)*extension,y:guard.y+(target.y-guard.y)*extension+Math.sin(gait+(near?0:Math.PI))*stride*1.2*(1-extension)};
  if(action?.kind==='elbow'&&near){hand.x=shoulder.x+8;hand.y=shoulder.y-12;}
  const elbow=extension>1-1e-8?{x:(shoulder.x+hand.x)/2,y:(shoulder.y+hand.y)/2}:fighterJoint(shoulder,hand,22,22,action?.kind==='elbow'&&near?-1:1);
  segment(`${side}UpperArm`,shoulder,elbow,18);segment(`${side}Forearm`,elbow,hand,near?15:16.5);

 };
 arm('right',false);
 piece('body',{x:punch*1.4+Math.sin(gait)*stride*.4,y:-60-bounce},64,90,.5,0,punch*.025+Math.sin(gait)*stride*.004);
 arm('left',true);
 if(action){for(const p of out){if(p.part==='body')p.r=0;if(action.kind==='headbutt'){p.x+=Math.cos(aim)*actionPulse*6;p.y+=Math.sin(aim)*actionPulse*6;}}}
 return out;
}
const cache=new WeakMap<HTMLImageElement,Map<FighterPart,HTMLCanvasElement>>();
export function fighterPart(image:HTMLImageElement,part:FighterPart,legs:HTMLImageElement,forearms:HTMLImageElement,nearForearm:HTMLImageElement){
 if(part==='leftLeg'||part==='rightLeg')image=legs;
 if(part.includes('Arm')||part.includes('Forearm'))image=forearms;
 if(part==='leftForearm')image=nearForearm;
 let map=cache.get(image);if(!map){map=new Map();cache.set(image,map);}const prior=map.get(part);if(prior)return prior;
 const forearm=part.includes('Forearm'),arm=forearm||part.includes('UpperArm');
 // Both upper arms use the inward-facing contour; wrapped fists keep their handedness.
 const leftColumn=part.startsWith('left')||part==='rightUpperArm';
 const [rx,ry,rw,rh]=part==='leftForearm'?[0,0,image.width,image.height]:arm?[leftColumn?0:image.width/2,forearm?image.height/2:0,image.width/2,image.height/2]:FIGHTER_REGIONS[part];
 const sx=arm?1:image.width/(part.endsWith('Leg')?1536:1254),sy=arm?1:image.height/(part.endsWith('Leg')?1024:1254);
 const tile=document.createElement('canvas');tile.width=Math.round(rw*sx);tile.height=Math.round(rh*sy);
 const g=tile.getContext('2d')!;g.drawImage(image,rx*sx,ry*sy,rw*sx,rh*sy,0,0,tile.width,tile.height);
 const data=g.getImageData(0,0,tile.width,tile.height).data;let left=tile.width,top=tile.height,right=-1,bottom=-1;
 for(let y=0;y<tile.height;y++)for(let x=0;x<tile.width;x++)if(data[(y*tile.width+x)*4+3]>20){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 const c=document.createElement('canvas');c.width=Math.max(1,right-left+1);c.height=Math.max(1,bottom-top+1);
 if(right>=left)c.getContext('2d')!.drawImage(tile,left,top,c.width,c.height,0,0,c.width,c.height);
 if(part==='body'){const ctx=c.getContext('2d')!,pixels=ctx.getImageData(0,0,c.width,c.height);removeDuplicateThighs(pixels.data,c.width,c.height);ctx.putImageData(pixels,0,0);}
 map.set(part,c);return c;
}
export function drawFighter(g:CanvasRenderingContext2D,image:HTMLImageElement,legs:HTMLImageElement,forearms:HTMLImageElement,nearForearm:HTMLImageElement,time=0,moving=false,attack=0,sequence=0,flip=false,motion?:{gait:number;stride:number}){
 g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.scale(flip?-1:1,1);
 for(const p of fighterPose(time,moving,attack,sequence,motion)){g.save();g.translate(p.x,p.y);g.rotate(p.r);g.drawImage(fighterPart(image,p.part,legs,forearms,nearForearm),-p.w*p.ox,-p.h*p.oy,p.w,p.h);g.restore();}g.restore();
}
export class LethweiRig{
 private parts=new Map<FighterPart,Phaser.GameObjects.Image>();
 private motion=new FighterMotion();
 constructor(scene:Phaser.Scene){const source=scene.textures.get(LETHWEI_ART.key).getSourceImage() as HTMLImageElement,legs=scene.textures.get(LETHWEI_LEGS.key).getSourceImage() as HTMLImageElement,forearms=scene.textures.get(LETHWEI_FOREARMS.key).getSourceImage() as HTMLImageElement,nearForearm=scene.textures.get(LETHWEI_NEAR_FOREARM.key).getSourceImage() as HTMLImageElement;for(const part of FIGHTER_PARTS){const key=LETHWEI_ART.key+'-'+part;if(!scene.textures.exists(key))scene.textures.addCanvas(key,fighterPart(source,part,legs,forearms,nearForearm));this.parts.set(part,scene.add.image(0,0,key));}}
 render(x:number,y:number,aim:number,time:number,moving:boolean,attack:number,sequence:number,duration=.2,action?:LethweiAction){if(action)aim=action.aim;const flip=Math.cos(aim)<0,scale=.58,motion=this.motion.sample(x,y,time);fighterPose(time,moving,attack,sequence,motion,duration,Math.atan2(Math.sin(aim),Math.abs(Math.cos(aim))),action).forEach((p,i)=>{this.parts.get(p.part)!.setOrigin(flip?1-p.ox:p.ox,p.oy).setPosition(x+p.x*scale*(flip?-1:1),y+(p.y-4)*scale).setDisplaySize(p.w*scale,p.h*scale).setRotation(p.r*(flip?-1:1)).setFlipX(flip).setDepth(3+i*.012);});}
 campLayer(offset:number){fighterPose().forEach((p,i)=>this.parts.get(p.part)!.setDepth(3+i*.012+offset));}
 defeat(){for(const s of this.parts.values())s.setAlpha(.4);}
}

export class LethweiCloneRig {
 private parts = new Map<FighterPart, Phaser.GameObjects.Image>();
 private motion = new FighterMotion();

 constructor(scene: Phaser.Scene, depth = 3.28) {
  try {
   const source = scene.textures.get(LETHWEI_ART.key)?.getSourceImage() as HTMLImageElement | undefined;
   const legs = scene.textures.get(LETHWEI_LEGS.key)?.getSourceImage() as HTMLImageElement | undefined;
   const forearms = scene.textures.get(LETHWEI_FOREARMS.key)?.getSourceImage() as HTMLImageElement | undefined;
   const nearForearm = scene.textures.get(LETHWEI_NEAR_FOREARM.key)?.getSourceImage() as HTMLImageElement | undefined;

   for (const part of FIGHTER_PARTS) {
    const key = LETHWEI_ART.key + '-' + part;
    if (!scene.textures.exists(key) && source && legs && forearms && nearForearm) {
     scene.textures.addCanvas(key, fighterPart(source, part, legs, forearms, nearForearm));
    }
    if (scene.textures.exists(key)) {
     const img = scene.add.image(0, 0, key)
      .setDepth(depth)
      .setVisible(false)
      .setAlpha(0.88)
      .setTint(0xffd54f);
     this.parts.set(part, img);
    }
   }
  } catch {}
 }

 render(
  x: number,
  y: number,
  aim: number,
  time: number,
  moving: boolean,
  attack: number,
  sequence: number,
  duration = 0.2,
  afterimageAlpha?: number
 ) {
  const flip = Math.cos(aim) < 0;
  const scale = 0.54;
  const motion = this.motion.sample(x, y, time);
  const breath = Math.sin(time * 6) * 0.04;
  const poses = fighterPose(
   time,
   moving,
   attack,
   sequence,
   motion,
   duration,
   Math.atan2(Math.sin(aim), Math.abs(Math.cos(aim)))
  );

  poses.forEach((p, i) => {
   const img = this.parts.get(p.part);
   if (img) {
    img
     .setVisible(true)
     .setOrigin(flip ? 1 - p.ox : p.ox, p.oy)
     .setPosition(x + p.x * scale * (flip ? -1 : 1), y + (p.y - 4) * scale)
     .setDisplaySize(p.w * scale, p.h * scale)
     .setRotation(p.r * (flip ? -1 : 1))
     .setFlipX(flip)
     .setAlpha(afterimageAlpha ?? (0.85 + breath));
    if(afterimageAlpha!==undefined)img.setTintFill(0xfff1d5);else img.setTint(0xffd54f);
   }
  });
 }

 setVisible(visible: boolean) {
  for (const img of this.parts.values()) {
   img.setVisible(visible);
  }
 }

 destroy() {
  for (const img of this.parts.values()) {
   img.destroy();
  }
  this.parts.clear();
 }
}
