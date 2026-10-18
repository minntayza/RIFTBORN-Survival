import {artImage} from '../src/art';
import {HEROES,type HeroId} from '../src/config';
document.querySelector('main')!.innerHTML=(Object.keys(HEROES) as HeroId[]).map(hero=>`<div class="card">${artImage('hero',hero)}<h2>${HEROES[hero].name}</h2><p>Connected arms · relaxed hands</p></div>`).join('');
