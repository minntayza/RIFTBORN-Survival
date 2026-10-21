import {drawZawgyi} from './zawgyi-rig-art';
import {ZAWGYI_ART} from './zawgyi';
import {tankArmAsset,registerTankArmArtwork,tankOutfitShoulder} from './tank-arm-art';
import {tankSkinArm} from './tank-cosmetics';
import {gunnerSkinArm} from './gunner-cosmetics';
import {ninjaSkinCanvas,ninjaSkinArm,ninjaSkinWeaponCanvas} from './ninja-cosmetics';
import {tintArtwork} from './cosmetics';
import {CONNECTED_ARMS,connectedArmCanvas,connectedArmPose,connectedArmVisible} from './connected-arms';
import {rigidHeroArm,heroArmSprite,shoulderGrip} from './hero-arm';
import type {HeroId,WeaponId} from './config';
import {CUTE_ATLAS,cuteCanvas} from './cute-trio';
import {NINJA_ATTACK_ATLAS,NINJA_WEAPONS_ATLAS,ninjaAttackPart,ninjaSwordCanvas,ninjaWeaponCanvas} from './ninja-attack-art';
import {SAMURAI_ATLAS,samuraiCanvas,samuraiPart,samuraiSkinArm} from './samurai-art';
import {SAMURAI_WEAPONS_ATLAS,samuraiWeaponCanvas,isSamuraiWeapon} from './samurai-weapons';
import {GUNNER_ATLAS,gunnerCanvas,gunnerPart} from './gunner-art';
import {GUNNER_WEAPONS_ATLAS,gunnerWeaponCanvas,isGunnerWeapon} from './gunner-weapons';
import {TANK_ATLAS,tankCanvas,tankPart} from './tank-art';
import {TANK_WEAPONS_ATLAS,tankWeaponCanvas,isTankWeapon} from './tank-weapons';
import {weaponPose,WEAPON_EFFECTS} from './weapon-effects';
import {gunnerWeaponPose,gunnerSupportHand} from './gunner-motion';
import {samuraiSupportHand} from './samurai-motion';
const images=new Map<string,Promise<HTMLImageElement>>();
function load(url:string){let promise=images.get(url);if(!promise){promise=new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{images.delete(url);reject(new Error('Artwork unavailable'));};im.src=url;});images.set(url,promise);}return promise;}
const framesCache=new Map<string,HTMLCanvasElement>();
function cachedFrame(key:string,make:()=>HTMLCanvasElement){let c=framesCache.get(key);if(!c){c=make();framesCache.set(key,c);}return c;}
/** A lightweight home-only showcase, sharing the actual combat art and grip poses. */
export async function startHomeScene(canvas:HTMLCanvasElement,hero:HeroId,weapon:WeaponId,portrait=false,colors={character:0xffffff,weapon:0xffffff},skin?:string,weaponSkin?:string){
 try{
 if(hero==='zawgyi'){
 const image=await load(ZAWGYI_ART.url);if(!canvas.isConnected)return;
 canvas.width=portrait?420:600;canvas.height=portrait?240:420;
 const g=canvas.getContext('2d')!,scale=portrait?1.5:2.7;
 g.fillStyle='#07151866';g.beginPath();g.ellipse(canvas.width/2,canvas.height/2+67*scale,portrait?38:60,10,0,0,Math.PI*2);g.fill();
 g.save();g.translate(canvas.width/2-64*scale,canvas.height/2-55*scale);g.scale(scale,scale);drawZawgyi(g,image,0,false);g.restore();canvas.dataset.ready='true';return;
 }

 const bodyAtlas=hero==='samurai'?{...SAMURAI_ATLAS,url:skin||SAMURAI_ATLAS.url}:hero==='gunner'?{...GUNNER_ATLAS,url:skin||GUNNER_ATLAS.url}:hero==='tank'?{...TANK_ATLAS,url:skin||TANK_ATLAS.url}:skin?{...CUTE_ATLAS,url:skin}:CUTE_ATLAS;
 const weaponAtlas=hero==='samurai'?{...SAMURAI_WEAPONS_ATLAS,url:weaponSkin||SAMURAI_WEAPONS_ATLAS.url}:hero==='gunner'?{...GUNNER_WEAPONS_ATLAS,url:weaponSkin||GUNNER_WEAPONS_ATLAS.url}:hero==='tank'?{...TANK_WEAPONS_ATLAS,url:weaponSkin||TANK_WEAPONS_ATLAS.url}:weaponSkin?{key:'ninja-skin',url:weaponSkin}:weapon==='katana'?NINJA_ATTACK_ATLAS:NINJA_WEAPONS_ATLAS;
 const [bodyImage,weaponImage,connectedImage,tankArms]=await Promise.all([load(bodyAtlas.url),load(weaponAtlas.url),load(CONNECTED_ARMS.url),hero==='tank'&&skin?load(tankArmAsset(skin)):Promise.resolve(undefined)]);if(tankArms&&skin)registerTankArmArtwork(tankArms,tankArmAsset(skin));
 if(!canvas.isConnected)return;
 const heroFrame=(i:number)=>cachedFrame(`${hero}:${i}:${colors.character}:${skin||'base'}`,()=>tintArtwork(hero==='samurai'?samuraiCanvas(bodyImage,i+1):hero==='gunner'?gunnerCanvas(bodyImage,i+1):hero==='tank'?tankCanvas(bodyImage,i+1):skin?ninjaSkinCanvas(bodyImage,i+1):cuteCanvas(bodyImage,'ninja',i/24,1,false),colors.character));
 let trio:HTMLImageElement|undefined;
 const enemyFrame=(i:number)=>trio?cachedFrame(`wanderer:${i}`,()=>cuteCanvas(trio!,'wanderer',i/24,1,true)):undefined;

 const gun=isGunnerWeapon(weapon),dual=weapon==='dual'||weapon==='pistols';
 const equipment=cachedFrame(`weapon:${weapon}:${colors.weapon}:${weaponSkin||'base'}`,()=>tintArtwork(isSamuraiWeapon(weapon)?samuraiWeaponCanvas(weaponImage,weapon):isGunnerWeapon(weapon)?gunnerWeaponCanvas(weaponImage,weapon):isTankWeapon(weapon)?tankWeaponCanvas(weaponImage,weapon):weaponSkin?ninjaSkinWeaponCanvas(weaponImage,weapon as 'katana'|'dual'|'kama'):weapon==='katana'?ninjaSwordCanvas(weaponImage):ninjaWeaponCanvas(weaponImage,weapon==='dual'?'dual':'kama'),colors.weapon));
 const arms=[0,1].map(i=>cachedFrame(`connected:${hero}:${i}:${colors.character}:${skin||'base'}`,()=>tintArtwork(skin&&hero==='samurai'?samuraiSkinArm(bodyImage,i):skin&&hero==='ninja'?ninjaSkinArm(bodyImage,i):skin&&hero==='gunner'?gunnerSkinArm(bodyImage,i):skin&&hero==='tank'?tankSkinArm(bodyImage,i):connectedArmCanvas(connectedImage,hero,i),colors.character)));
 const g=canvas.getContext('2d')!;canvas.width=portrait?420:600;canvas.height=portrait?240:420;
 const reduced=portrait||matchMedia('(prefers-reduced-motion: reduce)').matches,start=performance.now();let last=-1;
 const sprite=(im:CanvasImageSource,x:number,y:number,w:number,h:number,rotation=0,ox=.5,oy=.5,flipX=false,flipY=false)=>{g.save();g.translate(x,y);g.rotate(rotation);g.scale(flipX?-1:1,flipY?-1:1);g.drawImage(im,-w*ox,-h*oy,w,h);g.restore();};
 const tick=(now:number)=>{if(!canvas.isConnected)return;const age=reduced?0:(now-start)/1000;if(now-last<33&&!reduced){requestAnimationFrame(tick);return;}last=now;g.clearRect(0,0,600,420);
 // The ground and cast shadows keep the action readable without a busy map.
 const floor=g.createRadialGradient(320,310,30,320,310,260);floor.addColorStop(0,'#42686666');floor.addColorStop(1,'#29444400');g.fillStyle=floor;g.fillRect(0,140,600,280);
 g.strokeStyle='#71978a22';g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.ellipse(320,325,135+i*48,32+i*13,0,0,Math.PI*2);g.stroke();}
 const frame=Math.floor(age*7)%24;
 for(const [i,x,y,size] of [[0,470,209,96],[1,505,309,108],[2,402,349,83]]){const enemy=portrait?undefined:enemyFrame((frame+i*7)%24);if(!enemy)continue;const drift=Math.sin(age*.8+i)*7;g.fillStyle='#08161766';g.beginPath();g.ellipse(x+drift,y+size*.4,size*.32,10,0,0,Math.PI*2);g.fill();sprite(enemy,x+drift,y,size,size,0,.5,.5,true);}
 g.save();g.translate(portrait?110:230,portrait?120:240);g.scale(portrait?2:3.25,portrait?2:3.25);
 g.fillStyle='#07151870';g.beginPath();g.ellipse(0,31,26,7,0,0,Math.PI*2);g.fill();sprite(heroFrame(frame),0,0,78,78,0,.5,.5,hero==='samurai');
 const cycle=age%3.4,active=!reduced&&cycle>1.6&&cycle<1.6+WEAPON_EFFECTS[weapon].duration,phase=active?(cycle-1.6)/WEAPON_EFFECTS[weapon].duration:0,mode=hero==='samurai'?'samurai':hero==='tank'?'tank':hero==='ninja';
 const pose=hero==='gunner'&&isGunnerWeapon(weapon)?gunnerWeaponPose(weapon,0,0,0,phase,active):weaponPose(weapon,0,0,0,phase,active,0,false,false,1,1,mode);
 const other=hero==='gunner'&&isGunnerWeapon(weapon)?gunnerWeaponPose(weapon,0,0,0,phase,false,true):weaponPose(weapon,0,0,0,phase,active,0,true,false,1,1,mode);
 if(dual)sprite(equipment,other.grip.x,other.grip.y,other.size,other.size,other.rotation,other.originX,other.originY,false,other.flipY);
 if(hero==='ninja')sprite(equipment,pose.grip.x,pose.grip.y,pose.size,pose.size,pose.rotation,pose.originX,pose.originY,false,pose.flipY);
 const handDraws:{image:HTMLCanvasElement;p:ReturnType<typeof heroArmSprite>}[]=[];
 for(let i=0;i<2;i++){
 if(!connectedArmVisible(hero,i))continue;
 const shoulder=hero==='tank'&&skin?tankOutfitShoulder(0,0,i):{x:i===0?8:-9,y:5},target=i===0?pose.grip:hero==='samurai'||hero==='tank'&&weapon==='hammer'?samuraiSupportHand(pose.grip,pose.rotation):hero==='gunner'&&!dual&&isGunnerWeapon(weapon)?gunnerSupportHand(gunnerWeaponPose(weapon,0,0,0,phase,active)):dual?other.grip:{x:-12,y:21};
 const resting=i===1&&!dual&&hero!=='samurai'&&hero!=='gunner'&&weapon!=='hammer';
 const p=connectedArmPose(hero,i,shoulder,resting?shoulderGrip(shoulder,Math.PI/2,18):target);
 if(hero==='tank'&&weapon!=='hammer')sprite(arms[i],p.x,p.y,p.width,p.height,p.rotation,p.originX,p.originY);else handDraws.push({image:arms[i],p});

 }
 if(hero!=='ninja')sprite(equipment,pose.grip.x,pose.grip.y,pose.size,pose.size,pose.rotation,pose.originX,pose.originY,false,pose.flipY);
 for(const {image,p} of handDraws)sprite(image,p.x,p.y,p.width,p.height,p.rotation,p.originX,p.originY);
 if(active){g.strokeStyle=gun?'#ffe5a0':'#ead2ff';g.lineWidth=2;g.beginPath();if(gun){g.moveTo(pose.tip.x,pose.tip.y);g.lineTo(pose.tip.x+12,pose.tip.y-3);}else g.arc(0,7,Math.hypot(pose.tip.x,pose.tip.y),-.6,.6);g.stroke();}
 g.restore();canvas.dataset.ready='true';if(!reduced)requestAnimationFrame(tick);
 };requestAnimationFrame(now=>{tick(now);requestAnimationFrame(()=>{if(!canvas.isConnected)return;void load(CUTE_ATLAS.url).then(im=>{if(!canvas.isConnected)return;trio=im;if(reduced)tick(performance.now());}).catch(()=>{});});});
 }catch{canvas.classList.add('home-scene-unavailable');}
}
