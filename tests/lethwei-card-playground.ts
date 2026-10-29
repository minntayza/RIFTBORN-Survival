import Phaser from 'phaser';
import '../src/style.css';
import {ArenaScene} from '../src/combat';
import {freshSave} from '../src/save';
import {AudioManager} from '../src/audio';
import {UPGRADES,type Upgrade} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {visualUpgradeCard} from '../src/upgrade-ui';
import type {LethweiSkill} from '../src/lethwei';
const save=freshSave();save.hero='lethwei';save.weapon='hempwraps';save.settings.sound=false;save.settings.shake=false;
const audio=new AudioManager();audio.sound=false;
const picker=document.querySelector<HTMLElement>('#picker')!,status=document.querySelector<HTMLElement>('#status')!;
const cards=UPGRADES.filter(u=>!u.hero||u.hero==='lethwei');
let ready=false,shown:Upgrade[]=[];
const scene=new ArenaScene(save,audio,()=>openCards(false),()=>{},()=>{scene.paused=!scene.paused;});
function message(text:string){status.textContent=text+' · WASD / arrows to move · aim with mouse · Q / E skills · temporary session';}
function openCards(evolve:boolean){if(!ready)return;scene.paused=true;picker.hidden=false;
 shown=evolve?cards.filter(u=>CARD_EVOLUTIONS[u.id]).map(u=>({...u,id:'evolve:'+u.id,evolves:u.id,name:CARD_EVOLUTIONS[u.id].name,description:CARD_EVOLUTIONS[u.id].effect,icon:CARD_EVOLUTIONS[u.id].icon,max:1})):cards;
 picker.innerHTML=`<section class="panel"><div class="actions"><button data-mode="base">Level-up cards (${cards.length})</button><button data-mode="evolution">Evolution cards (${cards.filter(u=>CARD_EVOLUTIONS[u.id]).length})</button><button data-mode="play">Return to combat</button></div><h2>${evolve?'Test an evolution':'Test a level-up card'}</h2><p>${evolve?'Selecting an evolution automatically maxes its base card for this practice session.':'Select a card to gain one level. You can reopen this panel to add more levels.'} Normal progress is not saved.</p><div class="cards upgrade-cards">${shown.map((u,i)=>visualUpgradeCard(u,i,'lethwei','hempwraps',scene.u(u.evolves||u.id))).join('')}</div></section>`;
 for(const [i,u] of shown.entries()){
  const button=picker.querySelector<HTMLButtonElement>(`[data-action="upgrade:${i}"]`);
  if(button)button.disabled=u.evolves?scene.evolved(u.evolves):scene.u(u.id)>=u.max;
 }
}
picker.onclick=e=>{const button=(e.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button||button.disabled)return;
 const mode=button.dataset.mode;if(mode==='base'||mode==='evolution'){openCards(mode==='evolution');return;}if(mode==='play'){picker.hidden=true;scene.paused=false;return;}
 const action=button.dataset.action;if(!action?.startsWith('upgrade:'))return;const u=shown[Number(action.split(':')[1])];if(!u)return;
 if(u.evolves){const base=UPGRADES.find(card=>card.id===u.evolves)!;while(scene.u(base.id)<base.max)scene.apply(base.id);}
 scene.apply(u.id);scene.notifyCombat(u.name);message(`${u.name} ${u.evolves?'evolved':`level ${scene.u(u.id)}/${u.max}`}`);picker.hidden=true;scene.paused=false;
};
scene.onArenaReady=()=>{ready=true;scene.plan=[];scene.spawnIndex=0;scene.waveTime=-1e6;scene.xpNeed=1e9;scene.countdown=0;scene.stats.wave=11;scene.enemies.forEach(e=>e.active=false);
 for(let i=0;i<8;i++){const e=scene.spawn('basic');if(e){e.x=scene.x+Math.cos(i*Math.PI/4)*140;e.y=scene.y+Math.sin(i*Math.PI/4)*140;e.hp=e.max=180;e.damage=0;e.speed=15;}}
 message('Choose any card, then test its effect');openCards(false);
};
document.querySelector('#regular')!.addEventListener('click',()=>openCards(false));document.querySelector('#evolved')!.addEventListener('click',()=>openCards(true));
for(const [button,id] of [['blitz','blitz'],['ring','lethweiring'],['chin','ironchin']] as const)document.querySelector('#'+button)!.addEventListener('click',()=>{if(!ready||!scene.lethwei)return;const l=scene.lethwei,old=l.equipped[0];l.equipped[0]=id as LethweiSkill;l.cooldowns[0]=0;scene.paused=false;l.activate(0,Math.cos(scene.angle),Math.sin(scene.angle));l.equipped[0]=old;});
document.querySelector('#targets')!.addEventListener('click',()=>{if(!ready)return;for(let i=0;i<8;i++){const e=scene.spawn('basic');if(e){e.x=scene.x+Math.cos(i*Math.PI/4)*100;e.y=scene.y+Math.sin(i*Math.PI/4)*100;e.hp=e.max=80;e.damage=0;}}});
document.querySelector('#elite')!.addEventListener('click',()=>{if(!ready)return;const e=scene.spawn('elite');if(e){e.x=scene.x+90;e.y=scene.y;e.hp=e.max=160;e.damage=0;e.speed=10;}});
document.querySelector('#low')!.addEventListener('click',()=>{scene.hp=scene.maxHp*.4;message('Health set to 40% — test low-health effects');});
document.querySelector('#hit')!.addEventListener('click',()=>{scene.invuln=0;scene.hurt(10);message('Test hit applied');});
document.querySelector('#reset')!.addEventListener('click',()=>location.reload());
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1100,height:650,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[scene],audio:{noAudio:true},banner:false});
