/** Matched illustrations for Zawgyi's five cards and three existing evolutions. */
const ZAWGYI_CARD_IDS=['twindatlone','lotusflame','earthshaker','elixir','celestial'];
export function zawgyiCardArt(id:string,evolved=false){
 const column=ZAWGYI_CARD_IDS.indexOf(id);
 if(column<0||evolved&&!['twindatlone','lotusflame','celestial'].includes(id))return '';
 const edges=[0,100.3,199.7,301.1,400.4,500];
 const x=edges[column]+.5,y=evolved?100.5:.5,w=edges[column+1]-edges[column]-1;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art ${evolved?'evolution-card-reference':''}" data-zawgyi-card="${id}" aria-hidden="true"><svg x="0" y="0" width="100" height="100" viewBox="${x} ${y} ${w} 99" preserveAspectRatio="none" overflow="hidden"><image href="/assets/card-concepts/zawgyi-upgrades-v4.png" width="500" height="200" preserveAspectRatio="none"/></svg></svg>`;
}
