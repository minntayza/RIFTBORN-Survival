import type {EnemyFaction} from './robot-enemies';
export type BossMark={x:number;y:number;radius:number;delay:number;color:number;style:'rupture'|'reactor'|'mortar'|'rally';damage:number};
export function bossMarks(type:'boss'|'shooterBoss'|'commander',phase:number,faction:EnemyFaction,x:number,y:number,tx:number,ty:number):BossMark[]{
 const robot=faction==='robot',color=robot?0x79e4ed:0xd7a579;
 if(type==='commander')return [{x,y,radius:220,delay:1.15,color:robot?0xb9a1ef:0xc5ad7e,style:'rally',damage:0}];
 if(type==='shooterBoss')return phase%3===2?[-1,0,1].map(i=>({x:tx+i*115,y:ty+(i===0?0:65),radius:62,delay:.9+Math.abs(i)*.25,color,style:'mortar' as const,damage:.85})):[];
 if(phase%3!==0)return [];
 if(robot)return [[0,0],[-140,0],[140,0],[0,-140],[0,140]].map(([dx,dy],i)=>({x:tx+dx,y:ty+dy,radius:66,delay:1.15+(i===0?0:.35),color,style:'reactor' as const,damage:1}));
 const a=Math.atan2(ty-y,tx-x);
 return [0,1,2].map(i=>({x:tx+Math.cos(a)*i*105,y:ty+Math.sin(a)*i*105,radius:76,delay:1.15+i*.24,color,style:'rupture' as const,damage:1}));
}
