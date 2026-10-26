import {skillIcon} from './skill-icons';

export const PYUSAWHTI_SKILLS = {
 multishot: { name: 'Gale Volley', cooldown: 9, icon: '➳', description: 'Loose 7 piercing arrows in a wide spread, decimating incoming crowds.' },
 windfocus: { name: 'Wind Focus', cooldown: 12, icon: '彡', description: 'Enter extreme focus for 5s: gain +80% attack speed, +25% move speed, and infinite arrow pierce.' },
 banepierce: { name: 'Five-Bane Pierce', cooldown: 14, icon: '☼', description: 'Fire a colossal golden sun arrow that pierces all enemies in a line, pushes them back, and detonates in an AoE sunburst.' }
} as const;

export type PyusawhtiSkill = keyof typeof PYUSAWHTI_SKILLS;
export type PyusawhtiLoadout = [PyusawhtiSkill, PyusawhtiSkill];

export function validPyusawhtiLoadout(raw: unknown): PyusawhtiLoadout {
 if (Array.isArray(raw) && raw.length === 2) {
  if (raw[0] !== raw[1] && raw.every(s => typeof s === 'string' && Object.hasOwn(PYUSAWHTI_SKILLS, s))) {
   return raw as PyusawhtiLoadout;
  }
 }
 return ['multishot', 'windfocus'];
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
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" role="img" aria-label="Pyusawhti the Divine Archer of Bagan">
  <ellipse cx="120" cy="265" rx="72" ry="9" fill="#050a13" opacity=".45"/>
  <!-- Quiver on back -->
  <path d="M145 60 L175 160 L160 165 L130 65 Z" fill="#6d4c24" stroke="#080e19" stroke-width="3"/>
  <path d="M148 45 L156 60 M154 42 L162 60 M160 40 L168 60" stroke="#f0c040" stroke-width="4" stroke-linecap="round"/>
  <!-- Legs -->
  <path d="M85 180 L115 178 L112 232 L106 260 L78 260 L86 230 Z" fill="#1b2838" stroke="#080e19" stroke-width="3.5"/>
  <path d="M120 178 L150 180 L147 230 L162 255 L135 260 L122 230 Z" fill="#1b2838" stroke="#080e19" stroke-width="3.5"/>
  <!-- Royal Longyi / Tunic -->
  <path d="M78 135 L160 135 L152 195 L84 195 Z" fill="#b8860b" stroke="#080e19" stroke-width="3.5"/>
  <path d="M84 145 L152 145 M84 165 L150 165 M86 185 L148 185" stroke="#ffe066" stroke-width="2"/>
  <path d="M96 135 L96 195 M138 135 L138 195" stroke="#7a5500" stroke-width="2.5"/>
  <!-- Torso & Golden Armor Vest -->
  <path d="M82 82 L154 80 L158 140 L78 140 Z" fill="#d4af37" stroke="#080e19" stroke-width="3.5"/>
  <path d="M102 82 L118 138 L134 82" fill="none" stroke="#fff1a8" stroke-width="3"/>
  <!-- Arms & Bracers -->
  <path d="M82 85 L58 125 L70 145 L88 115 Z" fill="#b57a22" stroke="#080e19" stroke-width="3"/>
  <path d="M152 85 L175 125 L162 145 L144 115 Z" fill="#b57a22" stroke="#080e19" stroke-width="3"/>
  <!-- Golden Archer Bow -->
  <path d="M50 40 Q25 120 52 200" fill="none" stroke="#ffd700" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M50 40 L52 200" stroke="#e6f2ff" stroke-width="1.5" stroke-dasharray="4 2"/>
  <path d="M38 115 L46 125" stroke="#7a4b00" stroke-width="6"/>
  <!-- Head & Hair Knot with Gold Filigree -->
  <circle cx="118" cy="55" r="23" fill="#d8a070" stroke="#080e19" stroke-width="3.5"/>
  <!-- Hair & Burmese Topknot (သျှောင်ပေစူး) -->
  <path d="M98 52 Q118 28 138 52 Q136 34 118 32 Q100 34 98 52 Z" fill="#181310"/>
  <ellipse cx="118" cy="28" rx="10" ry="12" fill="#181310" stroke="#080e19" stroke-width="2.5"/>
  <circle cx="118" cy="28" r="4" fill="#ffd700"/>
  <!-- Face details -->
  <path d="M106 54 L114 53 M124 53 L132 54" stroke="#22150c" stroke-width="2.5" stroke-linecap="round"/>
  <ellipse cx="110" cy="58" rx="2" ry="2.5" fill="#22150c"/>
  <ellipse cx="128" cy="58" rx="2" ry="2.5" fill="#22150c"/>
  <path d="M115 67 Q118 70 123 67" fill="none" stroke="#683416" stroke-width="2" stroke-linecap="round"/>
 </svg>`;
}

export function aungZeyaBowPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Aung Zeya Bow">
  <path d="M34 18 Q14 64 36 110" fill="none" stroke="#d4af37" stroke-width="5" stroke-linecap="round"/>
  <path d="M34 18 Q20 64 36 110" fill="none" stroke="#ffeb80" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M34 18 L36 110" stroke="#e0e8f0" stroke-width="1.5"/>
  <path d="M23 60 L29 68" stroke="#6e4210" stroke-width="6" stroke-linecap="round"/>
  <!-- Nocked Golden Arrow -->
  <path d="M26 64 L105 64" stroke="#ffd700" stroke-width="3" stroke-linecap="round"/>
  <path d="M102 59 L112 64 L102 69 Z" fill="#ffd700"/>
  <path d="M26 60 L32 64 L26 68" stroke="#d94f26" stroke-width="2"/>
 </svg>`;
}

export function solarCrossbowPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Solar Repeater Crossbow">
  <rect x="25" y="58" width="75" height="12" rx="3" fill="#8c5828" stroke="#221508" stroke-width="2"/>
  <path d="M78 22 Q92 64 78 106" fill="none" stroke="#d48817" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M78 22 L55 64 L78 106" stroke="#dbe7f2" stroke-width="1.5"/>
  <!-- Solar Sigil Hub -->
  <circle cx="55" cy="64" r="8" fill="#ffd043" stroke="#99580a" stroke-width="2"/>
  <path d="M55 58 L55 70 M49 64 L61 64" stroke="#b86200" stroke-width="2"/>
  <rect x="85" y="54" width="16" height="5" fill="#f09624"/>
 </svg>`;
}

export function greatbowPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Phoenix Greatbow">
  <path d="M42 12 Q6 64 42 116" fill="none" stroke="#c0392b" stroke-width="6.5" stroke-linecap="round"/>
  <path d="M42 12 Q18 64 42 116" fill="none" stroke="#f39c12" stroke-width="3" stroke-linecap="round"/>
  <path d="M42 12 L42 116" stroke="#ffffff" stroke-width="2"/>
  <!-- Feather crests on tips -->
  <path d="M42 12 Q48 4 56 8 Q46 16 42 12 Z" fill="#e74c3c"/>
  <path d="M42 116 Q48 124 56 120 Q46 112 42 116 Z" fill="#e74c3c"/>
  <rect x="22" y="60" width="8" height="14" rx="2" fill="#2c3e50"/>
  <!-- Flame arrow -->
  <path d="M26 64 L108 64" stroke="#ff5722" stroke-width="3.5"/>
  <path d="M104 57 L116 64 L104 71 Z" fill="#ff9800"/>
 </svg>`;
}
