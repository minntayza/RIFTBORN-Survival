import {targetsCamp} from './camp-siege';
import {campObstacles,resolveCampGround,campSteering,obstacleDistance} from './last-camp-collision';
export type CampReward='repair'|'strength'|'defense';
export const CAMP_REWARDS=[{id:'repair' as const,name:'Repair camp',description:'Restore 25% of maximum camp health.',icon:'✚'},{id:'strength' as const,name:'Strengthen survivor',description:'+10% damage for the rest of this run.',icon:'⚔'},{id:'defense' as const,name:'Reinforce barricades',description:'Camp takes 8% less damage. Maximum 40%.',icon:'▣'}];
export class LastCamp {
 readonly x=600;readonly y=380;readonly max=600;hp=600;damageBonus=0;armor=0;lastRewardWave=0;hitAt=-10;lastDamage=0;siegeStopped=0;
 readonly obstacles=campObstacles(this.x,this.y);
 get fraction(){return Math.max(0,this.hp/this.max);}
 hurt(damage:number,time:number){this.lastDamage=Math.min(this.hp,Math.max(0,damage)*(1-this.armor));this.hp=Math.max(0,this.hp-this.lastDamage);this.hitAt=time;return this.hp===0;}
 reward(id:CampReward,wave:number){if(wave<=this.lastRewardWave||wave>=10||!CAMP_REWARDS.some(r=>r.id===id))return false;this.lastRewardWave=wave;if(id==='repair')this.hp=Math.min(this.max,this.hp+this.max*.25);if(id==='strength')this.damageBonus+=.1;if(id==='defense')this.armor=Math.min(.4,this.armor+.08);return true;}
 siege(type:string,roll:number,wave:number,activeAttackers=0){return targetsCamp(type,wave,roll,activeAttackers);}
 entrance(wave:number){return (wave-1)%4;}
 spawn(side:number,offset:number){return{x:this.x+(side===0?-570:side===1?570:(offset-.5)*120),y:this.y+(side===2?-410:side===3?410:(offset-.5)*90)};}
 constrain(x:number,y:number,r=17){return resolveCampGround(x,y,r,this.x,this.y,this.obstacles);}
 move(x:number,y:number,dx:number,dy:number,r:number){
  const start=this.constrain(x,y,r);x=start.x;y=start.y;
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/6));
  for(let i=0;i<steps;i++){
   const sx=dx/steps,sy=dy/steps,p=this.constrain(x+sx,y+sy,r),limit=Math.hypot(sx,sy)*1.6+.01;
   if(Math.hypot(p.x-x,p.y-y)<=limit){x=p.x;y=p.y;}
   else{const options=[this.constrain(x+sx,y,r),this.constrain(x,y+sy,r)].filter(q=>Math.hypot(q.x-x,q.y-y)<=limit).sort((a,b)=>Math.hypot(a.x-x-sx,a.y-y-sy)-Math.hypot(b.x-x-sx,b.y-y-sy));if(options[0]){x=options[0].x;y=options[0].y;}}
  }
  return{x,y};
 }
 steer(x:number,y:number,tx:number,ty:number,r:number){return campSteering(x,y,tx,ty,r,this.x,this.y,this.obstacles);}
 attackDistance(x:number,y:number){return Math.min(...this.obstacles.filter(o=>o.group==='camp').map(o=>obstacleDistance(x,y,o)));}

}

export const CAMP_DIRECTIONS=['WEST','EAST','NORTH','SOUTH'] as const;
export function campWave(wave:number){
 const primary=(wave-1)%4;
 const variants=[
  {name:'First watch',hint:'Stop the first siege attacker.',sides:[primary]},
  {name:'Siege escort',hint:'Clear the escort and intercept the heavy.',sides:[primary]},
  {name:'Pincer attack',hint:'Two opposite entrances are threatened.',sides:[primary,primary^1]},
  {name:'Fast flank',hint:'Runners pressure you while siege enemies advance.',sides:[primary,(primary+2)%4]},
  {name:'First breach',hint:'A boss attack covers a heavy siege push.',sides:[primary]},
  {name:'Split siege',hint:'Heavy attackers approach from opposite sides.',sides:[primary,primary^1]},
  {name:'Crossfire',hint:'Protect the beacon from two entrances.',sides:[primary,(primary+2)%4]},
  {name:'Armored convoy',hint:'Break the armored escort before it reaches camp.',sides:[primary]},
  {name:'Last approach',hint:'Multiple fronts. Keep an escape route open.',sides:[primary,primary^1]},
  {name:'Final stand',hint:'Defeat the boss and stop the final siege.',sides:[primary,primary^1]}
 ];
 return variants[Math.max(0,Math.min(9,wave-1))];
}
export function campRewardPreview(c:LastCamp,id:CampReward){
 if(id==='repair'){const restored=Math.min(c.max-c.hp,c.max*.25);return{before:`${Math.ceil(c.hp)} HP`,after:`${Math.ceil(c.hp+restored)} HP`,detail:`Restore ${Math.ceil(restored)} HP now. No damage or armor increase.`,disabled:restored<=0};}
 if(id==='strength')return{before:`+${Math.round(c.damageBonus*100)}% damage`,after:`+${Math.round((c.damageBonus+.1)*100)}% damage`,detail:'Permanent for this run. Does not repair the camp.',disabled:false};
 const next=Math.min(.4,c.armor+.08),prevented=Math.round(100*next);return{before:`${Math.round(c.armor*100)}% protection`,after:`${Math.round(next*100)}% protection`,detail:`A 100-damage siege hit deals ${100-prevented} HP. Protects future waves; no immediate repair.`,disabled:next===c.armor};
}
export function campScore(kills:number,wave:number,victory:boolean,time:number,camp:LastCamp){
 const parts={combat:kills*10,waves:Math.max(0,victory?wave:wave-1)*50,victory:victory?1000:0,preservation:victory?Math.round(camp.fraction*1000):0,siege:camp.siegeStopped*40,speed:victory?Math.max(0,Math.round(600-time))*2:0};
 return{parts,total:Object.values(parts).reduce((sum,n)=>sum+n,0)};
}
