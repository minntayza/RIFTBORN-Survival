import Phaser from 'phaser';
import {applyArtDirection} from '../src/art-direction';
import {rememberImageSource,imageSourceUrl} from '../src/texture-cache';
import {gunnerWeaponCanvas,type GunnerWeapon} from '../src/gunner-weapons';
const sets=['outlaw','street','courier'],weapons:GunnerWeapon[]=['pistols','shotgun','smg'];
class Check extends Phaser.Scene{
 preload(){for(const set of sets){const url=`/assets/cosmetics/gunner-${set}.png`;this.load.image(set,url);}this.load.on('filecomplete',(key:string,type:string,image:HTMLImageElement)=>{if(type==='image')rememberImageSource(image,`/assets/cosmetics/gunner-${key}.png`);});}
 create(){applyArtDirection(this);let passed=0;for(const set of sets)for(const weapon of weapons){const source=this.textures.get(set).getSourceImage() as HTMLImageElement;const canvas=gunnerWeaponCanvas(source,weapon,512),pixels=canvas.getContext('2d')!.getImageData(0,0,512,512).data;let count=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>128)count++;const correct=imageSourceUrl(source).includes(`/gunner-${set}.png`)&&count>500;passed+=Number(correct);const card=document.createElement('article');card.textContent=`${correct?'PASS':'FAIL'} · ${set} ${weapon} · ${count} pixels`;card.append(canvas);document.querySelector('#results')!.append(card);}document.querySelector('#status')!.textContent=`${passed}/9 cosmetic combat textures passed`;}
}
new Phaser.Game({type:Phaser.CANVAS,parent:'engine',width:16,height:16,scene:[Check],audio:{noAudio:true},banner:false});
