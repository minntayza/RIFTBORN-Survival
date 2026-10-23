import {imageSourceUrl} from './texture-cache';
export const isRedesignedTank=(url:string)=>url.includes('/tank-v3/');
export const TANK_RIG_ATLAS='/assets/cosmetics/tank-v3/animation-parts.png';
type Point=readonly [number,number];
const legs=[{pivot:[48,83] as Point},{pivot:[80,83] as Point}];
const rig=(y:number)=>({arms:[{pivot:[90,y] as Point},{pivot:[38,y] as Point}],legs,legSize:[22,45] as Point});
export const TANK_RIGS={royal:rig(51),forge:{...rig(53),legs:[{pivot:[46,83] as Point},{pivot:[82,83] as Point}],legSize:[26,40] as Point},polar:rig(52)};
export function tankRig(url:string){return TANK_RIGS[url.includes('royal')?'royal':url.includes('forge')?'forge':'polar'];}
let atlas:HTMLImageElement|HTMLCanvasElement|undefined;
const parts=new Map<string,HTMLCanvasElement[]>();
export function registerTankRigAtlas(image:HTMLImageElement|HTMLCanvasElement){if(atlas!==image){atlas=image;parts.clear();}}
/** Tight alpha bounds inside a single atlas cell prevent adjacent-part leakage. */
function cropCell(image:HTMLImageElement|HTMLCanvasElement,row:number,col:number){const columns=[[0,.26],[.29,.43],[.47,.61],[.64,.80],[.83,1]],left=Math.floor(columns[col][0]*image.width),w=Math.floor((columns[col][1]-columns[col][0])*image.width),h=Math.floor(image.height/3),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d')!;g.drawImage(image,left,row*h,w,h,0,0,w,h);const data=g.getImageData(0,0,w,h),pixels=data.data,seen=new Uint8Array(w*h);let largest:number[]=[];
 for(let i=0;i<w*h;i++)if(!seen[i]&&pixels[i*4+3]>64){const group=[i];seen[i]=1;for(let j=0;j<group.length;j++){const q=group[j],x=q%w;for(const n of [x>0?q-1:-1,x<w-1?q+1:-1,q-w,q+w])if(n>=0&&n<w*h&&!seen[n]&&pixels[n*4+3]>64){seen[n]=1;group.push(n);}}if(group.length>largest.length)largest=group;}
 const keep=new Uint8Array(w*h);let l=w,t=h,r=0,b=0;for(const i of largest){keep[i]=1;const x=i%w,y=Math.floor(i/w);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}for(let i=0;i<w*h;i++)if(!keep[i])pixels[i*4+3]=0;g.putImageData(data,0,0);
 const out=document.createElement('canvas');out.width=Math.max(1,r-l+1);out.height=Math.max(1,b-t+1);out.getContext('2d')!.drawImage(c,l,t,out.width,out.height,0,0,out.width,out.height);return out;}
function layers(source:HTMLImageElement){const url=imageSourceUrl(source),name=url.includes('royal')?'royal':url.includes('forge')?'forge':'polar';let result=parts.get(name);if(result)return result;if(!atlas)throw Error('Tank animation atlas has not loaded');const row=name==='royal'?0:name==='forge'?1:2;result=Array.from({length:5},(_,col)=>cropCell(atlas!,row,col));parts.set(name,result);return result;}
/** Only the legs rotate during a walk; the head/torso source never changes. */
export function redesignedTankCanvas(source:HTMLImageElement,frame:number,showArms:boolean,resolution=128){const c=document.createElement('canvas');c.width=c.height=resolution;const g=c.getContext('2d')!;g.scale(resolution/128,resolution/128);const p=layers(source),rig=tankRig(imageSourceUrl(source)),phase=frame===0?0:(frame-1)/24*Math.PI*2;
 for(let i=0;i<2;i++){const [x,y]=rig.legs[i].pivot;g.save();g.translate(x,y);g.rotate(Math.sin(phase)*(i===0?1:-1)*.08);const [w,h]=rig.legSize;g.drawImage(p[i+3],-w/2,-4,w,h);g.restore();}
 const body=p[0],height=85,width=Math.min(85,height*body.width/body.height);g.save();g.beginPath();g.moveTo(0,0);g.lineTo(128,0);g.lineTo(128,39);g.lineTo(83,39);g.lineTo(78,65);g.lineTo(78,75);g.lineTo(96,80);g.lineTo(96,88);g.lineTo(32,88);g.lineTo(32,80);g.lineTo(50,75);g.lineTo(50,65);g.lineTo(45,39);g.lineTo(0,39);g.closePath();g.clip();g.drawImage(body,64-width/2,2,width,height);g.restore();
 if(showArms)for(let i=0;i<2;i++){const [x,y]=rig.arms[i].pivot,p=tankArmPose(i,{x,y},{x:x+(i===0?2:-2),y:88});g.save();g.translate(p.x,p.y);g.rotate(p.rotation);g.drawImage(redesignedTankArm(source,i),-p.width*p.originX,-p.height*p.originY,p.width,p.height);g.restore();}return c;
}
/** A uniform transform maps the painted shoulder and glove to the rig anchors. */
export function redesignedTankArm(source:HTMLImageElement,side:number){
 const c=document.createElement('canvas');c.width=320;c.height=470;
 const g=c.getContext('2d')!,p=layers(source)[side===0?2:1];
 const sx=p.width*.5,sy=p.height*.2,gx=p.width*(side===0?.42:.58),gy=p.height*.88;
 const dx=(side===0?-.02:.02)*320,dy=.64*470,scale=Math.hypot(dx,dy)/Math.hypot(gx-sx,gy-sy);
 g.translate(160,94);g.rotate(Math.atan2(dy,dx)-Math.atan2(gy-sy,gx-sx));g.scale(scale,scale);g.drawImage(p,-sx,-sy);return c;
}
export function tankArmPose(side:number,shoulder:{x:number;y:number},hand:{x:number;y:number},facing=1){
 const dx=(side===0?-.02:.02)*320*facing,dy=.64*470,scale=Math.hypot(hand.x-shoulder.x,hand.y-shoulder.y)/Math.hypot(dx,dy);
 return {x:shoulder.x,y:shoulder.y,width:320*scale,height:470*scale,originX:.5,originY:.2,flipX:facing<0,rotation:Math.atan2(hand.y-shoulder.y,hand.x-shoulder.x)-Math.atan2(dy,dx)};
}

/** Visual-only linkage: combat reach and hit tests keep using weaponPose unchanged. */
export function tankEquipmentPose<T extends {grip:{x:number;y:number};tip:{x:number;y:number};rotation:number}>(pose:T,x:number,y:number,facing:number,url:string,hammer:boolean):T{
 if(!isRedesignedTank(url))return pose;
 const shoulders=tankRig(url).arms.map(({pivot:[px,py]})=>({x:x+(px-64)*78/128*facing,y:y+(py-64)*78/128}));
 let grip:{x:number;y:number};
 if(hammer){
  const offset={x:-Math.cos(pose.rotation)*10.5,y:-Math.sin(pose.rotation)*10.5},a=shoulders[0],b={x:shoulders[1].x-offset.x,y:shoulders[1].y-offset.y},dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),h=Math.sqrt(Math.max(0,22*22-d*d/4)),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  const p={x:mx-dy/d*h,y:my+dx/d*h},q={x:mx+dy/d*h,y:my-dx/d*h};grip=p.y>=q.y?p:q;
 }else{const a=pose.rotation+.3*facing;grip={x:shoulders[0].x+Math.cos(a)*22,y:shoulders[0].y+Math.sin(a)*22};}
 return {...pose,grip,tip:{x:pose.tip.x+grip.x-pose.grip.x,y:pose.tip.y+grip.y-pose.grip.y}};
}
