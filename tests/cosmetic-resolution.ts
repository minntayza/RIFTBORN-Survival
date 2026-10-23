import {COSMETICS} from '../src/cosmetics';
import {WEAPONS,type WeaponId} from '../src/config';
import {ninjaSkinCanvas,ninjaSkinWeaponCanvas} from '../src/ninja-cosmetics';
import {samuraiCanvas} from '../src/samurai-art';
import {gunnerCanvas} from '../src/gunner-art';
import {tankCanvas} from '../src/tank-art';
import {samuraiWeaponCanvas} from '../src/samurai-weapons';
import {gunnerWeaponCanvas} from '../src/gunner-weapons';
import {tankWeaponCanvas} from '../src/tank-weapons';
import {gameplayArtwork} from '../src/gameplay-art';
import {registerTankRigAtlas,TANK_RIG_ATLAS} from '../src/tank-redesign';
const rig=new Image();rig.src=TANK_RIG_ATLAS;await rig.decode();registerTankRigAtlas(rig);
let passed=0;const failures:string[]=[];
for(const cosmetic of COSMETICS){
 try{
 const image=new Image();image.src=cosmetic.asset!;await image.decode();
 const hero=cosmetic.kind==='character'?cosmetic.target:WEAPONS[cosmetic.target as WeaponId].hero;
 const id=cosmetic.target;
 const art=cosmetic.kind==='character'?(hero==='ninja'?ninjaSkinCanvas(image,0,true):hero==='samurai'?samuraiCanvas(image,0,true):hero==='gunner'?gunnerCanvas(image,0,true):tankCanvas(image,0,true)):(hero==='ninja'?ninjaSkinWeaponCanvas(image,id as 'katana'):hero==='samurai'?samuraiWeaponCanvas(image,id as 'nodachi'):hero==='gunner'?gunnerWeaponCanvas(image,id as 'smg'):tankWeaponCanvas(image,id as 'hammer'));
 const pixels=art.getContext('2d')!.getImageData(0,0,art.width,art.height).data;
 if(art.width!==512||!pixels.some((v,i)=>i%4===3&&v>150))throw Error('Missing or undersized texture');
 const filtered=gameplayArtwork(art);if(filtered.width!==256)throw Error('Unexpected gameplay dimensions');
 passed++;const card=document.createElement('article');card.innerHTML=`<b>${cosmetic.name}</b><small>Preview 512px · gameplay 256px</small>`;card.append(art,filtered);document.querySelector('main')!.append(card);
 }catch(error){failures.push(`${cosmetic.name}: ${error}`);}
}
document.querySelector('#status')!.textContent=`${passed}/${COSMETICS.length} assets passed. ${failures.join('; ')}`;
