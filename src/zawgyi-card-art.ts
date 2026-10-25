/** Generated to match the existing Ninja card sheet; full-bleed square assets. */
const ZAWGYI_CARD_ART=new Set(['twindatlone','lotusflame','earthshaker','elixir','celestial']);
export function zawgyiCardArt(id:string){return ZAWGYI_CARD_ART.has(id)?`<img class="upgrade-reference-art" src="/assets/card-concepts/zawgyi-${id}-${id==='twindatlone'?'v3':'v2'}.png" alt=""/>`:'';}
