import {championBeltSvg} from './champion-belt';
/** Dedicated illustrated card artwork for Myanmar heroes: Pyusawhti, Lethwei Master, Kyansittha */
export const MYANMAR_CARD_IDS = new Set([
 'arrowstorm',
 'windfocuscard',
 'sunburstcard',
 'beasthunter',
 'piercingeye',
 'nineweapons',
 'ironshins',
 'headbutt',
 'ringmaster',
 'goldenbelt',
 'arindamapower',
 'royalguard',
 'spearwhirl',
 'baganvalour',
 'thunderthrust'
]);

export function myanmarCardArt(id: string): string {
 if (!MYANMAR_CARD_IDS.has(id)) return '';
 switch (id) {
  case 'arrowstorm':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <linearGradient id="g-arrowstorm" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4a2e12"/>
        <stop offset="100%" stop-color="#1e1107"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#g-arrowstorm)"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#e8a838" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6"/>
    <!-- 3 Glowing Arrows ascending -->
    <g stroke="#ffdd72" stroke-width="3" stroke-linecap="round">
      <line x1="50" y1="80" x2="50" y2="22"/>
      <path d="M42 32 L50 18 L58 32" fill="none" stroke="#fff1a8" stroke-width="3"/>
      <line x1="30" y1="82" x2="22" y2="30"/>
      <path d="M16 42 L22 26 L30 38" fill="none" stroke="#ffdd72" stroke-width="2.5"/>
      <line x1="70" y1="82" x2="78" y2="30"/>
      <path d="M70 38 L78 26 L84 42" fill="none" stroke="#ffdd72" stroke-width="2.5"/>
    </g>
    <circle cx="50" cy="18" r="4" fill="#ffffff" filter="drop-shadow(0 0 6px #ffe066)"/>
   </svg>`;

  case 'windfocuscard':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <linearGradient id="g-windfocus" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#143c3a"/>
        <stop offset="100%" stop-color="#0a1a1c"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#g-windfocus)"/>
    <!-- Falcon Eye and swirling wind -->
    <path d="M15 50 Q50 20 85 50 Q50 80 15 50 Z" fill="none" stroke="#7ef0d8" stroke-width="3" opacity="0.75"/>
    <circle cx="50" cy="50" r="14" fill="#1b5a54" stroke="#e0fff7" stroke-width="2.5"/>
    <circle cx="50" cy="50" r="6" fill="#7ef0d8"/>
    <!-- Swirling gales -->
    <path d="M22 30 Q50 10 78 25" fill="none" stroke="#afffee" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 70 Q50 90 78 75" fill="none" stroke="#afffee" stroke-width="2" stroke-linecap="round"/>
   </svg>`;

  case 'sunburstcard':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <radialGradient id="g-sunburst" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff8db"/>
        <stop offset="40%" stop-color="#ffb834"/>
        <stop offset="100%" stop-color="#4a1805"/>
      </radialGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="#2d1007"/>
    <circle cx="50" cy="50" r="22" fill="url(#g-sunburst)"/>
    <!-- Radiant Sun Rays -->
    <g stroke="#ffdd72" stroke-width="2.5" stroke-linecap="round">
      <line x1="50" y1="12" x2="50" y2="22"/>
      <line x1="50" y1="78" x2="50" y2="88"/>
      <line x1="12" y1="50" x2="22" y2="50"/>
      <line x1="78" y1="50" x2="88" y2="50"/>
      <line x1="23" y1="23" x2="30" y2="30"/>
      <line x1="70" y1="70" x2="77" y2="77"/>
      <line x1="77" y1="23" x2="70" y2="30"/>
      <line x1="23" y1="77" x2="30" y2="70"/>
    </g>
    <circle cx="50" cy="50" r="10" fill="#ffffff" filter="drop-shadow(0 0 8px #ffb300)"/>
   </svg>`;

  case 'beasthunter':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <linearGradient id="g-beasthunter" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3d1f14"/>
        <stop offset="100%" stop-color="#140a08"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#g-beasthunter)"/>
    <!-- Giant Beast Silhouette pierced by Royal Arrow -->
    <path d="M25 65 Q35 40 50 42 Q65 40 75 65 Q60 55 50 58 Q40 55 25 65 Z" fill="#752a1d" opacity="0.6"/>
    <!-- Cross Swords / Arrow -->
    <g stroke="#e29845" stroke-width="3" stroke-linecap="round">
      <line x1="25" y1="25" x2="75" y2="75"/>
      <line x1="75" y1="25" x2="25" y2="75"/>
    </g>
    <polygon points="50,15 42,28 58,28" fill="#ffd77a"/>
    <circle cx="50" cy="50" r="7" fill="#ff4d4d"/>
   </svg>`;

  case 'piercingeye':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <linearGradient id="g-pierceeye" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b2b10"/>
        <stop offset="100%" stop-color="#141108"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#g-pierceeye)"/>
    <!-- Concentric Target Sight -->
    <circle cx="50" cy="50" r="32" fill="none" stroke="#d4af37" stroke-width="2"/>
    <circle cx="50" cy="50" r="20" fill="none" stroke="#ffdd72" stroke-width="2"/>
    <circle cx="50" cy="50" r="8" fill="#ffeaa7"/>
    <line x1="12" y1="50" x2="88" y2="50" stroke="#ffdd72" stroke-width="2"/>
    <line x1="50" y1="12" x2="50" y2="88" stroke="#ffdd72" stroke-width="2"/>
   </svg>`;

  case 'nineweapons':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <linearGradient id="g-nineweapons" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4a1515"/>
        <stop offset="100%" stop-color="#1f0808"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#g-nineweapons)"/>
    <!-- Lethwei Fist with Wrapped Hemp Ropes -->
    <ellipse cx="50" cy="52" rx="22" ry="26" fill="#9e3223" stroke="#f47560" stroke-width="2.5"/>
    <g stroke="#ffd9a6" stroke-width="2" stroke-linecap="round" opacity="0.85">
      <line x1="32" y1="42" x2="68" y2="42"/>
      <line x1="30" y1="50" x2="70" y2="50"/>
      <line x1="32" y1="58" x2="68" y2="58"/>
      <line x1="35" y1="66" x2="65" y2="66"/>
    </g>
    <!-- 9 points starburst -->
    <circle cx="50" cy="24" r="5" fill="#ffcc00"/>
    <circle cx="74" cy="38" r="4" fill="#ff7733"/>
    <circle cx="26" cy="38" r="4" fill="#ff7733"/>
   </svg>`;

  case 'ironshins':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <linearGradient id="g-ironshins" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3d1b10"/>
        <stop offset="100%" stop-color="#140804"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#g-ironshins)"/>
    <!-- Sweeping Kick Arc with Iron Sheen -->
    <path d="M20 75 Q45 25 80 35" fill="none" stroke="#ff7043" stroke-width="6" stroke-linecap="round"/>
    <path d="M25 78 Q48 32 78 40" fill="none" stroke="#fff176" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Impact shock burst -->
    <circle cx="80" cy="35" r="9" fill="#ffab40"/>
    <polygon points="80,22 83,32 94,35 83,38 80,48 77,38 66,35 77,32" fill="#ffffff"/>
   </svg>`;

  case 'headbutt':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <radialGradient id="g-headbutt" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ff5252"/>
        <stop offset="70%" stop-color="#801010"/>
        <stop offset="100%" stop-color="#240505"/>
      </radialGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="#240505"/>
    <circle cx="50" cy="50" r="28" fill="url(#g-headbutt)"/>
    <!-- Shattering Shockwaves -->
    <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round">
      <line x1="50" y1="14" x2="50" y2="28"/>
      <line x1="50" y1="72" x2="50" y2="86"/>
      <line x1="14" y1="50" x2="28" y2="50"/>
      <line x1="72" y1="50" x2="86" y2="50"/>
      <line x1="26" y1="26" x2="36" y2="36"/>
      <line x1="64" y1="64" x2="74" y2="74"/>
    </g>
    <circle cx="50" cy="50" r="12" fill="#ffebee"/>
   </svg>`;

  case 'ringmaster':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <linearGradient id="g-ringmaster" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#26173d"/>
        <stop offset="100%" stop-color="#0f071a"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#g-ringmaster)"/>
    <!-- Boxing Ring Perspective Ropes & Corner Posts -->
    <rect x="22" y="22" width="56" height="56" rx="4" fill="none" stroke="#d32f2f" stroke-width="3"/>
    <rect x="26" y="26" width="48" height="48" rx="4" fill="none" stroke="#ffa000" stroke-width="2"/>
    <rect x="30" y="30" width="40" height="40" rx="4" fill="none" stroke="#ffd700" stroke-width="1.5"/>
    <!-- 4 Corner Posts -->
    <circle cx="22" cy="22" r="5" fill="#d32f2f"/>
    <circle cx="78" cy="22" r="5" fill="#1976d2"/>
    <circle cx="22" cy="78" r="5" fill="#ffffff"/>
    <circle cx="78" cy="78" r="5" fill="#d32f2f"/>
   </svg>`;

  case 'goldenbelt':
   return championBeltSvg('upgrade-reference-art');

  case 'arindamapower':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <linearGradient id="g-arindama" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b3842"/>
        <stop offset="100%" stop-color="#04181c"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#g-arindama)"/>
    <!-- Arindama Spearhead crackling with electric bolts -->
    <polygon points="50,14 62,42 50,36 38,42" fill="#64ffda" stroke="#ffffff" stroke-width="1.5"/>
    <line x1="50" y1="36" x2="50" y2="88" stroke="#e0f2f1" stroke-width="4"/>
    <!-- Lightning Tendrils -->
    <path d="M50 30 L68 25 L60 38 L76 34" fill="none" stroke="#00e5ff" stroke-width="2.5"/>
    <path d="M50 40 L32 35 L40 48 L24 44" fill="none" stroke="#00e5ff" stroke-width="2.5"/>
   </svg>`;

  case 'royalguard':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <linearGradient id="g-royalguard" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#17352f"/>
        <stop offset="100%" stop-color="#081412"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#g-royalguard)"/>
    <!-- Bagan Shield Wall with Royal Boss -->
    <path d="M28 24 L72 24 L78 60 Q50 86 50 86 Q22 60 28 24 Z" fill="#2d6a5e" stroke="#80cbc4" stroke-width="2.5"/>
    <circle cx="50" cy="48" r="12" fill="#e0f2f1" stroke="#d4af37" stroke-width="3"/>
    <line x1="50" y1="24" x2="50" y2="76" stroke="#d4af37" stroke-width="2"/>
   </svg>`;

  case 'spearwhirl':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <linearGradient id="g-spearwhirl" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e3a47"/>
        <stop offset="100%" stop-color="#0a151a"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#g-spearwhirl)"/>
    <!-- 360-degree Whirlwind Slash Blade -->
    <circle cx="50" cy="50" r="32" fill="none" stroke="#80deea" stroke-width="4" stroke-dasharray="140,40" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="22" fill="none" stroke="#e0f7fa" stroke-width="2" stroke-dasharray="80,30" stroke-linecap="round"/>
    <polygon points="78,42 88,48 78,54" fill="#00e5ff"/>
    <circle cx="50" cy="50" r="7" fill="#ffffff"/>
   </svg>`;

  case 'baganvalour':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <linearGradient id="g-baganvalour" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#423412"/>
        <stop offset="100%" stop-color="#1a1405"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#g-baganvalour)"/>
    <!-- Bagan King's Crown & Standard -->
    <path d="M26 62 L32 38 L44 48 L50 30 L56 48 L68 38 L74 62 Z" fill="#d4af37" stroke="#fff4cf" stroke-width="2"/>
    <circle cx="50" cy="28" r="4" fill="#ffffff"/>
    <circle cx="32" cy="36" r="3" fill="#64ffda"/>
    <circle cx="68" cy="36" r="3" fill="#64ffda"/>
    <rect x="24" y="62" width="52" height="8" rx="2" fill="#8c6d1f"/>
   </svg>`;

  case 'thunderthrust':
   return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art" aria-hidden="true">
    <defs>
      <linearGradient id="g-thunderthrust" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0d3b45"/>
        <stop offset="100%" stop-color="#05171c"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#g-thunderthrust)"/>
    <!-- Piercing Spear Trail with Lightning Energy -->
    <line x1="16" y1="84" x2="78" y2="22" stroke="#00e5ff" stroke-width="6" stroke-linecap="round"/>
    <line x1="16" y1="84" x2="78" y2="22" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    <polygon points="84,16 68,24 76,32" fill="#ffd700"/>
    <circle cx="84" cy="16" r="6" fill="#ffffff" filter="drop-shadow(0 0 6px #00e5ff)"/>
   </svg>`;

  default:
   return '';
 }
}
