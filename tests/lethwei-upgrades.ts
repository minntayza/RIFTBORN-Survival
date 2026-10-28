import '../src/style.css';
import '../src/mobile-combat.css';
import {visualUpgradeCard,upgradeBuildHint} from '../src/upgrade-ui';
import {UPGRADES} from '../src/upgrades';
const levels={nineweapons:1};
document.querySelector('#overlay')!.innerHTML=`<section class="panel levelup-panel"><div class="choice-heading"><b>SKILL CHOICE</b><small>LEVEL 18 · PICK ONE</small></div><div class="cards upgrade-cards">${['nineweapons','fire','health'].map((id,i)=>{const u=UPGRADES.find(u=>u.id===id)!;return visualUpgradeCard(u,i,'lethwei','hempwraps',id==='nineweapons'?1:0,upgradeBuildHint(u,levels));}).join('')}</div><div class="actions"><button>Evolution guide</button><button>Reroll</button></div></section>`;
