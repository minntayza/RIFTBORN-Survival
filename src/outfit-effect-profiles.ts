import {skillIcon} from './skill-icons';
import {samuraiPortrait} from './samurai-art';
import {ninjaSkinPortrait} from './ninja-cosmetics';
import {gunnerSkinPortrait} from './gunner-cosmetics';
import {tankSkinPortrait} from './tank-cosmetics';
import type {Save} from './save';
import type {HeroId} from './config';
import {COSMETICS} from './cosmetics';
import {styles,type CosmeticEffectProfile} from './cosmetic-effect-profiles';
export type OutfitProfile=CosmeticEffectProfile&{hero:HeroId;theme:string};
const names:Record<HeroId,readonly string[]>={zawgyi:[],ninja:['Inkleaf Escape','Street Flash','Hologram Dash'],samurai:['Blossom Promise','Fox Spirit Guard','Moonlit Counter'],gunner:['Lucky Star Rush','Arcade Overdrive','Comet Courier'],tank:['Crownfall','Dwarven Runeforge','Snowglobe Slam']};
export function outfitEffectProfile(save:Save,hero:HeroId):OutfitProfile|undefined{
 const id=save.cosmetics.equipped[`character:${hero}`];if(!id||!save.cosmetics.owned.includes(id))return;
 if(!COSMETICS.some(c=>c.id===id&&c.kind==='character'&&c.target===hero&&c.asset))return;
 const theme=id.split(':').at(-1)!,style=styles[`${hero}:${theme}`];if(!style)return;
 return {id,hero,theme,motif:style[0],color:style[1],accent:style[2],name:names[hero][['sakura','jade','starlight'].indexOf(theme)]};
}
export function outfitUltimateIcon(save:Save,hero:HeroId,base:string){
 const profile=outfitEffectProfile(save,hero),id=base.match(/data-skill-icon="([^"]+)"/)?.[1];
 if(!profile||!id)return base;
 return skillIcon(id,hero,profile.theme);
}
