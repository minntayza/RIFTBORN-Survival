import {removeDuplicateThighs,wrapWristCap} from './lethwei-joins';
import type Phaser from 'phaser';
export const LETHWEI_ART={key:'lethwei-tiger-jointed-v2',url:'/assets/characters/lethwei-tiger-jointed-v2.png'};
export const LETHWEI_LEGS={key:'lethwei-continuous-legs',url:'/assets/characters/lethwei-tiger-rig-v1.png'};
export const FIGHTER_PARTS=['body','leftUpperArm','rightUpperArm','leftForearm','rightForearm','leftHand','rightHand','leftLeg','rightLeg'] as const;
export type FighterPart=typeof FIGHTER_PARTS[number];
// Regions are registered to the actual 1254px atlas; joint crops include rounded caps.
export const FIGHTER_REGIONS:Record<FighterPart,[number,number,number,number]>={
 body:[44,8,265,381],leftUpperArm:[411,70,149,273],rightUpperArm:[694,70,146,271],leftForearm:[1024,87,131,257],
 rightForearm:[101,439,129,255],leftHand:[409,450,182,213],rightHand:[663,449,183,215],
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
  if(moving)this.phase+=distance/34*Math.PI*2;
  return {gait:this.phase,stride:this.stride};
 }
}
export function fighterPose(time=0,moving=false,attack=0,sequence=0,motion?:{gait:number;stride:number},duration=.2,aim=0):Pose[]{
 const gait=motion?.gait??time*9,stride=motion?.stride??(moving?1:0),bounce=(1-Math.cos(gait*2))*stride*.8+Math.sin(time*3)*.25*(1-stride);
 const progress=Math.max(0,Math.min(1,1-attack/duration)),punch=attack>0?Math.sin(progress*Math.PI):0;
 const out:Pose[]=[];
 const piece=(part:FighterPart,p:Point,w:number,h:number,ox=.5,oy=.12,r=0)=>out.push({part,...p,w,h,ox,oy,r});
 const segment=(part:FighterPart,a:Point,b:Point,width:number)=>{
  const forearm=part.includes('Forearm'),ox=.5,oy=forearm?.1:.18,endX=forearm?.58:.5,endY=forearm?.87:.82;
  const localX=(endX-ox)*width,length=Math.hypot(b.x-a.x,b.y-a.y);
  const height=Math.sqrt(Math.max(1,length*length-localX*localX))/(endY-oy);
  piece(part,a,width,height,ox,oy,Math.atan2(b.y-a.y,b.x-a.x)-Math.atan2((endY-oy)*height,localX));
 };
 // Each leg is a continuous drawing: only the hip pivot rotates.
 for(const [side,index] of [['left',0],['right',1]] as const){
  const phase=gait+index*Math.PI,swing=Math.sin(phase)*stride;
  piece(`${side}Leg`,{x:index?11:-11,y:14-bounce},index?38:39,65,index?.36:.62,.08,swing*.11);
 }
 const arm=(side:'left'|'right',near:boolean)=>{
  const active=(sequence%2===0)===near,extension=active?punch:0;
  const shoulder={x:near?-21:20,y:-12-bounce};
  const guard={x:near?-11:30,y:(near?-9:-11)-bounce};
  const hand={x:guard.x+Math.cos(aim)*extension*(near?33:27),y:guard.y+Math.sin(aim)*extension*(near?33:27)-extension*8+Math.sin(gait+(near?0:Math.PI))*stride*1.2*(1-extension)};
  const elbow=fighterJoint(shoulder,hand,22,25,1);
  segment(`${side}UpperArm`,shoulder,elbow,18);segment(`${side}Forearm`,elbow,hand,15);
  // The two fist drawings have mirrored, off-centre wrist openings.
  // Align their wrist-to-knuckle axes with the forearm instead of rotating
  // them around the middle of the wrapping.
  const wristX=near?.38:.62;
  const fistAngle=Math.atan2(hand.y-elbow.y,hand.x-elbow.x)-Math.atan2(19*.56,17*(near?.28:-.28));
  piece(`${side}Hand`,hand,17,19,wristX,.24,fistAngle);
 };
 arm('right',false);
 piece('body',{x:punch*1.4,y:-60-bounce},64,90,.5,0,punch*.025);
 arm('left',true);
 return out;
}
const cache=new WeakMap<HTMLImageElement,Map<FighterPart,HTMLCanvasElement>>();
export function fighterPart(image:HTMLImageElement,part:FighterPart,legs:HTMLImageElement){
 if(part==='leftLeg'||part==='rightLeg')image=legs;
 let map=cache.get(image);if(!map){map=new Map();cache.set(image,map);}const prior=map.get(part);if(prior)return prior;
 const [rx,ry,rw,rh]=FIGHTER_REGIONS[part],sx=image.width/(part.endsWith('Leg')?1536:1254),sy=image.height/(part.endsWith('Leg')?1024:1254);
 const tile=document.createElement('canvas');tile.width=Math.round(rw*sx);tile.height=Math.round(rh*sy);
 const g=tile.getContext('2d')!;g.drawImage(image,rx*sx,ry*sy,rw*sx,rh*sy,0,0,tile.width,tile.height);
 const data=g.getImageData(0,0,tile.width,tile.height).data;let left=tile.width,top=tile.height,right=-1,bottom=-1;
 for(let y=0;y<tile.height;y++)for(let x=0;x<tile.width;x++)if(data[(y*tile.width+x)*4+3]>20){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 const c=document.createElement('canvas');c.width=Math.max(1,right-left+1);c.height=Math.max(1,bottom-top+1);
 if(right>=left)c.getContext('2d')!.drawImage(tile,left,top,c.width,c.height,0,0,c.width,c.height);
 if(part.includes('Forearm')||part.endsWith('Hand')){const ctx=c.getContext('2d')!,pixels=ctx.getImageData(0,0,c.width,c.height);wrapWristCap(pixels.data,c.width,c.height,part.endsWith('Hand'));ctx.putImageData(pixels,0,0);}
 if(part==='body'){const ctx=c.getContext('2d')!,pixels=ctx.getImageData(0,0,c.width,c.height);removeDuplicateThighs(pixels.data,c.width,c.height);ctx.putImageData(pixels,0,0);}
 map.set(part,c);return c;
}
export function drawFighter(g:CanvasRenderingContext2D,image:HTMLImageElement,legs:HTMLImageElement,time=0,moving=false,attack=0,sequence=0,flip=false,motion?:{gait:number;stride:number}){
 g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.scale(flip?-1:1,1);
 for(const p of fighterPose(time,moving,attack,sequence,motion)){g.save();g.translate(p.x,p.y);g.rotate(p.r);g.drawImage(fighterPart(image,p.part,legs),-p.w*p.ox,-p.h*p.oy,p.w,p.h);g.restore();}g.restore();
}
export class LethweiRig{
 private parts=new Map<FighterPart,Phaser.GameObjects.Image>();
 private motion=new FighterMotion();
 constructor(scene:Phaser.Scene){const source=scene.textures.get(LETHWEI_ART.key).getSourceImage() as HTMLImageElement,legs=scene.textures.get(LETHWEI_LEGS.key).getSourceImage() as HTMLImageElement;for(const part of FIGHTER_PARTS){const key=LETHWEI_ART.key+'-'+part;if(!scene.textures.exists(key))scene.textures.addCanvas(key,fighterPart(source,part,legs));this.parts.set(part,scene.add.image(0,0,key));}}
 render(x:number,y:number,aim:number,time:number,moving:boolean,attack:number,sequence:number,duration=.2){const flip=Math.cos(aim)<0,scale=.58,motion=this.motion.sample(x,y,time);fighterPose(time,moving,attack,sequence,motion,duration,Math.atan2(Math.sin(aim),Math.abs(Math.cos(aim)))).forEach((p,i)=>{this.parts.get(p.part)!.setOrigin(flip?1-p.ox:p.ox,p.oy).setPosition(x+p.x*scale*(flip?-1:1),y+(p.y-4)*scale).setDisplaySize(p.w*scale,p.h*scale).setRotation(p.r*(flip?-1:1)).setFlipX(flip).setDepth(3+i*.012);});}
 campLayer(offset:number){fighterPose().forEach((p,i)=>this.parts.get(p.part)!.setDepth(3+i*.012+offset));}
 defeat(){for(const s of this.parts.values())s.setAlpha(.4);}
}
