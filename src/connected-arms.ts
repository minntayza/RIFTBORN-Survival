import {zawgyiPortrait} from './zawgyi';
import {pyusawhtiPortrait} from './pyusawhti';
import {lethweiPortrait} from './lethwei';
import {kyansitthaPortrait} from './kyansittha';
import type {HeroId} from './config';
import type {ArmPoint} from './hero-arm';
import {cutePortrait} from './cute-trio';
import {samuraiPortrait} from './samurai-art';
import {gunnerPortrait} from './gunner-art';
import {tankPortrait} from './tank-art';
export const CONNECTED_ARMS={key:'hero-connected-arms-v1',url:'/assets/characters/hero-connected-arms-v1.webp'};
const regions={ninja:[[233,25,148,335],[644,25,147,335]],samurai:[[242,486,156,258],[626,486,156,258]],gunner:[[245,895,142,212],[637,895,142,212]],tank:[[236,1268,160,235],[629,1268,160,235]]} as const;
export function connectedArmRegion(hero:HeroId,side:number){const key=(hero in regions)?hero as keyof typeof regions:'ninja';return regions[key][side===0?1:0];}
export function connectedArmPose(hero:HeroId,side:number,shoulder:ArmPoint,hand:ArmPoint,facing=1){const r=connectedArmRegion(hero,side),ax=.5,ay=hero==='ninja'?.12:.04,bx=side===0?.4:.6,by=.88,dx=(bx-ax)*r[2]*facing,dy=(by-ay)*r[3],scale=Math.hypot(hand.x-shoulder.x,hand.y-shoulder.y)/Math.hypot(dx,dy);return {x:shoulder.x,y:shoulder.y,width:r[2]*scale,height:r[3]*scale,originX:ax,originY:ay,flipX:facing<0,rotation:Math.atan2(hand.y-shoulder.y,hand.x-shoulder.x)-Math.atan2(dy,dx)};}
export function connectedArmCanvas(image:HTMLImageElement,hero:HeroId,side:number){const r=connectedArmRegion(hero,side),c=document.createElement('canvas');c.width=r[2];c.height=r[3];c.getContext('2d')!.drawImage(image,r[0],r[1],r[2],r[3],0,0,c.width,c.height);return c;}
export function connectedRestPose(hero:HeroId){const spread=hero==='tank'?15:hero==='ninja'?11:10;return [0,1].map(i=>({shoulder:{x:(i===0?1:-1)*spread,y:hero==='ninja'?4:5},hand:{x:(i===0?1:-1)*(spread+3),y:23}}));}
export function connectedHeroPortrait(hero:HeroId){if(hero==='zawgyi')return zawgyiPortrait();if(hero==='pyusawhti')return pyusawhtiPortrait();if(hero==='lethwei')return lethweiPortrait();if(hero==='kyansittha')return kyansitthaPortrait();const body=hero==='ninja'?cutePortrait('ninja',false):hero==='samurai'?samuraiPortrait(false):hero==='gunner'?gunnerPortrait(false):tankPortrait(false),scale=128/78;const arms=connectedRestPose(hero).map(({shoulder,hand},i)=>{const p=connectedArmPose(hero,i,shoulder,hand),r=connectedArmRegion(hero,i);return `<g transform="translate(${64+p.x*scale} ${64+p.y*scale}) rotate(${p.rotation*180/Math.PI})"><svg x="${-p.width*p.originX*scale}" y="${-p.height*p.originY*scale}" width="${p.width*scale}" height="${p.height*scale}" viewBox="${r.join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${CONNECTED_ARMS.url}" width="1024" height="1536"/></svg></g>`;}).join('');return body.slice(0,-6)+arms+'</svg>';}

/** Hide the arm on the facing side while Gunner or Tank holds a weapon. */
export function connectedArmVisible(hero:HeroId,side:number,holdingWeapon=true){return !(holdingWeapon&&(hero==='gunner'||hero==='tank')&&side===0);}
