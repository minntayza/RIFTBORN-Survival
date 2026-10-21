import '../src/style.css';
import {weaponShopImage} from '../src/art';
import {WEAPONS,type WeaponId} from '../src/config';
document.querySelector('#preview')!.innerHTML=`<section class="panel" style="margin:12px auto;max-width:900px"><h2>Full weapon previews</h2><div class="cards weapon-select-cards">${Object.entries(WEAPONS).sort(([a],[b])=>Number(b==='cursed')-Number(a==='cursed')).map(([id,w])=>`<article class="weapon-select-card" style="--weapon-glow:#e19c9c"><div class="weapon-art">${weaponShopImage(id as WeaponId)}</div><h3>${w.name}</h3></article>`).join('')}</div></section>`;
