import type Phaser from 'phaser';

// Keep the saved hero ID stable while presenting the new Archer King identity.
export const PYUSAWHTI_RIG_ASSETS = {atlas:{key:'archer-king-atlas-v1',url:'/assets/characters/archer-king-atlas-v1.png'},shooting:{key:'archer-king-aim-arms-v1',url:'/assets/characters/archer-king-aim-arms-v1.png'}} as const;
const crops = {
 body:[195,5,475,690],legLeft:[200,705,235,440],legRight:[520,705,260,440],
 nearArm:[860,5,450,750],farArm:[940,740,300,405],bowArm:[30,0,880,885],drawArm:[1120,345,630,355]
} as const;
type Part=keyof typeof crops;
export const ARCHER_DRAW_TIME=.075;
export function archerAttackMotion(age:number){
 const draw=Math.max(0,Math.min(1,age/ARCHER_DRAW_TIME)),released=age>=ARCHER_DRAW_TIME,t=Math.max(0,age-ARCHER_DRAW_TIME);
 return {released,pull:released?60+2*Math.exp(-t/.08):54+6*draw,stringPull:released?6+54*Math.exp(-t/.012):54+6*draw,recoil:released?-1.5*Math.exp(-t/.065)*Math.sin(Math.min(1,t/.025)*Math.PI/2):0};
}
export type PyusawhtiPart='legs'|'body';
export type ArcherPiece={part:Part,x:number,y:number,w:number,h:number,angle:number,ox:number,oy:number,mirror?:boolean};
export function pyusawhtiPose(time=0,moving=false,attack=0,aim=0,shotAge=ARCHER_DRAW_TIME-.001):ArcherPiece[]{
 const facing=Math.cos(aim)<0?-1:1;
 const a=facing<0?Math.atan2(Math.sin(aim),-Math.cos(aim)):aim;
 const bob=moving?Math.abs(Math.sin(time*5))*0.6:0;
 const pulse=Math.max(0,Math.min(1,attack));
 const pieces:ArcherPiece[]=[];
 const add=(part:Part,x:number,y:number,w:number,h:number,angle=0,ox=.5,oy=0)=>pieces.push({part,x,y:y-bob,w,h,angle,ox,oy});
 // Align the illustrated belt/coat opening with the hip midpoint, not the atlas rectangle.
 add('legLeft',-8,11,20,39,moving?Math.sin(time*5)*.09:0,.5,.08);
 add('legRight',8,11,20,39,moving?-Math.sin(time*5)*.09:0,.5,.08);
 if(attack>0){
  const shot=archerShotGeometry(aim,shotAge);
  add('body',-8,-51,60,76);
  add('drawArm',shot.drawRoot.x,shot.drawRoot.y,34,34*355/630,a,.206,.605);
  add('bowArm',shot.shoulder.x,shot.shoulder.y,38,47*885/880,a,.1,.52);
  return pieces;
 }
 add('body',-8,-51,60,76);
 add('farArm',9,-10,23,37,-.4+pulse*.12,.25,.16);pieces[pieces.length-1].mirror=true;
 // One continuous arm owns its hand and bow: no elbow/wrist seams can open.
 // The relaxed bow sits beside the body, below the face.
 add('nearArm',-27,-10,34,60,pulse*.35-Math.sin(a)*.12,.22,.34);pieces[pieces.length-1].mirror=true;
 return pieces;
}
/** Local right-facing geometry; canvas and Phaser mirror this same pose. */
export function archerShotGeometry(aim:number,age=ARCHER_DRAW_TIME-.001){
 const flip=Math.cos(aim)<0,a=flip?Math.atan2(Math.sin(aim),-Math.cos(aim)):aim;
 const rotate=(x:number,y:number)=>({x:x*Math.cos(a)-y*Math.sin(a),y:x*Math.sin(a)+y*Math.cos(a)});
 const motion=archerAttackMotion(age),kick=rotate(motion.recoil,0),shoulder={x:6+kick.x,y:-18+kick.y};
 const offset=rotate((.92-.1)*38,0),grip={x:shoulder.x+offset.x,y:shoulder.y+offset.y};
 const back=rotate(-motion.stringPull,0),nock={x:grip.x+back.x,y:grip.y+back.y};
 const hand=rotate(3,-8),pull=rotate(-motion.pull,0),drawRoot={x:grip.x+pull.x-hand.x,y:grip.y+pull.y-hand.y};
 const tip=rotate(12,0),arrowTip={x:grip.x+tip.x,y:grip.y+tip.y};
 const top=rotate(32*38/47,-24),bottom=rotate(32*38/47,23);
 return {flip,shoulder,grip,nock,drawRoot,arrowTip,released:motion.released,top:{x:shoulder.x+top.x,y:shoulder.y+top.y},bottom:{x:shoulder.x+bottom.x,y:shoulder.y+bottom.y}};
}
export function pyusawhtiArrowOrigin(x:number,y:number,aim:number){const shot=archerShotGeometry(aim);return {x:x+shot.arrowTip.x*.75*(shot.flip?-1:1),y:y+shot.arrowTip.y*.75};}
const assetFor=(part:Part)=>part==='bowArm'||part==='drawArm'?PYUSAWHTI_RIG_ASSETS.shooting:PYUSAWHTI_RIG_ASSETS.atlas;
let atlas:HTMLImageElement|undefined;
let shootingImage:HTMLImageElement|undefined;
export async function loadPyusawhtiArt(){
 if(!shootingImage)shootingImage=await new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=PYUSAWHTI_RIG_ASSETS.shooting.url;});
 if(atlas?.complete&&atlas.naturalWidth)return atlas;
 return await new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>{atlas=im;resolve(im);};im.onerror=reject;im.src=PYUSAWHTI_RIG_ASSETS.atlas.url;});
}
export function drawPyusawhti(g:CanvasRenderingContext2D,time=0,moving=false,attack=0,aim=0,flip=false,image=atlas){
 if(!image)return;
 g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 if(flip||Math.cos(aim)<0)g.scale(-1,1);
 for(const p of pyusawhtiPose(time,moving,attack,aim)){
  const [x,y,w,h]=crops[p.part];g.save();g.translate(p.x,p.y);g.rotate(p.angle);if(p.mirror)g.scale(-1,1);
  g.drawImage(p.part==='bowArm'||p.part==='drawArm'?shootingImage!:image,x,y,w,h,-p.w*p.ox,-p.h*p.oy,p.w,p.h);g.restore();
 }
 if(attack>0){const shot=archerShotGeometry(aim);g.strokeStyle='#c4b69e';g.lineWidth=.5;g.beginPath();g.moveTo(shot.top.x,shot.top.y);g.lineTo(shot.nock.x,shot.nock.y);g.lineTo(shot.bottom.x,shot.bottom.y);g.stroke();g.strokeStyle='#e8d2a2';g.lineWidth=.8;g.beginPath();g.moveTo(shot.nock.x,shot.nock.y);g.lineTo(shot.arrowTip.x,shot.arrowTip.y);g.stroke();}
 g.restore();
}
export function pyusawhtiRigPortrait(cls='art-image'){
 const art=pyusawhtiPose().map(p=>{const [x,y,w,h]=crops[p.part];return `<g transform="translate(${p.x} ${p.y}) rotate(${p.angle*180/Math.PI}) scale(${p.mirror?-1:1} 1)"><svg x="${-p.w*p.ox}" y="${-p.h*p.oy}" width="${p.w}" height="${p.h}" viewBox="${x} ${y} ${w} ${h}" overflow="hidden"><image href="${assetFor(p.part).url}" width="1358" height="1158"/></svg></g>`;}).join('');
 return `<svg class="${cls}" viewBox="-65 -58 130 112" role="img" aria-label="Archer King, hooded master archer">${art}</svg>`;
}
export function createPyusawhtiCanvas(_part:PyusawhtiPart,attack=0,aim=0){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;g.translate(64,64);drawPyusawhti(g,0,false,attack,aim);return c;}
export class PyusawhtiRig{
 private sprites:Phaser.GameObjects.Image[]=[];
 private shotFx:Phaser.GameObjects.Graphics;
 private sequence=-1;
 private shotAim=0;
 private shotStarted=0;
 private raisedUntil=-1;
 constructor(private scene:Phaser.Scene){
  this.shotFx=scene.add.graphics().setDepth(3.3);
  for(const [name,c] of Object.entries(crops)){const texture=scene.textures.get(assetFor(name as Part).key);if(!texture.has(name))texture.add(name,0,c[0],c[1],c[2],c[3]);}
 }
 render(x:number,y:number,aim:number,time:number,moving:boolean,attack:number,_sequence:number,duration=.28){
  if(attack>0){if(this.sequence!==_sequence){this.sequence=_sequence;this.shotAim=aim;this.shotStarted=time;}aim=this.shotAim;this.raisedUntil=time+.22;}
  const flip=Math.cos(aim)<0,scale=.75;
  const raised=attack>0||time<this.raisedUntil,age=time-this.shotStarted;
  const pose=pyusawhtiPose(time,moving,raised?1:0,aim,age);
  this.sprites.slice(pose.length).forEach(sprite=>sprite.setVisible(false));
  pose.forEach((p,i)=>{
   const sprite=this.sprites[i]??(this.sprites[i]=this.scene.add.image(0,0,assetFor(p.part).key,p.part));
   sprite.setTexture(assetFor(p.part).key,p.part).setOrigin(flip!==!!p.mirror?1-p.ox:p.ox,p.oy).setDisplaySize(p.w*scale,p.h*scale).setPosition(x+p.x*scale*(flip?-1:1),y+p.y*scale).setRotation(p.angle*(flip?-1:1)).setFlipX(flip!==!!p.mirror).setDepth(3.1+i*.01).setVisible(true);
  });
  this.shotFx.clear();
  if(raised){const shot=archerShotGeometry(aim,age),world=(p:{x:number;y:number})=>({x:x+p.x*scale*(flip?-1:1),y:y+(p.y-(moving?Math.abs(Math.sin(time*5))*.6:0))*scale});const top=world(shot.top),bottom=world(shot.bottom),nock=world(shot.nock),tip=world(shot.arrowTip);
   this.shotFx.lineStyle(.6,0xc4b69e,1).beginPath().moveTo(top.x,top.y).lineTo(nock.x,nock.y).lineTo(bottom.x,bottom.y).strokePath();
   if(!shot.released)this.shotFx.lineStyle(.9,0xe8d2a2,1).lineBetween(nock.x,nock.y,tip.x,tip.y);
  }

 }
 clear(){this.shotFx.clear();this.sprites.forEach(s=>s.setVisible(false));}
 campLayer(offset:number){this.shotFx.setDepth(3.3+offset);this.sprites.forEach((s,i)=>s.setDepth(3.1+i*.01+offset));}
}
