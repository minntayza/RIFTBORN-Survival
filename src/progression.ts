import type { HeroId } from './config';
export type RewardId = 'heal' | 'damage' | 'shield' | 'gold' | 'speed';
export const REWARDS = [
 {id:'heal',icon:'✚',name:'Field recovery',description:'Restore 25% maximum health.'},
 {id:'damage',icon:'⚔',name:'Power surge',description:'+40% damage for the next wave’s first 15 seconds.'},
 {id:'shield',icon:'◇',name:'Triple shield',description:'Absorb the next three hits.'},
 {id:'gold',icon:'◈',name:'Gold cache',description:'Collect bonus gold scaled to this wave.'},
 {id:'speed',icon:'↗',name:'Escape velocity',description:'+25% movement speed for the next wave’s first 15 seconds.'}
] as const;
export function rollReward(hp:number,maxHp:number,random=Math.random):RewardId {
 const pool=REWARDS.filter(r=>r.id!=='heal'||hp<maxHp);
 return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))].id;
}
export type EvolutionId='reach'|'power'|'tempo';
export function evolutionOptions(hero:HeroId){return [
{id:'reach' as const,icon:'ϟ',name:'Lightning',description:hero==='gunner'?'Charged rounds pierce and chain lightning to nearby enemies.':'Electric crescent waves pierce enemies and chain lightning.'},
{id:'power' as const,icon:'♨',name:'Wildfire',description:hero==='gunner'?'Explosive flame rounds ignite enemies for burning damage.':'Fiery impacts ignite enemies and release a burning shockwave.'},
{id:'tempo' as const,icon:'Ⅱ',name:'Phantom',description:'Attack 20% faster and release a delayed spectral echo attack.'}
];}
export function waveEvent(wave:number){if(wave<=10)return 'Survival';if(wave%5===0)return 'Boss encounter';return ['Supply rush','Zombie dog pack','Elite hunt','Hold the zone'][(wave-11)%4];}
