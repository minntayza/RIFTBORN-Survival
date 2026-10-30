/** Paired illustrations for Samurai's five unique cards and four existing evolutions. */
const SAMURAI_CARD_IDS=['range','bleed','counter','wind','dragon-slash'];
export function samuraiCardArt(id:string,evolved=false){
 const column=SAMURAI_CARD_IDS.indexOf(id);if(column<0||evolved&&id==='dragon-slash')return '';
 const x=column*100+.5,y=evolved?98.4:.5,h=evolved?101.1:96.9;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="upgrade-reference-art ${evolved?'evolution-card-reference':''}" data-samurai-card="${id}" aria-hidden="true"><svg x="0" y="0" width="100" height="100" viewBox="${x} ${y} 99 ${h}" preserveAspectRatio="none" overflow="hidden"><image href="/assets/card-concepts/samurai-upgrades-v1.png" width="500" height="200" preserveAspectRatio="none"/></svg></svg>`;
}
