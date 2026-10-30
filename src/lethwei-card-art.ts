/** Matched regular/evolved illustrations for Lethwei's five unique upgrades. */
const LETHWEI_CARD_IDS=['nineweapons','ironshins','headbutt','ringmaster','goldenbelt'];
export function lethweiCardArt(id:string,evolved=false){
 const column=LETHWEI_CARD_IDS.indexOf(id);if(column<0)return '';
 const edges=[0,104.4,203.5,304.6,398.4,500];
 const x=edges[column]+.5,y=evolved?100.5:.5,w=edges[column+1]-edges[column]-1;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art ${evolved?'evolution-card-reference':''}" data-lethwei-card="${id}" aria-hidden="true"><svg x="0" y="0" width="100" height="100" viewBox="${x} ${y} ${w} 99" preserveAspectRatio="none" overflow="hidden"><image href="/assets/card-concepts/lethwei-upgrades-v3.png" width="500" height="200" preserveAspectRatio="none"/></svg></svg>`;
}
