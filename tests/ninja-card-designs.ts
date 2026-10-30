import '../src/style.css';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {visualUpgradeCard} from '../src/upgrade-ui';
const ids=['wide','double','trail','clone','smoke'];
document.querySelector('#cards')!.innerHTML='<h2 class="gallery-heading">Five unique upgrades</h2>'+ids.map((id,i)=>visualUpgradeCard(UPGRADES.find(u=>u.id===id)!,i,'ninja','katana',0,'',true)).join('')+'<h2 class="gallery-heading">Four existing evolutions</h2>'+ids.filter(id=>CARD_EVOLUTIONS[id]).map((id,i)=>{const u=UPGRADES.find(u=>u.id===id)!,e=CARD_EVOLUTIONS[id];return visualUpgradeCard({...u,id:'evolve:'+id,evolves:id,name:e.name,description:e.effect,max:1},i,'ninja','katana',0,'',true);}).join('');
