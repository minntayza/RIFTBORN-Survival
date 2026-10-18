import type {BossAction} from './boss-motion';
export const COMMAND_ATLAS={key:'cute-command-parts-v1',url:'/assets/characters/cute-command-parts-v1.webp'};
export type CommandId='commander'|'boss';
type Part='body'|'leftUpper'|'leftFore'|'rightUpper'|'rightFore'|'leftLeg'|'rightLeg';
type Rect=readonly [number,number,number,number];
const parts:Part[]=['body','leftUpper','leftFore','rightUpper','rightFore','leftLeg','rightLeg'];
const frames:Record<CommandId,readonly Rect[]>={
 commander:[[68,10,324,376],[435,153,169,181],[669,137,214,215],[978,157,170,180],[1200,164,207,181],[1482,218,162,172],[1780,216,153,174]],
 boss:[[28,388,356,390],[440,473,162,183],[717,494,156,208],[978,472,165,181],[1226,458,177,318],[1467,570,177,182],[1773,571,170,181]]
};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
type Angles=readonly [number,number,number,number];
const rest:Angles=[.12,-.22,-.12,.2];
function blend(a:Angles,b:Angles,t:number):Angles{const u=smooth(t);return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u,a[3]+(b[3]-a[3])*u];}
/** Angles only: heads, torsos and shoulder anchors never inherit a skill transform. */
export function commandSkillAngles(id:CommandId,action:BossAction,age:number,windup=1.15):Angles{
 if(age<0||age>=windup+.65)return rest;
 const p=age/windup;
 const ready:Angles=action==='slam'?[.3,-.65,-2.35,-.55]:action==='charge'?[-.65,-.45,.65,.25]:id==='commander'?[.6,-3.1,-2.4,.05]:[-.4,-.4,-2.3,-.4];
 const strike:Angles=action==='slam'?[.15,-.15,-.48,.12]:action==='charge'?[-.65,-.45,-.55,-.12]:id==='commander'?[.6,-3.1,-1.25,-.4]:[-.2,-.2,-1.3,-.25];
 if(p<.55)return blend(rest,ready,p/.55);
 if(p<.84)return ready;
 if(p<1)return blend(ready,strike,(p-.84)/.16);
 const after=age-windup;
 if(after<.12)return strike;
 return blend(strike,rest,(after-.12)/.53);
}
export function commandPose(id:CommandId,phase=0,strength=0,skill?:{action:BossAction;age:number;windup:number}){
 const step=Math.sin(phase*Math.PI*2)*strength,angles=skill?commandSkillAngles(id,skill.action,skill.age,skill.windup):rest;
 const shoulders=[{x:46,y:id==='boss'?60:64},{x:85,y:id==='boss'?60:64}];
 const arms=shoulders.map((shoulder,i)=>{const upper=angles[i*2],fore=upper+angles[i*2+1],length=12;return {shoulder,elbow:{x:shoulder.x-Math.sin(upper)*length,y:shoulder.y+Math.cos(upper)*length},upper,fore};});
 return {body:{x:64,y:8,w:id==='boss'?82:75,h:90,angle:0},arms,legs:[{x:53,y:91,angle:step*.14},{x:75,y:91,angle:-step*.14}]};
}
type Draw={part:Part;x:number;y:number;w:number;h:number;angle:number;ox:number;oy:number;orient?:number};
export function commandDraws(id:CommandId,phase=0,strength=0,skill?:{action:BossAction;age:number;windup:number}):Draw[]{
 const p=commandPose(id,phase,strength,skill),draws:Draw[]=p.legs.map((leg,i)=>({part:i===0?'leftLeg':'rightLeg',x:leg.x,y:leg.y,w:24,h:26,angle:leg.angle,ox:.5,oy:.1}));
 p.arms.forEach((a,i)=>draws.push({part:i===0?'leftUpper':'rightUpper',x:a.shoulder.x,y:a.shoulder.y,w:20,h:19,angle:a.upper,ox:.5,oy:.1}));
 draws.push({part:'body',x:p.body.x,y:p.body.y,w:p.body.w,h:p.body.h,angle:0,ox:.5,oy:0});
 p.arms.forEach((a,i)=>draws.push({part:i===0?'leftFore':'rightFore',x:a.elbow.x,y:a.elbow.y,w:id==='commander'?29:i===0?19:26,h:id==='commander'?29:i===0?25:47,angle:a.fore,orient:id==='commander'?Math.PI/2:0,ox:id==='commander'?.13:.45,oy:id==='commander'?.5:.06}));
 return draws;
}
export function commandBatonTip(age:number,action:BossAction='slam'){
 const arm=commandPose('boss',0,0,{action,age,windup:1.15}).arms[1];
 const x=8,y=40;return {x:arm.elbow.x+x*Math.cos(arm.fore)-y*Math.sin(arm.fore),y:arm.elbow.y+x*Math.sin(arm.fore)+y*Math.cos(arm.fore)};
}
function skillEffects(g:CanvasRenderingContext2D,id:CommandId,skill:{action:BossAction;age:number;windup:number}){
 const p=skill.age/skill.windup,after=skill.age-skill.windup;
 if(id==='boss'&&skill.action==='slam'){
  if(p>.84&&after<.08){
   g.save();g.lineCap='round';g.strokeStyle='#ffe09a';g.lineWidth=3;g.globalAlpha=.6;
   g.beginPath();for(let i=0;i<6;i++){const tip=commandBatonTip(Math.max(.84*skill.windup,skill.age-.075+i*.015));if(i===0)g.moveTo(tip.x,tip.y);else g.lineTo(tip.x,tip.y);}g.stroke();g.restore();
  }
  if(after>=0&&after<.38){
   const tip=commandBatonTip(1.15),t=after/.38;g.save();g.globalAlpha=1-t;
   g.strokeStyle='#ffe4a3';g.lineWidth=2;g.beginPath();g.ellipse(tip.x,tip.y,5+t*16,2+t*4,0,0,Math.PI*2);g.stroke();
   for(let i=0;i<7;i++){const a=i*Math.PI*2/7,r=4+t*13;g.fillStyle=i%2?'#f7cf72':'#bda381';g.beginPath();g.arc(tip.x+Math.cos(a)*r,tip.y+Math.sin(a)*r*.35-8*Math.sin(t*Math.PI),2.5*(1-t)+.5,0,Math.PI*2);g.fill();}g.restore();
  }
 }else if(skill.action==='rally'&&after>=0&&after<.5){
  g.save();g.globalAlpha=(1-after/.5)*.7;g.strokeStyle=id==='boss'?'#f7d878':'#98e1c4';g.lineWidth=2;
  g.beginPath();g.ellipse(64,112,14+after*65,4+after*15,0,0,Math.PI*2);g.stroke();g.restore();
 }
}
export function commandCanvas(image:HTMLImageElement,id:CommandId,frame:number,action?:BossAction,resolution=128,padding=0){
 const active=action?{action,age:frame/35*1.8,windup:1.15}:undefined;
 const phase=frame===0||frame>48?0:(frame-1)%24/24,strength=active||frame===0||frame>48?0:frame>24?.4:1;
 const c=document.createElement('canvas');c.width=c.height=resolution;const g=c.getContext('2d')!;g.scale(resolution/(128+padding*2),resolution/(128+padding*2));g.translate(padding,padding);
 for(const p of commandDraws(id,phase,strength,active)){
  const [x,y,w,h]=frames[id][parts.indexOf(p.part)];g.save();g.translate(p.x,p.y);g.rotate(p.angle+(p.orient??0));g.drawImage(image,x,y,w,h,-p.w*p.ox,-p.h*p.oy,p.w,p.h);g.restore();
 }
 if(active)skillEffects(g,id,active);
 return c;
}
export function commandPortrait(id:CommandId){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${id==='boss'?'Zombie General':'Horde Commander'} gameplay illustration">${commandDraws(id).map(p=>{const r=frames[id][parts.indexOf(p.part)];return `<g transform="translate(${p.x} ${p.y}) rotate(${(p.angle+(p.orient??0))*180/Math.PI})"><svg x="${-p.w*p.ox}" y="${-p.h*p.oy}" width="${p.w}" height="${p.h}" viewBox="${r.join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${COMMAND_ATLAS.url}" width="1983" height="793"/></svg></g>`;}).join('')}</svg>`;}
