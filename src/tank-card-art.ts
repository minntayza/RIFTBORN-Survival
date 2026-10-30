/** Paired illustrations for Shield Tank's five unique upgrades and evolutions. */
const TANK_CARD_IDS=['stamina','block','reflect','spikes','rush'];
export function tankCardArt(id:string,evolved=false){
 const column=TANK_CARD_IDS.indexOf(id);if(column<0)return '';
 const x=column*100+.5,y=evolved?95.3:.5,h=evolved?104.2:93.8;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art ${evolved?'evolution-card-reference':''}" data-tank-card="${id}" aria-hidden="true"><svg x="0" y="0" width="100" height="100" viewBox="${x} ${y} 99 ${h}" preserveAspectRatio="none" overflow="hidden"><image href="/assets/card-concepts/tank-upgrades-v1.png" width="500" height="200" preserveAspectRatio="none"/></svg></svg>`;
}
