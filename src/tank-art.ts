import {imageSourceUrl} from './texture-cache';
import {tankSkinCanvas} from './tank-cosmetics';
import {rigidHeroArm,heroArmSprite} from './hero-arm';
export const TANK_ATLAS={key:'cute-tank-parts-v1',url:'/assets/characters/cute-tank-parts-v1.webp'};
const regions={body:[18,31,555,646],leftLeg:[578,341,234,342],rightLeg:[863,341,235,342],upper:[1145,400,176,206],forearm:[1372,347,178,317],hand:[1582,414,232,250],otherHand:[1582,414,232,250],shield:[1815,162,339,516]} as const;
type Part=keyof typeof regions;
type Draw={part:Part;x:number;y:number;w:number;h:number;angle:number;ox:number;oy:number};
export function tankBodyPose(phase:number,strength=1){const step=Math.sin(phase*Math.PI*2)*strength;return {body:{x:64,y:6,w:83,h:96,angle:0},legs:[{x:53,y:93,angle:step*.17},{x:74,y:93,angle:-step*.17}]};}
function draws(phase:number,strength:number,arms:boolean):Draw[]{
 const p=tankBodyPose(phase,strength),out:Draw[]=p.legs.map((leg,i)=>({part:i===0?'leftLeg':'rightLeg',x:leg.x,y:leg.y,w:23,h:29,angle:leg.angle,ox:.5,oy:.08}));out.push({part:'body',x:p.body.x,y:p.body.y,w:p.body.w,h:p.body.h,angle:0,ox:.5,oy:0});
 if(arms){const scale=128/78;for(const [i,rig] of tankRestArms().entries())for(const [part,a,b] of [['upper',rig.shoulder,rig.elbow],['forearm',rig.elbow,rig.wrist],['hand',rig.wrist,rig.grip]] as const){const p=heroArmSprite('tank',part,a,b);out.push({part:part==='hand'&&i===1?'otherHand':part,x:64+p.x*scale,y:64+p.y*scale,w:p.width*scale,h:p.height*scale,angle:p.rotation,ox:p.originX,oy:p.originY});}}

 return out;
}
export function tankCanvas(image:HTMLImageElement,frame:number,arms=false,resolution=128){if(imageSourceUrl(image).includes('/cosmetics/'))return tankSkinCanvas(image,frame,arms,resolution);const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;for(const p of draws(frame===0?0:(frame-1)%24/24,frame===0?0:1,arms)){const [x,y,w,h]=regions[p.part];g.save();g.translate(p.x,p.y);g.rotate(p.angle);g.drawImage(image,x,y,w,h,-p.w*p.ox,-p.h*p.oy,p.w,p.h);g.restore();}return c;}
export function tankPart(image:HTMLImageElement,part:'upper'|'forearm'|'hand'|'otherHand'){const [x,y,w,h]=regions[part],c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d')!.drawImage(image,x,y,w,h,0,0,w,h);return c;}
export function tankPortrait(arms=true){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Shield Tank gameplay illustration">${draws(0,0,arms).map(p=>`<g transform="translate(${p.x} ${p.y}) rotate(${p.angle*180/Math.PI})"><svg x="${-p.w*p.ox}" y="${-p.h*p.oy}" width="${p.w}" height="${p.h}" viewBox="${regions[p.part].join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${TANK_ATLAS.url}" width="2172" height="724"/></svg></g>`).join('')}</svg>`;}


export function tankRestArms(){return [rigidHeroArm({x:8,y:5},{x:17,y:21}),rigidHeroArm({x:-9,y:5},{x:-15,y:21})];}
