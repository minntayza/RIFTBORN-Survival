import {pyusawhtiArrowOrigin,ARCHER_DRAW_TIME} from './pyusawhti-rig';
import type {ArenaScene, Enemy} from './combat';
import {PYUSAWHTI_SKILLS,validPyusawhtiLoadout,type PyusawhtiSkill} from './pyusawhti';
import {WEAPONS} from './config';

type Arrow = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	angle: number;
	damage: number;
	pierce: number;
	remainingRange: number;
	sunburst?: boolean;
	giant?: boolean;
	hitEnemies: Set<Enemy>;
 trailDistance?:number;
};

type SunBurst = {
	x: number;
	y: number;
	age: number;
	maxAge: number;
	radius: number;
};

type SolarLaserBeam = {
	x: number;
	y: number;
	angle: number;
	length: number;
	width: number;
	duration: number;
	maxDuration: number;
	damage: number;
	hitEnemies: Set<Enemy>;
};

export class PyusawhtiCombat {
	readonly equipped: [PyusawhtiSkill, PyusawhtiSkill];
	cooldowns: [number, number] = [0, 0];
	windFocusTime = 0;
 legendTime=0;
 private legendCooldown=0;
 private sunburstCooldown=0;
 private bowShots=0;
 private fieldTick=0;
 readonly fields:{x:number;y:number;life:number;radius:number;kind:'gale'|'sun'}[]=[];
	readonly arrows: Arrow[] = [];
 private glints:{x:number;y:number;age:number;crown:boolean}[]=[];
 private releases:{x:number;y:number;angle:number;age:number}[]=[];
 private pendingShots:{remaining:number;aim:number;arrows:Arrow[]}[]=[];
	readonly bursts: SunBurst[] = [];
	readonly laserBeams: SolarLaserBeam[] = [];
	private ground;
	private effects;

	constructor(private s: ArenaScene) {
		this.equipped = validPyusawhtiLoadout(s.save.pyusawhtiSkills);
		this.ground = s.add.graphics().setDepth(1.2);
		this.effects = s.add.graphics().setDepth(5);
	}

 private shotAim=0;
 /** Hold the pose on the same direction as the released arrows during recovery. */
 get lockedAim(){return this.s.swing>0?this.shotAim:undefined;}

	get speedMultiplier() {
		return this.windFocusTime > 0 ? 1.25 : 1;
	}

	get attackRateMultiplier() {
		return (this.windFocusTime > 0 ? 1.8 : 1)*(this.legendTime>0?1.25:1);
	}

	activate(slot: number, dx = 0, dy = 0) {
		const s = this.s;
		if ((slot !== 0 && slot !== 1) || s.hero !== 'pyusawhti' || s.paused || s.ended || s.countdown > 0 || this.cooldowns[slot] > 0) {
			return false;
		}
		const id = this.equipped[slot];
		const angle = dx || dy ? Math.atan2(dy, dx) : s.angle;
		this.cooldowns[slot] = PYUSAWHTI_SKILLS[id].cooldown * (1-Math.min(3,s.u('windfocuscard'))*.05) * (s.options.build === 'mobility' ? 0.9 : 1);

		if(id!=='windfocus'){this.shotAim=angle;s.angle=angle;s.attackSequence++;s.swing=.28;}
		if (id === 'multishot') {
			const baseDmg = (WEAPONS[s.weapon]?.damage || 28) * 1.1;
			const flankBonus = Math.min(3,s.u('arrowstorm')) * 2;
			const totalArrows = 7 + flankBonus;
			for (let i = 0; i < totalArrows; i++) {
				const a = angle + (i - Math.floor(totalArrows / 2)) * 0.13;
				const speed = 720 * (1 + Math.min(3,s.u('windfocuscard')) * 0.15);
				this.arrows.push({
					x: pyusawhtiArrowOrigin(s.x,s.y,angle).x,
					y: pyusawhtiArrowOrigin(s.x,s.y,angle).y,
					vx: Math.cos(a) * speed,
					vy: Math.sin(a) * speed,
					angle: a,
					damage: baseDmg * (i<flankBonus/2||i>=totalArrows-flankBonus/2?.35:1),
					pierce: s.evolved('piercingeye') ? Infinity : 3 + Math.min(3,s.u('piercingeye')),
					remainingRange: 650,
					sunburst: Math.random() < Math.min(3,s.u('sunburstcard')) * .15,
					hitEnemies: new Set()
				});
			}
			s.audio.play('shotgun');
			s.notifyCombat('GALE VOLLEY');
		} else if (id === 'windfocus') {
			this.windFocusTime = 5;
			s.audio.play('overdrive');
			s.notifyCombat('MOONWIND FOCUS');
		} else if (id === 'banepierce') {
			// Five-Bane Pierce: Devastating 96px-wide (3 enemies wide) Solar Laser Beam Arrow
			const baseDmg = (WEAPONS[s.weapon]?.damage || 28) * 5.4;
			const beamLen = 920;
			const beamWidth = 96; // 3 enemies wide (~96px)
			const startX = pyusawhtiArrowOrigin(s.x,s.y,angle).x;
			const startY = pyusawhtiArrowOrigin(s.x,s.y,angle).y;

			this.laserBeams.push({
				x: startX,
				y: startY,
				angle,
				length: beamLen,
				width: beamWidth,
				duration: 0.65,
				maxDuration: 0.65,
				damage: baseDmg,
				hitEnemies: new Set()
			});

			// Giant Vanguard Arrow spearheading the laser beam
			this.arrows.push({
				x: startX,
				y: startY,
				vx: Math.cos(angle) * 1050,
				vy: Math.sin(angle) * 1050,
				angle,
				damage: baseDmg * 0.5,
				pierce: 99,
				remainingRange: beamLen,
				giant: true,
				sunburst: true,
				hitEnemies: new Set()
			});

			// Terminal solar explosion at the far end of the laser
			const endX = startX + Math.cos(angle) * (beamLen * 0.88);
			const endY = startY + Math.sin(angle) * (beamLen * 0.88);
			this.explodeSun(endX, endY, 190, baseDmg * 0.7);

			s.cameras.main.shake(200, 0.007);
			s.audio.play('tank-slam');
			s.notifyCombat('CROWNPIERCER');
		}
		return true;
	}

	bowAttack() {
		const s = this.s;
		if (s.paused || s.ended || s.swing > 0) return;
		this.shotAim=s.angle;
		s.attackSequence++;
		const w = WEAPONS[s.weapon];
		const speed = (s.weapon === 'solarcrossbow' ? 820 : s.weapon === 'greatbow' ? 580 : 700) * (1 + Math.min(3,s.u('windfocuscard')) * 0.15);
		const pierce = s.evolved('piercingeye') ? Infinity : (this.windFocusTime > 0 ? 12 : s.weapon === 'greatbow' ? 2 : 1) + s.u('pierce') + Math.min(3,s.u('piercingeye'));
		const damage = (w?.damage || 28) * (this.windFocusTime > 0 ? 1.2 : 1) * (1 + s.u('damage') * 0.15);

		s.swing = (w?.cooldown || 0.35) / this.attackRateMultiplier;

		const angles = [s.angle];
		this.bowShots++;
		if (s.evolved('arrowstorm') && this.bowShots%4===0) {
			for (let i = 1; i < 8; i++) angles.push(s.angle + (i * Math.PI * 2 / 8));
		} else if (s.u('arrowstorm') > 0) {
			const extra = Math.min(3,s.u('arrowstorm'));
			for (let i = 1; i <= extra; i++) {
				angles.push(s.angle - i * 0.12);
				angles.push(s.angle + i * 0.12);
			}
		}

		const shotArrows:Arrow[]=[];
		for (const [index,a] of angles.entries()) {
			shotArrows.push({
				x: pyusawhtiArrowOrigin(s.x,s.y,s.angle).x,
				y: pyusawhtiArrowOrigin(s.x,s.y,s.angle).y,
				vx: Math.cos(a) * speed,
				vy: Math.sin(a) * speed,
				angle: a,
				damage:damage*(index===0?1:.35),
				pierce,
				remainingRange: w?.range || 650,
				sunburst: s.weapon === 'greatbow' || Math.random() < Math.min(3,s.u('sunburstcard')) * .15,
				hitEnemies: new Set()
			});
		}

		this.pendingShots.push({remaining:ARCHER_DRAW_TIME,aim:s.angle,arrows:shotArrows});
	}

 releasePendingShots(dt:number){
  if(this.s.paused||this.s.ended)return;
  for(let i=this.pendingShots.length-1;i>=0;i--){const shot=this.pendingShots[i];shot.remaining-=dt;if(shot.remaining>1e-8)continue;
   const origin=pyusawhtiArrowOrigin(this.s.x,this.s.y,shot.aim);
   for(const arrow of shot.arrows){arrow.x=origin.x;arrow.y=origin.y;this.arrows.push(arrow);}
   this.releases.push({...origin,angle:shot.aim,age:0});
   this.s.audio.play('reload-swish');this.pendingShots.splice(i,1);
  }
 }

 private damageEnemy(e:Enemy,damage:number,knockback:number){
  const elite=['elite','boss','shooterBoss','commander'].includes(e.type),alive=e.hp>0;
  this.s.hit(e,damage*(elite?1+Math.min(3,this.s.u('beasthunter'))*.15:1),knockback);
  if(alive&&e.hp<=0&&elite&&this.s.evolved('beasthunter')&&this.legendCooldown<=0){
   this.legendTime=3;this.legendCooldown=10;this.s.notifyCombat('LEGEND OF BAGAN · +25% ATTACK SPEED');
  }
 }
 private explodeSun(x:number,y:number,radius:number,damage:number){
  this.bursts.push({x,y,age:0,maxAge:.65,radius});
  for(const e of this.s.enemies)if(e.active&&Math.hypot(e.x-x,e.y-y)<=radius+e.r)this.damageEnemy(e,damage,45);
  this.s.audio.play('tank-slam');
 }
 private arrowSunburst(a:Arrow){
  if(!a.sunburst||this.sunburstCooldown>0)return;
  this.sunburstCooldown=.5;
  const evolved=this.s.evolved('sunburstcard');
  this.explodeSun(a.x,a.y,evolved?110:85,a.damage*.9);
  if(evolved)this.addField(a.x,a.y,'sun');
 }
 private addField(x:number,y:number,kind:'gale'|'sun'){
  if(this.fields.length>=80)this.fields.shift();
  this.fields.push({x,y,kind,life:kind==='gale'?.65:2,radius:kind==='gale'?20:55});
 }
 private updateFields(dt:number){
  for(let i=this.fields.length-1;i>=0;i--){this.fields[i].life-=dt;if(this.fields[i].life<=0)this.fields.splice(i,1);}
  this.fieldTick-=dt;if(this.fieldTick>0)return;this.fieldTick=.25;
  const base=WEAPONS[this.s.weapon]?.damage||28;
  // One strongest field hit per enemy per tick; overlapping trails never stack.
  for(const e of this.s.enemies){if(!e.active)continue;let factor=0;
   for(const f of this.fields)if(Math.hypot(e.x-f.x,e.y-f.y)<=f.radius+e.r)factor=Math.max(factor,f.kind==='sun'?.2:.15);
   if(factor)this.damageEnemy(e,base*factor*.25,0);
  }
 }

	update(dt: number) {
		const s = this.s;
		if (s.ended) {
			this.clear();
			return;
		}
		if (s.paused) return;

  this.sunburstCooldown=Math.max(0,this.sunburstCooldown-dt);
  this.legendCooldown=Math.max(0,this.legendCooldown-dt);this.legendTime=Math.max(0,this.legendTime-dt);
  this.updateFields(dt);
  this.releasePendingShots(dt);
  for(const list of [this.glints,this.releases]){for(let i=list.length-1;i>=0;i--){list[i].age+=dt;if(list[i].age>.32)list.splice(i,1);}}

		for (let i = 0; i < 2; i++) {
			this.cooldowns[i as 0 | 1] = Math.max(0, this.cooldowns[i as 0 | 1] - dt);
		}
		if (this.windFocusTime > 0) {
			this.windFocusTime = Math.max(0, this.windFocusTime - dt);
		}

		// Update Solar Bursts
		for (let i = this.bursts.length - 1; i >= 0; i--) {
			this.bursts[i].age += dt;
			if (this.bursts[i].age >= this.bursts[i].maxAge) {
				this.bursts.splice(i, 1);
			}
		}

		// Update Solar Laser Beams: 96px wide corridor damaging everything in its path
		for (let i = this.laserBeams.length - 1; i >= 0; i--) {
			const b = this.laserBeams[i];
			b.duration -= dt;

			const lx = Math.cos(b.angle);
			const ly = Math.sin(b.angle);
			const nx = -Math.sin(b.angle);
			const ny = Math.cos(b.angle);
			const halfWidth = b.width / 2;

			for (const e of s.enemies) {
				if (!e.active || b.hitEnemies.has(e)) continue;
				const dx = e.x - b.x;
				const dy = e.y - b.y;
				const proj = dx * lx + dy * ly;
				if (proj >= -20 && proj <= b.length + e.r) {
					const perp = Math.abs(dx * nx + dy * ny);
					if (perp <= halfWidth + e.r) {
						b.hitEnemies.add(e);
      this.glints.push({x:e.x,y:e.y,age:0,crown:true});
						this.damageEnemy(e,b.damage,85);
						e.stagger = Math.max(e.stagger || 0, 0.85);
						s.burst(e.x, e.y, 0xffd700, 10);
					}
				}
			}

			if (b.duration <= 0) {
				this.laserBeams.splice(i, 1);
			}
		}

		// Update Arrows
		for (let i = this.arrows.length - 1; i >= 0; i--) {
			const a = this.arrows[i];
			const stepDist = Math.hypot(a.vx * dt, a.vy * dt);
			a.x += a.vx * dt;
			a.y += a.vy * dt;
			a.remainingRange -= stepDist;
   if(s.evolved('windfocuscard')){a.trailDistance=(a.trailDistance||0)+stepDist;if(a.trailDistance>=28){a.trailDistance%=28;this.addField(a.x,a.y,'gale');}}

			for (const e of s.enemies) {
				if (!e.active || a.hitEnemies.has(e)) continue;
				const hitRadius = e.r + (a.giant ? 24 : 8);
				if (Math.hypot(e.x - a.x, e.y - a.y) <= hitRadius) {
					a.hitEnemies.add(e);
     this.glints.push({x:e.x,y:e.y,age:0,crown:!!a.giant});
					this.damageEnemy(e,a.damage,a.giant?65:18);
     if(!a.giant)this.arrowSunburst(a);
					s.burst(a.x, a.y, a.giant ? 0xf4d589 : 0xb5fff2, a.giant ? 6 : 2);
					a.pierce--;
					if (a.giant) {
						e.stagger = Math.max(e.stagger, 0.5);
					}
					if (a.pierce <= 0) break;
				}
			}

			if (a.pierce <= 0 || a.remainingRange <= 0) {
				if (a.giant) {
					this.explodeSun(a.x, a.y, a.giant ? 175 : 85, a.damage * 0.9);
				}
				this.arrows.splice(i, 1);
			}
		}
	}

	clear() {
  this.pendingShots.length=0;this.glints.length=0;this.releases.length=0;this.fields.length=0;this.legendTime=0;this.legendCooldown=0;this.sunburstCooldown=0;this.bowShots=0;this.fieldTick=0;
		this.arrows.length = 0;
		this.bursts.length = 0;
		this.laserBeams.length = 0;
		this.windFocusTime = 0;
	}

 render(time:number){
  const g=this.effects,f=this.ground;g.clear();f.clear();
  const teal=0x6ce8cf,silver=0xe9fbff,gold=0xf4d589;
  // All arrow shapes are built in flight coordinates, including diagonal shots.
  const line=(x:number,y:number,a:number,u:number,v:number,U:number,V:number,w:number,c:number,alpha=1)=>{
   const dx=Math.cos(a),dy=Math.sin(a);g.lineStyle(w,c,alpha);g.lineBetween(x+dx*u-dy*v,y+dy*u+dx*v,x+dx*U-dy*V,y+dy*U+dx*V);
  };
  const star=(x:number,y:number,r:number,alpha:number,c=silver)=>{
   g.fillStyle(c,alpha);g.fillTriangle(x,y-r,x-r*.28,y,x+r*.28,y);g.fillTriangle(x,y+r,x-r*.28,y,x+r*.28,y);
   g.fillTriangle(x-r*.65,y,x,y-r*.2,x,y+r*.2);g.fillTriangle(x+r*.65,y,x,y-r*.2,x,y+r*.2);
  };
  if(this.windFocusTime>0){
   const x=this.s.x,y=this.s.y;
   f.fillStyle(teal,.07);f.fillEllipse(x,y+15,65,24);
   // Two silk-like wind ribbons stay below the face and lead to the bow.
   for(let band=0;band<2;band++){
    for(let i=0;i<24;i++){
     const a=time*2.5+band*Math.PI+i*.065,b=a+.075;
     f.lineStyle(1.3+i/18,band? silver:teal,.12+i/45);
     f.lineBetween(x+Math.cos(a)*31,y+14+Math.sin(a)*11,x+Math.cos(b)*31,y+14+Math.sin(b)*11);
    }
   }
   // The raised-bow attachment is valid only during a committed shot.
   if(this.s.swing>0){
   const bow=pyusawhtiArrowOrigin(x,y,this.lockedAim??this.s.angle);
   for(let i=0;i<2;i++){
    const a=time*2+i*Math.PI,px=x+Math.cos(a)*24,py=y+Math.sin(a)*9;
    g.lineStyle(1,teal,.35);g.lineBetween(px,py,bow.x,bow.y);star(px,py,2.5,.7,teal);
   }
   star(bow.x,bow.y,4+Math.sin(time*5),.9);
   }
  }
  for(const b of this.laserBeams){
   const t=1-b.duration/b.maxDuration,fade=Math.pow(1-t,1.5);
   // Translucent full-width corridor preserves the existing damage footprint.
   line(b.x,b.y,b.angle,0,0,b.length,0,b.width,teal,fade*.12);
   line(b.x,b.y,b.angle,0,0,b.length,0,18,teal,fade*.3);
   line(b.x,b.y,b.angle,0,0,b.length,0,5,silver,fade*.95);
   for(const side of [-1,1]){
    line(b.x,b.y,b.angle,0,side*b.width/2,b.length,side*b.width/2,1.2,teal,fade*.55);
    // Feathered chevrons sweep down the corridor without hiding enemies.
    for(let i=0;i<7;i++){
     const d=((i/7+t*.7)%1)*b.length;
     line(b.x,b.y,b.angle,d-22,side*23,d,0,1.5,silver,fade*.6);
    }
   }
   star(b.x,b.y,18*fade,fade,gold);
  }
  for(const field of this.fields){
   const alpha=Math.min(1,field.life/.4),r=field.radius;
   f.fillStyle(field.kind==='sun'?gold:teal,.06*alpha);f.fillCircle(field.x,field.y,r);
   f.lineStyle(1.4,field.kind==='sun'?gold:teal,.5*alpha);f.beginPath();f.arc(field.x,field.y,r*.7,time*3,time*3+4.4);f.strokePath();
  }
  if(this.legendTime>0)star(this.s.x,this.s.y-40,4,.8,gold);
  for(const b of this.bursts){
   const t=b.age/b.maxAge,fade=1-t,r=b.radius*Math.min(1,.25+t*1.7);
   f.fillStyle(teal,fade*.045);f.fillCircle(b.x,b.y,r);
   g.lineStyle(2,teal,fade*.6);g.strokeCircle(b.x,b.y,r);
   g.lineStyle(1,silver,fade*.5);g.strokeCircle(b.x,b.y,r*.85);
   for(let i=0;i<8;i++){const a=i*Math.PI/4;star(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r,4*fade,fade,i%2?gold:silver);}
  }
  for(const a of this.arrows){
   if(a.giant){
    // The icon's crowned silver arrow, drawn in flight coordinates so its
    // leading point remains exactly at the projectile collision position.
    const dx=Math.cos(a.angle),dy=Math.sin(a.angle);
    const point=(u:number,v:number)=>({x:a.x+dx*u-dy*v,y:a.y+dy*u+dx*v});
    const poly=(coords:number[][],color:number,outline=true)=>{
     const pts=coords.map(([u,v])=>point(u,v));g.fillStyle(color,1);g.beginPath();
     g.moveTo(pts[0].x,pts[0].y);for(const p of pts.slice(1))g.lineTo(p.x,p.y);g.closePath();g.fillPath();
     if(outline){g.lineStyle(1.6,0x142b32,1);g.strokePath();}
    };
    // Curved wind streamers echo the crescent trails around the icon.
    for(const side of [-1,1])for(let i=0;i<20;i++){
     const t=i/20,T=(i+1)/20;
     const v=(q:number)=>side*(4+Math.sin(q*Math.PI)*17)+Math.sin(time*10+q*5)*2;
     line(a.x,a.y,a.angle,-22-t*83,v(t),-22-T*83,v(T),3*(1-t)+.5,teal,(1-t)*.7);
    }
    line(a.x,a.y,a.angle,-75,0,-19,0,7,0x142b32);
    line(a.x,a.y,a.angle,-75,0,-19,0,4,0x9cbbc5);
    line(a.x,a.y,a.angle,-73,-1,-20,-1,1,silver);
    for(const side of [-1,1]){
     poly([[-72,0],[-78,side*10],[-60,side*12],[-48,0]],0x2dbda9);
     poly([[-73,side*3],[-65,side*8],[-53,side*2]],0x9affed,false);
     for(let i=0;i<3;i++)line(a.x,a.y,a.angle,-72+i*5,side*2,-69+i*5,side*8,1,0x197b79,.9);
    }
    // Broad faceted blade, with a bright central ridge and shaded lower face.
    poly([[0,0],[-25,-13],[-22,0],[-25,13]],0xc2d3df);
    poly([[0,0],[-25,-13],[-22,0]],0xf4fbff,false);
    poly([[0,0],[-22,0],[-25,13]],0x7993a8,false);
    line(a.x,a.y,a.angle,-22,0,-2,0,1.3,0xffffff);
    // Crown collar and three forward-facing gold points, not a chevron.
    poly([[-34,-9],[-22,-13],[-25,-6],[-18,0],[-25,6],[-22,13],[-34,9]],0xe2aa3d);
    poly([[-33,-7],[-26,-9],[-28,-4],[-22,0],[-28,4],[-26,9],[-33,7]],0xffe69a,false);
    line(a.x,a.y,a.angle,-34,-9,-34,9,2,gold);
    for(const [u,v] of [[-22,-13],[-18,0],[-22,13]]){const p=point(u,v);g.fillStyle(gold);g.fillCircle(p.x,p.y,2);g.fillStyle(silver);g.fillCircle(p.x-.4,p.y-.5,.7);}
    continue;
   }
   const big=!!a.giant,len=big?60:22,w=big?9:3;
   line(a.x,a.y,a.angle,-len-24,0,0,0,big?14:3,teal,big?.28:.15);
   line(a.x,a.y,a.angle,-len-15,0,0,0,big?3:1,silver,.8);
   if(big||this.windFocusTime>0){
    for(const side of [-1,1]){
     for(let i=0;i<9;i++){
      const u=-len-i*5,v=side*(big?7:3)+Math.sin(time*12+i*.4)*(big?4:1.5);
      line(a.x,a.y,a.angle,u,v,u-5,side*(big?7:3)+Math.sin(time*12+(i+1)*.4)*(big?4:1.5),big?2:1,teal,(1-i/10)*.7);
     }
    }
   }
   line(a.x,a.y,a.angle,-len,0,-5,0,big?4:1.5,silver);
   for(const side of [-1,1]){
    line(a.x,a.y,a.angle,-len-4,side*w,-len+6,0,big?3:1.5,teal);
    line(a.x,a.y,a.angle,-12,side*w,0,0,big?3:1.5,silver);
    if(big)line(a.x,a.y,a.angle,-19,side*14,-6,0,2,gold);
   }
   if(big)star(a.x,a.y,7,.95);
  }
  for(const r of this.releases){
   const t=r.age/.32,fade=1-t;
   for(const side of [-1,1])line(r.x,r.y,r.angle,3+t*15,0,-3+t*8,side*(4+t*7),1.3,teal,fade);
   star(r.x,r.y,5*fade,fade);
  }
  for(const h of this.glints){
   const t=h.age/.32,fade=1-t,y=h.y-t*12;
   if(h.crown){
    const x=h.x,r=7+t*3;
    g.lineStyle(1.6,gold,fade);g.beginPath();g.moveTo(x-r,y+3);g.lineTo(x-r,y-4);g.lineTo(x-r*.4,y-1);g.lineTo(x,y-7);g.lineTo(x+r*.4,y-1);g.lineTo(x+r,y-4);g.lineTo(x+r,y+3);g.closePath();g.strokePath();
    star(x+r+4,y-5,3*fade,fade);
   }else star(h.x,y,7*(1+t),fade);
  }
 }
}
