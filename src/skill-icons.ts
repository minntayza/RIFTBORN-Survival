import {gunnerSkillIcon,type GunnerTheme} from './gunner-gadgets';
import {samuraiSkillIcon} from './samurai-skill-icons';
/** Approved simplified illustration sheet. Viewports expose only the icon art, never labels. */
export const SKILL_ICON_SHEET='/assets/ui/ability-icons-simplified.png';
const centers:Record<string,readonly [number,number,number]>={
 dash:[325,164,94],counter:[325,377,94],draw:[609,377,94],mark:[875,377,94],
 overdrive:[325,601,94],beacon:[609,601,94],breach:[875,601,94],
 slam:[325,820,94],bulwark:[609,820,94],march:[875,820,94],
 datlone:[325,1033,94],flame:[609,1033,94],staffslam:[875,1033,94],
 'slam-royal':[240,1352,110],'slam-forge':[525,1352,110],'slam-polar':[813,1352,110]
};
export function skillIcon(id:string,hero='',theme=''){
 if(hero==='gunner'&&['sakura','jade','starlight'].includes(theme)&&(id==='beacon'||id==='breach'||id==='overdrive'))return gunnerSkillIcon(id,theme as GunnerTheme);
 if(hero==='gunner'&&id==='beacon'&&!theme)return `<svg viewBox="0 0 100 100" aria-hidden="true" data-skill-icon="beacon" data-icon-theme="base"><circle cx="50" cy="50" r="49" fill="#10232e"/><ellipse cx="50" cy="78" rx="29" ry="9" fill="#294753" stroke="#6ce4d4" stroke-width="2"/><path d="M50 27V17m-5 0 5-8 5 8-5 5Z" fill="#ffda8a" stroke="#172b38" stroke-width="3"/><rect x="28" y="28" width="44" height="46" rx="13" fill="#294b58" stroke="#ffda8a" stroke-width="3"/><rect x="34" y="35" width="32" height="27" rx="8" fill="#142b3c"/><path d="M42 43v7m16-7v7" stroke="#6ce4d4" stroke-width="4" stroke-linecap="round"/><path d="M46 55q4 4 8 0" fill="none" stroke="#fff6d9" stroke-width="2"/><path d="M18 60Q5 35 26 25m-9-2 10 1-2 10M75 68q22-14 6-34m-5 7 4-10 9 6" fill="none" stroke="#6ce4d4" stroke-width="4" stroke-linecap="round"/><path d="m78 14 3 6 7 2-7 3-3 6-2-6-6-3 6-2Z" fill="#ffda8a"/></svg>`;
 if((hero==='samurai'||theme)&&(id==='draw'||id==='mark'))return samuraiSkillIcon(id as 'draw'|'mark',theme);

 const themed=hero==='tank'&&id==='slam'&&theme?`slam-${theme==='sakura'?'royal':theme==='jade'?'forge':'polar'}`:id;
 const [x,y,r]=centers[themed]||centers.slam;
 return `<svg viewBox="${x-r} ${y-r} ${r*2} ${r*2}" aria-hidden="true" data-skill-icon="${id}" data-icon-theme="${theme||'base'}" ${hero?`data-ultimate="${hero}"`:''} style="border-radius:50%;overflow:hidden"><image href="${SKILL_ICON_SHEET}" width="1024" height="1536"/></svg>`;
}
