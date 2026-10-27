import {skillIcon} from './skill-icons';

export const KYANSITTHA_SKILLS = {
 crescentsweep: { name: 'Crescent Sweep & Lunge', cooldown: 8, icon: '⚔', description: 'Sweep in a 240° arc to knock hordes back, followed by a lunging thrust that pierces a straight line.' },
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
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="King Kyansittha of Bagan with divine Arindama spear">
  <!-- Ground Shadow -->
  <ellipse cx="64" cy="120" rx="36" ry="6" fill="#050a13" opacity=".4"/>
  <!-- Royal Crimson Capelet flowing behind -->
  <path d="M38 48 L90 48 L98 106 L30 106 Z" fill="#b71c1c" stroke="#080e19" stroke-width="2.5"/>
  <!-- Royal Emerald Longyi Skirt & Armored Greaves -->
  <path d="M42 86 L86 86 L90 116 L38 116 Z" fill="#1b3320" stroke="#080e19" stroke-width="2.5"/>
  <rect x="44" y="94" width="16" height="18" rx="2" fill="#ffd700" stroke="#b8860b" stroke-width="1.5"/>
  <rect x="68" y="94" width="16" height="18" rx="2" fill="#ffd700" stroke="#b8860b" stroke-width="1.5"/>
  <rect x="42" y="112" width="18" height="8" rx="2" fill="#b8860b" stroke="#080e19" stroke-width="1.5"/>
  <rect x="68" y="112" width="18" height="8" rx="2" fill="#b8860b" stroke="#080e19" stroke-width="1.5"/>
  <!-- Torso / Golden Scaled Cuirass -->
  <path d="M42 54 L86 54 L88 88 L40 88 Z" fill="#386b30" stroke="#080e19" stroke-width="2.5"/>
  <rect x="46" y="58" width="36" height="24" rx="3" fill="#ffd700" stroke="#b8860b" stroke-width="1.8"/>
  <!-- Royal Lion / Sun Medallion -->
  <circle cx="64" cy="70" r="8" fill="#ffb300" stroke="#080e19" stroke-width="1.5"/>
  <circle cx="64" cy="70" r="4.5" fill="#00e676"/>
  <!-- Armored Gauntlets holding spear -->
  <path d="M34 62 L22 84 L30 88 L42 70 Z" fill="#d4af37" stroke="#080e19" stroke-width="2"/>
  <path d="M86 62 L98 84 L90 88 L78 70 Z" fill="#d4af37" stroke="#080e19" stroke-width="2"/>
  <!-- Divine Arindama Spear held upright at side -->
  <g transform="translate(100 14) rotate(12)">
   <line x1="0" y1="-8" x2="0" y2="108" stroke="#4e342e" stroke-width="4.5"/>
   <line x1="0" y1="-8" x2="0" y2="108" stroke="#8d6e63" stroke-width="2"/>
   <!-- Red Plume -->
   <ellipse cx="-4" cy="10" rx="5" ry="8" fill="#d32f2f"/>
   <!-- Spearhead Socket -->
   <rect x="-4" y="6" width="8" height="5" fill="#ffd700"/>
   <!-- Leaf Blade -->
   <polygon points="0,-18 7,6 0,8 -7,6" fill="#ffffff" stroke="#ffd700" stroke-width="2"/>
   <line x1="0" y1="-16" x2="0" y2="6" stroke="#00e5ff" stroke-width="1.5"/>
  </g>
  <!-- Chibi Head -->
  <circle cx="64" cy="38" r="21" fill="#f5cba7" stroke="#080e19" stroke-width="2.5"/>
  <!-- Bagan King's Spired Crown / Helmet (မကိုဋ်သရဖူ) -->
  <path d="M44 30 L84 30 L80 16 L64 4 L48 16 Z" fill="#ffd700" stroke="#080e19" stroke-width="2.2"/>
  <circle cx="64" cy="14" r="3.5" fill="#00e676"/>
  <circle cx="53" cy="22" r="2.2" fill="#d32f2f"/>
  <circle cx="75" cy="22" r="2.2" fill="#d32f2f"/>
  <!-- Resolute Eyes -->
  <ellipse cx="55" cy="37" rx="3.5" ry="4.5" fill="#1c1611"/>
  <ellipse cx="73" cy="37" rx="3.5" ry="4.5" fill="#1c1611"/>
  <circle cx="56" cy="35" r="1.5" fill="#ffffff"/>
  <circle cx="74" cy="35" r="1.5" fill="#ffffff"/>
  <path d="M52 31 Q56 28 60 31 M70 31 Q74 28 78 31" stroke="#1c1611" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Bagan Royal Mustache (နှုတ်ခမ်းမွေး) -->
  <path d="M55 45 Q64 42 73 45 Q78 48 81 46 M55 45 Q50 48 47 46" fill="none" stroke="#1c1611" stroke-width="2.5" stroke-linecap="round"/>
 </svg>`;
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
