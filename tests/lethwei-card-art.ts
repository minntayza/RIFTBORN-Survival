import {lethweiSkillIcon,LETHWEI_SKILLS,type LethweiSkill} from '../src/lethwei';
import {myanmarCardArt} from '../src/myanmar-card-art';
const cards=[['nineweapons','Nine Limbs'],['ironshins','Iron Shins'],['headbutt','Lethwei Headbutt'],['ringmaster','Rope Rebound'],['goldenbelt',"Champion’s Heart"]];
document.querySelector('.art-grid')!.innerHTML=cards.map(([id,name])=>`<article><h2>${name}</h2>${myanmarCardArt(id)}</article>`).join('')+`<article><h2>Ninja · style reference</h2><svg viewBox="1027 3 250 250" style="overflow:hidden"><defs><clipPath id="ninja-style-ref"><rect x="1027" y="3" width="250" height="250"/></clipPath></defs><image clip-path="url(#ninja-style-ref)" href="/assets/card-concepts/skill-icons-v1.webp" width="1536" height="1024"/></svg></article>`;

document.querySelector('h1')!.textContent='Lethwei skills · circular emblems';
document.querySelector('.art-grid')!.innerHTML=(Object.keys(LETHWEI_SKILLS) as LethweiSkill[]).map(id=>`<article><h2>${LETHWEI_SKILLS[id].name}</h2>${lethweiSkillIcon(id)}</article>`).join('')+cards.slice(0,3).map(([id,name])=>`<article><h2>${name} · card reference</h2>${myanmarCardArt(id)}</article>`).join('');
