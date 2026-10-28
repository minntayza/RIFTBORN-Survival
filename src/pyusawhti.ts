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
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Prince Pyusawhti of Bagan"><image href="/assets/characters/pyusawhti-portrait-v2.png" x="6" y="0" width="116" height="128" preserveAspectRatio="xMidYMid meet"/></svg>`;
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
