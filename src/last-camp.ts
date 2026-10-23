export type CampReward='repair'|'strength'|'defense';
export const CAMP_REWARDS=[{id:'repair' as const,name:'Repair camp',description:'Restore 25% of maximum camp health.',icon:'✚'},{id:'strength' as const,name:'Strengthen survivor',description:'+10% damage for the rest of this run.',icon:'⚔'},{id:'defense' as const,name:'Reinforce barricades',description:'Camp takes 8% less damage. Maximum 40%.',icon:'▣'}];
export class LastCamp {
 readonly x=600;readonly y=380;readonly max=600;hp=600;damageBonus=0;armor=0;lastRewardWave=0;hitAt=-10;
 get fraction(){return Math.max(0,this.hp/this.max);}
 hurt(damage:number,time:number){this.hp=Math.max(0,this.hp-Math.max(0,damage)*(1-this.armor));this.hitAt=time;return this.hp===0;}
 reward(id:CampReward,wave:number){if(wave<=this.lastRewardWave||wave>=10||!CAMP_REWARDS.some(r=>r.id===id))return false;this.lastRewardWave=wave;if(id==='repair')this.hp=Math.min(this.max,this.hp+this.max*.25);if(id==='strength')this.damageBonus+=.1;if(id==='defense')this.armor=Math.min(.4,this.armor+.08);return true;}
 siege(type:string,serial:number,wave:number){return ['brute','armoured'].includes(type)||wave>=3&&type==='basic'&&serial%5===0;}
 entrance(wave:number){return (wave-1)%4;}
 spawn(side:number,offset:number){return{x:this.x+(side===0?-570:side===1?570:(offset-.5)*900),y:this.y+(side===2?-410:side===3?410:(offset-.5)*650)};}
 constrain(x:number,y:number,r=17){x=Math.max(this.x-615+r,Math.min(this.x+615-r,x));y=Math.max(this.y-450+r,Math.min(this.y+450-r,y));const dx=x-this.x,dy=y-this.y,d=Math.hypot(dx,dy),minimum=62+r;if(d<minimum){x=this.x+(dx||1)/(d||1)*minimum;y=this.y+dy/(d||1)*minimum;}return{x,y};}
}
