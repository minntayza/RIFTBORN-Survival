import '../src/style.css';
import {HEROES,WEAPONS,type HeroId,type WeaponId} from '../src/config';
import {UPGRADES} from '../src/upgrades';
import {visualUpgradeCard} from '../src/upgrade-ui';
let hero:HeroId='samurai',weapon:WeaponId='nodachi';
function render(){
 document.querySelector('#heroes')!.innerHTML=Object.entries(HEROES).map(([id,h])=>`<button data-hero="${id}" class="${id===hero?'active':''}">${h.name}</button>`).join('');
 document.querySelector('#weapon')!.innerHTML=Object.entries(WEAPONS).filter(([,w])=>w.hero===hero).map(([id,w])=>`<option value="${id}" ${id===weapon?'selected':''}>${w.name}</option>`).join('');
 document.querySelector('#cards')!.innerHTML=[hero==='gunner'?'pierce':'wide','health','regen'].map((id,i)=>visualUpgradeCard(UPGRADES.find(u=>u.id===id)!,i,hero,weapon,1)).join('');
}
document.querySelector('#heroes')!.addEventListener('click',e=>{const id=(e.target as HTMLElement).closest<HTMLElement>('[data-hero]')?.dataset.hero;if(!id)return;hero=id as HeroId;weapon=Object.entries(WEAPONS).find(([,w])=>w.hero===hero)![0] as WeaponId;render();});
document.querySelector('#weapon')!.addEventListener('change',e=>{weapon=(e.target as HTMLSelectElement).value as WeaponId;render();});render();
