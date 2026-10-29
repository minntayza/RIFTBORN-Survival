import type Phaser from 'phaser';
import type {WeaponId} from './config';
import {weaponPose} from './weapon-effects';
export const KYANSITTHA_RIG_ASSETS={atlas:{key:'kyansittha-royal-spark-v1',url:'/assets/characters/kyansittha-royal-spark-atlas-v1.png'}} as const;
export const KYANSITTHA_PORTRAIT='/assets/characters/kyansittha-royal-spark-portrait-v1.png';
const crops={body:[50,0,465,590],legLeft:[640,190,335,385],legRight:[1120,185,365,390],nearArm:[100,725,380,155],farArm:[745,690,220,300],spear:[1190,578,125,440]} as const;
type Part=keyof typeof crops;
export type KyansitthaPart='legs'|'body';
type Piece={part:Part;x:number;y:number;w:number;h:number;angle:number;ox:number;oy:number};
export const ROYAL_SPARK_SCALE=.75;
export function royalSparkPose(time=0,moving=false,attack=0,aim=0,sequence=0,duration=.38,weapon:WeaponId='arindamaspear',reach=1,arcScale=1):Piece[]{
 const flip=Math.cos(aim)<0,sign=flip?-1:1,bob=moving?Math.abs(Math.sin(time*5))*.5:0;
 const pieces:Piece[]=[];
 const add=(part:Part,x:number,y:number,w:number,h:number,angle=0,ox=.5,oy=0)=>pieces.push({part,x,y:y-bob,w,h,angle,ox,oy});
 add('legLeft',-8,9,25,33,moving?Math.sin(time*5)*.09:0,.55,.05);
 add('legRight',8,9,25,33,moving?-Math.sin(time*5)*.09:0,.45,.05);
 add('body',0,-51,60,76);
 add('farArm',18,-6,17,25,-.15,.3,.16);
 let hand={x:-25,y:8},tip={x:-25,y:-65};
 if(attack>0){
  const phase=Math.max(0,Math.min(1,1-attack/Math.max(.01,duration))),pose=weaponPose(weapon,0,0,aim,phase,true,sequence,false,false,reach,arcScale);
  hand={x:pose.grip.x/ROYAL_SPARK_SCALE*sign,y:pose.grip.y/ROYAL_SPARK_SCALE+bob};
  tip={x:pose.tip.x/ROYAL_SPARK_SCALE*sign,y:pose.tip.y/ROYAL_SPARK_SCALE+bob};
 }
 const sx=-13,sy=-7,dx=hand.x-sx,dy=hand.y-sy,length=Math.hypot(dx,dy),width=length/.8;
 add('nearArm',sx,sy,width,width*155/380,Math.atan2(dy,dx),.1,.5);
 const spearLength=Math.hypot(tip.x-hand.x,tip.y-hand.y)/.68;
 add('spear',hand.x,hand.y,spearLength*125/440,spearLength,Math.atan2(tip.y-hand.y,tip.x-hand.x)+Math.PI/2,.68,.68);
 return pieces;
}
let image:HTMLImageElement|undefined;
export async function loadRoyalSparkArt(){if(image?.complete&&image.naturalWidth)return image;return new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>{image=im;resolve(im);};im.onerror=reject;im.src=KYANSITTHA_RIG_ASSETS.atlas.url;});}
export function drawKyansittha(g:CanvasRenderingContext2D,time=0,moving=false,attack=0,aim=0,flip=false){if(!image)return;g.save();if(flip||Math.cos(aim)<0)g.scale(-1,1);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';for(const p of royalSparkPose(time,moving,attack,aim)){const c=crops[p.part];g.save();g.translate(p.x,p.y);g.rotate(p.angle);g.drawImage(image,c[0],c[1],c[2],c[3],-p.w*p.ox,-p.h*p.oy,p.w,p.h);g.restore();}g.restore();}
export function createKyansitthaCanvas(_part:KyansitthaPart,attack=0){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;g.translate(64,66);drawKyansittha(g,0,false,attack);return c;}
export class KyansitthaRig{
 private sprites:Phaser.GameObjects.Image[]=[];
 constructor(private scene:Phaser.Scene){const texture=scene.textures.get(KYANSITTHA_RIG_ASSETS.atlas.key);for(const [name,c] of Object.entries(crops))if(!texture.has(name))texture.add(name,0,c[0],c[1],c[2],c[3]);}
 render(x:number,y:number,aim:number,time:number,moving:boolean,attack:number,sequence:number,duration=.38,weapon:WeaponId='arindamaspear',reach=1,arcScale=1){
  const flip=Math.cos(aim)<0,sign=flip?-1:1,scale=ROYAL_SPARK_SCALE;
  royalSparkPose(time,moving,attack,aim,sequence,duration,weapon,reach,arcScale).forEach((p,i)=>{const sprite=this.sprites[i]??(this.sprites[i]=this.scene.add.image(0,0,KYANSITTHA_RIG_ASSETS.atlas.key,p.part));sprite.setFrame(p.part).setOrigin(flip?1-p.ox:p.ox,p.oy).setDisplaySize(p.w*scale,p.h*scale).setPosition(x+p.x*scale*sign,y+p.y*scale).setRotation(p.angle*sign).setFlipX(flip).setDepth(3.1+i*.01).setVisible(true);});
 }
 clear(){this.sprites.forEach(s=>s.setVisible(false));}
 campLayer(offset:number){this.sprites.forEach((s,i)=>s.setDepth(3.1+i*.01+offset));}
}
