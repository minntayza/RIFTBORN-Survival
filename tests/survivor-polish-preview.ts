import '../src/style.css';
import {heroFigureImage} from '../src/art';
import {COSMETICS} from '../src/cosmetics';
import {ninjaSkinPortrait} from '../src/ninja-cosmetics';
import {samuraiPortrait} from '../src/samurai-art';
const cards:string[]=[];
for(const hero of ['ninja','samurai'] as const){
 cards.push(`<article class="polish-card">${heroFigureImage(hero)}<h2>${hero} · Original</h2></article>`);
 for(const outfit of COSMETICS.filter(c=>c.kind==='character'&&c.target===hero&&c.asset))
 cards.push(`<article class="polish-card">${hero==='ninja'?ninjaSkinPortrait(outfit.asset!):samuraiPortrait(true,outfit.asset!)}<h2>${outfit.name}</h2></article>`);
}
document.querySelector('main')!.innerHTML=cards.join('');
const style=document.createElement('style');style.textContent='h1{font:700 25px system-ui!important;padding:18px 24px!important;margin:0!important;text-shadow:none!important}p{margin:0 24px!important}.polish-card>svg{width:160px!important;height:165px!important}.polish-card h2{font:600 15px system-ui!important;text-shadow:none!important;margin:8px!important}';document.head.append(style);
