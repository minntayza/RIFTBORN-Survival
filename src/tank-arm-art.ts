import {isRedesignedTank,redesignedTankArm,tankRig,registerTankRigAtlas,TANK_RIG_ATLAS} from './tank-redesign';
import {imageSourceUrl} from './texture-cache';
import {connectedArmPose} from './connected-arms';
const armImages=new Map<string,HTMLImageElement>();
const assetKey=(url:string)=>url.replace(/^https?:\/\/[^/]+/,'');
export const tankArmAsset=(bodyUrl:string)=>isRedesignedTank(bodyUrl)?TANK_RIG_ATLAS:bodyUrl.replace(/\.png$/,'-arms-v2.png');
export function registerTankArmArtwork(image:HTMLImageElement,url:string){armImages.set(assetKey(url),image);if(url.includes('animation-parts.png'))registerTankRigAtlas(image);}
export const TANK_ARM_REGIONS={royal:[[710,57,321,1125],[222,57,321,1125]],forge:[[699,93,347,1069],[209,93,345,1069]],polar:[[712,110,330,1044],[212,110,330,1044]]};
const regions=(url:string)=>TANK_ARM_REGIONS[url.includes('royal')?'royal':url.includes('forge')?'forge':'polar'];
export function tankOutfitShoulder(x:number,y:number,side:number,facing=1,url=''){if(isRedesignedTank(url)){const [px,py]=tankRig(url).arms[side].pivot;return {x:x+(px-64)*78/128*facing,y:y+(py-64)*78/128};}return {x:x+(side===0?35:-35)*78/128*facing,y:y-18*78/128};}
export function tankOutfitRestPose(side:number){return connectedArmPose('tank',side,{x:side===0?89:39,y:49},{x:side===0?93:35,y:84});}
export function continuousTankArm(body:HTMLImageElement,side:number){if(isRedesignedTank(imageSourceUrl(body)))return redesignedTankArm(body,side);const c=document.createElement('canvas');c.width=160;c.height=235;const image=armImages.get(assetKey(tankArmAsset(imageSourceUrl(body))));if(!image)return c;const [x,y,w,h]=regions(imageSourceUrl(body))[side],g=c.getContext('2d')!,shear=(side===0?-16:16)/(235*(.88-.04));g.transform(1,0,shear,1,-shear*235*.04,0);g.drawImage(image,x,y,w,h,16,0,128,235);return c;}
export function tankOutfitArmsSvg(bodyUrl:string){const url=tankArmAsset(bodyUrl);return [0,1].map(side=>{const p=tankOutfitRestPose(side),r=regions(bodyUrl)[side],shear=(side===0?-16:16)/(235*(.88-.04));return `<g data-outfit-arm="${side}" transform="translate(${p.x} ${p.y}) rotate(${p.rotation*180/Math.PI})"><g transform="translate(${-p.width*p.originX} ${-p.height*p.originY}) scale(${p.width/160} ${p.height/235})"><g transform="matrix(1 0 ${shear} 1 ${-shear*235*.04} 0)"><svg x="16" y="0" width="128" height="235" viewBox="${r.join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${url}" width="1254" height="1254"/></svg></g></g></g>`;}).join('');}
