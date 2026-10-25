import '../src/style.css';
import '../src/mobile-combat.css';
import {weaponAwakeningUi} from '../src/weapon-awakening-ui';
import type {EvolutionId} from '../src/progression';
const params=new URLSearchParams(location.search),full=params.get('full') as EvolutionId|undefined;
document.querySelector('.panel')!.innerHTML=weaponAwakeningUi('zawgyi','mysticstaff',full?20:10,full);
document.addEventListener('click',e=>{const a=(e.target as Element).closest<HTMLElement>('[data-action]')?.dataset.action;if(a?.startsWith('evolve:')){document.querySelector('.awakening-heading p')!.textContent=`Selected ${a.split(':')[1]} · preview only`;}else if(a==='guide-weapons')location.href='/tests/evolution-showcase.html';});
