import {drawFighter,LETHWEI_ART,LETHWEI_LEGS} from '../src/lethwei-rig';
const canvas=document.querySelector('canvas')!,g=canvas.getContext('2d')!,image=new Image(),legs=new Image();
Promise.all([new Promise<void>(resolve=>image.onload=()=>resolve()),new Promise<void>(resolve=>legs.onload=()=>resolve())]).then(()=>{g.save();g.translate(240,215);g.scale(3.2,3.2);g.fillStyle='#0b1c22';g.beginPath();g.ellipse(0,80,46,5,0,0,Math.PI*2);g.fill();drawFighter(g,image,legs);g.restore();});image.src=LETHWEI_ART.url;legs.src=LETHWEI_LEGS.url;
