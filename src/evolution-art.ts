import type {HeroId,WeaponId} from './config';
import type {EvolutionId} from './progression';

export function evolutionCardImage(hero:HeroId,upgradeId:string){
 return `/assets/evolution-cards/${hero}-${upgradeId}.webp`;
}
export function weaponEvolutionArtImage(weapon:WeaponId,evolution:EvolutionId,stage:'awakening'|'full'){
 return `/assets/weapon-evolution-art/${weapon}-${evolution}-${stage}.webp`;
}
export function weaponEvolutionPortrait(weapon:WeaponId){
 return `/assets/weapon-evolution-art/${weapon}-portrait.webp`;
}
