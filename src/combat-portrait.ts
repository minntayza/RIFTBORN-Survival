import type {HeroId} from './config';
import type {Save} from './save';
import {artImage} from './art';
import {equippedSkin} from './cosmetics';
import {ninjaSkinPortrait} from './ninja-cosmetics';
import {samuraiPortrait} from './samurai-art';
import {gunnerSkinPortrait} from './gunner-cosmetics';
import {tankSkinPortrait} from './tank-cosmetics';
const portraits=new Map<string,string>();
/** Resolve the active hero's outfit independently of weapon cosmetics. */
export function combatPortrait(save:Save,hero:HeroId){
 const skin=equippedSkin(save,hero);
 if(!skin)return artImage('hero',hero);
 const key=`${hero}:${skin}`,cached=portraits.get(key);if(cached)return cached;
 const svg=hero==='ninja'?ninjaSkinPortrait(skin):hero==='samurai'?samuraiPortrait(true,skin):hero==='gunner'?gunnerSkinPortrait(skin):hero==='tank'?tankSkinPortrait(skin):undefined;
 if(!svg)return artImage('hero',hero);
 const markup=svg.replace('<svg ','<svg class="art-image" ');portraits.set(key,markup);return markup;
}
