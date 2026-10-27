import {skillIcon} from './skill-icons';

export const LETHWEI_SKILLS = {
 blitz: { name: 'Nine-Limb Blitz', cooldown: 8, icon: '⚔', description: 'Dash forward with a flying knee, elbow strike, and headbutt, knocking back and stunning foes.' },
 ironchin: { name: 'Iron Chin', cooldown: 11, icon: '🛡', description: 'Harden your stance: gain 50% damage reduction for 3.5s and reflect 70% melee damage taken back as a shockwave.' },
 lethweiring: { name: 'Lethwei Ring', cooldown: 16, icon: '⬡', description: 'Establish a 220px spiritual Lethwei boxing ring for 9s. Gain 40% damage reduction inside. Two fighting spirit clones spawn to auto-pummel nearby enemies, and ring ropes bounce foes back inside.' }
} as const;

export type LethweiSkill = keyof typeof LETHWEI_SKILLS;
export type LethweiLoadout = [LethweiSkill, LethweiSkill];

export function validLethweiLoadout(raw: unknown): LethweiLoadout {
 if (Array.isArray(raw) && raw.length === 2) {
  if (raw[0] !== raw[1] && raw.every(s => typeof s === 'string' && Object.hasOwn(LETHWEI_SKILLS, s))) {
   return raw as LethweiLoadout;
  }
 }
 return ['blitz', 'lethweiring'];
}

export function replaceLethweiSkill(pair: LethweiLoadout, slot: number, skill: LethweiSkill): LethweiLoadout {
 const next: [LethweiSkill, LethweiSkill] = [...pair];
 const other = slot === 0 ? 1 : 0;
 if (next[other] === skill) next[other] = next[slot];
 next[slot] = skill;
 return next;
}

export function lethweiSkillIcon(id: LethweiSkill) {
 if (id === 'blitz') {
  return `<svg viewBox="0 0 32 32" class="skill-svg-icon" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18 L16 8 L26 14 L18 26 Z" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22 L20 14" stroke="#ff8a80"/><circle cx="24" cy="8" r="3" fill="#ff5252"/></svg>`;
 }
 if (id === 'ironchin') {
  return `<svg viewBox="0 0 32 32" class="skill-svg-icon" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4 L28 9 V18 Q28 26 16 30 Q4 26 4 18 V9 Z" stroke-linecap="round" stroke-linejoin="round" fill="#30151a"/><path d="M11 16 L15 20 L22 13" stroke="#ff5252" stroke-width="2.5"/></svg>`;
 }
 // Boxing Ring Icon
 return `<svg viewBox="0 0 32 32" class="skill-svg-icon" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="5" width="22" height="22" rx="3" stroke="#ffd700" stroke-width="2.5"/><rect x="8" y="8" width="16" height="16" rx="2" stroke="#ff8f00" stroke-dasharray="2 2"/><circle cx="5" cy="5" r="2" fill="#d32f2f"/><circle cx="27" cy="5" r="2" fill="#1976d2"/><circle cx="5" cy="27" r="2" fill="#fff"/><circle cx="27" cy="27" r="2" fill="#fff"/></svg>`;
}

export function lethweiPortrait(cls = 'art-image') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1141 1349" role="img" aria-label="Lethwei Master with wrapped fists and traditional Htoe Kwin tattoos"><image href="/assets/characters/lethwei-tiger-portrait-v1.png" width="1141" height="1349"/></svg>`;
}

export function hempWrapsPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Raw Hemp Handwraps">
  <rect x="36" y="32" width="56" height="64" rx="12" fill="#d7c4a3" stroke="#4a3525" stroke-width="3"/>
  <path d="M36 46 L92 56 M36 60 L92 70 M36 74 L92 84" stroke="#8c6f4b" stroke-width="3.5"/>
  <path d="M42 32 L42 96 M86 32 L86 96" stroke="#aa8c64" stroke-width="2" stroke-dasharray="4 2"/>
  <circle cx="64" cy="64" r="8" fill="#a83232" opacity=".6"/>
 </svg>`;
}

export function ironWrapsPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Iron Studded Wraps">
  <rect x="34" y="30" width="60" height="68" rx="12" fill="#546e7a" stroke="#1c2b36" stroke-width="3.5"/>
  <path d="M34 46 L94 46 M34 82 L94 82" stroke="#263238" stroke-width="4"/>
  <!-- Iron Studs -->
  <circle cx="48" cy="64" r="5" fill="#cfd8dc" stroke="#263238" stroke-width="2"/>
  <circle cx="64" cy="64" r="6" fill="#eceff1" stroke="#263238" stroke-width="2"/>
  <circle cx="80" cy="64" r="5" fill="#cfd8dc" stroke="#263238" stroke-width="2"/>
 </svg>`;
}

export function tigerWrapsPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Tiger Strike Wraps">
  <rect x="34" y="30" width="60" height="68" rx="12" fill="#e65100" stroke="#3e2723" stroke-width="3.5"/>
  <!-- Tiger Stripes -->
  <path d="M34 44 Q54 48 42 60 M94 44 Q74 48 86 60 M34 76 Q56 74 44 86 M94 76 Q72 74 84 86" fill="none" stroke="#212121" stroke-width="4" stroke-linecap="round"/>
  <!-- Tiger Claws at top -->
  <path d="M46 30 L48 18 L54 30 M61 30 L64 16 L67 30 M74 30 L80 18 L82 30" fill="#f5f5f5" stroke="#3e2723" stroke-width="2"/>
 </svg>`;
}
