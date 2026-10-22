import {ABILITY_TUNING as T,WEAPONS} from './config';
import {HERO_ABILITIES,validHeroAbilities,isAbilityHero,type HeroAbilityId} from './hero-abilities';
import type {ArenaScene,Enemy,Bullet} from './combat';
export const abilityBoss=(e:Pick<Enemy,'type'>)=>['boss','commander','shooterBoss'].includes(e.type);
export const abilityElite=(e:Pick<Enemy,'type'>)=>abilityBoss(e)||['elite','brute','armoured','cleaver','abomination'].includes(e.type);
const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
const angularDistance=(a:number,b:number)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
type Point={x:number;y:number};
type Pulse=Point&{age:number;radius:number;color:number;kind:'crescent'|'ring'|'stars';angle:number};
/** Two equipped skills with independent clocks. No duplicated shots or unbounded effect objects. */
export class HeroAbilityCombat{
 readonly equipped;readonly cooldowns:[number,number]=[0,0];
 drawTime=0;drawAim=0;markTime=0;marked?:Enemy;markHits=0;private markSequence=-1;private markFinished=false;
 beacon?:Point&{life:number;redirects:number};charge?:Point&{origin:Point;target:Point;flight:number;fuse:number};
 bulwarkTime=0;energy=0;absorbed=0;marchTime=0;
 private pulses:Pulse[]=[];private graphics;private disposed=false;private onShutdown=()=>this.destroy();
 constructor(private s:ArenaScene){if(!isAbilityHero(s.hero))throw Error('This hero uses its existing ability system');this.equipped=validHeroAbilities(s.hero,s.save.heroAbilities?.[s.hero]);this.graphics=s.add.graphics().setDepth(4.4);s.events.once('shutdown',this.onShutdown);}
 get actionLocked(){return this.s.hero==='samurai'&&(this.drawTime>0||this.s.counter>0);}
 get speedMultiplier(){return this.marchTime>0?T.march.speed:1;}
 incomingDamage(value:number){return this.marchTime>0?value*(1-T.march.protection):value;}
 active(id:HeroAbilityId){return id==='draw'?this.drawTime>0:id==='mark'?this.markTime>0:id==='beacon'?!!this.beacon:id==='breach'?!!this.charge:id==='bulwark'?this.bulwarkTime>0:id==='march'?this.marchTime>0:id==='counter'?this.s.counter>0:id==='overdrive'?this.s.overdrive>0:false;}
 activate(slot:number,dx=0,dy=0){const s=this.s;if(this.disposed||slot!==0&&slot!==1||s.paused||s.ended||s.countdown>0||this.actionLocked||this.cooldowns[slot]>0)return false;
 const id=this.equipped[slot],aim=dx||dy?Math.atan2(dy,dx):s.angle;
 // Mark does not waste a cooldown when no target exists.
 let target:Enemy|undefined;
 if(id==='mark'){const nearby=s.enemies.filter(e=>e.active&&distance(s,e)<=T.mark.range);target=nearby.filter(abilityElite).sort((a,b)=>distance(s,a)-distance(s,b))[0]||nearby.sort((a,b)=>distance(s,a)-distance(s,b))[0];if(!target){s.notifyCombat('NO TARGET IN RANGE');return false;}}
 if(id==='counter'||id==='overdrive'||id==='slam'){if(s.ability>0)return false;s.activateLegacy(dx,dy);this.cooldowns[slot]=s.ability;return true;}
 this.cooldowns[slot]=HERO_ABILITIES[id].cooldown*Math.max(.1,1-s.u('cooldown')*.15)*(s.options.build==='mobility'?.9:1);
 if(id==='draw'){this.drawTime=T.draw.window;this.drawAim=aim;s.angle=aim;s.swing=0;s.audio.play('lotus-guard');}
 if(id==='mark'){this.marked=target;this.markTime=T.mark.duration;this.markHits=0;this.markSequence=-1;this.markFinished=false;s.audio.play('keen-hit');}
 if(id==='beacon'){const p=s.moveOnGround(s.x,s.y,Math.cos(aim)*T.beacon.deployRange,Math.sin(aim)*T.beacon.deployRange,12);this.beacon={...p,life:T.beacon.duration,redirects:0};s.audio.play('ricochet-chime');}
 if(id==='breach'){const target=s.moveOnGround(s.x,s.y,Math.cos(aim)*T.breach.throwRange,Math.sin(aim)*T.breach.throwRange,12);this.charge={x:s.x,y:s.y,origin:{x:s.x,y:s.y},target,flight:T.breach.flight,fuse:T.breach.fuse};s.audio.play('reload-swish');}
 if(id==='bulwark'){s.angle=aim;this.bulwarkTime=T.bulwark.duration;this.energy=0;this.absorbed=0;s.audio.play('tank-block');}
 if(id==='march'){this.marchTime=T.march.duration;s.audio.play('tank-block');}
 s.notifyCombat(HERO_ABILITIES[id].name.toUpperCase());return true;
 }
 private pulse(x:number,y:number,radius:number,color:number,kind:Pulse['kind']='ring',angle=this.s.angle){this.pulses.push({x,y,radius,color,kind,angle,age:0});if(this.pulses.length>12)this.pulses.shift();}
 private damage(e:Enemy,base:number,id:HeroAbilityId){this.s.hit(e,base,0,false,false,HERO_ABILITIES[id].name);}
 private push(e:Enemy,origin:Point,amount:number,eliteScale=0){if(!e.active||abilityBoss(e))return;if(abilityElite(e))amount*=eliteScale;if(amount<=0)return;let dx=e.x-origin.x,dy=e.y-origin.y,d=Math.hypot(dx,dy);if(d<.001){dx=Math.cos(this.s.angle);dy=Math.sin(this.s.angle);d=1;}const p=this.s.moveOnGround(e.x,e.y,dx/d*amount,dy/d*amount,e.r);e.x=p.x;e.y=p.y;}
 parry(angle:number){if(this.s.paused||this.s.ended||this.s.countdown>0||this.drawTime<=0||angularDistance(angle,this.drawAim)>T.draw.arc/2)return false;const s=this.s;this.drawTime=0;s.protect(.25);for(const e of [...s.enemies])if(e.active&&distance(s,e)<=T.draw.range+e.r&&angularDistance(Math.atan2(e.y-s.y,e.x-s.x),this.drawAim)<=T.draw.arc/2)this.damage(e,Math.min(T.draw.damageCap,WEAPONS[s.weapon].damage*T.draw.damage),'draw');this.pulse(s.x,s.y,T.draw.range,0xf1bad5,'crescent',this.drawAim);s.audio.play('lotus-counter');s.notifyCombat('PERFECT DRAW');return true;}
 onHit(e:Enemy,weaponHit:boolean){if(this.markFinished||!weaponHit||this.marked!==e||!e.active||this.markTime<=0||this.markSequence===this.s.attackSequence)return;this.markSequence=this.s.attackSequence;this.markHits++;if(this.markHits>=T.mark.hits){this.markFinished=true;this.pulse(e.x,e.y,45,0xf0c680,'stars');this.damage(e,abilityBoss(e)?T.mark.bossFinisher:T.mark.finisher,'mark');this.s.audio.play('lotus-counter');}}
 onKill(e:Enemy){if(this.marked!==e||this.markTime<=0)return;this.marked=undefined;this.markTime=0;this.markHits=0;for(const other of this.s.enemies)if(other!==e&&distance(e,other)<=T.mark.pulseRadius+other.r)this.push(other,e,T.mark.push);this.pulse(e.x,e.y,T.mark.pulseRadius,0xf1bad5);}
 redirect(b:Bullet){const beacon=this.beacon;if(this.s.paused||this.s.ended||this.s.countdown>0||!beacon||beacon.redirects>=T.beacon.maxRedirects||b.beaconRedirected||b.hostile||b.reflected||b.explosive||b.kind!=='round'||b.source==='Crossfire'||b.bounces>=T.beacon.maxBounces||distance(b,beacon)>T.beacon.radius)return false;const target=this.s.enemies.filter(e=>e.active&&!b.hit.has(e)&&distance(beacon,e)<=T.beacon.targetRange).sort((a,c)=>distance(b,a)-distance(b,c))[0];if(!target)return false;const speed=Math.hypot(b.vx,b.vy),aim=Math.atan2(target.y-b.y,target.x-b.x);b.vx=Math.cos(aim)*speed;b.vy=Math.sin(aim)*speed;b.beaconRedirected=true;b.bounces++;beacon.redirects++;this.pulse(b.x,b.y,14,0xffda8d,'stars');if(beacon.redirects===1)this.s.audio.play('ricochet-chime');return true;}
 absorb(b:Bullet){if(this.s.paused||this.s.ended||this.s.countdown>0||this.bulwarkTime<=0||!b.hostile||b.kind!=='round'||b.explosive||distance(this.s,b)>T.bulwark.radius||angularDistance(Math.atan2(b.y-this.s.y,b.x-this.s.x),this.s.angle)>T.bulwark.halfAngle)return false;b.active=false;this.absorbed++;this.energy=Math.min(T.bulwark.energyCap,this.energy+Math.max(0,b.damage));this.pulse(b.x,b.y,14,0xa5e4d2,'stars');if(this.absorbed>=T.bulwark.maxProjectiles)this.release();else if(this.absorbed===1)this.s.audio.play('tank-return');return true;}
 private release(){this.bulwarkTime=0;const s=this.s,damage=T.bulwark.baseDamage+this.energy*T.bulwark.energyScale;for(const e of [...s.enemies])if(e.active&&distance(s,e)<=T.bulwark.radiusBurst+e.r){this.damage(e,damage,'bulwark');this.push(e,s,T.bulwark.push,.25);}this.pulse(s.x,s.y,T.bulwark.radiusBurst,0x9ee5d0);this.energy=0;this.absorbed=0;s.audio.play('tank-slam');}
 private explode(){const c=this.charge!;for(const e of [...this.s.enemies])if(e.active&&distance(c,e)<=T.breach.radius+e.r){this.damage(e,T.breach.damage,'breach');this.push(e,c,T.breach.push,T.breach.elitePush);}this.pulse(c.x,c.y,T.breach.radius,0xf3ca81);this.s.audio.play('verdict-pop');this.charge=undefined;}
 tickCooldowns(dt:number){for(const i of [0,1] as const)this.cooldowns[i]=Math.max(0,this.cooldowns[i]-dt);}
 update(dt:number){if(this.disposed||this.s.paused)return;if(this.s.ended){this.clear();return;}this.tickCooldowns(dt);this.pulses=this.pulses.filter(p=>(p.age+=dt)<.55);this.drawTime=Math.max(0,this.drawTime-dt);
 if(this.markTime>0){this.markTime=Math.max(0,this.markTime-dt);if(!this.marked?.active||this.markTime===0){this.marked=undefined;this.markTime=0;this.markHits=0;}}
 if(this.beacon&&(this.beacon.life-=dt)<=0)this.beacon=undefined;
 if(this.charge){const c=this.charge,flight=Math.min(dt,c.flight);c.flight=Math.max(0,c.flight-flight);const p=1-c.flight/T.breach.flight;c.x=c.origin.x+(c.target.x-c.origin.x)*p;c.y=c.origin.y+(c.target.y-c.origin.y)*p;c.fuse-=dt-flight;if(c.flight<=0&&c.fuse<=0)this.explode();}
 if(this.bulwarkTime>0){this.bulwarkTime=Math.max(0,this.bulwarkTime-dt);if(this.bulwarkTime===0)this.release();}
 if(this.marchTime>0){this.marchTime=Math.max(0,this.marchTime-dt);for(const e of this.s.enemies)if(distance(this.s,e)<=T.march.pushRadius+e.r)this.push(e,this.s,Math.min(T.march.pushSpeed*dt,Math.max(0,T.march.pushRadius+e.r-distance(this.s,e))));if(this.marchTime===0){for(const e of [...this.s.enemies])if(e.active&&distance(this.s,e)<=T.march.stompRadius+e.r){this.damage(e,T.march.damage,'march');this.push(e,this.s,T.march.push,.25);}this.pulse(this.s.x,this.s.y,T.march.stompRadius,0xd2dda1);this.s.audio.play('tank-slam');}}
 }
 clear(){this.drawTime=0;this.markTime=0;this.marked=undefined;this.markHits=0;this.beacon=undefined;this.charge=undefined;this.bulwarkTime=0;this.energy=0;this.absorbed=0;this.marchTime=0;this.pulses=[];this.graphics.clear();}
 destroy(){if(this.disposed)return;this.clear();this.disposed=true;this.s.events.off('shutdown',this.onShutdown);this.graphics.destroy();}
 render(){if(this.disposed)return;const g=this.graphics,s=this.s;g.clear();if(s.ended)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,quiet=reduced||s.save.settings.mapView===2;
 const diamond=(x:number,y:number,r:number,color:number,alpha=.9)=>{g.fillStyle(color,alpha);g.fillPoints([{x,y:y-r},{x:x+r,y},{x,y:y+r},{x:x-r,y}],true);};
 if(this.drawTime>0){g.lineStyle(3,0xf1c4db,.8);g.beginPath();g.arc(s.x,s.y,48,this.drawAim-T.draw.arc/2,this.drawAim+T.draw.arc/2);g.strokePath();diamond(s.x+Math.cos(this.drawAim)*48,s.y+Math.sin(this.drawAim)*48,5,0xffdfab);}
 if(this.marked&&this.markTime>0){const e=this.marked;g.lineStyle(2,0xf1bad5,.85);g.strokeCircle(e.x,e.y,e.r+9);for(let i=0;i<T.mark.hits;i++)diamond(e.x+(i-1.5)*9,e.y-e.r-19,3,i<this.markHits?0xffe3a2:0x817088);g.lineStyle(2,0xf1bad5,.7);g.beginPath();g.arc(e.x,e.y,e.r+13,-Math.PI/2,-Math.PI/2+Math.PI*2*this.markTime/T.mark.duration);g.strokePath();}
 if(this.beacon){const b=this.beacon;g.lineStyle(1.5,0xf0c980,.4);g.strokeCircle(b.x,b.y,T.beacon.radius);g.fillStyle(0x1b343c,1);g.fillRoundedRect(b.x-14,b.y-18,28,31,8);g.lineStyle(2,0xf0d08e,.9);g.strokeRoundedRect(b.x-14,b.y-18,28,31,8);diamond(b.x,b.y-4,8,0xffd58c);g.fillStyle(0x263640,1);g.fillCircle(b.x-4,b.y-4,1.5);g.fillCircle(b.x+4,b.y-4,1.5);g.lineStyle(2,0xc4ddee,.8);g.lineBetween(b.x-22,b.y-7,b.x-17,b.y-12);g.lineBetween(b.x+22,b.y-7,b.x+17,b.y-12);}
 if(this.charge){const c=this.charge,lift=c.flight>0?Math.sin((1-c.flight/T.breach.flight)*Math.PI)*25:0;g.lineStyle(1.5,0xffd08e,.5);g.strokeCircle(c.target.x,c.target.y,T.breach.radius);g.fillStyle(0xe9ae65,1);g.fillRoundedRect(c.x-10,c.y-10-lift,20,20,5);g.lineStyle(2,0xffe4ac,.9);g.beginPath();g.arc(c.x,c.y-lift,16,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(0,c.fuse/T.breach.fuse));g.strokePath();}
 if(this.bulwarkTime>0){g.lineStyle(quiet?6:9,0x73d9bd,.3);g.beginPath();g.arc(s.x,s.y,T.bulwark.radius,s.angle-T.bulwark.halfAngle,s.angle+T.bulwark.halfAngle);g.strokePath();g.lineStyle(2,0xd0f2cb,.95);g.strokePath();for(let i=0;i<Math.min(8,this.absorbed);i++)diamond(s.x-21+i*6,s.y-42,2.5,0xffdfa0);}
 if(this.marchTime>0){g.lineStyle(2,0xc6dcab,.7);g.strokeEllipse(s.x,s.y+24,70,22);for(const side of [-1,1]){g.lineStyle(3,0xa6ddc7,.9);g.lineBetween(s.x+side*27,s.y-12,s.x+side*33,s.y+16);}diamond(s.x,s.y-43,7,0xd4e5a9);}
 for(const p of this.pulses){const progress=Math.min(1,p.age/.55),r=reduced?p.radius:p.radius*(.25+progress*.75),alpha=(1-progress)*.8;g.lineStyle(quiet?2:3,p.color,alpha);g.beginPath();g.arc(p.x,p.y,r,p.kind==='crescent'?p.angle-T.draw.arc/2:0,p.kind==='crescent'?p.angle+T.draw.arc/2:Math.PI*2);g.strokePath();for(let i=0;i<(quiet?3:6);i++){const a=p.kind==='crescent'?p.angle+(i/5-.5)*T.draw.arc:i*Math.PI/3;diamond(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,Math.max(1,4*(1-progress)),p.color,alpha);}}
 }
}
