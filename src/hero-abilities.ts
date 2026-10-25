import {skillIcon} from './skill-icons';
import {ABILITY_TUNING as T,HEROES,type HeroId} from './config';
export type AbilityHero='samurai'|'gunner'|'tank';
export type HeroAbilityId='counter'|'draw'|'mark'|'overdrive'|'beacon'|'breach'|'slam'|'bulwark'|'march';
export type AbilityPair=[HeroAbilityId,HeroAbilityId];
export const isAbilityHero=(hero:HeroId):hero is AbilityHero=>hero==='samurai'||hero==='gunner';
export const HERO_ABILITIES={
 counter:{name:'Perfect Counter',cooldown:HEROES.samurai.cooldown,description:'Brace for a hit, then retaliate in a wide circle. Counter upgrades extend the timing window.',icon:'☯'},
 draw:{name:'Flash Draw',cooldown:T.draw.cooldown,description:'Burst forward through enemies with one powerful cut. Brief protection during the dash. Walls and obstacles stop movement.',icon:'☾'},
 mark:{name:'Blade Tempest',cooldown:T.mark.cooldown,description:'Unleash three sweeping strikes while moving freely. The final cut pushes ordinary enemies away; bosses hold their ground.',icon:'⌖'},
 overdrive:{name:'Overdrive',cooldown:HEROES.gunner.cooldown,description:'Instantly refill your magazine and fire faster for 3 seconds. Existing reload and opening-shot mechanics remain active.',icon:'▥'},
 beacon:{name:'Ricochet Beacon',cooldown:T.beacon.cooldown,description:`Deploy a ${T.beacon.duration}s beacon. Nearby ordinary rounds redirect once toward an unhit enemy; damage and piercing are unchanged. At most ${T.beacon.maxRedirects} redirects and ${T.beacon.maxBounces} combined bounces per affected bullet. Explosives, reflected shots and split bullets are excluded.`,icon:'◇'},
 breach:{name:'Breach Charge',cooldown:T.breach.cooldown,description:`Throw a charge that explodes after a ${T.breach.flight}s flight and ${T.breach.fuse}s fuse. Damages and pushes enemies from the blast center. Elites resist the push; bosses cannot be displaced.`,icon:'✹'},
 slam:{name:'Ground Slam',cooldown:9,description:'Slam the ground to damage and slow nearby enemies. Retains Ground Slam upgrades, aftershock synergy and brief protection.',icon:'✦'},
 bulwark:{name:'Magnetic Bulwark',cooldown:T.bulwark.cooldown,description:`Raise a frontal shield for ${T.bulwark.duration}s. Absorb up to ${T.bulwark.maxProjectiles} ordinary hostile projectiles and release stored energy in a shockwave. Energy caps at ${T.bulwark.energyCap}. Ground hazards, melee and boss area attacks pass through.`,icon:'⬟'},
 march:{name:'Wrecking March',cooldown:T.march.cooldown,description:`Steer freely for ${T.march.duration}s with 50% damage reduction and 15% extra speed. Push normal enemies aside, then stomp. Elites and bosses resist the marching push; bosses resist the stomp displacement.`,icon:'➤'}
} as const;
export const ABILITY_CHOICES:Record<AbilityHero,readonly HeroAbilityId[]>={samurai:['counter','draw','mark'],gunner:['overdrive','beacon','breach'],tank:['slam','bulwark','march']};
export function validHeroAbilities(hero:AbilityHero,raw:unknown):AbilityPair{const allowed=ABILITY_CHOICES[hero];return Array.isArray(raw)&&raw.length===2&&raw[0]!==raw[1]&&raw.every(id=>allowed.includes(id))?[raw[0],raw[1]]:[allowed[0],allowed[1]];}
// Same duplicate rule as Zawgyi: selecting the other equipped skill swaps the two slots.
export function replaceHeroAbility(pair:AbilityPair,slot:0|1,id:HeroAbilityId):AbilityPair{const next:AbilityPair=[...pair],other=slot===0?1:0;if(next[other]===id)next[other]=next[slot];next[slot]=id;return next;}
export function heroAbilityIcon(id:HeroAbilityId){return skillIcon(id);}
