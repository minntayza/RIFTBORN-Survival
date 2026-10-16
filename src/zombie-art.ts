import {ENEMIES,type EnemyId} from './config';
import type {WalkingZombie} from './zombie-walk';
type Part='head'|'torso'|'leftArm'|'rightArm'|'leftLeg'|'rightLeg';
export type ZombieShape={d:string;fill:string;stroke:string;width:number;part:Part};
// Artwork is expressed in joint-local coordinates, shared by portraits and frames.
export function zombieShapes(id:WalkingZombie):ZombieShape[]{
 const shapes:ZombieShape[]=[],ink='#14202a',skin=id==='spitter'?'#a3b58b':id==='boss'?'#a4b58d':id==='brute'?'#91a582':'#a6b98a';
 const coat=id==='commander'?'#784552':id==='elite'?'#754858':id==='rifle'?'#7b805d':id==='armoured'?'#566b80':id==='spitter'?'#67566e':'#786657';
 const p=(part:Part,d:string,fill:string,stroke=ink,width=1.5)=>shapes.push({part,d,fill,stroke,width});
 const line=(part:Part,d:string,c='#d2c6a7',w=1)=>p(part,d,'#00000000',c,w);
 if(id==='runner'){
  for(const part of ['leftArm','rightArm','leftLeg','rightLeg'] as Part[]){p(part,'M-5 -3L6 -2L4 13L8 24L-4 26L-7 22L-2 12Z',skin);line(part,'M-2 20L0 25M3 21L4 25',ink);}
  p('torso','M-36 -5L-47 -19L-43 -23L-27 -11L-8 -16L25 -12L37 -1L25 18L-22 16L-35 8Z','#bd8b58');p('torso','M-26 -10L-9 -14L17 -11L26 -3L15 12L-17 11L-29 3Z','#e6d8ae');line('torso','M-3 -5L-7 5M3 -4L0 7M9 -3L6 6','#766654',2);
  p('head','M-18 5L-19 -16L-7 -7L9 -20L12 -2L23 6L24 15L8 26L-10 22L-19 14Z',skin);p('head','M-14 3L-13 -8L-6 -1M5 -2L9 -11L10 1','#566c59');p('head','M1 7L10 5L9 11L2 12Z','#f1d47f');p('head','M17 7L26 9L23 14L17 14Z',ink);p('head','M-2 17L18 15L13 23L3 25Z','#392f31');p('head','M3 17L6 22L9 17M13 17L14 20L16 16','#e8dcb9',ink,.7);return shapes;
 }
 for(const part of ['leftLeg','rightLeg'] as Part[]){p(part,'M-8 -3L8 -2L6 16L9 29L-11 31L-12 25L-6 17Z','#3c4748');p(part,'M-9 24L7 23L10 31L-13 32Z','#26323c');line(part,'M-4 5L1 13M-6 26L5 26','#718080');}
 for(const part of ['leftArm','rightArm'] as Part[]){
  const huge=id==='brute'||id==='boss'&&part==='leftArm',w=huge?15:9,h=huge?49:38;
  p(part,`M${-w} -4L${w-2} -6L${w+2} 12L${w-2} 23L${w+3} ${h-7}L${w-1} ${h}L${-w-3} ${h-2}L${-w-5} ${h-10}L${-w+1} 17Z`,skin);
  p(part,`M${w-5} 1L${w+2} 12L${w-2} 23L${w+3} ${h-7}L${w-1} ${h}L${w-7} ${h-3}L${w-8} 14Z`,'#667d6c');
  if(!huge)p(part,'M-10 -5L8 -5L12 8L6 15L0 10L-7 15L-12 7Z',coat);
  line(part,`M-5 ${h-8}L-5 ${h-1}M0 ${h-7}L0 ${h-1}M5 ${h-7}L5 ${h-1}`,ink,.9);
  if(huge){line(part,'M-8 13L6 9M-5 20L5 17','#d3c8a5',2);p(part,'M-6 27L2 23L5 30L-2 33Z','#805353');}
 }
 const broad=id==='brute'?29:id==='boss'?26:22;
 p('torso',`M${-broad+3} -14L-9 -20L12 -19L${broad} -11L${broad-3} 18L16 27L8 21L0 28L-9 22L-20 26L${-broad} 9Z`,id==='brute'?skin:coat);
 p('torso',`M10 -15L${broad} -11L${broad-3} 18L16 27L8 21L3 20Z`,id==='brute'?'#6f856e':'#3a4146');
 p('torso','M-10 -18L1 -11L11 -18L6 -1L-4 7Z',skin);line('torso','M-17 4L-8 9L-12 17M14 1L11 10','#b5a28b');p('torso','M-17 13L-5 15L-8 21L-16 20Z','#493335');
 if(id==='brute'){line('torso','M-19 -4L-5 0M6 0L20 -4M0 3V21','#c3c5a3',2);line('torso','M-14 7L-10 3M-8 10L-4 6','#49594c',2);}
 if(id==='armoured'){p('torso','M-22 -14L-8 -10L8 -10L22 -14L24 14L11 22L-18 22L-25 10Z','#718697');p('torso','M-15 -3L14 -4L15 12L-15 14Z','#3d5366');line('torso','M-15 -9L-10 -5M-13 17L9 16','#c0ced0');}
 if(id==='boss'||id==='commander'){
  p('torso','M-25 -14L-14 -18L-10 -7L-26 -5Z','#c1a26b');p('torso','M12 -18L26 -14L27 -5L14 -7Z','#c1a26b');line('torso','M-5 -7V22M-2 -6V22','#c1a26b',1.5);p('torso','M8 1L15 -2L18 5L12 10L7 6Z','#d2b370');
 }
 if(id==='elite'){for(const side of [-1,1])p('torso',`M${side*17} -10L${side*26} -28L${side*27} -8L${side*35} -17L${side*29} 2L${side*18} 4Z`,'#d8ceb0');}
 // Asymmetric jaw, one clouded eye and exposed teeth read at phone size.
 p('head','M-17 1L-18 15L-12 29L1 34L15 27L19 11L11 -3L-6 -5Z',skin);p('head','M11 0L19 11L15 27L1 34L-3 29L7 22L9 8Z','#6c846c');p('head','M-15 11L-3 14L-6 20L-14 18Z','#d9dbac');p('head','M4 14L14 10L13 18L5 20Z','#e6ba93');line('head','M-16 10L-4 12M3 12L14 9',ink,2);p('head','M-9 25L0 22L11 24L6 30L-6 30Z','#362e32');line('head','M-4 24V28M1 24V28M6 25V28','#e2d6b2',1.7);line('head','M-11 2L-7 6L-10 9','#596c5a');
 if(id==='spitter'){p('head','M-13 29L-5 22L9 24L19 33L16 44L3 49L-13 42L-18 34Z','#936585');p('head','M-7 29L4 27L12 32L9 39L-1 41L-10 36Z','#c68eab');line('head','M-7 28L0 28','#eed3c8',2);p('head','M5 27L9 28L10 37L6 40L4 35Z','#bedc7a');}
 if(['armoured','rifle','commander','boss'].includes(id)){
  const c=id==='armoured'?'#607b91':id==='rifle'?'#747e5b':'#485366';p('head','M-21 11L-20 -3L-9 -11L11 -9L22 3L22 11Z',c);line('head','M-15 -2L-7 -6L10 -4','#c1c8b8');p('head','M-22 9L23 7L25 12L-22 15Z',id==='boss'||id==='commander'?'#c4a572':'#344a59');
  if(id==='armoured'){p('head','M-20 15L21 12L19 28L-15 30Z','#8bb1b966');line('head','M-14 18L-3 17','#d3edf0',2);}
 }
 if(id==='elite')p('head','M-6 -4L-3 -18L5 -5Z','#d8ceb0');
 return shapes;
}
export function zombiePortrait(id:WalkingZombie,pose:Record<Part,{x:number;y:number;angle:number;offset?:number}>){
 const order:Part[]=['rightLeg','leftLeg','rightArm','leftArm','torso','head'];
 return `<svg viewBox="0 0 128 128" role="img" aria-label="${ENEMIES[id as EnemyId].name} gameplay illustration"><g transform="translate(64 64) scale(1.16) translate(-64 -64)">${order.map(part=>{const j=pose[part];return `<g transform="translate(${j.x} ${j.y+(j.offset||0)}) rotate(${j.angle*180/Math.PI})">${zombieShapes(id).filter(s=>s.part===part&&!(id==='rifle'&&(part==='leftArm'||part==='rightArm'))).map(s=>`<path d="${s.d}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.width}" stroke-linejoin="round"/>`).join('')}</g>`;}).join('')}</g></svg>`;
}
export function rifleShapes(){return [
 {d:'M48 61L54 56L68 65L76 63L83 69L75 75L61 71L52 71Z',fill:'#a6b98a'},
 {d:'M47 58L54 56L61 62L56 69L47 66Z',fill:'#7b805d'},
 {d:'M62 63L86 62L88 69L72 70L67 77L59 74Z',fill:'#72583f'},
 {d:'M83 63L112 63L114 67L83 68Z',fill:'#526676'},
 {d:'M76 63L82 63L83 70L77 71Z',fill:'#a6b98a'}
 ];}
