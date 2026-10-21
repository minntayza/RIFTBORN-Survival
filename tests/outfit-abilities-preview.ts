import {tankArmAsset,registerTankArmArtwork} from '../src/tank-arm-art';
import Phaser from 'phaser';
import {OutfitAbilityEffects} from '../src/outfit-ability-fx';
import {outfitEffectProfile,type OutfitProfile} from '../src/outfit-effect-profiles';
import {COSMETICS} from '../src/cosmetics';
import {freshSave} from '../src/save';
import type {HeroId} from '../src/config';
import {samuraiCanvas} from '../src/samurai-art';
import {ninjaSkinCanvas} from '../src/ninja-cosmetics';
import {gunnerSkinCanvas} from '../src/gunner-cosmetics';
import {tankSkinCanvas} from '../src/tank-cosmetics';
import {rememberImageSource} from '../src/texture-cache';
const outfits=COSMETICS.filter(c=>c.kind==='character');
class Preview extends Phaser.Scene{
 private entries:{fx:OutfitAbilityEffects;p:OutfitProfile;x:number;y:number;body:Phaser.GameObjects.Image;key:string}[]=[];private began=-10;private counterDone=false;
 preload(){for(let i=0;i<outfits.length;i++){this.load.image(`outfit-source-${i}`,outfits[i].asset!);if(outfits[i].target==='tank')this.load.image(`outfit-arm-${i}`,tankArmAsset(outfits[i].asset!));}}
 create(){const g=this.add.graphics();for(const [i,c] of outfits.entries()){const hero=c.target as HeroId,save=freshSave();save.cosmetics.owned=[c.id];save.cosmetics.equipped[`character:${hero}`]=c.id;const p=outfitEffectProfile(save,hero)!,image=this.textures.get(`outfit-source-${i}`).getSourceImage() as HTMLImageElement;rememberImageSource(image,c.asset!);if(hero==='tank')registerTankArmArtwork(this.textures.get(`outfit-arm-${i}`).getSourceImage() as HTMLImageElement,tankArmAsset(c.asset!));const body=(hero==='samurai'?samuraiCanvas:hero==='ninja'?ninjaSkinCanvas:hero==='gunner'?gunnerSkinCanvas:tankSkinCanvas)(image,0,true),key=`outfit-body-${i}`;this.textures.addCanvas(key,body);const col=i%3,row=Math.floor(i/3),x=col*280+140,y=row*230+145;g.fillStyle(0x21342f);g.fillRoundedRect(col*280+8,row*230+8,264,214,12);this.add.text(col*280+20,row*230+20,c.name,{fontSize:'15px',color:'#eee6d5'});this.add.text(col*280+20,row*230+42,p.name,{fontSize:'11px',color:'#b9c7c1'});this.entries.push({fx:new OutfitAbilityEffects(this),p,x,y,body:this.add.image(x,y,key).setDisplaySize(78,78).setDepth(3),key});}
 document.querySelector('#replay')!.addEventListener('click',()=>this.began=-10);}
 update(ms:number){const t=ms/1000;if(t-this.began>3.8){this.began=t;this.counterDone=false;for(const e of this.entries)e.fx.begin(e.p,e.x,e.y,0,t);}
 const age=t-this.began;if(age>.65&&!this.counterDone){this.counterDone=true;for(const e of this.entries)if(e.p.hero==='samurai')e.fx.counter(e.p,e.x,e.y,t);}
 for(const e of this.entries){const nx=e.p.hero==='ninja'?Math.sin(Math.min(1,age/.5)*Math.PI-Math.PI/2)*45:0;e.body.setPosition(e.x+nx,e.y);e.fx.render(e.p,{x:e.x+nx,y:e.y,angle:0,time:t,dash:e.p.hero==='ninja'&&age<.5?.35:0,counter:e.p.hero==='samurai'&&age<.65?.6:0,overdrive:e.p.hero==='gunner'&&age<3?3:0,reduced:false,texture:e.key});}
 document.querySelector('#status')!.textContent='12 outfit abilities · actual cosmetic art · outfit buttons share these themes · gameplay stats unchanged';}
}
new Phaser.Game({type:Phaser.CANVAS,parent:'preview',width:840,height:920,backgroundColor:'#142329',scene:[Preview],audio:{noAudio:true},banner:false});
