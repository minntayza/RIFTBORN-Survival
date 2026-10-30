/** Paired regular/evolved illustrations for Archer King's five unique cards. */
const ARCHER_CARD_IDS=['arrowstorm','windfocuscard','sunburstcard','beasthunter','piercingeye'];
export function archerCardArt(id:string,evolved=false){
 const column=ARCHER_CARD_IDS.indexOf(id);if(column<0)return '';
 const edges=[0,101.6,199.2,300.8,398.4,500];
 const x=edges[column]+.5,y=evolved?97.35:.5,w=edges[column+1]-edges[column]-1,h=evolved?102.15:95.85;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art ${evolved?'evolution-card-reference':''}" data-archer-card="${id}" aria-hidden="true"><svg x="0" y="0" width="100" height="100" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" overflow="hidden"><image href="/assets/card-concepts/archer-upgrades-v2.png" width="500" height="200" preserveAspectRatio="none"/></svg></svg>`;
}
