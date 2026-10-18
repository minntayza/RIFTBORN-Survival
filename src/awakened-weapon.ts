import {weaponShopImage} from './art';
import type {WeaponId} from './config';
import type {EvolutionId} from './progression';
/** Reuse the real weapon silhouette. Effects are clipped to its opaque metal art. */
export function awakenedWeaponImage(weapon:WeaponId,element:EvolutionId,full=false){
 const art=weaponShopImage(weapon),id=`awaken-${weapon}-${element}-${full?'full':'first'}`,color=element==='reach'?'#75dcff':element==='power'?'#ffad45':'#c49bff';
 const lightning='<path d="M30 18 45 32 35 45 65 53 53 67 93 83M84 12 70 30 82 40 60 58 75 77 62 99M20 63 42 57 52 72"/>';
 const fire='<path d="M20 35 41 42 48 33 61 55 79 49 102 70M37 15 48 36 40 56 61 69 57 91M88 24 77 44 91 60"/>';
 const channels='<path d="M35 18 44 31 39 49 67 59 59 83 77 100M83 18 69 38 84 55 71 74"/>';
 return `<svg class="awakened-weapon element-${element} ${full?'is-full':''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${weapon} ${element==='reach'?'Lightning':element==='power'?'Wildfire':'Phantom'} ${full?'full evolution':'awakening'}"><defs><mask id="${id}" style="mask-type:alpha">${art}</mask></defs>${element==='tempo'?`<g class="weapon-echo" opacity=".3" transform="translate(${full?8:5} -3)">${art}</g>`:''}${art}<g mask="url(#${id})"><g fill="none" stroke="${color}" stroke-linejoin="bevel" stroke-width="${full?4:2.5}" class="weapon-element-lines">${element==='reach'?lightning:element==='power'?fire:channels}</g><path d="m58 38 6-7 6 7-6 8Z" fill="${color}" stroke="#17232a" stroke-width="2"/></g>${element==='reach'?'<g class="weapon-sparks" stroke="#c7f6ff" stroke-width="2"><path d="m44 12-5 8 7-2-4 9m35 55-6 8 6-2-3 8"/></g>':element==='power'?'<g class="weapon-embers" fill="#ffc36b"><circle cx="44" cy="23" r="2"/><circle cx="82" cy="40" r="2"/><circle cx="67" cy="13" r="1.5"/></g>':''}</svg>`;
}
