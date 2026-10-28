import {skillIcon} from './skill-icons';

export const KYANSITTHA_SKILLS = {
 crescentsweep: { name: 'Triple Crescent Flurry', cooldown: 8, icon: '⚔', description: 'Surge forward while unleashing 3 sweeping spear cleaves in rapid succession, dealing massive area damage all along your path.' },
 phalanx: { name: 'Bagan Phalanx', cooldown: 12, icon: '🛡', description: 'Plant your spear to raise a golden energy wall for 4.5s. Destroys hostile bullets and repels approaching enemies.' },
 arindamathunder: { name: "Arindama's Thunderbolt", cooldown: 15, icon: '⚡', description: 'Hurl the divine Arindama spear into a target area. Unleashes a massive earthquake and lightning shockwaves, pinning heavy enemies.' }
} as const;

export type KyansitthaSkill = keyof typeof KYANSITTHA_SKILLS;
export type KyansitthaLoadout = [KyansitthaSkill, KyansitthaSkill];

export function validKyansitthaLoadout(raw: unknown): KyansitthaLoadout {
 if (Array.isArray(raw) && raw.length === 2) {
  if (raw[0] !== raw[1] && raw.every(s => typeof s === 'string' && Object.hasOwn(KYANSITTHA_SKILLS, s))) {
   return raw as KyansitthaLoadout;
  }
 }
 return ['crescentsweep', 'arindamathunder'];
}

export function replaceKyansitthaSkill(pair: KyansitthaLoadout, slot: number, skill: KyansitthaSkill): KyansitthaLoadout {
 const next: [KyansitthaSkill, KyansitthaSkill] = [...pair];
 const other = slot === 0 ? 1 : 0;
 if (next[other] === skill) next[other] = next[slot];
 next[slot] = skill;
 return next;
}

export function kyansitthaSkillIcon(id: KyansitthaSkill) {
 if (id === 'crescentsweep') {
  return `<svg viewBox="0 0 32 32" class="skill-svg-icon" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 28 L28 4 M8 6 Q24 6 26 22" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4 L28 4 L28 10" stroke="#76ff03"/></svg>`;
 }
 if (id === 'phalanx') {
  return `<svg viewBox="0 0 32 32" class="skill-svg-icon" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="8" width="20" height="16" rx="2" fill="#2e4c1e" stroke="#76ff03" stroke-width="2"/><line x1="16" y1="4" x2="16" y2="28" stroke="#ffd700" stroke-width="2.5"/><polygon points="13,8 16,3 19,8" fill="#ffd700"/></svg>`;
 }
 // Divine Spear Lightning
 return `<svg viewBox="0 0 32 32" class="skill-svg-icon" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 2 L16 30 M12 6 L16 2 L20 6" stroke="#ffd700" stroke-width="2.5"/><path d="M7 14 L13 18 L10 24 L20 18 L16 12" stroke="#64ffda" stroke-width="2" fill="none"/></svg>`;
}

export function kyansitthaPortrait(cls = 'art-image') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="King Kyansittha of Bagan with divine Arindama spear"><image href="/assets/characters/kyansittha-portrait-v2.png" x="6" y="0" width="116" height="128" preserveAspectRatio="xMidYMid meet"/></svg>`;
}

export function arindamaSpearPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Arindama Spear illustration">
  <defs>
   <linearGradient id="arindamaGold" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#fff9c4"/>
    <stop offset="50%" stop-color="#ffd700"/>
    <stop offset="100%" stop-color="#b8860b"/>
   </linearGradient>
  </defs>
  <g transform="rotate(35 64 64)">
   <line x1="64" y1="-20" x2="64" y2="140" stroke="#4e342e" stroke-width="6"/>
   <line x1="64" y1="-20" x2="64" y2="140" stroke="#8d6e63" stroke-width="2.5"/>
   <!-- Divine Golden Spear Blade -->
   <polygon points="64,-72 76,-16 68,6 60,6 52,-16" fill="url(#arindamaGold)" stroke="#3e2723" stroke-width="2.5"/>
   <polygon points="64,-66 71,-16 64,0 57,-16" fill="#ffffff"/>
   <!-- Lightning Core Arc -->
   <line x1="64" y1="-62" x2="64" y2="2" stroke="#00e5ff" stroke-width="2.5"/>
   <!-- Emerald jewel core -->
   <circle cx="64" cy="-4" r="5" fill="#00e676" stroke="#1b5e20" stroke-width="1.5"/>
   <!-- Red Horsehair Plume (လှံအမွှေး) -->
   <path d="M68 6 Q84 22 76 42 Q70 26 68 12 Z" fill="#d32f2f"/>
  </g>
 </svg>`;
}

export function baganPikePortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Bagan Crescent Pike illustration">
  <g transform="rotate(35 64 64)">
   <line x1="64" y1="-15" x2="64" y2="140" stroke="#37474f" stroke-width="6"/>
   <line x1="64" y1="-15" x2="64" y2="140" stroke="#78909c" stroke-width="2.5"/>
   <!-- Spear Point -->
   <polygon points="64,-65 72,-15 64,0 56,-15" fill="#eceff1" stroke="#263238" stroke-width="2.5"/>
   <!-- Crescent Side Blade -->
   <path d="M64 -15 Q96 -10 86 30 Q76 8 64 4 Z" fill="#90a4ae" stroke="#263238" stroke-width="2.5"/>
   <circle cx="64" cy="4" r="4.5" fill="#ffd700" stroke="#080e19" stroke-width="1.5"/>
  </g>
 </svg>`;
}

export function royalLancePortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Royal Vanguard Lance illustration">
  <g transform="rotate(35 64 64)">
   <line x1="64" y1="-28" x2="64" y2="140" stroke="#b71c1c" stroke-width="6.5"/>
   <!-- Fluted Golden Vamplate Guard -->
   <polygon points="46,45 82,45 74,80 54,80" fill="#ffd700" stroke="#3e2723" stroke-width="2.5"/>
   <!-- Massive Penetrating Lance Tip -->
   <polygon points="64,-70 72,-28 68,20 60,20 56,-28" fill="#ffd54f" stroke="#3e2723" stroke-width="2.5"/>
   <circle cx="64" cy="55" r="4.5" fill="#ffffff" stroke="#b8860b" stroke-width="1.5"/>
  </g>
 </svg>`;
}
