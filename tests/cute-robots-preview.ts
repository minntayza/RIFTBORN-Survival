import {ROBOT_ATLAS,CUTE_ROBOTS,cuteRobotCanvas} from '../src/cute-robots';
const image=new Image();image.src=ROBOT_ATLAS.url;await image.decode();
let age=0,skill=false,paused=false,last=performance.now();
const names=['Scrap Walker','Scout Bot','Shield Unit','Crusher'];
const canvases=CUTE_ROBOTS.map((kind,i)=>{const section=document.createElement('section'),c=document.createElement('canvas');c.width=c.height=128;section.append(c,Object.assign(document.createElement('p'),{textContent:names[i]}));document.querySelector('main')!.append(section);return c;});
document.querySelector('#walk')!.addEventListener('click',()=>{skill=false;age=0;paused=false;});document.querySelector('#slam')!.addEventListener('click',()=>{skill=true;age=0;paused=false;});document.querySelector('#pause')!.addEventListener('click',()=>paused=!paused);
function tick(now:number){if(!paused)age=(age+Math.min(.04,(now-last)/1000))%2;last=now;CUTE_ROBOTS.forEach((kind,i)=>{const active=kind==='crusher'&&skill&&age<1.35;const g=canvases[i].getContext('2d')!;g.clearRect(0,0,128,128);g.drawImage(cuteRobotCanvas(image,kind,active?Math.floor(age/1.35*35):1+Math.floor(age*18)%24,active),0,0);});requestAnimationFrame(tick);}requestAnimationFrame(tick);
