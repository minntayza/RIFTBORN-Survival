import {createCanvas,loadImage} from '/Users/mintayza/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas/index.js';
import {drawFighter} from '../../src/lethwei-rig';
import {writeFileSync} from 'node:fs';
Object.assign(globalThis,{document:{createElement:()=>createCanvas(1,1)}});
const im=await loadImage('public/assets/characters/lethwei-tiger-rig-v1.png');
const c=createCanvas(1200,750),g=c.getContext('2d');g.fillStyle='#173035';g.fillRect(0,0,1200,750);
const poses=[[0,false,0,0,false],[.4,true,0,0,false],[0,false,.1,0,false],[0,false,0,0,true]] as const;
poses.forEach((p,i)=>{g.save();g.translate(150+i*300,270);g.scale(2,2);drawFighter(g as any,im as any,...p);g.restore();g.fillStyle='#fff0c2';g.font='18px sans-serif';g.fillText(['Guard','Walk','Punch','Face left'][i],100+i*300,470);g.save();g.translate(150+i*300,590);g.scale(.58,.58);drawFighter(g as any,im as any,...p);g.restore();});writeFileSync('output/lethwei/rig-check.png',c.toBuffer('image/png'));
