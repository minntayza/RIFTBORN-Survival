export type CuteCharacter='ninja'|'wanderer'|'pulse';
export type CutePart='body'|'leftArm'|'rightArm'|'leftLeg'|'rightLeg';
export const CUTE_ATLAS={key:'cute-trio-parts-v1',url:'/assets/characters/cute-trio-parts-v1.png'};
const source:Record<CuteCharacter,readonly (readonly [number,number,number,number])[]>={
 ninja:[[47,12,339,316],[457,92,129,212],[727,94,133,210],[1006,59,197,238],[1392,58,187,245]],
 wanderer:[[70,328,225,295],[428,379,201,220],[692,381,176,221],[1010,379,174,231],[1390,380,189,231]],
 pulse:[[50,630,258,317],[428,655,182,260],[701,655,263,254],[1008,659,181,267],[1393,656,185,270]]
};
const parts:CutePart[]=['body','leftArm','rightArm','leftLeg','rightLeg'];
export type CutePose={part:CutePart;x:number;y:number;width:number;height:number;angle:number;ox:number;oy:number};
/** No walking transform is ever applied to a head, torso, shoulder or hand. */
export function cutePose(id:CuteCharacter,phase:number,strength=1,arms=true):CutePose[]{
 const step=Math.sin(phase*Math.PI*2)*strength;
 const bodyW=id==='ninja'?90:id==='wanderer'?65:68,bodyH=id==='pulse'?80:84;
 const poses:CutePose[]=[
 {part:'leftLeg',x:53,y:84+Math.max(0,step)*-2,width:23,height:34,angle:step*.18,ox:.5,oy:.08},
 {part:'rightLeg',x:71,y:84+Math.max(0,-step)*-2,width:23,height:34,angle:-step*.18,ox:.5,oy:.08},
 {part:'body',x:id==='ninja'?64:62,y:6,width:bodyW,height:bodyH,angle:0,ox:.5,oy:0}
 ];
 if(arms){poses.push(
 {part:'leftArm',x:46,y:65,width:id==='wanderer'?28:23,height:35,angle:0,ox:.3,oy:.06},
 {part:'rightArm',x:76,y:65,width:id==='pulse'?38:27,height:id==='pulse'?40:35,angle:0,ox:id==='pulse'?.15:.7,oy:.06});}
 return poses;
}
export function cuteCanvas(image:HTMLImageElement,id:CuteCharacter,phase:number,strength=1,arms=true){
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;
 for(const pose of cutePose(id,phase,strength,arms)){
 const [x,y,w,h]=source[id][parts.indexOf(pose.part)];g.save();g.translate(pose.x,pose.y);g.rotate(pose.angle);
 g.drawImage(image,x,y,w,h,-pose.width*pose.ox,-pose.height*pose.oy,pose.width,pose.height);g.restore();
 }return c;
}
export function cuteArmCanvas(image:HTMLImageElement,part:'leftArm'|'rightArm'){
 const [x,y,w,h]=source.ninja[parts.indexOf(part)],c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d')!.drawImage(image,x,y,w,h,0,0,w,h);return c;
}
export function cutePortrait(id:CuteCharacter,arms=true){
 const title=id==='ninja'?'Ninja':id==='wanderer'?'Wanderer':'Pulse Shooter';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${title} gameplay illustration">${cutePose(id,0,0,arms).map(p=>{const [x,y,w,h]=source[id][parts.indexOf(p.part)];return `<svg x="${p.x-p.width*p.ox}" y="${p.y-p.height*p.oy}" width="${p.width}" height="${p.height}" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" overflow="hidden"><image href="${CUTE_ATLAS.url}" width="1619" height="972"/></svg>`;}).join('')}</svg>`;
}
