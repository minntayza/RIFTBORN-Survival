import {HEROES,WEAPONS,PLAYTEST,type HeroId,type WeaponId} from './config';
import type {Save} from './save';
export const FINISHES=[{id:'sakura',name:'Sakura',color:0xffa9d6,filter:'sepia(.4) saturate(1.6) hue-rotate(285deg)',price:120},{id:'jade',name:'Jade',color:0x91f4cb,filter:'sepia(.5) saturate(1.8) hue-rotate(95deg)',price:160},{id:'starlight',name:'Starlight',color:0xc2b0ff,filter:'sepia(.5) saturate(1.8) hue-rotate(205deg)',price:200}] as const;
export const SAMURAI_SKINS={sakura:{name:'Blossom Guardian',asset:'/assets/cosmetics/samurai-blossom.png'},jade:{name:'Fox Ronin',asset:'/assets/cosmetics/samurai-fox.png'},starlight:{name:'Moon Sentinel',asset:'/assets/cosmetics/samurai-moon.png'}};
export const SAMURAI_WEAPON_SKINS={sakura:{name:'Blossom',asset:'/assets/cosmetics/weapons-blossom.png'},jade:{name:'Fox Spirit',asset:'/assets/cosmetics/weapons-fox.png'},starlight:{name:'Crescent Moon',asset:'/assets/cosmetics/weapons-moon.png'}};
export const NINJA_SKINS={sakura:{name:'Ancient Shadow',asset:'/assets/cosmetics/ninja-ancient.png'},jade:{name:'Modern Street Shinobi',asset:'/assets/cosmetics/ninja-modern.png'},starlight:{name:'Future Neon Ghost',asset:'/assets/cosmetics/ninja-future.png'}};
export const GUNNER_SKINS={sakura:{name:'Lucky Outlaw',asset:'/assets/cosmetics/gunner-outlaw.png'},jade:{name:'Street Ace',asset:'/assets/cosmetics/gunner-street.png'},starlight:{name:'Star Courier',asset:'/assets/cosmetics/gunner-courier.png'}};
export const TANK_SKINS={sakura:{name:'Royal Bulwark',asset:'/assets/cosmetics/tank-royal.png'},jade:{name:'Dwarven Forge Warden',asset:'/assets/cosmetics/tank-forge.png'},starlight:{name:'Polar Bastion',asset:'/assets/cosmetics/tank-polar.png'}};
export const COSMETICS=([['character',HEROES],['weapon',WEAPONS]] as const).flatMap(([kind,targets])=>Object.entries(targets).filter(([id])=>id!=='zawgyi'&&id!=='mysticstaff').flatMap(([target,value])=>FINISHES.map(f=>{
 const hero=kind==='character'?target:WEAPONS[target as WeaponId].hero;
 const design=hero==='tank'?TANK_SKINS[f.id]:hero==='gunner'?GUNNER_SKINS[f.id]:hero==='ninja'?NINJA_SKINS[f.id]:hero==='samurai'?(kind==='character'?SAMURAI_SKINS[f.id]:SAMURAI_WEAPON_SKINS[f.id]):undefined;
 return {...f,id:`${kind}:${target}:${f.id}`,kind,target,name:design?(kind==='character'?design.name:`${design.name} ${value.name}`):`${f.name} ${value.name}`,asset:hero==='tank'&&kind==='character'?`/assets/cosmetics/tank-v3/${f.id==='sakura'?'royal':f.id==='jade'?'forge':'polar'}.png`:design?.asset};
})));
export function equippedWeaponSkin(s:Save,weapon:WeaponId){return COSMETICS.find(c=>c.id===s.cosmetics.equipped[`weapon:${weapon}`])?.asset;}
export function equippedSkin(s:Save,hero:HeroId=s.hero){return COSMETICS.find(c=>c.id===s.cosmetics.equipped[`character:${hero}`])?.asset;}
export function cosmeticColor(s:Save,kind:'character'|'weapon',target:string){const c=COSMETICS.find(c=>c.id===s.cosmetics.equipped[`${kind}:${target}`]);return c?.asset?0xffffff:c?.color||0xffffff;}
export function buyCosmetic(s:Save,id:string){const c=COSMETICS.find(c=>c.id===id);if(!c||s.cosmetics.owned.includes(id)||(!PLAYTEST.unlimitedPetals&&s.petals<c.price))return false;if(!PLAYTEST.unlimitedPetals)s.petals-=c.price;s.cosmetics.owned.push(id);return true;}
export function equipCosmetic(s:Save,id:string){
 const c=COSMETICS.find(c=>c.id===id);if(!c||!s.cosmetics.owned.includes(id))return false;
 if(c.kind==='weapon'){
  const weapon=c.target as WeaponId,hero=WEAPONS[weapon].hero as HeroId;
  if(s.weapons.includes(weapon)&&s.heroes.includes(hero)){s.hero=hero;s.weapon=weapon;}
 }else{
  const hero=c.target as HeroId,weapon=s.weapons.find(w=>WEAPONS[w].hero===hero);
  if(s.heroes.includes(hero)&&weapon){s.hero=hero;if(WEAPONS[s.weapon].hero!==hero)s.weapon=weapon;}
 }
 s.cosmetics.equipped[`${c.kind}:${c.target}`]=id;return true;
}
export function tintArtwork(source:HTMLCanvasElement,color:number){if(color===0xffffff)return source;const c=document.createElement('canvas');c.width=source.width;c.height=source.height;const g=c.getContext('2d')!;g.drawImage(source,0,0);g.globalCompositeOperation='multiply';g.fillStyle=`#${color.toString(16).padStart(6,'0')}`;g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='destination-in';g.drawImage(source,0,0);return c;}
