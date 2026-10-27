import {skillIcon} from './skill-icons';

export const PYUSAWHTI_SKILLS = {
 banepierce: { name: 'Five-Bane Pierce', cooldown: 14, icon: '☼', description: 'Unleash a massive 96px-wide solar laser beam arrow that incinerates all enemies in its path with devastating damage.' },
 multishot: { name: 'Gale Volley', cooldown: 9, icon: '➳', description: 'Loose 7 piercing arrows in a wide spread, decimating incoming crowds.' },
 windfocus: { name: 'Wind Focus', cooldown: 12, icon: '彡', description: 'Enter extreme focus for 5s: gain +80% attack speed, +25% move speed, and infinite arrow pierce.' }
} as const;

export type PyusawhtiSkill = keyof typeof PYUSAWHTI_SKILLS;
export type PyusawhtiLoadout = [PyusawhtiSkill, PyusawhtiSkill];

export function validPyusawhtiLoadout(raw: unknown): PyusawhtiLoadout {
 if (Array.isArray(raw) && raw.length === 2) {
  if (raw[0] === 'multishot' && raw[1] === 'windfocus') {
   return ['banepierce', 'windfocus'];
  }
  if (raw[0] !== raw[1] && raw.every(s => typeof s === 'string' && Object.hasOwn(PYUSAWHTI_SKILLS, s))) {
   return raw as PyusawhtiLoadout;
  }
 }
 return ['banepierce', 'windfocus'];
}

export function replacePyusawhtiSkill(pair: PyusawhtiLoadout, slot: number, skill: PyusawhtiSkill): PyusawhtiLoadout {
 const next: [PyusawhtiSkill, PyusawhtiSkill] = [...pair];
 const other = slot === 0 ? 1 : 0;
 if (next[other] === skill) next[other] = next[slot];
 next[slot] = skill;
 return next;
}

export function pyusawhtiSkillIcon(id: PyusawhtiSkill) {
 if (id === 'multishot') {
  return `<svg viewBox="0 0 32 32" class="skill-svg-icon" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 28 L28 4 M16 4 L28 4 L28 16 M8 20 L24 8 M12 24 L24 12" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
 }
 if (id === 'windfocus') {
  return `<svg viewBox="0 0 32 32" class="skill-svg-icon" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12 Q14 6 22 10 Q28 14 26 18 Q23 22 18 20 M6 18 Q16 14 24 16 Q30 20 27 24 M2 24 Q10 22 18 24" stroke-linecap="round"/><circle cx="24" cy="8" r="2" fill="currentColor"/></svg>`;
 }
 return `<svg viewBox="0 0 32 32" class="skill-svg-icon" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="16" r="6" fill="#ffd700" stroke="#b8860b"/><path d="M16 2 L16 8 M16 24 L16 30 M2 16 L8 16 M24 16 L30 16 M6 6 L10 10 M22 22 L26 26 M6 26 L10 22 M22 10 L26 6" stroke="#ffd700" stroke-linecap="round"/></svg>`;
}

export function pyusawhtiPortrait(cls = 'art-image') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Pyusawhti the Divine Archer of Bagan">
  <!-- Ground Shadow -->
  <ellipse cx="64" cy="120" rx="34" ry="5.5" fill="#050a13" opacity=".4"/>
  <!-- Quiver over shoulder with golden arrows -->
  <g transform="translate(86 36) rotate(-22)">
   <rect x="-6" y="-22" width="13" height="42" rx="3" fill="#6d4c24" stroke="#080e19" stroke-width="2"/>
   <rect x="-7" y="-14" width="15" height="4" fill="#ffd700"/>
   <rect x="-7" y="6" width="15" height="4" fill="#ffd700"/>
   <!-- Arrow shafts & red fletching -->
   <rect x="-4" y="-34" width="2.5" height="13" fill="#ffd54f"/>
   <path d="M-4 -34 L-1.5 -40 L1 -34 Z" fill="#d32f2f"/>
   <rect x="2" y="-31" width="2.5" height="10" fill="#ffd54f"/>
   <path d="M2 -31 L4.5 -37 L7 -31 Z" fill="#d32f2f"/>
  </g>
  <!-- Royal Longyi & Boots -->
  <path d="M44 86 L84 86 L88 116 L40 116 Z" fill="#b8860b" stroke="#080e19" stroke-width="2.5"/>
  <path d="M42 96 L86 96 M41 106 L87 106" stroke="#ffe066" stroke-width="1.8"/>
  <rect x="42" y="114" width="18" height="6" rx="2" fill="#1b2838" stroke="#080e19" stroke-width="1.5"/>
  <rect x="68" y="114" width="18" height="6" rx="2" fill="#1b2838" stroke="#080e19" stroke-width="1.5"/>
  <!-- Torso & Golden Sun Cuirass -->
  <path d="M43 54 L85 54 L87 87 L41 87 Z" fill="#d4af37" stroke="#080e19" stroke-width="2.5"/>
  <circle cx="64" cy="70" r="9" fill="#ffd700" stroke="#b8860b" stroke-width="1.8"/>
  <circle cx="64" cy="70" r="4" fill="#d32f2f"/>
  <path d="M45 58 L54 68 M83 58 L74 68" stroke="#fff1a8" stroke-width="2"/>
  <!-- Bracers & Hands -->
  <path d="M36 60 L24 82 L32 86 L44 68 Z" fill="#b57a22" stroke="#080e19" stroke-width="2"/>
  <path d="M84 60 L96 82 L88 86 L76 68 Z" fill="#b57a22" stroke="#080e19" stroke-width="2"/>
  <!-- Aung Zeya Bow held in left hand -->
  <path d="M20 20 Q5 68 22 116" fill="none" stroke="#ffd700" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M20 20 Q10 68 22 116" fill="none" stroke="#fff9c4" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="20" cy="20" r="3" fill="#00e676"/>
  <circle cx="22" cy="116" r="3" fill="#00e676"/>
  <line x1="20" y1="20" x2="22" y2="116" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3 2"/>
  <!-- Chibi Head -->
  <circle cx="64" cy="38" r="21" fill="#f5cba7" stroke="#080e19" stroke-width="2.5"/>
  <!-- Bagan Golden Crown (မကိုဋ်) -->
  <path d="M46 30 L82 30 L78 18 L64 6 L50 18 Z" fill="#ffd700" stroke="#080e19" stroke-width="2.2"/>
  <circle cx="64" cy="16" r="3.5" fill="#d32f2f"/>
  <circle cx="53" cy="24" r="2" fill="#00e676"/>
  <circle cx="75" cy="24" r="2" fill="#00e676"/>
  <!-- Royal Archer Hair Knot -->
  <ellipse cx="64" cy="26" rx="8" ry="4" fill="#181310"/>
  <!-- Expressive Eyes -->
  <ellipse cx="55" cy="38" rx="3.5" ry="4.5" fill="#1c1611"/>
  <ellipse cx="73" cy="38" rx="3.5" ry="4.5" fill="#1c1611"/>
  <circle cx="56" cy="36" r="1.5" fill="#ffffff"/>
  <circle cx="74" cy="36" r="1.5" fill="#ffffff"/>
  <path d="M52 32 Q56 29 60 32 M70 32 Q74 29 78 32" stroke="#1c1611" stroke-width="2" stroke-linecap="round"/>
  <!-- Confident Smile -->
  <path d="M60 46 Q64 50 68 46" fill="none" stroke="#8d502a" stroke-width="2" stroke-linecap="round"/>
 </svg>`;
}

export function aungZeyaBowPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Aung Zeya Bow illustration">
  <defs>
   <linearGradient id="azbGold" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#fff9c4"/>
    <stop offset="50%" stop-color="#ffd700"/>
    <stop offset="100%" stop-color="#b8860b"/>
   </linearGradient>
  </defs>
  <path d="M36 12 Q8 64 38 116" fill="none" stroke="url(#azbGold)" stroke-width="6" stroke-linecap="round"/>
  <path d="M36 12 Q18 64 38 116" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
  <!-- Recurve Finials & Gems -->
  <circle cx="36" cy="12" r="4.5" fill="#00e676" stroke="#080e19" stroke-width="1.5"/>
  <circle cx="38" cy="116" r="4.5" fill="#00e676" stroke="#080e19" stroke-width="1.5"/>
  <line x1="36" y1="12" x2="38" y2="116" stroke="#ffffff" stroke-width="1.8"/>
  <!-- Carved Grip -->
  <rect x="18" y="58" width="9" height="14" rx="3" fill="#6d4c24" stroke="#080e19" stroke-width="1.5"/>
  <!-- Divine Solar Arrow -->
  <line x1="22" y1="64" x2="108" y2="64" stroke="#ffd700" stroke-width="3.5" stroke-linecap="round"/>
  <polygon points="106,58 118,64 106,70" fill="#ffffff" stroke="#b8860b" stroke-width="1.5"/>
  <!-- Arrow Fletchings -->
  <polygon points="22,60 30,64 22,68" fill="#d32f2f"/>
 </svg>`;
}

export function solarCrossbowPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Solar Repeater Crossbow illustration">
  <rect x="22" y="58" width="80" height="12" rx="3" fill="#8c5828" stroke="#221508" stroke-width="2"/>
  <path d="M80 18 Q98 64 80 110" fill="none" stroke="#d48817" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M80 18 L54 64 L80 110" stroke="#ffffff" stroke-width="1.8"/>
  <!-- Solar Sun Medallion -->
  <circle cx="54" cy="64" r="10" fill="#ffd700" stroke="#b8860b" stroke-width="2"/>
  <circle cx="54" cy="64" r="5" fill="#d32f2f"/>
  <rect x="88" y="53" width="16" height="6" rx="2" fill="#ff9800" stroke="#080e19" stroke-width="1.5"/>
 </svg>`;
}

export function greatbowPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Phoenix Greatbow illustration">
  <path d="M42 10 Q2 64 42 118" fill="none" stroke="#c0392b" stroke-width="7" stroke-linecap="round"/>
  <path d="M42 10 Q16 64 42 118" fill="none" stroke="#ffd700" stroke-width="3" stroke-linecap="round"/>
  <line x1="42" y1="10" x2="42" y2="118" stroke="#ffffff" stroke-width="2"/>
  <!-- Phoenix Feather Wing Tips -->
  <path d="M42 10 Q50 2 60 6 Q48 16 42 10 Z" fill="#e74c3c" stroke="#7e1d1d" stroke-width="1.5"/>
  <path d="M42 118 Q50 126 60 122 Q48 112 42 118 Z" fill="#e74c3c" stroke="#7e1d1d" stroke-width="1.5"/>
  <rect x="18" y="58" width="9" height="14" rx="2" fill="#2c3e50" stroke="#080e19" stroke-width="1.5"/>
  <line x1="22" y1="64" x2="110" y2="64" stroke="#ff5722" stroke-width="4"/>
  <polygon points="106,56 120,64 106,72" fill="#ff9800" stroke="#c0392b" stroke-width="1.5"/>
 </svg>`;
}
