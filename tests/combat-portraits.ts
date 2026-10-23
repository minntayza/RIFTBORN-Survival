import {COSMETICS} from '../src/cosmetics';
import {freshSave} from '../src/save';
import {combatPortrait} from '../src/combat-portrait';
import type {HeroId} from '../src/config';
const save=freshSave();
for(const outfit of COSMETICS.filter(c=>c.kind==='character')){const hero=outfit.target as HeroId;save.cosmetics.equipped[`character:${hero}`]=outfit.id;const card=document.createElement('article');card.className='card';card.innerHTML=`<span class="portrait">${combatPortrait(save,hero)}</span><b>${outfit.name}</b>`;document.querySelector('main')!.append(card);}
