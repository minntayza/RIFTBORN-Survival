import '../src/style.css';
import '../src/mobile-combat.css';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {visualUpgradeCard} from '../src/upgrade-ui';
const orbit=UPGRADES.find(u=>u.id==='orbit')!,e=CARD_EVOLUTIONS.orbit;
const rows=[UPGRADES.find(u=>u.id==='damage')!,UPGRADES.find(u=>u.id==='speed')!,{...orbit,id:'evolve:orbit',evolves:'orbit',name:e.name,description:e.effect,max:1}];
document.querySelector('#cards')!.innerHTML=rows.map((u,i)=>visualUpgradeCard(u,i,'zawgyi','mysticstaff',i===0?3:i===1?1:0)).join('');
