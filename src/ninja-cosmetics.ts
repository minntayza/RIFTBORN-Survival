import {singlePieceCosmeticArm,drawCosmeticRestArms,cosmeticRestArmsSvg} from './cosmetic-connected-arm';
import {imageSourceUrl} from './texture-cache';
export const NINJA_SKIN_KEY='ninja-cosmetic-atlas';
const bodyParts={body:[0,0,420,490],leftLeg:[400,200,180,280],rightLeg:[650,200,190,280],upper:[850,195,180,270],forearm:[1050,260,160,220],hand:[1210,280,160,210],otherHand:[1380,280,150,210]} as const;
function part(image:HTMLImageElement,key:keyof typeof bodyParts){const [x,y,w,h]=bodyParts[key],c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d')!.drawImage(image,x*image.width/1536,y*image.height/1024,w*image.width/1536,h*image.height/1024,0,0,w,h);return c;}
export function ninjaSkinCanvas(image:HTMLImageElement,frame:number,arms=false){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!,step=frame===0?0:Math.sin((frame-1)/24*Math.PI*2);for(const [key,x,angle] of [['leftLeg',53,step*.17],['rightLeg',73,-step*.17]] as const){g.save();g.translate(x,88);g.rotate(angle);g.drawImage(part(image,key),-12,-2,24,32);g.restore();}g.drawImage(part(image,'body'),19,3,90,91);if(arms)drawCosmeticRestArms(g,'ninja',side=>ninjaSkinArm(image,side));return c;}
export function ninjaSkinArm(image:HTMLImageElement,side:number){return singlePieceCosmeticArm('ninja',side,part(image,'upper'),part(image,side===0?'hand':'otherHand'));}
export function ninjaSkinPortrait(url:string){const piece=(key:keyof typeof bodyParts,x:number,y:number,w:number,h:number)=>`<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${bodyParts[key].join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${url}" width="1536" height="1024"/></svg>`;return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Ninja outfit illustration">${piece('leftLeg',41,87,24,32)}${piece('rightLeg',61,87,24,32)}${piece('body',19,3,90,91)}${cosmeticRestArmsSvg('ninja',piece)}</svg>`;}
function weaponRegion(url:string,id:'katana'|'dual'|'kama'){return id==='katana'?(url.includes('modern')?[225,470,140,550]:url.includes('future')?[195,490,165,520]:[190,480,170,530]):id==='dual'?[680,550,190,470]:[1080,495,450,525];}
export function ninjaSkinWeaponCanvas(image:HTMLImageElement,id:'katana'|'dual'|'kama'){
 const tile=document.createElement('canvas');tile.width=tile.height=724;const t=tile.getContext('2d')!;const [sx,sy,sw,sh]=weaponRegion(imageSourceUrl(image),id);t.drawImage(image,sx*image.width/1536,sy*image.height/1024,sw*image.width/1536,sh*image.height/1024,(724-724*sw/sh)/2,0,724*sw/sh,724);
 const pixels=t.getImageData(0,0,724,724).data;let left=724,top=724,right=0,bottom=0;
 for(let y=0;y<724;y++)for(let x=0;x<724;x++)if(pixels[(y*724+x)*4+3]>150){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;if(right<left||bottom<top)return c;
 const w=right-left+1,h=bottom-top+1,height=id==='kama'?86:90,width=Math.min(id==='kama'?62:38,height*w/h),gripY=.8;
 let lx=724,rx=0;for(let y=Math.floor(top+h*.76);y<Math.min(724,top+h*.86);y++)for(let x=left;x<=right;x++)if(pixels[(y*724+x)*4+3]>150){lx=Math.min(lx,x);rx=Math.max(rx,x);}const gripX=rx>=lx?((lx+rx)/2-left)/w:.5;
 g.translate(id==='kama'?45:44,64);g.rotate(Math.PI/2);g.drawImage(tile,left,top,w,h,-gripX*width,-gripY*height,width,height);return c;
}
export function ninjaSkinWeaponPortrait(url:string,id:'katana'|'dual'|'kama'){
 const region=weaponRegion(url,id),piece=(x:number,w:number)=>`<svg x="${x}" y="5" width="${w}" height="118" viewBox="${region.join(' ')}" overflow="hidden" preserveAspectRatio="xMidYMid meet"><image href="${url}" width="1536" height="1024"/></svg>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${id} Ninja weapon design">${id==='dual'?piece(18,42)+piece(68,42):piece(12,104)}</svg>`;
}
