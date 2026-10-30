import '../src/style.css';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {visualUpgradeCard} from '../src/upgrade-ui';
const ids=['stamina','block','reflect','spikes','rush'];
document.querySelector('#cards')!.innerHTML='<h2 class="gallery-heading">Five unique upgrades</h2>'+ids.map((id,i)=>visualUpgradeCard(UPGRADES.find(u=>u.id===id)!,i,'tank','shield',0,'',true)).join('')+'<h2 class="gallery-heading">Five evolutions</h2>'+ids.filter(id=>CARD_EVOLUTIONS[id]).map((id,i)=>{const u=UPGRADES.find(u=>u.id===id)!,e=CARD_EVOLUTIONS[id];return visualUpgradeCard({...u,id:'evolve:'+id,evolves:id,name:e.name,description:e.effect,max:1},i,'tank','shield',0,'',true);}).join('');
