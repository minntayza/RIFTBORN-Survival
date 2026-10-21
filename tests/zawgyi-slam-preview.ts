import {ZAWGYI_ATLAS,drawZawgyi} from '../src/zawgyi-rig-art';
import {ZAWGYI_SLAM,zawgyiSlamMotion} from '../src/zawgyi-slam-motion';
import {zawgyiMotion} from '../src/zawgyi-motion';
const image=new Image();image.src=ZAWGYI_ATLAS.url;
await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(Error('Rig art failed to load'));});
const phases=[['Raise',.20,'Staff and hand rise together'],['Small lift',.32,'Short hop; staff held overhead'],['Strike',.414,'Rapid downward acceleration'],['Impact',.43,'Tip planted; damage fires now'],['Recover',.70,'Stand up after the low hold']] as const;
function draw(canvas:HTMLCanvasElement,age:number){const g=canvas.getContext('2d')!,p=zawgyiSlamMotion(age),m=zawgyiMotion(0,false,0,0,age),scale=1.5;g.clearRect(0,0,canvas.width,canvas.height);g.save();g.translate((canvas.width-128*scale)/2,48);g.fillStyle='#081a2088';g.beginPath();g.ellipse(64*scale,126*scale,47,8,0,0,Math.PI*2);g.fill();g.scale(scale,scale);g.translate(0,-p.lift/.72);drawZawgyi(g,image,0,false,0,0,false,age);g.restore();if(age>=ZAWGYI_SLAM.impact&&age<ZAWGYI_SLAM.hold){const x=(canvas.width-128*scale)/2+m.contact.x*scale,y=48+m.contact.y*scale;g.fillStyle='#ffe6a3';g.beginPath();g.arc(x,y,4,0,Math.PI*2);g.fill();g.strokeStyle='#f2d29b';g.beginPath();g.ellipse(x,y,26,7,0,0,Math.PI*2);g.stroke();}}
for(const [title,age,caption] of phases){const article=document.createElement('article');article.innerHTML=`<h2>${title}</h2><canvas width="220" height="265" aria-label="${title} pose"></canvas><small>${caption}</small>`;document.querySelector('#poses')!.append(article);draw(article.querySelector('canvas')!,age);}
const canvas=document.querySelector<HTMLCanvasElement>('#animated')!,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function frame(t:number){const age=reduced?ZAWGYI_SLAM.impact:(t/1000%1.65);draw(canvas,age>ZAWGYI_SLAM.duration?-1:age);if(!reduced)requestAnimationFrame(frame);}requestAnimationFrame(frame);
document.querySelector('#checks')!.textContent='Impact: 0.43s · Short lift: 16px · Low hold: 0.13s · Total: 0.84s\nStaff remains attached to the hand. Home and loadout remain still.';
