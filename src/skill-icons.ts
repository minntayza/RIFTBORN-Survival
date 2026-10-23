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
 const themed=hero==='tank'&&id==='slam'&&theme?`slam-${theme==='sakura'?'royal':theme==='jade'?'forge':'polar'}`:id;
 const [x,y,r]=centers[themed]||centers.slam;
 return `<svg viewBox="${x-r} ${y-r} ${r*2} ${r*2}" aria-hidden="true" data-skill-icon="${id}" data-icon-theme="${theme||'base'}" ${hero?`data-ultimate="${hero}"`:''} style="border-radius:50%;overflow:hidden"><image href="${SKILL_ICON_SHEET}" width="1024" height="1536"/></svg>`;
}
