import {startHomeScene} from '../src/home-scene';
import {tankSkinWeaponPortrait} from '../src/tank-cosmetics';
import {tankWeaponCanvas} from '../src/tank-weapons';
import {TANK_WEAPON_THEMES,TANK_DESIGN_WEAPONS,tankWeaponSetAsset} from '../src/tank-weapon-designs';
import {rememberImageSource} from '../src/texture-cache';
const names={royal:'Royal Bulwark',forge:'Dwarven Forge Warden',polar:'Polar Bastion'},labels={hammer:'War Hammer',shield:'Round Shield',spiked:'Spiked Shield'};
for(const theme of TANK_WEAPON_THEMES){
 const section=document.createElement('section');section.id=theme;section.hidden=theme!=='royal';section.innerHTML=`<header><img src="/assets/cosmetics/tank-v3/${theme}-portrait.png" alt="${names[theme]}"><h2>${names[theme]}</h2></header><main></main>`;document.querySelector('#sets')!.append(section);
 const button=document.createElement('button');button.textContent=names[theme];button.onclick=()=>{document.querySelectorAll('section').forEach(s=>s.hidden=s!==section);};document.querySelector('nav')!.append(button);
 const image=new Image(),asset=tankWeaponSetAsset(theme);image.src=asset;await image.decode();rememberImageSource(image,asset);
 for(const id of TANK_DESIGN_WEAPONS){
  const card=document.createElement('article');card.innerHTML=`<h3>${labels[id]}</h3><small>Cosmetic shop</small>${tankSkinWeaponPortrait(asset,id)}<small>Equipped loadout</small>`;
  const c=document.createElement('canvas');card.append(c);section.querySelector('main')!.append(card);
  await startHomeScene(c,'tank',id,false,undefined,`/assets/cosmetics/tank-v3/${theme}.png`,asset);
  const texture=tankWeaponCanvas(image,id,256),g=texture.getContext('2d')!,pixels=g.getImageData(0,0,256,256).data;let count=0,edge=false;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(pixels[(y*256+x)*4+3]>160){count++;if(x===0||y===0||x===255||y===255)edge=true;}
  const status=document.createElement('p');status.className='status';status.textContent=c.dataset.ready==='true'&&count>100&&!edge?'PASS · Texture present / complete silhouette':'FAIL';card.append(status);
 }
 section.dataset.ready='true';
}
document.body.dataset.ready='true';
