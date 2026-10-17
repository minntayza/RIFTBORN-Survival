import type {BossAction} from './boss-motion';
export const LEADER_ATLAS={key:'cute-robot-leader-parts-v1',url:'/assets/characters/cute-robot-leader-parts-v1.png'};
export type RobotLeader='command'|'sentinel';
type Part='body'|'leftUpper'|'leftFore'|'rightUpper'|'rightFore'|'leftLeg'|'rightLeg';
type Rect=readonly [number,number,number,number];
const parts:Part[]=['body','leftUpper','leftFore','rightUpper','rightFore','leftLeg','rightLeg'];
const source:Record<RobotLeader,readonly Rect[]>={command:[[29,46,353,365],[401,139,168,226],[590,146,211,218],[839,138,170,226],[1026,160,245,196],[1268,97,232,302],[1534,97,225,302]],sentinel:[[10,426,406,390],[413,484,161,263],[585,482,211,333],[836,484,174,260],[1059,483,213,338],[1270,464,238,341],[1527,463,232,342]]};
const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
type Angles=readonly [number,number,number,number];
const rest:Angles=[.06,-.12,-.06,.12];
const blend=(a:Angles,b:Angles,t:number):Angles=>{const u=smooth(t);return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u,a[3]+(b[3]-a[3])*u];};
export function leaderAngles(kind:RobotLeader,action:BossAction,age:number,windup=1.15):Angles{
 if(age<0||age>=windup+.65)return rest;
 const p=age/windup;
 const raised:Angles=action==='slam'?[2.3,.25,-2.3,-.25]:action==='charge'?[-.65,-.4,.65,.4]:kind==='command'?[.45,-2.5,-2.35,-.1]:[1.9,.1,-1.9,-.1];
 const strike:Angles=action==='slam'?[.12,.15,-.12,-.15]:action==='charge'?[-1.1,-.1,-.8,-.2]:kind==='command'?[.45,-2.5,-1.25,-.2]:[.7,.2,-1.3,-.2];
 if(p<.55)return blend(rest,raised,p/.55);if(p<.84)return raised;if(p<1)return blend(raised,strike,(p-.84)/.16);
 const after=age-windup;return after<.12?strike:blend(strike,rest,(after-.12)/.53);
}
export function leaderPose(kind:RobotLeader,phase=0,strength=0,skill?:{action:BossAction;age:number;windup:number}){
 const step=Math.sin(phase*Math.PI*2)*strength,a=skill?leaderAngles(kind,skill.action,skill.age,skill.windup):rest;
 const shoulders=[{x:43,y:kind==='command'?72:68},{x:91,y:kind==='command'?72:68}];
 return {body:{x:64,y:6,w:kind==='sentinel'?82:75,h:88,angle:0},legs:[{x:53,y:85,angle:step*.16},{x:75,y:85,angle:-step*.16}],arms:shoulders.map((shoulder,i)=>({shoulder,upper:a[i*2],fore:a[i*2]+a[i*2+1],elbow:{x:shoulder.x-Math.sin(a[i*2])*12,y:shoulder.y+Math.cos(a[i*2])*12}}))};
}
type Draw={part:Part;x:number;y:number;w:number;h:number;angle:number;ox:number;oy:number;orient?:number};
function draws(kind:RobotLeader,phase=0,strength=0,skill?:{action:BossAction;age:number;windup:number}):Draw[]{
 const p=leaderPose(kind,phase,strength,skill),out:Draw[]=p.legs.map((leg,i)=>({part:i===0?'leftLeg':'rightLeg',x:leg.x,y:leg.y,w:27,h:30,angle:leg.angle,ox:.5,oy:.08}));
 p.arms.forEach((arm,i)=>out.push({part:i===0?'leftUpper':'rightUpper',x:arm.shoulder.x,y:arm.shoulder.y,w:21,h:19,angle:arm.upper,ox:.5,oy:.12}));
 out.push({part:'body',x:p.body.x,y:p.body.y,w:p.body.w,h:p.body.h,angle:0,ox:.5,oy:0});
 p.arms.forEach((arm,i)=>out.push({part:i===0?'leftFore':'rightFore',x:arm.elbow.x,y:arm.elbow.y,w:kind==='sentinel'?27:23,h:kind==='sentinel'?32:28,angle:arm.fore,ox:kind==='command'?.1:.5,oy:kind==='command'?.6:.08,orient:kind==='command'?Math.PI/2:0}));return out;
}
export function leaderCanvas(image:HTMLImageElement,kind:RobotLeader,frame:number,action?:BossAction){
 const skill=action?{action,age:frame/35*1.8,windup:1.15}:undefined,phase=frame===0?0:(frame-1)%24/24,strength=action||frame===0?0:frame>24?.4:1;
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;
 for(const p of draws(kind,phase,strength,skill)){const [x,y,w,h]=source[kind][parts.indexOf(p.part)];g.save();g.translate(p.x,p.y);g.rotate(p.angle+(p.orient??0));g.drawImage(image,x,y,w,h,-p.w*p.ox,-p.h*p.oy,p.w,p.h);g.restore();}
 if(skill){const after=skill.age-skill.windup,p=skill.age/skill.windup;
  if(p>.55&&p<1&&kind==='sentinel'){g.save();g.globalAlpha=.18+Math.sin(p*22)*.08;g.fillStyle='#ffed97';g.beginPath();g.arc(64,73,8,0,Math.PI*2);g.fill();g.restore();}
  if(after>=0&&after<.45){const t=after/.45;g.save();g.globalAlpha=1-t;g.strokeStyle=kind==='command'?'#bdadff':'#9af5ff';g.lineWidth=2;
   if(action==='slam'){for(const x of [33,96]){g.beginPath();g.ellipse(x,109,4+t*18,2+t*6,0,0,Math.PI*2);g.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2;g.beginPath();g.moveTo(x+Math.cos(a)*(5+t*12),106+Math.sin(a)*t*5);g.lineTo(x+Math.cos(a)*(8+t*14),102+Math.sin(a)*t*5);g.stroke();}}}
   else if(action==='rally'){g.beginPath();g.ellipse(64,111,14+t*32,4+t*8,0,0,Math.PI*2);g.stroke();}
   g.restore();
  }
 }
 return c;
}
export function leaderPortrait(kind:RobotLeader){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${kind} colorful 2D robot gameplay illustration">${draws(kind).map(p=>`<g transform="translate(${p.x} ${p.y}) rotate(${(p.angle+(p.orient??0))*180/Math.PI})"><svg x="${-p.w*p.ox}" y="${-p.h*p.oy}" width="${p.w}" height="${p.h}" viewBox="${source[kind][parts.indexOf(p.part)].join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${LEADER_ATLAS.url}" width="1774" height="887"/></svg></g>`).join('')}</svg>`;}
