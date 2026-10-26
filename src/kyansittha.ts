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
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" role="img" aria-label="King Kyansittha of Bagan with divine Arindama spear">
  <ellipse cx="120" cy="265" rx="72" ry="9" fill="#050a13" opacity=".45"/>
  <!-- Legs in royal dark emerald longyi -->
  <path d="M85 180 L115 178 L112 232 L106 260 L78 260 L86 230 Z" fill="#1b3320" stroke="#080e19" stroke-width="3.5"/>
  <path d="M120 178 L150 180 L147 230 L162 255 L135 260 L122 230 Z" fill="#1b3320" stroke="#080e19" stroke-width="3.5"/>
  <!-- Bagan Royal Waist Armor & Sash -->
  <path d="M78 138 L160 138 L154 195 L84 195 Z" fill="#2d5a27" stroke="#080e19" stroke-width="3.5"/>
  <path d="M84 146 L152 146 M86 166 L150 166" stroke="#ffd700" stroke-width="2"/>
  <path d="M110 138 L116 195 L126 195 L122 138 Z" fill="#c59b27"/>
  <!-- Torso & Golden Bagan Cuirass -->
  <path d="M80 82 L156 82 L158 142 L80 142 Z" fill="#386b30" stroke="#080e19" stroke-width="3.5"/>
  <path d="M88 82 L120 138 L148 82" fill="none" stroke="#d4af37" stroke-width="3.5"/>
  <circle cx="118" cy="108" r="8" fill="#ffd700" stroke="#080e19" stroke-width="2"/>
  <!-- Arms & Golden Bracers -->
  <path d="M80 84 L56 122 L68 145 L88 116 Z" fill="#2d5a27" stroke="#080e19" stroke-width="3"/>
  <path d="M156 84 L180 122 L168 145 L146 116 Z" fill="#2d5a27" stroke="#080e19" stroke-width="3"/>
  <rect x="54" y="124" width="16" height="20" rx="3" fill="#d4af37" stroke="#080e19" stroke-width="2"/>
  <rect x="166" y="124" width="16" height="20" rx="3" fill="#d4af37" stroke="#080e19" stroke-width="2"/>
  <!-- Royal Arindama Spear in Hand -->
  <g transform="translate(178 30) rotate(15)">
   <line x1="0" y1="-20" x2="0" y2="210" stroke="#5d4037" stroke-width="5"/>
   <line x1="0" y1="-20" x2="0" y2="210" stroke="#8d6e63" stroke-width="2.5"/>
   <!-- Spearhead (အရိန္ဒမာ လှံသွား) -->
   <path d="M-8 -20 L0 -70 L8 -20 L4 0 L-4 0 Z" fill="#ffd700" stroke="#080e19" stroke-width="2.5"/>
   <path d="M-4 -20 L0 -64 L4 -20 Z" fill="#ffffff"/>
   <circle cx="0" cy="-10" r="4" fill="#00e676"/>
   <!-- Tassel / Horsehair banner -->
   <path d="M4 -5 Q18 10 8 30" fill="none" stroke="#d32f2f" stroke-width="3"/>
  </g>
  <!-- Head with Bagan Royal Crested Crown / Helmet -->
  <circle cx="118" cy="55" r="23" fill="#d8a070" stroke="#080e19" stroke-width="3.5"/>
  <!-- Bagan Golden Crown (မကိုဋ်) -->
  <path d="M96 52 L140 52 L136 36 L118 10 L100 36 Z" fill="#ffd700" stroke="#080e19" stroke-width="3"/>
  <circle cx="118" cy="10" r="3" fill="#00e676"/>
  <circle cx="118" cy="36" r="4" fill="#d32f2f"/>
  <path d="M104 42 L132 42" stroke="#b8860b" stroke-width="2"/>
  <!-- Face details -->
  <path d="M106 54 L114 53 M124 53 L132 54" stroke="#22150c" stroke-width="2.5" stroke-linecap="round"/>
  <ellipse cx="110" cy="58" rx="2" ry="2.5" fill="#22150c"/>
  <ellipse cx="128" cy="58" rx="2" ry="2.5" fill="#22150c"/>
  <!-- Royal Mustache -->
  <path d="M110 68 Q118 64 126 68 Q132 72 136 70 M110 68 Q104 72 100 70" fill="none" stroke="#1c1611" stroke-width="2.5" stroke-linecap="round"/>
 </svg>`;
}

export function arindamaSpearPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Arindama Spear of King Kyansittha">
  <g transform="rotate(35 64 64)">
   <line x1="64" y1="-15" x2="64" y2="140" stroke="#4e342e" stroke-width="6"/>
   <line x1="64" y1="-15" x2="64" y2="140" stroke="#8d6e63" stroke-width="2.5"/>
   <!-- Divine Golden Spear Blade -->
   <path d="M54 -15 L64 -65 L74 -15 L68 5 L60 5 Z" fill="#ffd700" stroke="#3e2723" stroke-width="2.5"/>
   <path d="M58 -15 L64 -60 L70 -15 Z" fill="#fff9c4"/>
   <!-- Emerald jewel core -->
   <circle cx="64" cy="-5" r="5" fill="#00e676" stroke="#1b5e20" stroke-width="1.5"/>
   <!-- Golden wing crossguards -->
   <path d="M50 0 Q64 -8 78 0 L76 8 Q64 4 52 8 Z" fill="#ffb300" stroke="#3e2723" stroke-width="1.5"/>
   <!-- Crimson Royal Tassel -->
   <path d="M68 6 Q80 20 74 38 Q70 24 68 12" fill="#d32f2f"/>
  </g>
 </svg>`;
}

export function baganPikePortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Bagan Crescent Pike">
  <g transform="rotate(35 64 64)">
   <line x1="64" y1="-10" x2="64" y2="140" stroke="#37474f" stroke-width="5.5"/>
   <line x1="64" y1="-10" x2="64" y2="140" stroke="#78909c" stroke-width="2"/>
   <!-- Crescent Side Blade & Spear Point -->
   <path d="M64 -50 L64 5 M58 -35 L64 -50 L70 -35" stroke="#eceff1" stroke-width="3" fill="none"/>
   <path d="M64 -15 Q90 -10 82 25 Q74 5 64 0" fill="#90a4ae" stroke="#263238" stroke-width="2"/>
   <circle cx="64" cy="0" r="4" fill="#ffb300"/>
  </g>
 </svg>`;
}

export function royalLancePortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Royal Vanguard Lance">
  <g transform="rotate(35 64 64)">
   <line x1="64" y1="-25" x2="64" y2="140" stroke="#bf360c" stroke-width="6"/>
   <!-- Cone Guard -->
   <path d="M50 45 L78 45 L72 75 L56 75 Z" fill="#d4af37" stroke="#3e2723" stroke-width="2.5"/>
   <path d="M58 -25 L64 -65 L70 -25 L68 25 L60 25 Z" fill="#ffd54f" stroke="#3e2723" stroke-width="2.5"/>
   <circle cx="64" cy="55" r="4" fill="#ffffff"/>
  </g>
 </svg>`;
}
