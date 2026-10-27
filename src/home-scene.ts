import {FUTURE_ARMS,registerFutureArms} from './future-ghost-arms';
import {LETHWEI_ART,LETHWEI_LEGS,drawFighter} from './lethwei-rig';
import {ANCIENT_ARMS,registerAncientArms} from './ancient-shadow-arms';
import {ninjaCosmeticPose,ninjaCosmeticShoulder,ninjaOutfitFit} from './ninja-cosmetic-pose';
import {colorfulCharacter,outlinedWeapon} from './equipment-presentation';
import {isRedesignedSurvivor,survivorShoulder,survivorArmPose} from './survivor-redesign';
import {tankEquipmentPose,tankArmPose,isRedesignedTank} from './tank-redesign';
import {drawZawgyi} from './zawgyi-rig-art';
import {ZAWGYI_ART} from './zawgyi';
import {tankArmAsset,registerTankArmArtwork,tankOutfitShoulder} from './tank-arm-art';
import {tankSkinArm} from './tank-cosmetics';
import {gunnerSkinArm} from './gunner-cosmetics';
import {ninjaSkinCanvas,ninjaSkinArm,ninjaSkinWeaponCanvas} from './ninja-cosmetics';
import {tintArtwork} from './cosmetics';
import {CONNECTED_ARMS,connectedArmCanvas,connectedArmPose,connectedArmVisible} from './connected-arms';
import {heroArmSprite,shoulderGrip} from './hero-arm';
import type {HeroId,WeaponId} from './config';
import {CUTE_ATLAS,cuteCanvas} from './cute-trio';
import {NINJA_ATTACK_ATLAS,NINJA_WEAPONS_ATLAS,ninjaSwordCanvas,ninjaWeaponCanvas} from './ninja-attack-art';
import {SAMURAI_ATLAS,samuraiCanvas,samuraiSkinArm} from './samurai-art';
import {SAMURAI_WEAPONS_ATLAS,samuraiWeaponCanvas,isSamuraiWeapon} from './samurai-weapons';
import {GUNNER_ATLAS,gunnerCanvas} from './gunner-art';
import {GUNNER_WEAPONS_ATLAS,gunnerWeaponCanvas,isGunnerWeapon} from './gunner-weapons';
import {TANK_ATLAS,tankCanvas} from './tank-art';
import {TANK_WEAPONS_ATLAS,tankWeaponCanvas,isTankWeapon} from './tank-weapons';
import {weaponPose} from './weapon-effects';
import {gunnerWeaponPose,gunnerSupportHand} from './gunner-motion';
import {samuraiSupportHand} from './samurai-motion';
const images=new Map<string,Promise<HTMLImageElement>>();
function load(url:string){let promise=images.get(url);if(!promise){promise=new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();const timer=setTimeout(()=>fail(),12000);const fail=()=>{clearTimeout(timer);images.delete(url);reject(new Error('Artwork unavailable'));};im.onload=()=>{clearTimeout(timer);resolve(im);};im.onerror=fail;im.src=url;});images.set(url,promise);}return promise;}
const framesCache=new Map<string,HTMLCanvasElement>();
function cachedFrame(key:string,make:()=>HTMLCanvasElement){let c=framesCache.get(key);if(!c){c=make();framesCache.set(key,c);}return c;}
/** Fit the full equipped silhouette, including long blades, without distorting it. */
function fitPreview(source:HTMLCanvasElement,target:HTMLCanvasElement){
 const g=source.getContext('2d')!,pixels=g.getImageData(0,0,source.width,source.height).data;
 let left=source.width,top=source.height,right=0,bottom=0;
 for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++)if(pixels[(y*source.width+x)*4+3]>8){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 if(right<left)return;const width=right-left+1,height=bottom-top+1,scale=Math.min((target.width-48)/width,(target.height-48)/height);
 target.getContext('2d')!.drawImage(source,left,top,width,height,(target.width-width*scale)/2,(target.height-height*scale)/2,width*scale,height*scale);
}
/** A lightweight home-only showcase, sharing the actual combat art and grip poses. */
export async function startHomeScene(canvas:HTMLCanvasElement,hero:HeroId,weapon:WeaponId,portrait=false,colors={character:0xffffff,weapon:0xffffff},skin?:string,weaponSkin?:string){
 try{
 if(hero==='lethwei'){
 const [image,legs]=await Promise.all([load(LETHWEI_ART.url),load(LETHWEI_LEGS.url)]);if(!canvas.isConnected)return;
 canvas.width=portrait?840:1200;canvas.height=840;
 const g=canvas.getContext('2d')!;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 g.save();g.translate(canvas.width/2,375);g.scale(5.5,5.5);drawFighter(g,image,legs);g.restore();canvas.dataset.ready='true';return;
 }
 if(hero==='zawgyi'){
 const image=await load(ZAWGYI_ART.url);if(!canvas.isConnected)return;
 canvas.width=portrait?420:600;canvas.height=420;
 const g=canvas.getContext('2d')!,scale=portrait?2.5:2.7;
 g.fillStyle='#07151866';g.beginPath();g.ellipse(canvas.width/2,canvas.height/2+67*scale,portrait?38:60,10,0,0,Math.PI*2);g.fill();
 g.save();g.translate(canvas.width/2-64*scale,canvas.height/2-55*scale);g.scale(scale,scale);drawZawgyi(g,image,0,false);g.restore();canvas.dataset.ready='true';return;
 }

 if(hero==='ninja'&&skin?.includes('ninja-ancient'))registerAncientArms(await load(ANCIENT_ARMS.url));
 if(hero==='ninja'&&skin?.includes('ninja-future'))registerFutureArms(await load(FUTURE_ARMS.url));
 const bodyAtlas=hero==='samurai'?{...SAMURAI_ATLAS,url:skin||SAMURAI_ATLAS.url}:hero==='gunner'?{...GUNNER_ATLAS,url:skin||GUNNER_ATLAS.url}:hero==='tank'?{...TANK_ATLAS,url:skin||TANK_ATLAS.url}:skin?{...CUTE_ATLAS,url:skin}:CUTE_ATLAS;
 const weaponAtlas=hero==='samurai'?{...SAMURAI_WEAPONS_ATLAS,url:weaponSkin||SAMURAI_WEAPONS_ATLAS.url}:hero==='gunner'?{...GUNNER_WEAPONS_ATLAS,url:weaponSkin||GUNNER_WEAPONS_ATLAS.url}:hero==='tank'?{...TANK_WEAPONS_ATLAS,url:weaponSkin||TANK_WEAPONS_ATLAS.url}:weaponSkin?{key:'ninja-skin',url:weaponSkin}:weapon==='katana'?NINJA_ATTACK_ATLAS:NINJA_WEAPONS_ATLAS;
 const [bodyImage,weaponImage,connectedImage,tankArms]=await Promise.all([load(bodyAtlas.url),load(weaponAtlas.url),load(CONNECTED_ARMS.url),hero==='tank'&&skin?load(tankArmAsset(skin)):Promise.resolve(undefined)]);if(tankArms&&skin)registerTankArmArtwork(tankArms,tankArmAsset(skin));
 if(!canvas.isConnected)return;
 const heroFrame=(i:number)=>cachedFrame(`${hero}:${i}:${colors.character}:${skin||'base'}`,()=>tintArtwork(hero==='samurai'?samuraiCanvas(bodyImage,i+1):hero==='gunner'?gunnerCanvas(bodyImage,i+1,false,512):hero==='tank'?tankCanvas(bodyImage,i+1,false,512):skin?ninjaSkinCanvas(bodyImage,i+1):cuteCanvas(bodyImage,'ninja',i/24,1,false),colors.character));

 const dual=weapon==='dual'||weapon==='pistols';
 const equipment=cachedFrame(`weapon:${weapon}:${colors.weapon}:${weaponSkin||'base'}`,()=>tintArtwork(isSamuraiWeapon(weapon)?samuraiWeaponCanvas(weaponImage,weapon):isGunnerWeapon(weapon)?gunnerWeaponCanvas(weaponImage,weapon,512):isTankWeapon(weapon)?tankWeaponCanvas(weaponImage,weapon,512):weaponSkin?ninjaSkinWeaponCanvas(weaponImage,weapon as 'katana'|'dual'|'kama'):weapon==='katana'?ninjaSwordCanvas(weaponImage):ninjaWeaponCanvas(weaponImage,weapon==='dual'?'dual':'kama'),colors.weapon));
 const arms=[0,1].map(i=>cachedFrame(`connected:${hero}:${i}:${colors.character}:${skin||'base'}`,()=>tintArtwork(skin&&hero==='samurai'?samuraiSkinArm(bodyImage,i):skin&&hero==='ninja'?ninjaSkinArm(bodyImage,i):skin&&hero==='gunner'?gunnerSkinArm(bodyImage,i,4):skin&&hero==='tank'?tankSkinArm(bodyImage,i):connectedArmCanvas(connectedImage,hero,i),colors.character)));
 const staging=document.createElement('canvas');staging.width=1000;staging.height=800;const g=staging.getContext('2d')!;canvas.width=(portrait?420:600)*2;canvas.height=840;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';canvas.getContext('2d')!.imageSmoothingQuality='high';
 const sprite=(im:CanvasImageSource,x:number,y:number,w:number,h:number,rotation=0,ox=.5,oy=.5,flipX=false,flipY=false)=>{g.save();g.translate(x,y);g.rotate(rotation);g.scale(flipX?-1:1,flipY?-1:1);g.drawImage(im,-w*ox,-h*oy,w,h);g.restore();};
 const colorfulBody=colorfulCharacter(heroFrame(0),hero==='ninja'||hero==='samurai'),outlinedEquipment=outlinedWeapon(equipment),colorfulArms=arms.map(arm=>colorfulCharacter(arm,hero==='ninja'||hero==='samurai'));
 const draw=()=>{if(!canvas.isConnected)return;g.clearRect(0,0,staging.width,staging.height);
 const frame=0;

 g.save();g.translate(500,400);g.scale(3.8,3.8);
 g.fillStyle='#07151870';g.beginPath();g.ellipse(0,31,26,7,0,0,Math.PI*2);g.fill();sprite(colorfulBody,0,0,78,78,0,.5,.5,hero==='samurai'&&!isRedesignedSurvivor(skin||''));
 const active=false,phase=0,mode=hero==='samurai'?'samurai':hero==='tank'?'tank':hero==='ninja';
 let pose=hero==='gunner'&&isGunnerWeapon(weapon)?gunnerWeaponPose(weapon,0,0,0,phase,active):weaponPose(weapon,0,0,0,phase,active,0,false,false,1,1,mode);
 if(hero==='ninja'&&skin)pose=ninjaCosmeticPose(pose,0,0,0,phase,active,false,ninjaOutfitFit(skin));
 if(hero==='tank')pose=tankEquipmentPose(pose,0,0,1,skin||'',weapon==='hammer');
 let other=hero==='gunner'&&isGunnerWeapon(weapon)?gunnerWeaponPose(weapon,0,0,0,phase,false,true):weaponPose(weapon,0,0,0,phase,active,0,true,false,1,1,mode);
 if(hero==='ninja'&&skin)other=ninjaCosmeticPose(other,0,0,0,phase,active,true,ninjaOutfitFit(skin));
 if(dual)sprite(outlinedEquipment,other.grip.x,other.grip.y,other.size,other.size,other.rotation,other.originX,other.originY,false,other.flipY);
 if(hero==='ninja')sprite(outlinedEquipment,pose.grip.x,pose.grip.y,pose.size,pose.size,pose.rotation,pose.originX,pose.originY,false,pose.flipY);
 const handDraws:{image:HTMLCanvasElement;p:ReturnType<typeof heroArmSprite>}[]=[];
 for(let i=0;i<2;i++){
 if(!connectedArmVisible(hero,i)&&!(hero==='gunner'&&(!dual||isRedesignedSurvivor(skin||''))||hero==='tank'&&(weapon==='hammer'||isRedesignedTank(skin||''))))continue;
 const shoulder=hero==='ninja'&&skin?ninjaCosmeticShoulder(0,0,i,1,ninjaOutfitFit(skin)):isRedesignedSurvivor(skin||'')?survivorShoulder(0,0,i,1,skin):hero==='tank'&&skin?tankOutfitShoulder(0,0,i,1,skin):{x:i===0?8:-9,y:5},target=i===0?pose.grip:hero==='samurai'||hero==='tank'&&weapon==='hammer'?samuraiSupportHand(pose.grip,pose.rotation):hero==='gunner'&&!dual&&isGunnerWeapon(weapon)?gunnerSupportHand(gunnerWeaponPose(weapon,0,0,0,phase,active)):dual?other.grip:{x:-12,y:21};
 const resting=i===1&&!dual&&hero!=='samurai'&&hero!=='gunner'&&weapon!=='hammer';
 const held=resting?shoulderGrip(shoulder,Math.PI/2,18):target;
 const p=isRedesignedSurvivor(skin||'')?survivorArmPose(hero==='samurai'?'samurai':'gunner',i,shoulder,held,1,skin!):hero==='tank'&&isRedesignedTank(skin||'')?tankArmPose(i,shoulder,held):connectedArmPose(hero,i,shoulder,held);
 if(hero==='tank'&&weapon!=='hammer')sprite(colorfulArms[i],p.x,p.y,p.width,p.height,p.rotation,p.originX,p.originY);else handDraws.push({image:colorfulArms[i],p});

 }
 if(hero!=='ninja')sprite(outlinedEquipment,pose.grip.x,pose.grip.y,pose.size,pose.size,pose.rotation,pose.originX,pose.originY,false,pose.flipY);
 for(const {image,p} of handDraws)sprite(image,p.x,p.y,p.width,p.height,p.rotation,p.originX,p.originY);
 // Equipment is the final layer: character artwork must never conceal it.
 sprite(outlinedEquipment,pose.grip.x,pose.grip.y,pose.size,pose.size,pose.rotation,pose.originX,pose.originY,false,pose.flipY);
 if(dual)sprite(outlinedEquipment,other.grip.x,other.grip.y,other.size,other.size,other.rotation,other.originX,other.originY,false,other.flipY);
 // Only the gripping glove sits above equipment, never the sleeve or torso.
 if(hero==='ninja')for(const {image,p} of handDraws){g.save();g.translate(p.x,p.y);g.rotate(p.rotation);g.drawImage(image,0,image.height*.78,image.width,image.height*.22,-p.width*p.originX,p.height*(.78-p.originY),p.width,p.height*.22);g.restore();}


 g.restore();fitPreview(staging,canvas);canvas.dataset.ready='true';
 };draw();
 }catch{canvas.classList.add('home-scene-unavailable');const notice=document.createElement('div');notice.className='camp-art-error';notice.setAttribute('role','status');notice.innerHTML='Preview unavailable. Your equipment is saved. <button class="quiet" data-action="preview-retry">Retry artwork</button>';canvas.after(notice);}
}
