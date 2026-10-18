import type {EnemyId} from './config';
export const HORDE_ATLAS={key:'cute-horde-parts-v1',url:'/assets/characters/cute-horde-parts-v1.png'};
export const OFFICER_ATLAS={key:'cute-elite-rifle-parts-v1',url:'/assets/characters/cute-elite-rifle-parts-v1.png'};
export const HORDE_IDS=['spitter','armoured','brute','runner','elite','rifle'] as const;
export type HordeId=typeof HORDE_IDS[number];
type Rect=readonly [number,number,number,number];
const frames:Record<HordeId,readonly Rect[]>={
 spitter:[[82,17,277,256],[410,111,134,158],[650,110,161,160]],
 armoured:[[68,278,318,283],[422,380,143,157],[660,377,148,161]],
 brute:[[17,544,400,305],[434,669,162,161],[687,669,168,162]],
 elite:[[40,44,444,401],[577,226,190,195],[998,228,202,194]],
 rifle:[[57,451,351,402],[565,636,190,204],[999,639,207,199]],
 runner:[[44,823,343,281],[447,921,135,174],[665,918,183,174],[926,914,151,186],[1201,914,165,181]]
};
export function hordeAtlas(id:HordeId){return id==='elite'||id==='rifle'?OFFICER_ATLAS:HORDE_ATLAS;}
export function isCuteHorde(id:EnemyId):id is HordeId{return (HORDE_IDS as readonly string[]).includes(id);}
export function hordePose(id:HordeId,phase:number,strength=1){
 const step=Math.sin(phase*Math.PI*2)*strength,dog=id==='runner';
 const legs=dog?[{x:39,y:83,w:19,h:29},{x:80,y:83,w:22,h:29},{x:29,y:84,w:22,h:30},{x:73,y:84,w:23,h:30}]:[{x:51,y:84,w:27,h:33},{x:76,y:84,w:29,h:33}];
 return {body:{x:64,y:dog?54:51,w:dog?111:id==='brute'?112:88,h:dog?75:91,angle:0},legs:legs.map((p,i)=>({...p,angle:step*(dog?(i===0||i===3?1:-1):i===0?1:-1)*(dog?.27:id==='brute'?.13:.2),lift:Math.max(0,step*(i%2?-1:1))*-2}))};
}
/** One immutable upper-body cutout is composited over independently pivoted legs. */
export function hordeCanvas(image:HTMLImageElement,id:HordeId,frame:number,resolution=128,padding=0){
 const phase=frame===0||frame>48?0:(frame-1)%24/24,strength=frame===0||frame>48?0:frame>24?.4:1;
 const pose=hordePose(id,phase,strength),c=document.createElement('canvas');c.width=c.height=resolution;const g=c.getContext('2d')!;g.scale(resolution/(128+padding*2),resolution/(128+padding*2));g.translate(padding,padding);
 for(const [i,p] of pose.legs.entries()){
  const [x,y,w,h]=frames[id][i+1];g.save();g.translate(p.x,p.y+p.lift);g.rotate(p.angle);g.drawImage(image,x,y,w,h,-p.w/2,-3,p.w,p.h);g.restore();
 }
 const [x,y,w,h]=frames[id][0],b=pose.body;
 g.save();g.translate(b.x-b.w/2,b.y-b.h/2);g.scale(b.w/w,b.h/h);
 // Adjacent oversize cutouts share a row boundary; exclude their corner tips.
 if(id==='brute'){g.beginPath();g.moveTo(0,22);g.lineTo(190,22);g.lineTo(190,0);g.lineTo(w,0);g.lineTo(w,h);g.lineTo(w*.78,h);g.lineTo(w*.78,h-27);g.lineTo(w*.35,h-27);g.lineTo(w*.35,h);g.lineTo(0,h);g.closePath();g.clip();}
 if(id==='runner'){g.beginPath();g.moveTo(0,32);g.lineTo(110,32);g.lineTo(110,0);g.lineTo(270,0);g.lineTo(270,32);g.lineTo(w,32);g.lineTo(w,h);g.lineTo(0,h);g.closePath();g.clip();}
 g.drawImage(image,x,y,w,h,0,0,w,h);g.restore();return c;
}

export function rifleHandPose(kick=0,facing=1){return {x:64-Math.min(1,Math.max(0,kick))*14*facing,y:73,angle:0};}
export function cuteRifleHandsCanvas(image:HTMLImageElement){
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;
 g.drawImage(image,1316,587,439,196,28,59,81,36);return c;
}
export function hordePortrait(id:'elite'|'rifle'){
 const pose=hordePose(id,0,0),atlas=hordeAtlas(id);
 const crop=(r:Rect,x:number,y:number,w:number,h:number)=>`<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${r.join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${atlas.url}" width="1774" height="887"/></svg>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${id} gameplay illustration">${pose.legs.map((p,i)=>crop(frames[id][i+1],p.x-p.w/2,p.y-3,p.w,p.h)).join('')}${crop(frames[id][0],pose.body.x-pose.body.w/2,pose.body.y-pose.body.h/2,pose.body.w,pose.body.h)}${id==='rifle'?crop([1316,587,439,196],28,59,81,36):''}</svg>`;
}
