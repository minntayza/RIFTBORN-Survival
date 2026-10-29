import {skillIcon} from './skill-icons';

export const PYUSAWHTI_SKILLS = {
 banepierce: { name: 'Crownpiercer', cooldown: 14, icon: '☼', description: 'Loose a silver-and-teal crown arrow through a 96px-wide corridor, piercing enemies with devastating damage.' },
 multishot: { name: 'Gale Volley', cooldown: 9, icon: '➳', description: 'Loose 7 piercing arrows in a wide spread, decimating incoming crowds.' },
 windfocus: { name: 'Moonwind Focus', cooldown: 12, icon: '彡', description: 'Gather moonwind for 5s: gain +80% attack speed, +25% move speed, and 12 base arrow pierce.' }
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
 const tiles:Record<PyusawhtiSkill,[number,number]>={banepierce:[0,0],windfocus:[100,0],multishot:[0,100]};
 const [x,y]=tiles[id];
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x+4} ${y+4} 92 92" class="skill-svg-icon" data-skill-icon="${id}" aria-hidden="true" style="border-radius:50%;overflow:hidden"><image href="/assets/ui/archer-ability-emblems-v1.png" width="200" height="200"/></svg>`;
}

export function pyusawhtiPortrait(cls='art-image'){return `<svg class="${cls}" viewBox="0 0 128 160" role="img" aria-label="Archer King full-body portrait"><image href="/assets/characters/archer-king-portrait-v1.png" x="8" y="0" width="112" height="160" preserveAspectRatio="xMidYMid meet"/></svg>`;}

export function aungZeyaBowPortrait(cls = 'weapon-reference-art') {
 return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Duskstring Bow illustration">
 <path d="M55 9 C35 24 31 38 40 52 C47 61 46 69 40 78 C31 94 39 107 55 119 C45 101 51 89 57 77 C62 67 62 60 57 50 C50 35 46 24 55 9Z" fill="#855a3c" stroke="#30251f" stroke-width="3" stroke-linejoin="round"/>
 <path d="M55 9 L75 64 L55 119" fill="none" stroke="#b4a58c" stroke-width="1.5"/>
 <path d="M44 52 L57 50 L61 60 L47 62Z M47 69 L61 69 L57 79 L43 77Z" fill="#d8c9a8" stroke="#655641" stroke-width="1.5"/>
 <path d="M47 61 L61 61 L61 70 L46 70Z" fill="#342c27" stroke="#211e1d" stroke-width="2"/>
 <path d="M47 54 L58 53 M48 58 L60 57 M47 73 L59 74" stroke="#8c8068" stroke-width="1"/>
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
