import {drawZawgyi,ZAWGYI_ATLAS} from '../src/zawgyi-rig-art';
const hero=document.querySelector<HTMLCanvasElement>('#hero')!,small=document.querySelector<HTMLCanvasElement>('#small')!;
const image=new Image();image.src=ZAWGYI_ATLAS.url;
let magic=false,ready=false,walking=true,attacking=false,flip=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const control=document.querySelector<HTMLButtonElement>('#magic')!;
control.onclick=()=>{magic=!magic;control.setAttribute('aria-pressed',String(magic));control.textContent=magic?'✦ Staff glow on':'✦ Preview staff glow';};
image.onload=()=>{ready=true;document.querySelector('#status')!.textContent='ZAWGYI · SHOULDER & HIP ANIMATION';};
image.onerror=()=>{document.querySelector('#error')!.textContent='Character artwork could not load. Please refresh the preview.';};
function draw(canvas:HTMLCanvasElement,time:number,mini=false){
 const box=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(box.width*ratio)||canvas.height!==Math.round(box.height*ratio)){canvas.width=Math.round(box.width*ratio);canvas.height=Math.round(box.height*ratio);}
 const g=canvas.getContext('2d')!,w=box.width,h=box.height;g.setTransform(ratio,0,0,ratio,0,0);g.clearRect(0,0,w,h);if(!ready)return;
 const bob=reduced?0:Math.sin(time*.0016)*(mini?1:3),scale=Math.min(w*.88/128,h*.86/132),iw=128*scale,ih=132*scale,size=Math.max(iw,ih),x=(w-iw)/2,y=(h-ih)/2+bob;
 if(!mini){g.save();g.translate(w/2,h*.87);g.scale(1,.24);g.fillStyle='#060d1380';g.beginPath();g.ellipse(0,0,w*.22,w*.1,0,0,Math.PI*2);g.fill();g.restore();}
 if(magic){const glow=g.createRadialGradient(w*.62,h*.42,0,w*.62,h*.42,size*.48);glow.addColorStop(0,'#fbc86d32');glow.addColorStop(1,'#fbc86d00');g.fillStyle=glow;g.fillRect(0,0,w,h);}
 g.save();g.translate(x,y);g.scale(scale,scale);drawZawgyi(g,image,reduced?0:time/1000,walking&&!reduced,attacking?.24-(time/1000% .8)/.8*.239:0,Math.floor(time/800),flip);g.restore();
 if(magic){for(let i=0;i<(mini?5:16);i++){const a=i*2.399+(reduced?0:time*.00028),r=size*(.24+(i%4)*.032),px=w/2+Math.cos(a)*r,py=h*.51+Math.sin(a)*r*.95,s=mini?1.2:2.5+(i%3);g.save();g.translate(px,py);g.rotate(a);g.globalAlpha=.5+Math.sin((reduced?0:time*.003)+i)*.25;g.fillStyle=i%3?'#ffe2a0':'#a4dfb1';g.beginPath();g.moveTo(0,-s*2);g.quadraticCurveTo(s*.4,-s*.4,s*1.5,0);g.quadraticCurveTo(s*.4,s*.4,0,s*2);g.quadraticCurveTo(-s*.4,s*.4,-s*1.5,0);g.quadraticCurveTo(-s*.4,-s*.4,0,-s*2);g.fill();g.restore();}}
}
function frame(t:number){draw(hero,t);draw(small,t,true);requestAnimationFrame(frame);}requestAnimationFrame(frame);

for(const action of ['walk','attack','face'])document.querySelector('#'+action)?.addEventListener('click',e=>{const button=e.currentTarget as HTMLButtonElement;if(action==='walk'){walking=!walking;button.setAttribute('aria-pressed',String(walking));button.textContent=walking?'Walking · On':'Walking · Off';}else if(action==='attack'){attacking=!attacking;button.setAttribute('aria-pressed',String(attacking));}else flip=!flip;});
