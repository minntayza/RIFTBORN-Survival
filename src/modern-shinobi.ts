import {cosmeticRestArmPose} from './cosmetic-connected-arm';
import {connectedArmRegion} from './connected-arms';
export const MODERN_SHINOBI='/assets/cosmetics/ninja-modern-rig-v3.png';
export const isModernShinobi=(url:string)=>url.includes('ninja-modern-rig-v');
type Part='body'|'leftLeg'|'rightLeg'|'leftArm'|'rightArm';
export const MODERN_REGIONS:Record<Part,readonly[number,number,number,number]>={body:[0,0,800,940],leftArm:[805,20,260,460],rightArm:[1185,20,260,460],leftLeg:[715,480,340,520],rightLeg:[1180,480,355,520]};
const cache=new WeakMap<HTMLImageElement,Map<Part,HTMLCanvasElement>>();
export function modernPart(image:HTMLImageElement,part:Part){let map=cache.get(image);if(!map){map=new Map();cache.set(image,map);}const previous=map.get(part);if(previous)return previous;const [x,y,w,h]=MODERN_REGIONS[part],c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d')!;
 // Adjacent islands never leak into the torso or the left shoe's wide crop.
 const polygon=part==='body'?[[280,0],[800,0],[800,850],[690,850],[690,940],[150,940],[150,800],[0,750],[0,250]]:part==='leftLeg'?[[110,0],[340,0],[340,520],[0,520],[0,390],[90,355],[90,170]]:undefined;
 if(polygon){g.beginPath();polygon.forEach(([px,py],i)=>i?g.lineTo(px,py):g.moveTo(px,py));g.closePath();g.clip();}
 g.drawImage(image,x*image.width/1536,y*image.height/1024,w*image.width/1536,h*image.height/1024,0,0,w,h);map.set(part,c);return c;
}
/** One image from shoulder cap through fist; neither wrist nor elbow is animated. */
export function modernArm(image:HTMLImageElement,side:number){const region=connectedArmRegion('ninja',side),c=document.createElement('canvas');c.width=region[2]*3;c.height=region[3]*3;const g=c.getContext('2d')!;g.scale(3,3);const source=modernPart(image,side===0?'rightArm':'leftArm');const a=side===0?{x:65,y:50}:{x:195,y:50},b=side===0?{x:180,y:404}:{x:87,y:404},targetA={x:region[2]*.5,y:region[3]*.12},targetB={x:region[2]*(side===0?.4:.6),y:region[3]*.88},scale=Math.hypot(targetB.x-targetA.x,targetB.y-targetA.y)/Math.hypot(b.x-a.x,b.y-a.y);g.translate(targetA.x,targetA.y);g.rotate(Math.atan2(targetB.y-targetA.y,targetB.x-targetA.x)-Math.atan2(b.y-a.y,b.x-a.x));g.scale(scale,scale);g.drawImage(source,-a.x,-a.y);return c;}

/** SVG counterpart of ninjaSkinCanvas: use this sheet's regions, not legacy islands. */
export function modernShinobiPortrait(url:string){
 const piece=(part:Part,x:number,y:number,w:number,h:number)=>{
  const [sx,sy,sw,sh]=MODERN_REGIONS[part];
  const points=part==='body'?'280,0 800,0 800,850 690,850 690,940 150,940 150,800 0,750 0,250':part==='leftLeg'?'110,0 340,0 340,520 0,520 0,390 90,355 90,170':'';
  const key=`modern-portrait-${part}`;
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${sw} ${sh}" preserveAspectRatio="none" overflow="hidden">${points?`<defs><clipPath id="${key}"><polygon points="${points}"/></clipPath></defs>`:''}<image href="${url}" x="${-sx}" y="${-sy}" width="1536" height="1024" ${points?`clip-path="url(#${key})"`:''}/></svg>`;
 };
 const arms=[0,1].map(side=>{
  const p=cosmeticRestArmPose('ninja',side),r=connectedArmRegion('ninja',side);
  const a=side===0?{x:65,y:50}:{x:195,y:50},b=side===0?{x:180,y:404}:{x:87,y:404};
  const targetA={x:r[2]*.5,y:r[3]*.12},targetB={x:r[2]*(side===0?.4:.6),y:r[3]*.88};
  const scale=Math.hypot(targetB.x-targetA.x,targetB.y-targetA.y)/Math.hypot(b.x-a.x,b.y-a.y);
  const rotation=(Math.atan2(targetB.y-targetA.y,targetB.x-targetA.x)-Math.atan2(b.y-a.y,b.x-a.x))*180/Math.PI;
  return `<g data-modern-arm="${side}" transform="translate(${p.x} ${p.y}) rotate(${p.rotation*180/Math.PI})"><g transform="translate(${-p.width*p.originX} ${-p.height*p.originY}) scale(${p.width/r[2]} ${p.height/r[3]})"><g transform="translate(${targetA.x} ${targetA.y}) rotate(${rotation}) scale(${scale})">${piece(side===0?'rightArm':'leftArm',-a.x,-a.y,260,460)}</g></g></g>`;
 }).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Modern Street Shinobi full-body outfit">${piece('leftLeg',48,86,24,32)}${piece('rightLeg',68,86,24,32)}<g transform="translate(128 0) scale(-1 1)">${piece('body',19,3,90,91)}</g>${arms}</svg>`;
}
