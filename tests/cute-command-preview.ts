import {COMMAND_ATLAS,commandCanvas,type CommandId} from '../src/cute-command';
import type {BossAction} from '../src/boss-motion';
const image=new Image();image.src=COMMAND_ATLAS.url;await image.decode();
let skill:BossAction|'walk'='walk',age=0,playing=true,last=performance.now();
const timeline=document.querySelector<HTMLInputElement>('#timeline')!;
for(const button of Array.from(document.querySelectorAll<HTMLButtonElement>('[data-skill]')))button.onclick=()=>{skill=button.dataset.skill as typeof skill;age=0;playing=true;};
document.querySelector('#play')!.addEventListener('click',()=>playing=!playing);timeline.oninput=()=>{playing=false;age=Number(timeline.value);};
function tick(now:number){if(playing)age=(age+Math.min(.05,(now-last)/1000))%(skill==='walk'?2.4:2.5);last=now;timeline.value=String(Math.min(1.8,age));for(const id of ['commander','boss'] as CommandId[]){const active=skill!=='walk'&&age<1.8,action=id==='commander'?'rally':skill;const c=document.querySelector<HTMLCanvasElement>(`#${id}`)!,g=c.getContext('2d')!;g.clearRect(0,0,128,128);g.drawImage(commandCanvas(image,id,active?Math.min(35,Math.floor(age/1.8*35)):skill==='walk'?1+Math.floor(age*16)%24:0,active?action as BossAction:undefined),0,0);}document.querySelector('#state')!.textContent=skill==='walk'?'Walking: arms, heads and shoulders remain still':age<1.15?'Prepare → hold → arm swing':age<1.27?'Skill impact / order':'Recover → rest';requestAnimationFrame(tick);}requestAnimationFrame(tick);
