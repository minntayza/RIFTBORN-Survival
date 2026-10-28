import type {HeroId,WeaponId} from './config';
import type {EvolutionId} from './progression';

const ZAWGYI_EVO_ART: Record<string, string> = {
 celestial: '/assets/card-concepts/zawgyi-ruby-sun-evolution-v1.png',
 twindatlone: '/assets/card-concepts/zawgyi-royal-evolution-v2.png',
 lotusflame: '/assets/card-concepts/zawgyi-azure-evolution-v1.png',
};

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
