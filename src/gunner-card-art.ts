/** Matched regular/evolved illustrations for Gunner's five unique upgrades. */
const GUNNER_CARD_IDS=['magazine','pierce','ricochet','explosive','reload'];
export function gunnerCardArt(id:string,evolved=false){
 const column=GUNNER_CARD_IDS.indexOf(id);if(column<0)return '';
 const x=column*100+.5,y=evolved?93.9:.5,h=evolved?105.6:92.4;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art ${evolved?'evolution-card-reference':''}" data-gunner-card="${id}" aria-hidden="true"><svg x="0" y="0" width="100" height="100" viewBox="${x} ${y} 99 ${h}" preserveAspectRatio="none" overflow="hidden"><image href="/assets/card-concepts/gunner-upgrades-v1.png" width="500" height="200" preserveAspectRatio="none"/></svg></svg>`;
}
