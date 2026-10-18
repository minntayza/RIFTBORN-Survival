import type {RobotKind} from './robot-enemies';
import type {EnemyId} from './config';
export const ROBOT_ATLAS={key:'cute-robot-parts-v1',url:'/assets/characters/cute-robot-parts-v1.webp'};
export const CUTE_ROBOTS=['walker','scout','shield','crusher'] as const;
export type CuteRobot=typeof CUTE_ROBOTS[number];
export const isCuteRobot=(kind:RobotKind):kind is CuteRobot=>(CUTE_ROBOTS as readonly string[]).includes(kind);
type Rect=readonly [number,number,number,number];
const source:Record<CuteRobot,readonly Rect[]>={
 walker:[[54,8,326,318],[414,148,148,168],[688,148,162,168]],
 scout:[[65,329,293,265],[416,425,150,170],[701,422,157,170]],
 shield:[[58,575,363,283],[434,672,165,167],[686,669,172,170]],
 crusher:[[24,846,385,242],[422,907,206,193],[671,906,203,194],[897,832,220,277],[1163,832,202,277]]
};
export const crusherWindup=(type:EnemyId)=>type==='cleaver'?.8:.7;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
export function crusherArms(age:number,windup=.7){
 if(age<0||age>=windup+.65)return [0,0];
 const p=age/windup;let lift:number;
 if(p<.55)lift=smooth(p/.55);else if(p<.83)lift=1;else if(p<1)lift=1-smooth((p-.83)/.17);else lift=0;
 const contact=age>=windup?1-smooth((age-windup-.12)/.53):0;
 return [2.5*lift+.22*contact,-2.5*lift-.22*contact];
}
export function robotPose(kind:CuteRobot,phase=0,strength=0,skill?:{age:number;windup:number}){
 const step=Math.sin(phase*Math.PI*2)*strength;
 return {body:{x:64,y:kind==='crusher'?24:5,w:kind==='crusher'?99:kind==='shield'?98:kind==='scout'?86:94,h:kind==='crusher'?66:86,angle:0},legs:[{x:51,y:kind==='shield'?72:kind==='scout'?74:kind==='walker'?77:82,angle:step*.18},{x:76,y:kind==='shield'?72:kind==='scout'?74:kind==='walker'?77:82,angle:-step*.18}],arms:[{x:37,y:59,angle:kind==='crusher'&&skill?crusherArms(skill.age,skill.windup)[0]:0},{x:91,y:59,angle:kind==='crusher'&&skill?crusherArms(skill.age,skill.windup)[1]:0}]};
}
type Draw={rect:Rect;x:number;y:number;w:number;h:number;angle:number;ox:number;oy:number;body?:boolean};
function draws(kind:CuteRobot,phase=0,strength=0,skill?:{age:number;windup:number}):Draw[]{
 const p=robotPose(kind,phase,strength,skill),out:Draw[]=p.legs.map((leg,i)=>({rect:source[kind][i+1],x:leg.x,y:leg.y,w:kind==='crusher'?35:29,h:kind==='shield'?44:kind==='crusher'?35:40,angle:leg.angle,ox:.5,oy:.06}));
 if(kind==='crusher')p.arms.forEach((arm,i)=>out.push({rect:source.crusher[i+3],x:arm.x,y:arm.y,w:35,h:49,angle:arm.angle,ox:.5,oy:.09}));
 out.push({rect:source[kind][0],x:p.body.x,y:p.body.y,w:p.body.w,h:p.body.h,angle:0,ox:.5,oy:0,body:true});return out;
}
function bodyClip(kind:CuteRobot,w:number,h:number){
 const left=-w/2,right=w/2;
 if(kind==='shield')return `M${left} 10H${left+24}V0H${left+61}V10H${right}V${h}H${left+72}V${h-9}H${left}Z`;
 if(kind==='crusher')return `M${left} 4H${left+34}V0H${left+79}V4H${right}V${h}H${left}Z`;
 return '';
}
export function cuteRobotCanvas(image:HTMLImageElement,kind:CuteRobot,frame:number,skill=false,type:EnemyId='brute',resolution=128,padding=0){
 const windup=crusherWindup(type),age=frame/35*(windup+.65),active=kind==='crusher'&&skill?{age,windup}:undefined;
 const phase=frame===0?0:(frame-1)%24/24,strength=skill||frame===0?0:frame>24?.4:1;
 const c=document.createElement('canvas');c.width=c.height=resolution;const g=c.getContext('2d')!;g.scale(resolution/(128+padding*2),resolution/(128+padding*2));g.translate(padding,padding);
 for(const p of draws(kind,phase,strength,active)){const [x,y,w,h]=p.rect;g.save();g.translate(p.x,p.y);g.rotate(p.angle);if(p.body&&bodyClip(kind,p.w,p.h))g.clip(new Path2D(bodyClip(kind,p.w,p.h)));g.drawImage(image,x,y,w,h,-p.w*p.ox,-p.h*p.oy,p.w,p.h);g.restore();}
 if(active&&age>=windup&&age<windup+.35){const t=(age-windup)/.35;g.save();g.globalAlpha=1-t;g.strokeStyle='#ffe3a1';g.lineWidth=2;for(const x of [24,104]){g.beginPath();g.ellipse(x,109,4+t*14,2+t*4,0,0,Math.PI*2);g.stroke();for(let i=0;i<3;i++){g.beginPath();g.moveTo(x-7+i*7,104-t*12);g.lineTo(x-5+i*7,100-t*15);g.stroke();}}g.restore();}
 return c;
}
export function cuteRobotPortrait(kind:CuteRobot){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${kind} colorful 2D robot gameplay illustration">${draws(kind).map(p=>`<g transform="translate(${p.x} ${p.y}) rotate(${p.angle*180/Math.PI})">${p.body?`<defs><clipPath id="robot-body-${kind}"><path d="${bodyClip(kind,p.w,p.h)}"/></clipPath></defs>`:''}<g ${p.body&&bodyClip(kind,p.w,p.h)?`clip-path="url(#robot-body-${kind})"`:''}><svg x="${-p.w*p.ox}" y="${-p.h*p.oy}" width="${p.w}" height="${p.h}" viewBox="${p.rect.join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${ROBOT_ATLAS.url}" width="1402" height="1122"/></svg></g></g>`).join('')}</svg>`;}
