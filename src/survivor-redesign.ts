import {imageSourceUrl} from './texture-cache';
import {connectedArmPose,connectedArmRegion} from './connected-arms';
import {SURVIVOR_ATLASES} from './survivor-atlas-data';
export const isRedesignedSurvivor=(url:string)=>url.includes('/survivors-v2/');
export type SurvivorHero='samurai'|'gunner';
// Measured socket centres in each source body, ordered screen-right, screen-left.
// Three-quarter outfit artwork is asymmetric; a shared torso-centre offset cannot fit it.
export const SURVIVOR_SHOULDERS={blossom:[[400,395],[214,397]],fox:[[415,425],[161,425]],moon:[[395,413],[143,418]],outlaw:[[399,410],[191,410]],street:[[482,374],[217,370]],courier:[[432,391],[174,397]]} as const;
export function survivorShoulderPoint(url:string,side:number){const key=url.split('/').pop()!.replace('-atlas.png','') as keyof typeof SURVIVOR_SHOULDERS,a=atlas(url),r=a.parts[0],b=bodyLayout(r[2],r[3]),p=SURVIVOR_SHOULDERS[key][side===0?0:1];return{x:b.x+(p[0]-r[0])*b.width/r[2],y:b.y+(p[1]-r[1])*b.height/r[3]};}
export function survivorShoulder(x:number,y:number,side:number,facing=1,url?:string){const p=url?survivorShoulderPoint(url,side):{x:64+(side===0?8:-9)*128/78,y:63};return{x:x+(p.x-64)*78/128*facing,y:y+(p.y-64)*78/128};}
const atlas=(url:string)=>SURVIVOR_ATLASES[url.split('/').pop()!.replace('-atlas.png','') as keyof typeof SURVIVOR_ATLASES];
type ArmRegistration={part:number;shoulder:readonly [number,number];grip:readonly [number,number]};
/** Atlas cells show anatomical left then right; these three sets must be assigned to screen sides. */
export function survivorArmRegistration(url:string,side:number):ArmRegistration{
 const key=url.split('/').pop()!.replace('-atlas.png',''),right=side===0;
 if(key==='fox')return {part:right?2:1,shoulder:[.53,.16],grip:[right?.49:.5,.9]};
 if(key==='street')return {part:right?2:1,shoulder:[right?.45:.5,.16],grip:[right?.55:.45,right?.84:.82]};
 if(key==='courier')return {part:right?2:1,shoulder:[right?.5:.48,.16],grip:[right?.45:.65,.9]};
 return {part:side+1,shoulder:[.5,.16],grip:[.5,.91]};
}
/** Open Street Ace fingers extend below the palm grip; preserve them without moving that grip. */
export function survivorArmOverscan(url:string,hero:SurvivorHero,side:number){const h=connectedArmRegion(hero,side)[3];return url.includes('street-atlas')?Math.ceil(h*2*1.16)/(h*2):1;}
export function survivorArmPose(hero:SurvivorHero,side:number,shoulder:{x:number;y:number},hand:{x:number;y:number},facing:number,url:string){const p=connectedArmPose(hero,side,shoulder,hand,facing),extra=survivorArmOverscan(url,hero,side);return {...p,height:p.height*extra,originY:p.originY/extra};}
export function survivorLegLayout(url:string){return [0,1].map(side=>({part:url.includes('courier-atlas')?4-side:side+3,x:url.includes('courier-atlas')?(side===0?54:81):(side===0?51:77),y:87,width:21,height:37,originX:url.includes('courier-atlas')?(side===0?.43:.46):.5,originY:3/37}));}
const cache=new WeakMap<HTMLImageElement,HTMLCanvasElement[]>();
function parts(image:HTMLImageElement){let p=cache.get(image);if(p)return p;const a=atlas(imageSourceUrl(image));p=a.parts.map(r=>{const c=document.createElement('canvas');c.width=r[2];c.height=r[3];c.getContext('2d')!.drawImage(image,r[0],r[1],r[2],r[3],0,0,c.width,c.height);return c;});cache.set(image,p);return p;}
export function survivorArmTransform(hero:SurvivorHero,side:number,w:number,h:number,registration?:ArmRegistration){const r=connectedArmRegion(hero,side),sx=w*(registration?.shoulder[0]??.5),sy=h*(registration?.shoulder[1]??.16),gx=w*(registration?.grip[0]??.5),gy=h*(registration?.grip[1]??.91),tx=r[2]*.5,ty=r[3]*.04,dx=r[2]*((side===0?.4:.6)-.5),dy=r[3]*.84,scale=Math.hypot(dx,dy)/Math.hypot(gx-sx,gy-sy),rotation=Math.atan2(dy,dx)-Math.atan2(gy-sy,gx-sx);return{width:r[2],height:r[3],sx,sy,tx,ty,scale,rotation};}
export function survivorArm(image:HTMLImageElement,hero:SurvivorHero,side:number){const registration=survivorArmRegistration(imageSourceUrl(image),side),p=parts(image)[registration.part],t=survivorArmTransform(hero,side,p.width,p.height,registration),c=document.createElement('canvas');c.width=t.width*2;c.height=t.height*2*survivorArmOverscan(imageSourceUrl(image),hero,side);const g=c.getContext('2d')!;g.scale(2,2);g.translate(t.tx,t.ty);g.rotate(t.rotation);g.scale(t.scale,t.scale);g.drawImage(p,-t.sx,-t.sy);return c;}
function bodyLayout(w:number,h:number){const height=90,width=Math.min(89,height*w/h);return{x:64-width/2,y:1,width,height};}
export function survivorCanvas(image:HTMLImageElement,hero:SurvivorHero,frame:number,arms=false,resolution=256){const c=document.createElement('canvas');c.width=c.height=resolution;const g=c.getContext('2d')!,p=parts(image),step=frame===0?0:Math.sin((frame-1)/24*Math.PI*2);g.scale(resolution/128,resolution/128);
 for(const [i,leg] of survivorLegLayout(imageSourceUrl(image)).entries()){g.save();g.translate(leg.x,leg.y);g.rotate(step*(i===0?1:-1)*.13);g.drawImage(p[leg.part],-leg.width*leg.originX,-leg.height*leg.originY,leg.width,leg.height);g.restore();}
 const b=bodyLayout(p[0].width,p[0].height);g.drawImage(p[0],b.x,b.y,b.width,b.height);
 if(arms)for(let side=0;side<2;side++){const scale=128/78,shoulder=survivorShoulderPoint(imageSourceUrl(image),side),hand={x:64+(side===0?17:-15)*scale,y:64+23*scale},a=survivorArmPose(hero,side,shoulder,hand,1,imageSourceUrl(image));g.save();g.translate(a.x,a.y);g.rotate(a.rotation);g.drawImage(survivorArm(image,hero,side),-a.width*a.originX,-a.height*a.originY,a.width,a.height);g.restore();}return c;}
export function survivorPortrait(url:string,hero:SurvivorHero,arms=true){const a=atlas(url),piece=(i:number,x:number,y:number,w:number,h:number)=>`<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${a.parts[i].join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${url}" width="${a.width}" height="${a.height}"/></svg>`;const b=bodyLayout(a.parts[0][2],a.parts[0][3]);let content=survivorLegLayout(url).map(leg=>piece(leg.part,leg.x-leg.width*leg.originX,leg.y-leg.height*leg.originY,leg.width,leg.height)).join('')+piece(0,b.x,b.y,b.width,b.height);
 if(arms)for(let side=0;side<2;side++){const scale=128/78,shoulder=survivorShoulderPoint(url,side),hand={x:64+(side===0?17:-15)*scale,y:64+23*scale},p=connectedArmPose(hero,side,shoulder,hand),registration=survivorArmRegistration(url,side),r=a.parts[registration.part],t=survivorArmTransform(hero,side,r[2],r[3],registration);content+=`<g data-outfit-arm="${side}" transform="translate(${p.x} ${p.y}) rotate(${p.rotation*180/Math.PI}) scale(${p.width/t.width} ${p.height/t.height}) translate(${-p.originX*t.width} ${-p.originY*t.height})"><g transform="translate(${t.tx} ${t.ty}) rotate(${t.rotation*180/Math.PI}) scale(${t.scale})">${piece(registration.part,-t.sx,-t.sy,r[2],r[3])}</g></g>`;}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${hero} outfit illustration">${content}</svg>`;}
export type SurvivorMotion={brace:boolean;gesture:number;sweep?:number;weaponTurn?:number;skillAim?:number;bodyLift?:number;dashTrail?:boolean;trailColor?:number};
/** Cosmetic-only presentation. Gunner pivots around the real muzzle so shots remain aligned. */
export function survivorEquipmentPose<P extends {grip:{x:number;y:number};tip:{x:number;y:number};rotation:number;fore?:{x:number;y:number}}>(pose:P,hero:SurvivorHero,angle:number,motion?:SurvivorMotion):P{
 if(!motion)return pose;const delta=hero==='samurai'&&motion.weaponTurn!==undefined?(motion.skillAim??angle)+motion.weaponTurn-pose.rotation:(motion.brace?-.3:motion.sweep?.9*motion.sweep:-.22*motion.gesture)*(Math.cos(angle)<0?-1:1),pivot=hero==='gunner'?pose.tip:pose.grip;
 const rotate=(p:{x:number;y:number})=>({x:pivot.x+(p.x-pivot.x)*Math.cos(delta)-(p.y-pivot.y)*Math.sin(delta),y:pivot.y+(p.x-pivot.x)*Math.sin(delta)+(p.y-pivot.y)*Math.cos(delta)});
 return {...pose,grip:rotate(pose.grip),tip:rotate(pose.tip),fore:pose.fore?rotate(pose.fore):undefined,rotation:pose.rotation+delta};
}
