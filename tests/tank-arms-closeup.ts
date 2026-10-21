import {TANK_SKINS} from '../src/cosmetics';
import {tankSkinCanvas,tankSkinArm,tankSkinPortrait} from '../src/tank-cosmetics';
import {tankArmAsset,registerTankArmArtwork,tankOutfitRestPose,TANK_ARM_REGIONS} from '../src/tank-arm-art';
const load=(url:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=url;});
const lines:string[]=[];
for(const [key,skin] of Object.entries(TANK_SKINS)){const [body,arms]=await Promise.all([load(skin.asset),load(tankArmAsset(skin.asset))]);registerTankArmArtwork(arms,tankArmAsset(skin.asset));
 const card=document.createElement('article');card.innerHTML=tankSkinPortrait(skin.asset)+`<h2>${skin.name}</h2><small>SVG shop portrait above · gameplay cutout below</small>`;card.append(tankSkinCanvas(body,0,true));document.querySelector('#cards')!.append(card);
 for(let side=0;side<2;side++){const c=tankSkinArm(body,side),g=c.getContext('2d')!,a=g.getImageData(0,0,c.width,c.height).data;for(let y=12;y<225;y++){let visible=false;for(let x=0;x<c.width;x++)if(a[(y*c.width+x)*4+3]>80){visible=true;break;}if(!visible)throw Error(`${skin.name}: disconnected arm at row ${y}`);}if(tankOutfitRestPose(side).y!==49)throw Error('Incorrect shoulder pivot');}
 lines.push(`PASS · ${skin.name}: two continuous arms, no empty sleeve/wrist rows, shoulder attachment corrected`);
}
document.querySelector('#result')!.textContent=lines.join('\n')+'\nALL 3 PASS';
