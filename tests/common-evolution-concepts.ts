import '../src/style.css';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {visualUpgradeCard} from '../src/upgrade-ui';
const ids=['health','speed','crit','magnet','regen','ward','fire','orbit','damage','cooldown'];
const short:Record<string,string>={health:'+15% max HP. Gain brief armour when hit.',speed:'Keep moving to trigger a speed burst.',crit:'+7% critical chance; stronger critical hits.',magnet:'Wider pickup reach, plus a collection pulse.',regen:'+1 HP/sec; elite kills boost recovery.',ward:'Start each wave with three shield charges.',fire:'Burning kills leave damaging fire patches.',orbit:'Two opposing kunai with spectral trails.',damage:'+12% damage; every fifth kill releases a pulse.',cooldown:'Reduce ability cooldowns by another 15%.'};
const atlas=new Image();atlas.src='/output/common-evolutions/common-evolutions-v1.png';
let proposed=false;
function render(){
 document.querySelector('#cards')!.innerHTML=ids.map((id,i)=>{const base=UPGRADES.find(u=>u.id===id)!,evo=CARD_EVOLUTIONS[id];return visualUpgradeCard({...base,id:'evolve:'+id,evolves:id,name:evo.name,description:short[id],max:1},i,'ninja','katana',0,'',true);}).join('');
 if(proposed)Array.from(document.querySelectorAll('#cards .upgrade-demo')).forEach((box,i)=>{
  const c=document.createElement('canvas');c.width=512;c.height=512;c.className='upgrade-reference-art';c.setAttribute('role','img');c.setAttribute('aria-label',CARD_EVOLUTIONS[ids[i]].name+' evolution concept');
  const badge=box.querySelector('.evolution-art-badge');box.replaceChildren(c);if(badge)box.append(badge);
  if(atlas.complete&&atlas.naturalWidth){const w=atlas.width/5,split=atlas.height*.477,y=i<5?0:split,h=i<5?split:atlas.height-split;c.getContext('2d')!.drawImage(atlas,i%5*w+2,y+2,w-4,h-4,0,0,512,512);}
 });
 document.querySelector('#proposed')!.classList.toggle('active',proposed);document.querySelector('#current')!.classList.toggle('active',!proposed);
 document.querySelector('#status')!.textContent=proposed?'Approved canvas concepts · now implemented in the game.':'Live evolution renderer · approved artwork shared across every survivor.';
}
atlas.onload=render;atlas.onerror=()=>document.querySelector('#status')!.textContent='Artwork is not available yet.';
document.querySelector('#proposed')!.addEventListener('click',()=>{proposed=true;render();});document.querySelector('#current')!.addEventListener('click',()=>{proposed=false;render();});
document.querySelector('#download')!.addEventListener('click',()=>{const a=document.createElement('a');a.href=atlas.src;a.download='common-evolution-concepts.png';a.click();});
document.querySelector('#effects')!.innerHTML=ids.map(id=>`<li><strong>${CARD_EVOLUTIONS[id].name}:</strong> ${CARD_EVOLUTIONS[id].effect}</li>`).join('');render();
