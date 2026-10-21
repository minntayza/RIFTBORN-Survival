import { HEROES, WEAPONS, type HeroId, type WeaponId } from './config';
export type RunMode='endless'|'short'|'daily';
export type BuildId='assault'|'mobility'|'guard';
export type TechniqueId='standard'|'swift'|'fortified';
export type BossConfig = { type: 'commander' | 'boss'; faction: 'zombie' | 'robot' };
export type RunOptions={mode:RunMode;build:BuildId;technique:TechniqueId;seed?:number;date?:string;hero?:HeroId;weapon?:WeaponId;dailyBosses?:{wave5:BossConfig;wave10:BossConfig}};
export const BUILDS=[
 {id:'assault' as const,name:'Assault',icon:'⚔',description:'+10% damage. Build piercing, critical hits, and area attacks.'},
 {id:'mobility' as const,name:'Mobility',icon:'↗',description:'+8% speed and 10% faster abilities. Build movement and technique.'},
 {id:'guard' as const,name:'Guard',icon:'◇',description:'+15% maximum health. Build recovery, protection, and retaliation.'}
];
export function seededRandom(seed:number){let state=seed>>>0;const random=()=>{state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};random.getState=()=>state;random.setState=(value:number|undefined)=>{if(value!==undefined)state=value>>>0;};return random;}
export function dailySetup(date=new Date().toISOString().slice(0,10)):RunOptions{
 let seed=2166136261;for(const c of date)seed=Math.imul(seed^c.charCodeAt(0),16777619);
 const random=seededRandom(seed),hero=(Object.keys(HEROES) as HeroId[])[Math.floor(random()*Object.keys(HEROES).length)];
 const weapons=(Object.keys(WEAPONS) as WeaponId[]).filter(w=>WEAPONS[w].hero===hero);
 const wave5Boss:BossConfig=random()<0.5?{type:'commander',faction:'zombie'}:{type:'boss',faction:'zombie'};
 const wave10Boss:BossConfig=random()<0.5?{type:'commander',faction:'robot'}:{type:'boss',faction:'robot'};
 return {mode:'daily',build:BUILDS[Math.floor(random()*3)].id,technique:'standard',hero,weapon:weapons[Math.floor(random()*weapons.length)],seed:seed>>>0,date,dailyBosses:{wave5:wave5Boss,wave10:wave10Boss}};
}
export const masteryMilestones=[{kills:100,name:'Swift technique',description:'20% faster abilities, with 20% shorter dash or counter duration.'},{kills:250,name:'Fortified technique',description:'30% longer dash or counter duration, with 20% longer cooldowns.'},{kills:500,name:'Veteran appearance',description:'A veteran insignia and alternate survivor tint.'}];
export function techniqueUnlocked(kills:number,id:TechniqueId){return id==='standard'||kills>=(id==='swift'?100:250);}
export function earnedWaveGold(wave:number,kills:number,damage:number,objectives:number){const goal=8+wave*2;return {goal,combat:kills>=goal?100+wave*15:0,perfect:damage===0?60+wave*5:0,objective:objectives>0?objectives*(75+wave*10):0};}
export type ThreatEnemy={active:boolean;x:number;y:number;type:string};
export type View={x:number;y:number;width:number;height:number};
export type Threat={angle:number;count:number;kind:'group'|'elite'|'boss';urgent:boolean};
export function incomingThreats(enemies:ThreatEnemy[],view:View):Threat[]{
 const groups=new Map<number,Threat>();let boss:Threat|undefined;const cx=view.x+view.width/2,cy=view.y+view.height/2;
 for(const e of enemies){if(!e.active||e.x>=view.x&&e.x<=view.x+view.width&&e.y>=view.y&&e.y<=view.y+view.height)continue;
 const edgeDistance=Math.hypot(Math.max(view.x-e.x,0,e.x-view.x-view.width),Math.max(view.y-e.y,0,e.y-view.y-view.height));
 if(edgeDistance>220&&!['boss','shooterBoss','commander'].includes(e.type))continue;
 const angle=Math.atan2(e.y-cy,e.x-cx);if(['boss','shooterBoss','commander'].includes(e.type)){boss={angle,count:1,kind:'boss',urgent:edgeDistance<90};continue;}
 const sector=Math.floor((angle+Math.PI)/(Math.PI/4))%8;const old=groups.get(sector);
 if(old){old.count++;old.urgent ||= edgeDistance<70;if(e.type==='elite')old.kind='elite';}
 else groups.set(sector,{angle,count:1,kind:e.type==='elite'?'elite':'group',urgent:edgeDistance<70});
 }
 const out=[...groups.values()].sort((a,b)=>Number(b.kind==='elite')-Number(a.kind==='elite')||Number(b.urgent)-Number(a.urgent)||b.count-a.count).slice(0,4);
 return boss?[...out,boss]:out;
}
export function edgePosition(angle:number,width:number,height:number){
 const cx=width/2,cy=height/2,dx=Math.cos(angle),dy=Math.sin(angle);
 const horizontal=Math.max(18,cx-30)/Math.max(.001,Math.abs(dx));
 const vertical=Math.max(18,dy<0?cy-Math.min(110,height*.25):height-Math.min(190,height*.35)-cy)/Math.max(.001,Math.abs(dy));
 const scale=Math.min(horizontal,vertical);return{x:cx+dx*scale,y:cy+dy*scale};
}
