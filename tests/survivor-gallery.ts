import {COSMETICS} from '../src/cosmetics';
import {samuraiPortrait} from '../src/samurai-art';
import {gunnerSkinPortrait} from '../src/gunner-cosmetics';
const names=['blossom','fox','moon','outlaw','street','courier'];
document.querySelector('#gallery')!.innerHTML=COSMETICS.filter(c=>c.kind==='character'&&(c.target==='samurai'||c.target==='gunner')).map((c,i)=>{const art=(url:string)=>c.target==='samurai'?samuraiPortrait(true,url):gunnerSkinPortrait(url);return `<article class="card"><h2>${c.name}</h2><div class="pair"><div>Before${art(`/assets/cosmetics/${c.target}-${names[i]}.png`)}</div><div>After${art(c.asset!)}</div></div></article>`;}).join('');
