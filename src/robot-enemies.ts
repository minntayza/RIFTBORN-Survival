import {bossMotion,type BossAction} from './boss-motion';
import {ENEMIES,type EnemyId} from './config';
import type {WalkingZombie} from './zombie-walk';
export type EnemyFaction='zombie'|'robot';
export const enemyFaction=(wave:number):EnemyFaction=>wave>=11?'robot':'zombie';
export function spawnFaction(wave:number,serial:number,type:EnemyId):EnemyFaction{
 if(wave<=10)return 'zombie';if(wave>=14)return 'robot';
 if(['shooterBoss','commander','boss'].includes(type))return 'robot';
 return serial%4< wave-10?'robot':'zombie';
}
export const ROBOTS={
 walker:{name:'Scrap Walker',color:'#71dd59',role:'Close-range pursuer',cue:'Round orange-and-cream head, cyan eyes, bolt antenna, and chunky clamp hands.',tip:'Keep an escape route through the pack.'},
 scout:{name:'Scout Bot',color:'#ffbd38',role:'Fast pursuer',cue:'Small yellow chassis, swept-back head fins, blue visor, and oversized running boots.',tip:'Watch your flanks; it curves around your approach and closes gaps quickly.'},
 pulse:{name:'Pulse Shooter',color:'#f176cc',role:'Ranged attacker',cue:'Pink armor and a large blue pulse cannon.',tip:'Sidestep the locked aim line before it fires.'},
 shield:{name:'Shield Unit',color:'#39cbef',role:'Armored defender',cue:'Blue armor and a broad cyan shield.',tip:'Reduces damage to allies within its cyan field by 15%. Eliminate it first; heavy melee helps against its own armor.'},
 crusher:{name:'Crusher',color:'#ff8746',role:'Heavy melee',cue:'Broad red body, small yellow visor, and enormous hazard-striped hammer fists.',tip:'Leave its marked attack area before impact.'},
 command:{name:'Command Unit',color:'#b48aff',role:'Reinforcements',cue:'Purple-and-cream armor, yellow antenna, signal remote and pointing hand.',tip:'Defeat it to stop reinforcements and its support aura.'},
 sentinel:{name:'Factory Sentinel',color:'#ff5d65',role:'Boss',cue:'Red-and-ivory armor, gold reactor crest, bright chest core and two striking gauntlets.',tip:'Dodge its locked charge lane and ground slams.'}
} as const;
export type RobotKind=keyof typeof ROBOTS;
export const ROBOT_ROLES:Record<EnemyId,RobotKind>={abomination:'crusher',bioScreer:'pulse',shadowLurker:'scout',basic:'walker',runner:'scout',spitter:'pulse',rifle:'pulse',armoured:'shield',spear:'shield',brute:'crusher',cleaver:'crusher',elite:'shield',shooterBoss:'pulse',commander:'command',boss:'sentinel'};
export function enemyName(type:EnemyId,faction:EnemyFaction='zombie'){
 if(faction==='zombie')return ENEMIES[type].name;
 if(type==='elite')return 'Shield Warden';if(type==='shooterBoss')return 'Pulse Overseer';return ROBOTS[ROBOT_ROLES[type]].name;
}
export function robotMovementType(type:EnemyId):WalkingZombie{return type==='abomination'?'brute':type==='bioScreer'?'spitter':type==='shadowLurker'?'runner':type==='cleaver'?'brute':type==='spear'?'armoured':type==='shooterBoss'?'spitter':type;}
type Shape={path:string;fill:string;stroke?:string;width?:number;part?:'body'|'legs'|'leftArm'|'rightArm'};
const ink='#111e33';
// Shared angular armor artwork keeps the field guide and animated combat identical.
export function robotShapes(kind:RobotKind,phase=0,strength=0):Shape[]{
 const out:Shape[]=[],color=ROBOTS[kind].color,step=Math.sin(phase*Math.PI*2)*strength;
 let part:Shape['part']='body';
 const path=(d:string,fill:string,stroke=ink,width=2.2)=>out.push({path:d,fill,stroke,width,part});
 const poly=(points:string,fill:string)=>path(`M${points}Z`,fill);
 const line=(d:string,c='#d6e7e5',w=1.5)=>path(d,'#00000000',c,w);
 const joint=(x:number,y:number,r=5)=>path(`M${x-r} ${y}a${r} ${r} 0 1 0 ${r*2} 0a${r} ${r} 0 1 0 ${-r*2} 0`,'#29394c');
 const plate=(x:number,y:number,w:number,h:number,c:string=color)=>{poly(`${x+5} ${y} L${x+w-5} ${y} L${x+w} ${y+6} L${x+w-3} ${y+h} L${x+2} ${y+h} L${x} ${y+6}`,c);line(`M${x+6} ${y+4}H${x+w-7}`);poly(`${x+w-5} ${y+9}L${x+w-3} ${y+h}H${x+w-10}Z`,'#192a3c');};
 const glow=(x:number,y:number,w:number,h:number)=>{path(`M${x} ${y}h${w}v${h}h${-w}Z`,'#b8ffff','#3b798f',1);};
 if(kind==='scout'){
  for(const x of [27,94]){joint(x,91,16);joint(x,91,10);line(`M${x-7} ${91+step*4}L${x+7} ${91-step*4}`,'#94c9cf',3);}
  poly('21 64L39 45L78 40L108 61L99 91L36 94','#35465a');
  plate(33,54,67,26);poly('40 49L47 32L79 29L91 48',color);poly('47 35L78 32L82 45L44 47','#172b40');glow(53,38,24,4);
  poly('78 55L109 48L116 57L96 70','#e9d2a3');line('M42 76L66 72L85 76','#fff1b8',3);plate(11,58,24,16,'#63798a');return out;
 }
 if(kind==='sentinel'){
  part='legs';
  for(const [x,side] of [[36,-1],[91,1]])for(const [y,n] of [[65,1],[88,-1]]){
   const dy=step*4*n*side;poly(`${x} ${y}L${x+side*15} ${y+9+dy}L${x+side*20} ${108+dy}H${x+side*31}L${x+side*27} ${y+1+dy}L${x} ${y-9}`,'#647c91');joint(x,y,6);line(`M${x+side*17} ${y+9+dy}L${x+side*21} ${100+dy}`,'#bdcfda',2);
  }
  part='body';
  poly('28 44L45 29L85 29L104 46L96 86L77 105L47 105L29 85',color);poly('37 47L64 35L94 47L85 83L64 98L42 81','#4d293e');
  poly('64 53L82 69L75 88L54 88L45 69','#e5ac53');poly('64 60L75 71L69 81H58L53 71','#fff1ad');
  plate(13,39,26,31,'#b59c72');plate(91,39,26,31,'#b59c72');glow(44,44,40,5);poly('46 27L53 11L63 24L77 10L84 29','#c8b382');return out;
 }
 const heavy=kind==='crusher',shield=kind==='shield',command=kind==='command';
 // Separate hips, articulated knees and broad boots rather than a sliding box body.
 part='legs';
 for(const [x,n] of [[45,1],[72,-1]]){const dy=step*5*n;joint(x+6,88,6);poly(`${x} 84L${x+15} 86L${x+13} ${104+dy}L${x-2} ${103+dy}`,'#354759');plate(x-5,101+dy,25,14,'#52687b');}
 part='body';
 poly('42 77L87 77L83 94L48 94','#233343');
 const ly=55+step*4,ry=55-step*4;
 joint(32,ly+9,7);joint(96,ry+9,7);
 part='leftArm';
 plate(heavy?10:21,ly,heavy?28:19,heavy?38:29,heavy?'#b85c49':color);
 part='rightArm';
 plate(heavy?89:90,ry,heavy?28:19,heavy?38:29,heavy?'#b85c49':color);
 part='body';
 poly(heavy?'30 44L49 39L84 40L101 49L88 84L44 84':'37 45L53 39L79 39L95 48L85 84L45 84',color);
 poly('45 50L64 57L85 49L80 74L64 83L49 73','#334858');
 poly('64 57L74 64L64 74L55 64',command?'#ffdf7b':'#a2eff1');
 plate(heavy?19:27,42,heavy?29:23,14);plate(heavy?82:82,42,heavy?29:23,14);
 // Helmet crest, deep visor, cheek guards and highlighted bevels match hero armor.
 poly('43 33L47 17L64 10L82 18L89 34L80 49L49 47',color);
 poly('47 30L82 27L81 39L50 42','#172434');
 if(kind==='walker')glow(61,31,12,6);else{glow(51,33,11,4);glow(69,31,10,4);}
 poly('50 43L64 46L79 41L74 53L58 55','#52677c');line('M50 22L62 17L76 22');line('M58 49L70 47','#dce7d8');
 if(kind==='walker'){poly(`21 ${ly+26}L17 ${ly+40}L24 ${ly+35}L29 ${ly+41}L35 ${ly+28}`,'#b5c6ac');poly(`94 ${ry+26}L91 ${ry+40}L100 ${ry+35}L108 ${ry+39}L108 ${ry+27}`,'#b5c6ac');}
 if(kind==='pulse'){part='rightArm';plate(86,62,32,25,'#657ca0');poly('94 62L114 58L123 67L119 83L97 87','#34475f');glow(111,66,9,12);line('M92 70L103 68','#eabfdf',3);}
 if(shield){part='leftArm';poly('14 59L39 53L57 65L52 100L34 117L13 101','#3c647c');poly('20 65L38 60L49 69L45 97L34 108L20 96','#70cbda');poly('34 70L43 82L33 97L25 83','#f6dfa1');line('M20 66V94','#c5ffff',2);}
 if(command){part='body';poly('45 57L39 107L62 98L81 110L91 58','#54456e');plate(45,47,39,25);poly('59 53L68 53L72 68L64 75L56 68','#e5c67d');line('M78 23L91 9','#e5c67d',3);joint(92,8,4);part='rightArm';plate(94,32-step*3,15,21);glow(97,36-step*3,8,4);}
 if(heavy){part='leftArm';plate(7,ly+21,33,28,'#d89b60');part='rightArm';plate(88,ry+21,33,28,'#d89b60');for(const x of [12,94])line(`M${x} ${ly+29}h18m-18 6h18`,'#643e38',3);poly('54 13L64 3L74 14','#cfb382');}
 return out;
}
export function robotSvg(kind:RobotKind){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${ROBOTS[kind].name} colorful 2D robot">${robotShapes(kind).map(s=>`<path d="${s.path}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.width}" stroke-linejoin="round"/>`).join('')}</svg>`;}
export function robotCanvas(kind:RobotKind,frame:number,action?:BossAction,type?:EnemyId){
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;
 const strength=frame===0?0:frame>24?.4:1,phase=frame===0?0:(frame-1)%24/24;
 const motion=action?bossMotion(frame/35*((kind==='pulse'?.9:1.15)+.65),kind==='pulse'?.9:1.15,action):undefined;
 for(const s of [...robotShapes(kind,action?0:phase,action?0:strength),...(type?robotEquipment(type):[])]){
 g.save();if(motion){
  const m=motion,part=s.part||'body';
  if(part==='legs'){g.translate(64,105);g.scale(1+m.brace*.12,1);g.translate(-64,-105);}
  else {g.translate(m.recoil,m.crouch);g.translate(64,65);g.rotate(m.lean);g.translate(-64,-65);}
  if(part==='leftArm'||part==='rightArm'){
   const x=part==='leftArm'?32:96,sign=part==='leftArm'?1:-1;
   const angle=action==='slam'?sign*(2.45*m.lift-.2*m.contact):action==='rally'&&part==='rightArm'?-2.6*m.lift-.6*m.contact:action==='fire'&&part==='rightArm'?-.8*m.lift:0;
   g.translate(x,55);g.rotate(angle);g.translate(-x,-55);
  }
 }
 const p=new Path2D(s.path);g.fillStyle=s.fill;g.fill(p);g.strokeStyle=s.stroke||ink;g.lineWidth=s.width||3;g.lineJoin='round';g.stroke(p);g.restore();}return c;
}

// Multipliers supplement the existing endless wave scaling, with distinct role tradeoffs.
export function robotStats(type:EnemyId){
 const kind=ROBOT_ROLES[type];
 return {health:kind==='sentinel'?1.35:kind==='crusher'?1.25:kind==='shield'?1.15:1.08,
 damage:kind==='crusher'?1.4:kind==='sentinel'?1.35:1.2,
 speed:kind==='scout'?1.18:kind==='crusher'?.88:kind==='shield'?.9:1};
}
export function robotProtection(target:{x:number;y:number;type:EnemyId;faction?:EnemyFaction},squad:readonly {x:number;y:number;type:EnemyId;faction?:EnemyFaction;active:boolean}[]){
 return target.faction==='robot'&&ROBOT_ROLES[target.type]!=='shield'&&squad.some(e=>e!==target&&e.active&&e.faction==='robot'&&ROBOT_ROLES[e.type]==='shield'&&Math.hypot(e.x-target.x,e.y-target.y)<115)?.85:1;
}
/** Equipment variants preserve a shared faction language while making attacks identifiable. */
export function robotEquipment(type:EnemyId):Shape[]{
 const shape=(path:string,fill:string,part:Shape['part']='rightArm'):Shape=>({path,fill,part,stroke:ink,width:2});
 switch(type){
 case 'rifle':return [shape('M84 69H123V75H84Z','#506c87'),shape('M99 63H112V69H99Z','#c1dedb')];
 case 'spear':return [shape('M108 28V116H112V28Z','#b2b6ac'),shape('M110 9L101 30L110 36L119 30Z','#b3f3ee')];
 case 'cleaver':return [shape('M99 74L123 82L118 105L91 98Z','#d1b485'),shape('M96 80L118 87L113 97L93 92Z','#525e68')];
 case 'elite':return [shape('M41 22L47 5L57 17L66 2L77 19L87 7L89 29Z','#e3c17d','body'),shape('M11 58L21 51L29 61L25 108L12 101Z','#d4b677','leftArm')];
 case 'shooterBoss':return [shape('M9 41H35V68H9Z','#66518b','leftArm'),shape('M92 41H121V68H92Z','#66518b'),shape('M13 44H30V51H13ZM97 44H116V51H97Z','#b3f4f7')];
 default:return [];
 }
}
export function robotUnitSvg(type:EnemyId){
 const kind=ROBOT_ROLES[type];return robotSvg(kind).replace('</svg>',robotEquipment(type).map(s=>`<path d="${s.path}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.width}"/>`).join('')+'</svg>');
}
