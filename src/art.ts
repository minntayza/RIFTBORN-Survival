import type { HeroId, WeaponId, EnemyId } from './config';
import { HEROES, WEAPONS, ENEMIES } from './config';
// Original vector illustrations. The same equipment language is used in portraits and arena textures.
const ink = '#080e19';
const svg = (body: string, view = '0 0 240 280') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const path = (d: string, fill: string, stroke = ink, width = 4) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const circle = (x: number, y: number, r: number, fill: string, stroke = ink) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}"/>`;
export const ART_NAMES: Record<WeaponId, string> = { kama:'Crescent / hooked steel',naginata:'Horizon / sweeping polearm',smg:'Hornet / 28 rounds',hammer:'Anvil / crushing steel',katana: 'Moonsteel / balanced edge', dual: 'Dusk & Dawn / twin edges', nodachi: 'Exile / heavy steel', cursed: 'Blood oath / fractured steel', pistols: 'Brass twins / 12 rounds', shotgun: 'Crowdbreaker / scatter fire', shield: 'Bastion / forged guard', spiked: 'Thornwall / retaliation' };
export function weaponSvg(id: WeaponId) {
    let b = '';
    if(id==='kama')b=`<g transform="translate(118 123) rotate(25)">${path('M-7 -63 L7 -63 L7 88 L-7 88 Z','#655778')}${path('M-6 -57 Q39 -91 84 -59 Q44 -55 22 -17 L4 -23 L8 -43 Q35 -70 65 -63 Q26 -79 -6 -44 Z','#b7c9cd')}${path('M-7 10 L7 17 M-7 28 L7 35 M-7 46 L7 53 M-7 64 L7 71','none','#b89e80',3)}${circle(1,-56,5,'#a79261')}</g>`;
    else if(id==='naginata')b=`<g transform="translate(120 125) rotate(30)">${path('M-4 -60 L5 -60 L5 104 L-4 104 Z','#976346')}${path('M-5 -57 Q-5 -113 24 -117 Q31 -85 10 -43 L-5 -39 Z','#c3d0cf')}${path('M4 -96 Q19 -108 18 -111','none','#e0e2d2',2)}${path('M-7 -41 L11 -41 M-4 37 L5 43 M-4 51 L5 57','none','#bb9d64',4)}</g>`;
    else if(id==='smg')b=`<g transform="translate(120 113) rotate(-20)">${path('M-84 -13 L44 -13 L47 13 L-11 13 L-14 55 L-36 55 L-40 13 L-56 13 L-62 35 L-80 29 L-74 6 L-90 2 Z','#384955')}${path('M-84 -13 L41 -13 L41 -5 L-84 -5 Z','#889ca6')}${path('M44 -8 L89 -8 L89 4 L46 4 Z','#526975')}${path('M-13 16 L12 16 L17 65 L-9 65 Z','#74858a')}${path('M-7 29 L10 29 M-5 40 L12 40 M-3 51 L14 51','none','#35444b',3)}${path('M-48 -24 L-18 -24 L-15 -13 L-51 -13 Z','#a79368')}${path('M27 -11 L31 8 M35 -11 L39 8','none','#172830',2)}</g>`;
    else if(id==='hammer')b=`<g transform="translate(120 130) rotate(25)">${path('M-6 -47 L6 -47 L7 89 L-7 89 Z','#705342')}${path('M-62 -82 L48 -82 L59 -67 L55 -38 L-59 -38 L-68 -53 Z','#647c83')}${path('M-56 -75 L43 -75 L43 -46 L-56 -46 Z','#95a5a5')}${path('M-15 -81 L9 -81 L9 -38 L-15 -38 Z','#ba9b67')}${path('M-7 25 L7 32 M-7 43 L7 50 M-7 61 L7 68','none','#ad9a7f',3)}</g>`;
    else     if (['katana', 'nodachi', 'cursed', 'dual'].includes(id)) {
        const sword = (x: number, y: number, angle: number, dark = false, long = false) => `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${long ? 1.12 : .92})">${path('M-6 70 L-5 12 Q-2 -48 10 -91 L14 -102 L16 -77 Q9 -29 6 12 L6 70 Z', dark ? '#202434' : '#b4c3d3')}${path('M6 9 Q11 -44 14 -86', '#f6eedb', dark ? '#ed6371' : '#f6eedb', 2)}${path('M-12 67 L14 67 L12 75 L-12 75 Z', '#b29359')}${path('M-5 76 L5 76 L5 111 L-5 111 Z', dark ? '#682938' : long ? '#aa454c' : '#555984')}${path('M-5 84 L5 88 M-5 94 L5 98 M-5 104 L5 108', 'none', '#d7b68c', 2)}${dark ? path('M2 -73 L-3 -55 L4 -45 L-1 -28 L4 -8', 'none', '#ff5d78', 3) : ''}</g>`;
        b = id === 'dual' ? sword(85, 110, 32) + sword(158, 110, -32, true) : sword(120, 113, 45, id === 'cursed', id === 'nodachi');
    }
    else if (id === 'pistols' || id === 'shotgun') {
        const gun = (x: number, y: number, angle: number) => `<g transform="translate(${x} ${y}) rotate(${angle})">${path('M-65 -15 L42 -15 L46 10 L-16 10 L-23 54 L-51 48 L-42 8 L-65 8 Z', '#394753')}${path('M-60 -15 L42 -15 L40 -6 L-60 -6 Z', '#8495a2')}${path('M-21 12 L-2 12 L-2 29 L-25 29', 'none', '#c8a25b', 4)}${path('M-42 14 L-25 18 L-31 45 L-48 40 Z', '#93683e')}${path('M29 -20 L36 -20 M-49 -20 L-42 -20', 'none', '#e0bb70', 4)}${path('M-54 -1 L25 -1', 'none', '#161e2a', 3)}</g>`;
        b = id === 'pistols' ? gun(93, 84, -24) + gun(155, 172, 24) : `<g transform="translate(120 130) rotate(-25)">${path('M-103 1 L-65 -14 L-47 -4 L61 -13 L102 -13 L103 4 L-45 12 L-62 42 L-83 35 L-77 15 L-100 26 Z', '#34434d')}${path('M-46 -5 L102 -13 L102 -6 L-44 2 Z', '#8c9daa')}${path('M-99 4 L-66 -10 L-52 1 L-71 17 L-101 27 Z', '#9d6944')}${path('M-24 7 L31 3 L30 18 L-24 23 Z', '#b77a4d')}${path('M-57 12 L-35 10 L-37 27 L-64 29', 'none', '#c5a262', 3)}${path('M-16 9 L-15 21 M-4 8 L-3 20 M8 7 L9 19 M20 6 L21 18', 'none', '#4c3428', 2)}</g>`;
    }
    else {
        const spikes = id === 'spiked';
        b = `${spikes ? Array.from({ length: 10 }, (_, i) => `<g transform="translate(120 128) rotate(${i * 36})">${path('M-12 -70 L0 -97 L12 -70 Z', '#a4b0be')}</g>`).join('') : ''}${circle(120, 128, 75, '#314c56')}${circle(120, 128, 65, '#4d747e')}${circle(120, 128, 53, '#294451')}${path('M120 82 L153 104 L144 148 L120 173 L96 148 L87 104 Z', '#66beb9')}${circle(120, 126, 14, '#adbac7')}${[0, 60, 120, 180, 240, 300].map(a => circle(120 + Math.cos(a * Math.PI / 180) * 65, 128 + Math.sin(a * Math.PI / 180) * 65, 4, '#e6c18a')).join('')}${path('M78 101 L94 113 M144 153 L157 162 M143 88 L139 106', 'none', '#bfccd4', 2)}`;
    }
    return svg(b, '0 0 240 240');
}
export function heroSvg(id: HeroId, equipped = true) {
    const c = '#' + HEROES[id].color.toString(16);
    let b = '';
    const legs = path('M87 181 L120 179 L118 230 L111 260 L81 260 L89 230 Z', '#253244') + path('M122 179 L153 181 L151 228 L166 254 L138 260 L125 230 Z', '#253244') + path('M80 248 L112 248 L111 267 L75 267 Z', '#141d2b') + path('M139 248 L166 247 L172 265 L135 269 Z', '#141d2b');
    if (id === 'ninja')
        b = path('M91 68 Q55 65 31 110 L68 100 L27 152 L81 123 L109 83 Z', '#6560a4') + legs + path('M91 86 L143 83 L157 151 L144 192 L89 192 L78 148 Z', '#202d47') + path('M81 92 L65 98 L48 157 L66 167 L94 120 Z', '#344461') + path('M145 91 L163 101 L174 153 L157 167 L135 122 Z', '#344461') + path('M82 124 L148 114 L151 132 L86 143 Z', '#55538b') + path('M84 174 L149 172 L148 187 L85 190 Z', '#7970b1') + path('M88 70 Q78 36 97 24 Q122 6 144 28 L156 60 L142 85 L103 90 Z', '#334161') + path('M91 53 L149 47 L146 61 L94 68 Z', '#101c32') + path('M91 68 L146 60 L141 84 L105 91 Z', '#63638a') + path('M101 55 L112 54 M128 52 L138 51', 'none', '#edf1dd', 3) + path('M70 159 L182 28 L188 24 L183 38 L78 168 Z', '#d6e1e9') + path('M61 167 L77 150 M58 174 L69 162', 'none', '#b59f7d', 6);
    if (id === 'samurai')
        b = path('M101 82 L60 148 L76 209 L159 212 L177 153 L138 80 Z', '#682d3a') + legs + path('M90 83 L146 83 L155 167 L141 195 L93 192 L78 155 Z', '#a74b4e') + path('M78 91 L49 99 L51 128 L80 135 L95 107 Z', '#bd6260') + path('M146 91 L177 96 L185 126 L154 135 L138 110 Z', '#bd6260') + path('M51 107 L79 111 M52 119 L80 123 M157 109 L178 104 M158 123 L183 119', 'none', '#e0a078', 3) + path('M85 123 L153 122 M84 140 L153 138 M85 157 L152 155', 'none', '#efb181', 3) + path('M82 176 L154 175 L155 188 L86 191 Z', '#342b34') + path('M93 178 L90 222 L119 212 L115 180 Z', '#c65f57') + path('M97 73 L92 40 L104 27 L135 28 L148 44 L140 72 L124 85 Z', '#d6ae8c') + path('M92 48 Q83 26 99 20 L117 14 L126 3 L140 14 L138 26 L150 38 L144 52 L137 36 L106 36 L100 55 Z', '#22222a') + path('M101 61 L114 61 M129 60 L139 58 M117 74 L130 73', 'none', '#5c3540', 3) + path('M157 152 L210 7 L215 0 L216 21 L165 159 Z', '#ebe4d3') + path('M148 156 L174 165 M146 182 L160 157', 'none', '#b49a67', 7);
    if (id === 'gunner')
        b = legs + path('M86 81 L144 80 L159 184 L84 187 L74 126 Z', '#d6a449') + path('M86 87 L135 85 L143 163 L93 166 Z', '#33404a') + path('M99 100 L119 99 L120 129 L99 128 Z', '#53606a') + path('M125 96 L139 96 L142 127 L124 130 Z', '#53606a') + path('M80 89 L60 98 L44 147 L63 162 L95 115 Z', '#e7b65c') + path('M142 86 L162 94 L185 139 L165 156 L130 114 Z', '#e7b65c') + path('M83 174 L156 171 L158 186 L83 190 Z', '#75543b') + path('M85 187 L102 187 L105 213 L83 215 Z', '#a57748') + path('M136 183 L155 183 L166 204 L146 210 Z', '#a57748') + path('M100 70 L93 37 L106 25 L135 27 L145 42 L139 68 L120 81 Z', '#d5a28a') + path('M95 41 L96 27 L117 16 L139 25 L145 43 L130 36 L110 39 Z', '#513937') + path('M97 45 L115 41 L120 50 L125 40 L141 44 L139 59 L125 57 L119 52 L113 58 L99 60 Z', '#314e64') + path('M102 46 L109 46 M128 46 L135 47', 'none', '#d5e9e6', 2) + path('M37 129 L64 130 L65 149 L47 149 L47 171 L32 169 Z', '#485764') + path('M167 125 L194 117 L198 133 L184 139 L190 158 L177 164 Z', '#485764') + path('M37 133 L61 134 M170 128 L192 122', 'none', '#c6a35b', 3);
    if (id === 'tank')
        b = legs + path('M76 78 L154 78 L173 154 L151 194 L87 197 L64 145 Z', '#355963') + path('M88 93 L143 94 L150 151 L133 171 L97 163 Z', '#6c9398') + path('M70 84 L40 94 L44 129 L80 130 L94 101 Z', '#527e85') + path('M149 84 L179 87 L194 116 L160 130 L139 106 Z', '#527e85') + path('M91 109 L140 107 M91 125 L144 125', 'none', '#a0c5c1', 3) + path('M88 177 L155 171 L155 188 L88 197 Z', '#1f3947') + path('M91 68 L89 33 L102 17 L136 18 L153 39 L148 73 L127 84 Z', '#49737e') + path('M90 46 L149 42 L147 61 L95 67 Z', '#172935') + path('M109 49 L134 47', 'none', '#b4e7de', 3) + path('M100 24 L111 31 M137 23 L130 40', 'none', '#b2c6c7', 3) + `<g transform="translate(-23 21) scale(.69)">${weaponSvg('shield').replace(/<svg[^>]*>|<\/svg>/g, '')}</g>`;
    if(!equipped){
        const equipmentStart={ninja:'<path d="M70 159',samurai:'<path d="M157 152',gunner:'<path d="M37 129',tank:'<g transform="translate(-23 21)'}[id];
        const start=b.indexOf(equipmentStart);if(start>=0)b=b.slice(0,start);
    }
    return svg(`<ellipse cx="121" cy="267" rx="74" ry="9" fill="#050a13" stroke="none" opacity=".45"/>${b}${path('M84 203 L99 207 M143 230 L152 224', 'none', '#627181', 2)}`);
}
export function enemySvg(id: EnemyId) {
    if(id==='runner')return svg(`${path('M58 145 L43 112 L21 100 L37 137 Z','#46534b')}${path('M50 149 Q76 116 148 139 L172 170 L144 193 L66 191 Z','#62765a')}${path('M67 173 L57 222 L77 228 L88 183 M133 175 L131 225 L151 227 L156 183 M87 178 L82 210 L98 214 L105 182 M151 173 L167 213 L181 209 L169 168','#88a961')}${path('M137 145 L137 100 L155 116 L177 88 L185 137 L213 153 L205 177 L168 185 L147 168 Z','#9cbb6c')}${path('M144 119 L143 108 L151 122 M171 118 L179 103 L179 127','#3d4e47')}${circle(175,141,8,'#eff46e')}${path('M198 149 L215 152 L208 160 Z','#142025')}${path('M173 161 L203 164 L194 176 L175 173 Z','#18212b')}${path('M179 162 L183 169 L187 164 M192 165 L196 169 L198 165','none','#f1e5bf',3)}`);

    const d = ENEMIES[id], skin = '#' + d.color.toString(16), large = id === 'brute' || id === 'boss', coat = id === 'boss' ? '#513345' : id === 'armoured' ? '#475465' : id === 'spitter' ? '#564363' : '#3c5045';
    let b = path('M86 170 L117 171 L111 236 L89 262 L65 261 L83 230 Z', '#303837') + path('M126 172 L154 172 L158 231 L173 253 L147 265 L131 230 Z', '#303837');
    b += path(large ? 'M68 79 L157 74 L182 151 L157 197 L76 195 L53 147 Z' : 'M90 83 L146 80 L164 161 L144 189 L85 184 L72 138 Z', coat);
    b += path('M78 90 L55 102 L38 158 L56 181 L75 157 L97 111 Z', skin) + path('M151 86 L176 96 L196 143 L185 177 L166 157 L143 117 Z', skin);
    b += path('M95 79 L84 43 L96 22 L134 21 L154 47 L140 82 L115 95 Z', skin) + path('M97 45 L111 49 L104 59 L93 55 Z', '#e2ebac') + path('M125 48 L143 44 L143 54 L128 59 Z', '#f4a47e') + path('M104 73 L123 67 L136 73 L126 84 L108 82 Z', '#1a2525') + path('M115 73 L115 78 M125 72 L125 78', 'none', '#e6dbb7', 3) + path('M89 120 L104 130 L96 154 L115 168 M144 115 L132 143 L146 156', 'none', skin, 5);
    if (id === 'spitter')
        b += circle(124, 91, 25, '#9765aa') + circle(120, 87, 14, '#ca99cd') + circle(112, 81, 4, '#efd8e5') + path('M118 70 L116 97 L127 106', 'none', '#bfdd87', 5);
    if (id === 'armoured')
        b += path('M77 85 L147 85 L157 157 L91 165 Z', '#72818d') + path('M95 103 L141 101 L145 138 L98 143 Z', '#465868') + path('M86 44 L86 26 L103 11 L138 15 L153 36 L148 49 Z', '#687b8d') + path('M89 45 L149 42 L151 72 L92 73 Z', '#96b1bd66') + path('M113 16 L104 35 L122 43', 'none', '#d6d1bc', 3);
    if (id === 'brute')
        b += path('M59 144 L34 151 L28 187 L65 193 L77 171 Z', skin) + path('M180 142 L208 151 L215 185 L177 191 L164 170 Z', skin) + path('M84 111 L151 110 M100 92 L107 175', 'none', '#c8b39a', 3) + path('M82 127 L90 121 M100 135 L108 127 M114 142 L122 134', 'none', '#212c29', 3);
    if (id === 'elite')
        b += path('M73 90 L66 51 L88 80 L99 67 L104 99 Z', '#dfd5af') + path('M147 88 L171 54 L168 91 L187 79 L175 107 Z', '#dfd5af') + path('M110 20 L120 2 L130 24 Z', '#e6d39d');
    if (id === 'boss')
        b += path('M69 80 L47 88 L51 109 L83 106 Z', '#b99c63') + path('M153 79 L179 83 L189 103 L155 107 Z', '#b99c63') + path('M87 31 L95 12 L135 10 L151 25 L151 40 L88 41 Z', '#4a4d54') + path('M85 36 L158 33 L154 47 L90 50 Z', '#bd9a64') + circle(122, 25, 6, '#e16072') + path('M132 103 L117 120 L136 139 L128 165 M177 112 L173 142 L189 160', 'none', '#ff657e', 4) + path('M112 94 L117 186 M94 117 L97 177', 'none', '#be9868', 3);
    if(id==='cleaver')b+=path('M75 106 L148 105 L159 191 L83 194 Z','#7b6656')+path('M175 121 L183 205','none','#684f38',8)+path('M172 131 L210 135 L213 176 L179 173 Z','#9ea8a5')+path('M184 143 L198 159','none','#765b55',4);
    if(id==='spear')b+=path('M88 94 L144 93 L151 151 L90 157 Z','#526b68')+path('M188 49 L184 253','none','#9a815b',7)+path('M188 12 L173 52 L188 65 L202 50 Z','#b8c2ba')+path('M87 37 L151 37 L145 17 L100 15 Z','#5c7471');
    if(id==='rifle')b+=path('M84 93 L146 92 L155 167 L86 171 Z','#636a52')+path('M98 111 L113 173','none','#ac9877',7)+path('M152 136 L195 133 L202 149 L151 154 Z','#3b4650')+path('M185 142 L229 142','none','#8a989a',8)+path('M111 21 L149 29 L153 43 L88 43 L91 27 Z','#69745a');
    if(id==='shooterBoss')b+=path('M78 88 L150 87 L160 165 L83 172 Z','#536253')+path('M86 35 L94 14 L139 14 L154 35 L150 48 L86 48 Z','#6e7763')+path('M92 51 L147 51','none','#b4b796',6)+path('M147 121 L196 118 L200 147 L147 150 Z','#3a4955')+path('M193 126 L230 126 M193 140 L230 140','none','#a2afb3',7)+path('M151 148 L153 181 L182 181 L180 147 Z','#9d805b');
    if(id==='commander')b+=path('M75 85 L151 82 L173 166 L151 215 L80 210 L61 154 Z','#3e4f65')+path('M72 91 L47 84 L43 106 L78 119 M152 86 L181 82 L188 103 L156 115','#aa9766')+path('M90 34 L96 14 L137 14 L151 31 L149 48 L88 48 Z','#526779')+path('M91 42 L152 41','none','#d0b779',7)+path('M191 88 L188 204','none','#9db8bd',8)+circle(191,85,12,'#a8c4ca')+path('M113 113 L126 105 L139 113 L126 130 Z','#b6a16f');
    return svg(b);
}
export const heroFigureImage = (id:HeroId) => `<img class="art-image" alt="${HEROES[id].name} illustration" src="data:image/svg+xml,${encodeURIComponent(heroSvg(id,false))}">`;
export const artImage = (kind: 'hero' | 'weapon' | 'enemy', id: string, cls = '') => `<img class="art-image ${cls}" alt="${kind === 'hero' ? HEROES[id as HeroId].name : kind === 'weapon' ? WEAPONS[id as WeaponId].name : ENEMIES[id as EnemyId].name} illustration" src="data:image/svg+xml,${encodeURIComponent(kind === 'hero' ? heroSvg(id as HeroId) : kind === 'weapon' ? weaponSvg(id as WeaponId) : enemySvg(id as EnemyId))}">`;
// Cached top-down animation frames: canvas is used once at scene creation, never per frame.
export function actorCanvas(kind: 'hero' | 'enemy', id: HeroId | EnemyId, frame: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const c = canvas.getContext('2d')!;
    c.translate(64, 64);
    c.rotate(Math.PI / 2);
    c.lineWidth = 3;
    c.strokeStyle = ink;
    c.lineJoin = 'round';
    const shape = (pts: number[][], fill: string) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = fill; c.fill(); c.stroke(); };
    const ellipse = (x: number, y: number, rx: number, ry: number, fill: string) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); c.stroke(); };
    const line = (x: number, y: number, x2: number, y2: number, color: string, w = 3) => { c.strokeStyle = color; c.lineWidth = w; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = ink; c.lineWidth = 3; };
    const walk = frame === 1 ? 4 : frame === 2 ? -4 : 0;
    // Local forward is -Y; the quarter turn converts it to +X for world aiming.
    // Feet and trailing cloth are behind the shoulders, with the face on the leading edge.
    const hero=kind==='hero',h=id as HeroId,e=id as EnemyId;
    const skin=hero?(h==='ninja'?'#344469':h==='tank'?'#466a7c':'#c0a189'):'#'+ENEMIES[e].color.toString(16);
    const body=hero?(h==='ninja'?'#273653':h==='samurai'?'#9e424d':h==='gunner'?'#d7a545':'#497c85'):(e==='boss'?'#563749':e==='armoured'?'#657889':e==='rifle'?'#647153':e==='cleaver'?'#806d57':e==='spear'?'#576e6b':'#405548');
    const broad=hero&&h==='tank'||!hero&&(e==='boss'||e==='brute');
    ellipse(-10,18+walk,6,10,'#172233');ellipse(10,18-walk,6,10,'#172233');
    if(hero&&h==='ninja')shape([[-6,7],[-18,27+walk],[-29,36],[-14,33],[3,13]],'#7562b0');
    if(hero&&h==='samurai'||!hero&&e==='boss')shape([[-20,7],[-23,29],[-7,24],[0,30],[19,27],[20,7]],body);
    ellipse(0,8,broad?26:21,15,body);
    ellipse(-24,1+walk*.25,broad?12:8,10,body);ellipse(24,1-walk*.25,broad?12:8,10,body);
    if(hero&&h==='samurai'){line(-17,7,17,7,'#dfa87b',2);line(-16,14,16,14,'#dfa87b',2);line(-31,0,-19,0,'#dfa87b',3);line(19,0,31,0,'#dfa87b',3);}
    if(hero&&h==='gunner'||!hero&&e==='rifle'){shape([[-14,0],[14,0],[14,17],[-14,17]],'#35424b');line(-7,1,-7,14,'#89958b',3);line(7,1,7,14,'#89958b',3);}
    if(hero&&h==='tank'||!hero&&(e==='armoured'||e==='spear')){shape([[-17,-1],[17,-1],[17,13],[0,20],[-17,13]],'#719095');line(-12,6,12,6,'#b2c3bd',2);}
    ellipse(-19,-10,5,6,hero?'#c1a182':skin);ellipse(19,-10,5,6,hero?'#c1a182':skin);
    // Crown and face overlap the torso, rather than forming a full upright figure.
    ellipse(0,-4,15,15,skin);
    const cap=hero?(h==='ninja'?'#344469':h==='samurai'?'#242332':h==='gunner'?'#554036':'#466a7c'):(e==='rifle'?'#6b795b':e==='armoured'||e==='spear'?'#728981':skin);
    ellipse(0,-1,14,11,cap);
    shape([[-11,-12],[11,-12],[9,-18],[0,-21],[-9,-18]],hero&&h==='ninja'?'#777097':skin);
    line(-9,-15,9,-15,hero?(h==='gunner'?'#233b51':'#172b38'):'#243330',4);
    line(-7,-16,-3,-16,'#cfdbc7',1.5);line(3,-16,7,-16,'#cfdbc7',1.5);
    if(hero&&h==='samurai'){ellipse(0,10,4,5,'#292630');line(0,3,0,9,'#39323d',4);}
    if(hero&&h==='tank'){line(-10,-4,10,-4,'#91b0b1',2);line(0,-10,0,5,'#91b0b1',2);}
    if(!hero&&e==='spitter')ellipse(0,10,11,8,'#b482b9');
    if(!hero&&e==='elite'){shape([[-23,1],[-35,-8],[-23,-12],[-16,1]],'#d4c8a4');shape([[23,1],[35,-8],[23,-12],[16,1]],'#d4c8a4');}
    if(!hero&&e==='boss'){line(-28,0,-17,0,'#bd9e69',5);line(17,0,28,0,'#bd9e69',5);line(-12,-7,12,-7,'#bd9e69',4);}
    if(!hero&&e==='shooterBoss'){shape([[-19,-4],[18,-4],[20,18],[-19,18]],'#687760');line(-20,-12,20,-12,'#b4b796',5);shape([[14,3],[39,3],[39,-33],[17,-33]],'#3a4955');line(25,-31,25,-57,'#a2afb3',5);line(35,-31,35,-57,'#a2afb3',5);}
    if(!hero&&e==='commander'){shape([[-25,2],[-28,32],[0,24],[27,32],[24,1]],'#3e4f65');line(-30,0,-18,0,'#baab80',6);line(18,0,30,0,'#baab80',6);line(-15,-9,15,-9,'#c8b386',4);line(30,9,30,-40,'#8ea9b7',5);ellipse(30,-40,7,7,'#b9cbd3');}
    if(!hero&&e==='cleaver'){line(28,4,28,-42,'#7d5e40',6);shape([[24,-43],[52,-40],[50,-20],[25,-23]],'#a0aaa5');}
    if(!hero&&e==='spear'){line(27,23,27,-46,'#ab8d61',5);shape([[27,-59],[20,-43],[27,-36],[34,-43]],'#b6c6bc');}
    if(!hero&&e==='rifle'){shape([[15,5],[30,5],[30,-25],[19,-28]],'#35434b');line(25,-25,25,-50,'#a1adab',5);}
    return canvas;
}
export function weaponCanvas(id: WeaponId) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const c = canvas.getContext('2d')!;
    c.translate(64, 64);
    c.strokeStyle = ink;
    c.lineWidth = 3;
    c.lineJoin = 'round';
    const poly = (p: number[][], color: string) => { c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fillStyle = color; c.fill(); c.stroke(); };
    if(id==='kama'){poly([[-27,-4],[7,-4],[7,4],[-27,4]],'#756181');poly([[4,-5],[10,-21],[31,-33],[53,-29],[41,-23],[26,-21],[16,-9],[17,1]],'#b7c9cd');for(let i=0;i<4;i++)poly([[-24+i*7,-4],[-22+i*7,-4],[-19+i*7,4],[-21+i*7,4]],'#b69a7a');}
    else if(id==='naginata'){poly([[-59,-3],[25,-3],[25,3],[-59,3]],'#976346');poly([[20,-4],[31,-14],[51,-23],[59,-18],[48,-7],[28,4]],'#c3d0cf');poly([[17,-7],[22,-7],[22,7],[17,7]],'#bb9d64');}
    else if(id==='smg'){poly([[-32,-8],[25,-8],[25,6],[-9,6],[-12,22],[-24,22],[-23,4],[-32,4]],'#526b78');poly([[25,-5],[48,-5],[48,1],[25,1]],'#9eadae');poly([[-5,6],[9,6],[12,27],[-2,27]],'#879596');poly([[-11,-15],[3,-15],[3,-8],[-11,-8]],'#a79368');}
    else if(id==='hammer'){poly([[-43,-4],[25,-4],[25,4],[-43,4]],'#705342');poly([[18,-23],[44,-23],[49,-15],[49,20],[20,20]],'#8fa0a4');poly([[20,-5],[48,-5],[48,3],[20,3]],'#ba9b67');}
    else     if (['katana', 'dual', 'nodachi', 'cursed'].includes(id)) {
        poly([[-9, -4], [id === 'nodachi' ? 50 : 40, -7], [55, -15], [48, -2], [-9, 3]], id === 'cursed' ? '#292739' : '#d8e2e8');
        poly([[-28, -4], [-10, -4], [-10, 4], [-28, 4]], id === 'cursed' ? '#8a364b' : '#645d8c');
        poly([[-12, -10], [-7, -10], [-7, 10], [-12, 10]], '#ba9b60');
        c.strokeStyle = id === 'cursed' ? '#ff607d' : '#f7eed9';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(-3, -2);
        c.lineTo(25, -4);
        c.lineTo(43, -8);
        c.stroke();
    }
    else if (id === 'pistols') {
        poly([[-15, -7], [22, -7], [26, 3], [-2, 3], [-2, 16], [-14, 16]], '#627682');
        poly([[-13, 4], [-3, 4], [-3, 14], [-13, 14]], '#a2764b');
        poly([[14, -8], [20, -8], [20, -4], [14, -4]], '#e0bf74');
    }
    else if (id === 'shotgun') {
        poly([[-34, -5], [46, -5], [46, 3], [-9, 3], [-12, 17], [-24, 14], [-25, 5], [-35, 7]], '#70838f');
        poly([[-33, -4], [-17, -4], [-17, 5], [-34, 7]], '#b17d50');
        poly([[-2, 2], [22, 2], [22, 9], [-2, 9]], '#ba8252');
    }
    else {
        c.beginPath();
        c.ellipse(3, 0, 13, 29, 0, 0, Math.PI * 2);
        c.fillStyle = '#304957';
        c.fill();
        c.stroke();
        c.beginPath();
        c.ellipse(3, 0, 9, 23, 0, 0, Math.PI * 2);
        c.fillStyle = '#6aa5a9';
        c.fill();
        c.stroke();
        poly([[-3, -7], [9, -7], [9, 7], [-3, 7]], '#bccad0');
        if (id === 'spiked')
            for (const y of [-24, -12, 0, 12, 24])
                poly([[10, y - 4], [22, y], [10, y + 4]], '#b9c3d0');
    }
    return canvas;
}
