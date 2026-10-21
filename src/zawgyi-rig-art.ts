import {zawgyiMotion,type ZawgyiPart} from './zawgyi-motion';
export const ZAWGYI_ATLAS={key:'zawgyi-hero',url:'/assets/characters/zawgyi-rig-v4.png',width:1774,height:887};
export const ZAWGYI_REGIONS:Record<ZawgyiPart,readonly [number,number,number,number]>={body:[148,20,524,826],leftArm:[784,56,272,416],rightArm:[1212,56,260,424],leftLeg:[768,480,276,356],rightLeg:[1192,480,284,356],staff:[1600,20,88,848]};
const masks:Partial<Record<ZawgyiPart,string>>={};
const cache=new WeakMap<HTMLImageElement,Map<ZawgyiPart,HTMLCanvasElement>>();
export function zawgyiPart(image:HTMLImageElement,part:ZawgyiPart){let map=cache.get(image);if(!map){map=new Map();cache.set(image,map);}const old=map.get(part);if(old)return old;const [x,y,w,h]=ZAWGYI_REGIONS[part],c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d')!;g.translate(-x,-y);if(masks[part])g.clip(new Path2D(masks[part]));g.drawImage(image,0,0,ZAWGYI_ATLAS.width,ZAWGYI_ATLAS.height);map.set(part,c);return c;}
export function drawZawgyi(g:CanvasRenderingContext2D,image:HTMLImageElement,time=0,moving=false,attack=0,sequence=0,flip=false,slam=-1){g.save();if(flip){g.translate(128,0);g.scale(-1,1);}for(const p of zawgyiMotion(time,moving,attack,sequence,slam).parts){g.save();g.translate(p.x,p.y);g.rotate(p.rotation);g.drawImage(zawgyiPart(image,p.part),-p.width*p.ox,-p.height*p.oy,p.width,p.height);g.restore();}g.restore();}
export function zawgyiRigPortrait(cls='art-image'){const parts=zawgyiMotion(0).parts.map(p=>{const r=ZAWGYI_REGIONS[p.part],id=`zawgyi-mask-${p.part}`,mask=masks[p.part];return `<g transform="translate(${p.x} ${p.y}) rotate(${p.rotation*180/Math.PI})"><svg x="${-p.width*p.ox}" y="${-p.height*p.oy}" width="${p.width}" height="${p.height}" viewBox="${r.join(' ')}" preserveAspectRatio="none" overflow="hidden">${mask?`<defs><clipPath id="${id}"><path d="${mask}"/></clipPath></defs>`:''}<image href="${ZAWGYI_ATLAS.url}" width="1774" height="887" ${mask?`clip-path="url(#${id})"`:''}/></svg></g>`;}).join('');return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="10 -28 116 160" role="img" aria-label="Zawgyi with his red magic staff">${parts}</svg>`;}

/** Pre-filter large painted islands before the GPU shrinks them to gameplay size.
 * A single large reduction samples isolated bright pixels and shimmers at 2× map view. */
export function zawgyiGameplayPart(image:HTMLImageElement,part:ZawgyiPart){
 const pose=zawgyiMotion(0).parts.find(p=>p.part===part)!,width=Math.ceil(pose.width*.72),height=Math.ceil(pose.height*.72);
 let source=zawgyiPart(image,part);
 while(source.width>width||source.height>height){const next=document.createElement('canvas');next.width=Math.max(width,Math.ceil(source.width/2));next.height=Math.max(height,Math.ceil(source.height/2));const g=next.getContext('2d')!;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(source,0,0,next.width,next.height);source=next;}
 return source;
}
