import {polishedGunnerIcon} from './gunner-polished-icons';
import type Phaser from 'phaser';
export type GunnerTheme='sakura'|'jade'|'starlight';
export const GUNNER_THEMES={
 sakura:{primary:0xd99748,accent:0xffe4a1,light:0xfff4d9,body:0x855331,burst:0xf5be63},
 jade:{primary:0x54d5c5,accent:0xff7c78,light:0xf2fffb,body:0x244e5c,burst:0x54d5c5},
 starlight:{primary:0xb698f2,accent:0x78e6f5,light:0xf9f6ff,body:0x485186,burst:0xb698f2}
} as const;
type Shape={points:number[][];fill?:number;stroke?:number;width?:number}|{circle:[number,number,number];fill?:number;stroke?:number;width?:number};
const ink=0x172b38;
/** One small illustration feeds both the deployed gadget and its skill icon. */
export function gunnerGadgetArt(kind:'beacon'|'breach'|'overdrive',theme:GunnerTheme):Shape[]{
 const c=GUNNER_THEMES[theme],out:Shape[]=[];
 const poly=(points:number[][],fill?:number,stroke=ink,width=3)=>out.push({points,fill,stroke,width});
 const circle=(x:number,y:number,r:number,fill?:number,stroke=ink,width=3)=>out.push({circle:[x,y,r],fill,stroke,width});
 const line=(points:number[][],stroke:number,width=3)=>poly(points,undefined,stroke,width);
 const rect=(x:number,y:number,w:number,h:number,fill:number)=>poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],fill);
 const star=(x:number,y:number,r:number,fill:number=c.accent,n=5)=>poly(Array.from({length:n*2},(_,i)=>{const a=-Math.PI/2+i*Math.PI/n,d=i%2?r*.46:r;return[x+Math.cos(a)*d,y+Math.sin(a)*d];}),fill,ink,2);
 const face=(y:number)=>{for(const x of [43,57]){circle(x,y,2.4,c.light,ink,1);circle(x+.5,y-1,.7,c.light,c.light,0);}line([[46,y+7],[50,y+9],[54,y+7]],c.light,2);};
 if(kind==='beacon'){
  if(theme==='sakura'){
   // Open horseshoe silhouette with brass rivets and a sheriff-star antenna.
   poly([[23,27],[35,27],[35,58],[40,68],[50,73],[60,68],[65,58],[65,27],[77,27],[77,60],[69,79],[50,87],[31,79],[23,60]],c.primary);
   for(const x of [29,71])for(const y of [37,50,61])circle(x,y,2,c.accent,ink,1);
   poly([[37,39],[63,39],[66,58],[59,67],[41,67],[34,58]],c.body);face(49);line([[50,39],[50,25]],c.primary);star(50,19,13);
  }else if(theme==='jade'){
   // A portable street boombox: wide stance, carry handle, twin speakers, graffiti tag.
   poly([[14,38],[86,38],[91,44],[91,76],[84,82],[16,82],[9,76],[9,44]],c.body);
   poly([[15,40],[85,40],[87,45],[87,73],[82,77],[18,77],[13,73],[13,45]],c.primary);
   poly([[32,38],[32,27],[38,22],[62,22],[68,27],[68,38],[60,38],[60,30],[40,30],[40,38]],0x3c454f);
   for(const x of [28,72]){circle(x,59,14,0x17313d);circle(x,59,9,0x465767,ink,2);circle(x,59,5,c.accent,ink,1);circle(x-2,56,1.5,c.light,c.light,0);}
   rect(43,43,14,9,0x183441);line([[46,47],[48,45],[50,49],[53,45]],c.accent,2);
   poly([[49,54],[40,65],[48,65],[44,74],[60,59],[51,60]],c.accent,ink,1.5);
   line([[17,43],[29,43]],c.light,2);line([[72,78],[84,76],[88,70]],0x216a70,3);
   for(const x of [19,81])rect(x,82,7,5,0x253843);
  }else{
   // Floating courier drone: segmented wing pods around a holographic star core.
   for(const side of [-1,1]){const tx=(x:number)=>50+(x-50)*side;
    poly([[tx(13),34],[tx(28),39],[tx(31),62],[tx(21),72],[tx(10),62]],c.light);
    poly([[tx(15),39],[tx(24),43],[tx(26),58],[tx(18),64],[tx(14),57]],c.body);
    line([[tx(16),44],[tx(22),47]],c.accent,3);
    poly([[tx(19),70],[tx(25),67],[tx(23),77],[tx(18),79]],c.accent,ink,1.5);
    line([[tx(29),48],[tx(36),48]],c.accent,4);
   }
   poly([[35,28],[65,28],[73,40],[69,65],[50,76],[31,65],[27,40]],c.body);
   poly([[37,30],[63,30],[68,40],[64,61],[50,68],[36,61],[32,40]],c.primary);
   circle(50,47,14,0x163448,c.accent,2);star(50,47,11,c.light);
   line([[37,33],[45,31]],c.light,3);line([[50,76],[50,82]],c.accent,3);
   poly([[44,84],[50,78],[56,84],[50,91]],c.accent,ink,1.5);
  }
 }else if(kind==='breach'){
  if(theme==='sakura'){
   for(const [x,y] of [[29,37],[45,29],[61,36]]){poly([[x,y],[x+13,y-2],[x+16,44+y],[x+3,47+y]],0xc66c48);line([[x+3,y+5],[x+5,y+37]],c.accent,2);}
   rect(27,48,51,10,c.body);rect(29,69,48,8,c.primary);star(52,54,8);line([[53,29],[50,17],[62,12]],c.body,4);star(66,11,7,c.accent,4);
  }else if(theme==='jade'){
   // Stickered paint can, bright nozzle, oversized pull ring and dripping paint label.
   poly([[31,32],[65,32],[71,40],[71,78],[65,86],[32,86],[26,78],[26,40]],c.primary);
   poly([[32,34],[64,34],[67,41],[67,78],[61,82],[35,82],[30,77],[30,40]],0x37b5ad);
   rect(31,26,35,12,c.light);rect(43,15,19,12,c.accent);rect(57,18,6,5,0x213844);
   poly([[30,47],[65,43],[66,71],[31,76]],0x273c4e);
   poly([[49,45],[37,61],[48,60],[43,73],[62,52],[51,53]],c.accent,ink,1.5);
   line([[35,53],[35,64]],c.light,2);line([[57,71],[57,79]],c.accent,3);line([[62,71],[62,76]],c.accent,2);
   circle(70,27,10,undefined,c.light,4);line([[33,79],[47,79]],c.light,2);
  }else{
   // Compact plasma capsule: containment cage, luminous core, and three stabilizer fins.
   circle(50,54,26,0x303f68,c.accent,2);circle(50,54,20,c.primary,c.light,2);circle(46,50,12,0xe6f9ff,c.accent,2);
   for(let i=0;i<3;i++){const a=-Math.PI/2+i*Math.PI*2/3,pt=(r:number,t:number)=>[50+Math.cos(a)*r-Math.sin(a)*t,54+Math.sin(a)*r+Math.cos(a)*t];
    poly([pt(20,-6),pt(34,-7),pt(38,0),pt(34,7),pt(20,6)],c.light);line([pt(26,0),pt(33,0)],c.accent,3);
   }
   poly([[33,34],[40,30],[66,73],[60,78]],c.body);line([[37,33],[63,75]],c.accent,3);circle(43,47,4,0xffffff,0xffffff,0);
  }
 }else{
  // Different gun silhouettes, around each outfit's signature emblem.
  for(const side of [-1,1]){
   const tx=(x:number)=>50+(x-50)*side;
   const points=(p:number[][])=>p.map(([x,y])=>[tx(x),y]);
   poly(points(theme==='sakura'?[[14,26],[47,41],[43,52],[32,49],[27,68],[17,62],[24,43],[12,38]]:theme==='jade'?[[10,27],[45,37],[44,50],[31,48],[25,68],[16,62],[21,43],[9,39]]:[[9,23],[45,35],[48,48],[31,47],[24,65],[14,59],[20,41],[7,35]]),theme==='sakura'?c.primary:c.body);
   line(points([[15,31],[40,42]]),c.accent,4);
   if(theme==='sakura')circle(tx(31),43,5,c.body);else if(theme==='starlight')circle(tx(16),30,5,c.accent);
  }
  if(theme==='sakura')star(50,65,20);else if(theme==='jade')poly([[49,49],[34,69],[47,69],[42,88],[65,61],[52,61]],c.accent);else star(50,67,22,c.accent);
  for(const side of [-1,1])line([[50+side*26,76],[50+side*36,86]],c.primary,3);
 }
 if(kind==='beacon'){
  if(theme==='sakura'){line([[26,31],[26,58],[33,73],[49,81]],c.light,2);line([[74,32],[74,59],[65,76]],c.body,4);circle(50,57,3,c.accent,ink,1);}
  else if(theme==='jade'){line([[16,41],[28,41]],c.light,2);}
  else{line([[38,31],[44,30]],c.light,2);}
 }else if(kind==='breach'){
  if(theme==='sakura'){line([[31,41],[33,71]],0xffb993,2);line([[48,33],[50,75]],0xffbc83,2);line([[72,42],[75,77]],0x773b30,3);for(const x of [33,72])circle(x,53,2,c.accent,ink,1);}
  else if(theme==='jade'){line([[32,39],[32,74],[36,80]],c.light,3);line([[66,39],[66,76],[61,81]],0x238d91,4);line([[37,30],[58,30]],0xffffff,2);}
  else{line([[29,45],[34,36],[44,31]],c.light,3);line([[72,54],[68,69],[57,77]],0x7963ba,4);circle(37,39,3,0xffffff,0xffffff,0);}
 }
 return out;
}
export function drawGunnerGadget(g:Phaser.GameObjects.Graphics,kind:'beacon'|'breach',theme:GunnerTheme,x:number,y:number,scale:number,angle=0){
 const ca=Math.cos(angle),sa=Math.sin(angle),point=([px,py]:number[])=>({x:x+((px-50)*ca-(py-50)*sa)*scale,y:y+((px-50)*sa+(py-50)*ca)*scale});
 for(const shape of gunnerGadgetArt(kind,theme)){if(shape.fill!==undefined)g.fillStyle(shape.fill,1);if(shape.stroke!==undefined)g.lineStyle(shape.width?Math.max(1.15,shape.width*scale):0,shape.stroke,1);if('circle'in shape){const p=point(shape.circle);if(shape.fill!==undefined)g.fillCircle(p.x,p.y,shape.circle[2]*scale);if(shape.width)g.strokeCircle(p.x,p.y,shape.circle[2]*scale);}else{const pts=shape.points.map(point);if(shape.fill!==undefined)g.fillPoints(pts,true);if(shape.width)g.strokePoints(pts,shape.fill!==undefined);}}
}
const hex=(c:number)=>'#'+c.toString(16).padStart(6,'0');
export function gunnerSkillIcon(kind:'beacon'|'breach'|'overdrive',theme:GunnerTheme){
 if(theme==='jade'||theme==='starlight')return polishedGunnerIcon(kind,theme);
 const art=gunnerGadgetArt(kind,theme).map(s=>{const style=`fill="${s.fill===undefined?'none':hex(s.fill)}" stroke="${s.stroke===undefined?'none':hex(s.stroke)}" stroke-width="${s.width||0}" stroke-linejoin="round" stroke-linecap="round"`;return 'circle'in s?`<circle cx="${s.circle[0]}" cy="${s.circle[1]}" r="${s.circle[2]}" ${style}/>`:`<${s.fill===undefined?'polyline':'polygon'} points="${s.points.map(p=>p.join(',')).join(' ')}" ${style}/>`;}).join('');
 const burst=kind==='breach'?`<path d="M12 50 22 43 13 29 31 32 31 14 45 25 55 9 61 28 80 18 76 38 94 43 79 55 91 69 72 69 73 88 55 78 44 94 38 76 18 85 24 65 7 62Z" fill="#bd6d3a" stroke="#172b38" stroke-width="2" stroke-linejoin="round"/><path d="m20 49 17-8-3-15 14 12 9-16 4 19 17-7-10 16 15 10-20 2 2 18-15-11-12 15-1-21-18 3 10-12Z" fill="#ffd477"/>`:'';
 return `<svg viewBox="0 0 100 100" aria-hidden="true" data-skill-icon="${kind}" data-icon-theme="${theme}"><circle cx="50" cy="50" r="49" fill="#10232e"/><circle cx="50" cy="50" r="41" fill="#203442"/>${burst}${art}</svg>`;
}
