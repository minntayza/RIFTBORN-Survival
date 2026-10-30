import {tankCardArt} from './tank-card-art';
import {gunnerCardArt} from './gunner-card-art';
import {samuraiCardArt} from './samurai-card-art';
import {archerCardArt} from './archer-card-art';
import {zawgyiCardArt} from './zawgyi-card-art';
import {lethweiCardArt} from './lethwei-card-art';
import {ninjaCardArt} from './ninja-card-art';
import type {HeroId,WeaponId} from './config';
import type {EvolutionId} from './progression';

const ZAWGYI_EVO_ART: Record<string, string> = {
 celestial: '/assets/card-concepts/zawgyi-ruby-sun-evolution-v1.png',
 twindatlone: '/assets/card-concepts/zawgyi-royal-evolution-v2.png',
 lotusflame: '/assets/card-concepts/zawgyi-azure-evolution-v1.png',
};

/** Shared approved atlas: common evolutions use the same artwork for every survivor. */
const COMMON_EVOLUTION_IDS=['health','speed','crit','magnet','regen','ward','fire','orbit','damage','cooldown'];
export function commonEvolutionArt(id:string){
 const tile=COMMON_EVOLUTION_IDS.indexOf(id);if(tile<0)return '';
 const x=tile%5*100+.5,y=tile<5?.5:95.9,h=tile<5?94.4:103.6;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art evolution-card-reference" data-common-evolution="${id}" aria-hidden="true"><svg x="0" y="0" width="100" height="100" viewBox="${x} ${y} 99 ${h}" preserveAspectRatio="none" overflow="hidden"><image href="/assets/card-concepts/common-evolutions-v1.png" width="500" height="200" preserveAspectRatio="none"/></svg></svg>`;
}

export function evolutionCardArt(hero:HeroId,id:string){
 return commonEvolutionArt(id)||(hero==='ninja'?ninjaCardArt(id,true):hero==='lethwei'?lethweiCardArt(id,true):hero==='zawgyi'?zawgyiCardArt(id,true):hero==='pyusawhti'?archerCardArt(id,true):hero==='samurai'?samuraiCardArt(id,true):hero==='gunner'?gunnerCardArt(id,true):hero==='tank'?tankCardArt(id,true):'');
}

export function evolutionCardImage(hero:HeroId,upgradeId:string){
 if(hero === 'zawgyi' && ZAWGYI_EVO_ART[upgradeId]){
  return ZAWGYI_EVO_ART[upgradeId];
 }
 const h = hero === 'zawgyi' ? 'ninja' : hero;
 return `/assets/evolution-cards/${h}-${upgradeId}.webp`;
}
export function weaponEvolutionArtImage(weapon:WeaponId,evolution:EvolutionId,stage:'awakening'|'full'){
 return `/assets/weapon-evolution-art/${weapon}-${evolution}-${stage}.webp`;
}
export function weaponEvolutionPortrait(weapon:WeaponId){
 return `/assets/weapon-evolution-art/${weapon}-portrait.webp`;
}
