import {loadPyusawhtiArt,drawPyusawhti} from '../src/pyusawhti-rig';
const image=await loadPyusawhtiArt(),canvas=document.querySelector('canvas')!,g=canvas.getContext('2d')!;
let moving=false,aim=0,shooting=false;
document.querySelector('#walk')!.addEventListener('click',()=>moving=!moving);
document.querySelector('#face')!.addEventListener('click',()=>aim=aim?0:Math.PI);
document.querySelector('#shoot')!.addEventListener('click',()=>shooting=!shooting);
function frame(t:number){g.clearRect(0,0,850,600);g.save();g.translate(420,310);g.scale(5,5);drawPyusawhti(g,t/1000,moving,shooting?1:0,aim,false,image);g.restore();requestAnimationFrame(frame);}requestAnimationFrame(frame);
