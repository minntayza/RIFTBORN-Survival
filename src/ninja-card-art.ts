/** One illustrated set for Ninja's regular cards and existing evolutions. */
const NINJA_CARD_IDS=['wide','double','trail','clone','smoke'];
export function ninjaCardArt(id:string,evolved=false){
 const column=NINJA_CARD_IDS.indexOf(id);
 if(column<0||evolved&&id==='smoke')return '';
 const edges=[0,104.4,200.5,300.3,397.9,500];
 const x=edges[column]+.5,y=evolved?95.3:.5,w=edges[column+1]-edges[column]-1,h=evolved?104.2:93.8;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art ${evolved?'evolution-card-reference':''}" data-ninja-card="${id}" aria-hidden="true"><svg x="0" y="0" width="100" height="100" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" overflow="hidden"><image href="/assets/card-concepts/ninja-upgrades-v1.png" width="500" height="200" preserveAspectRatio="none"/></svg></svg>`;
}
