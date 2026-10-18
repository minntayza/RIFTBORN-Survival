import '../src/style.css';
import {visualUpgradeCard,upgradeBuildHint} from '../src/upgrade-ui';
import {UPGRADES} from '../src/upgrades';
const levels={damage:4,orbit:1};
document.querySelector('#overlay')!.innerHTML=`<section class="panel levelup-panel"><div class="choice-heading"><b>SKILL CHOICE</b><small>LEVEL 8 · PICK ONE</small></div><div class="cards upgrade-cards">${['fire','health','clone'].map((id,i)=>{const u=UPGRADES.find(u=>u.id===id)!;return visualUpgradeCard(u,i,'ninja','katana',id==='damage'?4:0,upgradeBuildHint(u,levels));}).join('')}</div><div class="actions"><button>Evolution guide</button><button>↻ Reroll (2 left)</button></div></section>`;
