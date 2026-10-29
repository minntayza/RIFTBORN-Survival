
export const LETHWEI_SKILLS = {
 blitz: { name: 'Nine-Limb Blitz', cooldown: 8, icon: '⚔', description: 'Dash forward with a flying knee, elbow strike, and headbutt, knocking back and stunning foes.' },
 ironchin: { name: 'Iron Chin', cooldown: 11, icon: '✦', description: 'Harden your stance: gain 50% damage reduction for 3.5s and reflect 70% melee damage taken back as a shockwave.' },
 lethweiring: { name: 'Lethwei Ring', cooldown: 20, icon: '⬡', description: 'Establish a sacred square Lethwei ring for 6s (20s cooldown). Gain 20% damage reduction inside. A spirit clone aids you, and elastic ring ropes bounce foes back inside.' }
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
 const tiles:Record<LethweiSkill,[number,number]>={blitz:[0,0],ironchin:[100,0],lethweiring:[0,100]};
 const [x,y]=tiles[id],key=`lethwei-emblem-${id}`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x+4} ${y+4} 92 92" class="skill-svg-icon" data-skill-icon="${id}" aria-hidden="true" style="border-radius:50%;overflow:hidden"><defs><clipPath id="${key}"><circle cx="${x+50}" cy="${y+50}" r="46"/></clipPath></defs><image clip-path="url(#${key})" href="/assets/ui/lethwei-ability-emblems-v1.png" width="200" height="200"/></svg>`;
}

export function lethweiPortrait(cls = 'art-image') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Lethwei Master with wrapped fists and traditional Htoe Kwin tattoos"><image href="/assets/characters/lethwei-tiger-portrait-v1.png" x="8" y="0" width="112" height="128" preserveAspectRatio="xMidYMid slice"/></svg>`;
}

export function hempWrapsPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Hemp Wraps illustration">
  <defs>
   <linearGradient id="hempGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#f5e6ca"/>
    <stop offset="50%" stop-color="#d7c4a3"/>
    <stop offset="100%" stop-color="#aa8c64"/>
   </linearGradient>
  </defs>
  <rect x="32" y="28" width="64" height="72" rx="14" fill="url(#hempGrad)" stroke="#3e2723" stroke-width="3"/>
  <!-- Multi-layered wound hemp fibers -->
  <path d="M32 44 L96 52 M32 58 L96 66 M32 72 L96 80 M32 86 L96 94" stroke="#6d4c24" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Knuckle cord wrap accents -->
  <rect x="38" y="32" width="52" height="10" rx="3" fill="#8d6e63" stroke="#3e2723" stroke-width="2"/>
  <!-- Traditional Burmese fighter blood seal -->
  <circle cx="64" cy="64" r="9" fill="#b71c1c" opacity=".85"/>
  <circle cx="64" cy="64" r="4" fill="#ffd700"/>
 </svg>`;
}

export function ironWrapsPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Iron Studded Wraps illustration">
  <defs>
   <linearGradient id="ironGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#90a4ae"/>
    <stop offset="50%" stop-color="#546e7a"/>
    <stop offset="100%" stop-color="#263238"/>
   </linearGradient>
  </defs>
  <rect x="30" y="26" width="68" height="76" rx="14" fill="url(#ironGrad)" stroke="#102027" stroke-width="3.5"/>
  <rect x="36" y="32" width="56" height="12" rx="4" fill="#37474f" stroke="#102027" stroke-width="2"/>
  <path d="M30 50 L98 50 M30 84 L98 84" stroke="#102027" stroke-width="4"/>
  <!-- Reinforced Iron Knuckle Spikes / Studs -->
  <circle cx="44" cy="66" r="6" fill="#eceff1" stroke="#102027" stroke-width="2.5"/>
  <circle cx="64" cy="66" r="7.5" fill="#ffffff" stroke="#102027" stroke-width="2.5"/>
  <circle cx="84" cy="66" r="6" fill="#eceff1" stroke="#102027" stroke-width="2.5"/>
 </svg>`;
}

export function tigerWrapsPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Tiger Strike Wraps illustration">
  <defs>
   <linearGradient id="tigerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#ff9800"/>
    <stop offset="50%" stop-color="#e65100"/>
    <stop offset="100%" stop-color="#bf360c"/>
   </linearGradient>
  </defs>
  <rect x="30" y="26" width="68" height="76" rx="14" fill="url(#tigerGrad)" stroke="#212121" stroke-width="3.5"/>
  <!-- Fierce Tiger Claw Marks -->
  <path d="M30 42 Q60 48 42 62 M98 42 Q68 48 86 62 M30 74 Q62 72 46 86 M98 74 Q66 72 82 86" fill="none" stroke="#212121" stroke-width="4.5" stroke-linecap="round"/>
  <!-- Razor Tiger Claws at Knuckles -->
  <polygon points="44,28 48,14 54,28" fill="#ffffff" stroke="#212121" stroke-width="2"/>
  <polygon points="61,28 64,12 67,28" fill="#ffffff" stroke="#212121" stroke-width="2"/>
  <polygon points="74,28 80,14 84,28" fill="#ffffff" stroke="#212121" stroke-width="2"/>
  <circle cx="64" cy="64" r="5" fill="#ffd700"/>
 </svg>`;
}
