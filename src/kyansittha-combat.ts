import type {ArenaScene, Enemy} from './combat';
import {KYANSITTHA_SKILLS,validKyansitthaLoadout,type KyansitthaSkill} from './kyansittha';
import {WEAPONS} from './config';

type PhalanxWall = {
	active: boolean;
	x: number;
	y: number;
	angle: number;
	duration: number;
	maxDuration: number;
	width: number;
};

type LightningSpear = {
	x: number;
	y: number;
	life: number;
	maxLife: number;
	damage: number;
	detonated: boolean;
};

type SweepStrike = {
	x: number;
	y: number;
	angle: number;
	sweepIndex: number;
	age: number;
	maxAge: number;
	radius: number;
	startAngle: number;
	endAngle: number;
};

type PathPoint = {
	x: number;
	y: number;
	angle: number;
	age: number;
	maxAge: number;
};

export class KyansitthaCombat {
	readonly equipped: [KyansitthaSkill, KyansitthaSkill];
	cooldowns: [number, number] = [0, 0];
	flurryTime = 0;
	readonly maxFlurryTime = 0.72;
	flurryAim = 0;
	flurryStartX = 0;
	flurryStartY = 0;
	flurryStrikesTriggered = 0;
	readonly sweepStrikes: SweepStrike[] = [];
	readonly pathTrail: PathPoint[] = [];

	phalanx: PhalanxWall = { active: false, x: 0, y: 0, angle: 0, duration: 0, maxDuration: 4.5, width: 140 };
	readonly spears: LightningSpear[] = [];
	private ground;
	private effects;

	constructor(private s: ArenaScene) {
		this.equipped = validKyansitthaLoadout(s.save.kyansitthaSkills);
		this.ground = s.add.graphics().setDepth(1.1);
		this.effects = s.add.graphics().setDepth(4.7);
	}

	private triggerStrike(index: number) {
		const s = this.s;
		this.flurryStrikesTriggered = index + 1;
		const baseDmg = WEAPONS[s.weapon]?.damage || 52;
		const whirlLevel = s.u('spearwhirl');
		const sweepRadius = 185 * (1 + whirlLevel * 0.18);

		let startAngle = 0;
		let endAngle = 0;

		if (index === 0) {
			// Strike 1: Powerful wide rightward crescent cleave
			startAngle = this.flurryAim - 2.1;
			endAngle = this.flurryAim + 1.5;
			s.audio.play('naginata');
		} else if (index === 1) {
			// Strike 2: Counter-sweeping wide leftward back-cleave
			startAngle = this.flurryAim + 2.1;
			endAngle = this.flurryAim - 1.5;
			s.audio.play('naginata');
		} else {
			// Strike 3: Heavy 360° Grand Royal Bagan Cyclone!
			startAngle = this.flurryAim - Math.PI;
			endAngle = this.flurryAim + Math.PI;
			s.audio.play('tank-slam');
			s.cameras.main.shake(140, 0.004);
		}

		this.sweepStrikes.push({
			x: s.x,
			y: s.y,
			angle: this.flurryAim,
			sweepIndex: index,
			age: 0,
			maxAge: index === 2 ? 0.44 : 0.34,
			radius: sweepRadius,
			startAngle,
			endAngle
		});

		// Calculate Area Damage for this strike
		const multiplier = index === 2 ? 2.6 : 1.6;
		const damage = baseDmg * multiplier * (1 + whirlLevel * 0.22) * (1 + s.u('thunderthrust') * 0.25);
		const knockback = index === 2 ? 120 : 80;

		for (const e of s.enemies) {
			if (!e.active) continue;
			const dist = Math.hypot(e.x - s.x, e.y - s.y);
			if (dist <= sweepRadius + e.r) {
				let inArc = true;
				if (index < 2) {
					const angleToEnemy = Math.atan2(e.y - s.y, e.x - s.x);
					const diff = Math.atan2(Math.sin(angleToEnemy - this.flurryAim), Math.cos(angleToEnemy - this.flurryAim));
					inArc = whirlLevel > 0 || Math.abs(diff) <= 2.2;
				}

				if (inArc) {
					if (s.evolved('spearwhirl')) {
						// Vacuum surrounding enemies into the center of spear reach
						e.x += (s.x - e.x) * 0.22;
						e.y += (s.y - e.y) * 0.22;
					}
					s.hit(e, damage, knockback, false, false, index === 2 ? 'Royal Cyclone Cleave' : 'Crescent Cleave');
					e.stagger = Math.max(e.stagger || 0, index === 2 ? 1.2 : 0.75);
					s.burst(e.x, e.y, index === 2 ? 0xffd700 : 0x00e676, index === 2 ? 12 : 6);

					// If evolved with thunderthrust, call divine lightning on all enemies caught in final whirlwind!
					if (index === 2 && s.evolved('thunderthrust')) {
						s.hit(e, damage * 0.8, 50, false, false, 'Divine Lightning');
						s.burst(e.x, e.y, 0x00e5ff, 8);
					}
				}
			}
		}
	}

	activate(slot: number, dx = 0, dy = 0) {
		const s = this.s;
		if ((slot !== 0 && slot !== 1) || s.hero !== 'kyansittha' || s.paused || s.ended || s.countdown > 0 || this.cooldowns[slot] > 0) {
			return false;
		}
		const id = this.equipped[slot];
		const angle = dx || dy ? Math.atan2(dy, dx) : s.angle;
		this.cooldowns[slot] = KYANSITTHA_SKILLS[id].cooldown * (s.options.build === 'mobility' ? 0.9 : 1);

		if (id === 'crescentsweep') {
			this.flurryTime = this.maxFlurryTime;
			this.flurryAim = angle;
			this.flurryStartX = s.x;
			this.flurryStartY = s.y;
			this.flurryStrikesTriggered = 0;
			this.sweepStrikes.length = 0;
			this.pathTrail.length = 0;

			// Trigger Strike 1 immediately!
			this.triggerStrike(0);

			s.notifyCombat('TRIPLE CRESCENT FLURRY');
		} else if (id === 'phalanx') {
			const width = 150 * (1 + s.u('royalguard') * 0.3);
			this.phalanx = {
				active: true,
				x: s.x + Math.cos(angle) * 55,
				y: s.y + Math.sin(angle) * 55,
				angle,
				duration: 4.5,
				maxDuration: 4.5,
				width
			};
			s.audio.play('lotus-guard');
			s.notifyCombat(s.evolved('royalguard') ? 'INVINCIBLE PHALANX' : 'BAGAN PHALANX');
		} else if (id === 'arindamathunder') {
			const targetDist = 260;
			const bound = s.moveOnGround(s.x, s.y, Math.cos(angle) * targetDist, Math.sin(angle) * targetDist, 15);

			this.spears.push({
				x: bound.x,
				y: bound.y,
				life: 2.2,
				maxLife: 2.2,
				damage: (WEAPONS[s.weapon]?.damage || 52) * 3.2 * (1 + s.u('arindamapower') * 0.25),
				detonated: false
			});

			s.cameras.main.shake(160, 0.004);
			s.audio.play('tank-slam');
			s.notifyCombat(s.evolved('arindamapower') ? 'WRATH OF ARINDAMA' : "ARINDAMA'S THUNDERBOLT");
		}
		return true;
	}

	update(dt: number) {
		const s = this.s;
		if (s.ended) {
			this.clear();
			return;
		}
		if (s.paused) return;

		for (let i = 0; i < 2; i++) {
			this.cooldowns[i as 0 | 1] = Math.max(0, this.cooldowns[i as 0 | 1] - dt);
		}

		// Handle Triple Crescent Flurry: 3 sweeping cleaves while advancing
		if (this.flurryTime > 0) {
			this.flurryTime = Math.max(0, this.flurryTime - dt);
			const progress = 1 - this.flurryTime / this.maxFlurryTime;

			// Advance forward while sweeping! ("သွားနေတုန်း")
			const speed = 440 * (1 + (s.u('thunderthrust') > 0 ? 0.35 : 0)) * dt;
			const bound = s.moveOnGround(s.x, s.y, Math.cos(this.flurryAim) * speed, Math.sin(this.flurryAim) * speed, 16);
			s.x = bound.x;
			s.y = bound.y;
			s.angle = this.flurryAim;
			s.invuln = Math.max(s.invuln, 0.1);

			// Synchronize spear swing animation with each of the 3 strikes
			const strikeSubPhase = (this.flurryTime % 0.24) / 0.24;
			s.swing = Math.sin((1 - strikeSubPhase) * Math.PI) * 0.38;

			// Record path trail points
			if (this.pathTrail.length === 0 || Math.hypot(s.x - this.pathTrail[this.pathTrail.length - 1].x, s.y - this.pathTrail[this.pathTrail.length - 1].y) >= 16) {
				this.pathTrail.push({
					x: s.x,
					y: s.y,
					angle: this.flurryAim,
					age: 0,
					maxAge: 0.55
				});
			}

			// Deal continuous cutting damage along the traveled corridor ("spear ဝှေ့တဲ့ လမ်းတစ်လျှောက် damage ပေးမယ်")
			const lx = Math.cos(this.flurryAim);
			const ly = Math.sin(this.flurryAim);
			const totalDashDist = Math.hypot(s.x - this.flurryStartX, s.y - this.flurryStartY);
			const baseDmg = WEAPONS[s.weapon]?.damage || 52;

			for (const e of s.enemies) {
				if (!e.active) continue;
				const dx = e.x - this.flurryStartX;
				const dy = e.y - this.flurryStartY;
				const proj = dx * lx + dy * ly;
				if (proj >= -25 && proj <= totalDashDist + e.r) {
					const perp = Math.abs(dx * (-ly) + dy * lx);
					if (perp <= 60 + e.r) {
						s.hit(e, baseDmg * 2.2 * dt, 15, false, false, 'Spear Flurry Wake');
						e.stagger = Math.max(e.stagger || 0, 0.4);
					}
				}
			}

			// Trigger Strike 2 at progress >= 0.35
			if (this.flurryStrikesTriggered === 1 && progress >= 0.35) {
				this.triggerStrike(1);
			}

			// Trigger Strike 3 at progress >= 0.68
			if (this.flurryStrikesTriggered === 2 && progress >= 0.68) {
				this.triggerStrike(2);
			}
		}

		// Update active Sweep Strikes
		for (let i = this.sweepStrikes.length - 1; i >= 0; i--) {
			this.sweepStrikes[i].age += dt;
			if (this.sweepStrikes[i].age >= this.sweepStrikes[i].maxAge) {
				this.sweepStrikes.splice(i, 1);
			}
		}

		// Update Path Trail
		for (let i = this.pathTrail.length - 1; i >= 0; i--) {
			this.pathTrail[i].age += dt;
			if (this.pathTrail[i].age >= this.pathTrail[i].maxAge) {
				this.pathTrail.splice(i, 1);
			}
		}

		// Handle Bagan Phalanx Barrier
		if (this.phalanx.active) {
			this.phalanx.duration -= dt;
			if (this.phalanx.duration <= 0) {
				this.phalanx.active = false;
			} else {
				const pw = this.phalanx;
				const normX = -Math.sin(pw.angle);
				const normY = Math.cos(pw.angle);

				for (const e of s.enemies) {
					if (!e.active) continue;
					const dx = e.x - pw.x;
					const dy = e.y - pw.y;
					const distFromPlane = Math.abs(dx * Math.cos(pw.angle) + dy * Math.sin(pw.angle));
					const lateralDist = Math.abs(dx * normX + dy * normY);

					if (distFromPlane <= 28 + e.r && lateralDist <= pw.width / 2 + e.r) {
						e.x += Math.cos(pw.angle) * 35;
						e.y += Math.sin(pw.angle) * 35;
						s.hit(e, 26, 45, false, false, 'Bagan Phalanx');
						e.slow = Math.max(e.slow || 0, 0.6);
						s.burst(e.x, e.y, 0x64ffda, 4);
					}
				}
			}
		}

		// Bagan Valour aura: heal if evolved and near enemies
		if (s.evolved('baganvalour') && s.hp < s.maxHp) {
			s.heal(2 * dt);
		}

		// Handle Arindama Lightning Spears
		for (let i = this.spears.length - 1; i >= 0; i--) {
			const sp = this.spears[i];
			sp.life -= dt;

			// Constant lightning tendrils to nearby enemies
			for (const e of s.enemies) {
				if (e.active && Math.hypot(e.x - sp.x, e.y - sp.y) <= 150 + e.r) {
					e.stagger = Math.max(e.stagger, 0.5);
					s.hit(e, 14 * dt * 3, 0, false, false, 'Arindama Lightning');
				}
			}

			// Eruption after 1.1s
			if (!sp.detonated && sp.maxLife - sp.life >= 1.1) {
				sp.detonated = true;
				for (const e of s.enemies) {
					if (e.active && Math.hypot(e.x - sp.x, e.y - sp.y) <= 180 + e.r) {
						s.hit(e, sp.damage, 110, false, false, 'Arindama Eruption');
						e.stagger = Math.max(e.stagger, 1.2);
					}
				}
				s.burst(sp.x, sp.y, 0xffd700, 16);
				s.audio.play('tank-slam');
			}

			if (sp.life <= 0) {
				this.spears.splice(i, 1);
			}
		}
	}

	clear() {
		this.flurryTime = 0;
		this.sweepStrikes.length = 0;
		this.pathTrail.length = 0;
		this.phalanx.active = false;
		this.spears.length = 0;
	}

	render(time: number) {
		const g = this.effects;
		const f = this.ground;
		g.clear();
		f.clear();

		// 1. Triple Crescent Flurry: Path Trail Corridor & Ground Furrows ("spear ဝှေ့တဲ့ လမ်းတစ်လျှောက်")
		for (let i = 1; i < this.pathTrail.length; i++) {
			const p1 = this.pathTrail[i - 1];
			const p2 = this.pathTrail[i];
			const alpha = (1 - p2.age / p2.maxAge) * 0.7;

			// Ground Scorched Earth Furrow along travel path
			f.lineStyle(28, 0x14331a, alpha * 0.5);
			f.lineBetween(p1.x, p1.y, p2.x, p2.y);
			f.lineStyle(12, 0x00e676, alpha * 0.4);
			f.lineBetween(p1.x, p1.y, p2.x, p2.y);

			// Cutting emerald speed ribbons in effects layer
			g.lineStyle(4, 0x64ffda, alpha * 0.8);
			g.lineBetween(p1.x, p1.y, p2.x, p2.y);
			g.lineStyle(1.8, 0xffffff, alpha * 0.95);
			g.lineBetween(p1.x, p1.y, p2.x, p2.y);
		}

		// 2. Volumetric Crescent Blade Waves & Grand Bagan Cyclone
		for (const sw of this.sweepStrikes) {
			const progress = sw.age / sw.maxAge;
			const fade = Math.max(0, 1 - progress);
			const swX = sw.x;
			const swY = sw.y;

			if (sw.sweepIndex < 2) {
				// Strikes 1 & 2: Volumetric Emerald & Jade Crescent Arc
				const r = sw.radius * (0.94 + progress * 0.12);

				// Ground crescent scorch crater
				f.lineStyle(20, 0x1b4020, fade * 0.45);
				f.beginPath();
				f.arc(swX, swY, r * 0.92, sw.startAngle, sw.endAngle, sw.startAngle > sw.endAngle);
				f.strokePath();

				// Tier 1: Outer emerald dragon aura wave
				g.lineStyle(22, sw.sweepIndex === 0 ? 0x00e676 : 0x00e5ff, fade * 0.45);
				g.beginPath();
				g.arc(swX, swY, r, sw.startAngle, sw.endAngle, sw.startAngle > sw.endAngle);
				g.strokePath();

				// Tier 2: Cyan jade plasma ribbon
				g.lineStyle(10, 0x69f0ae, fade * 0.85);
				g.beginPath();
				g.arc(swX, swY, r - 2, sw.startAngle, sw.endAngle, sw.startAngle > sw.endAngle);
				g.strokePath();

				// Tier 3: Radiant golden core
				g.lineStyle(4.5, 0xffd700, fade * 0.95);
				g.beginPath();
				g.arc(swX, swY, r - 4, sw.startAngle, sw.endAngle, sw.startAngle > sw.endAngle);
				g.strokePath();

				// Tier 4: Razor white-hot cutting edge
				g.lineStyle(2, 0xffffff, fade);
				g.beginPath();
				g.arc(swX, swY, r - 5, sw.startAngle, sw.endAngle, sw.startAngle > sw.endAngle);
				g.strokePath();

				// Tangential cutting sparks flying off the blade
				const span = Math.abs(sw.endAngle - sw.startAngle);
				const minA = Math.min(sw.startAngle, sw.endAngle);
				for (let i = 0; i < 7; i++) {
					const sparkA = minA + (i / 6) * span;
					const sr = r + Math.sin(time * 18 + i) * 12;
					const sx = swX + Math.cos(sparkA) * sr;
					const sy = swY + Math.sin(sparkA) * sr;
					const tanDir = sw.startAngle < sw.endAngle ? 1 : -1;
					const tanX = -Math.sin(sparkA) * (8 + i * 2) * tanDir;
					const tanY = Math.cos(sparkA) * (8 + i * 2) * tanDir;

					g.fillStyle(0xffffff, fade);
					g.fillCircle(sx, sy, 2);
					g.lineStyle(1.5, 0x76ff03, fade * 0.8);
					g.lineBetween(sx, sy, sx + tanX, sy + tanY);
				}

				// Leading Spear Tip Star Flare
				const tipX = swX + Math.cos(sw.endAngle) * r;
				const tipY = swY + Math.sin(sw.endAngle) * r;
				g.fillStyle(0xffffff, fade);
				g.fillCircle(tipX, tipY, 6);
				g.lineStyle(2.5, 0xffd700, fade * 0.95);
				g.strokeCircle(tipX, tipY, 11);
				g.lineStyle(1.5, 0x00e5ff, fade * 0.85);
				g.strokeCircle(tipX, tipY, 16);
			} else {
				// Strike 3: Heavy 360° Grand Royal Bagan Cyclone!
				const r = sw.radius * (0.85 + progress * 0.35);

				// Ground scorched circular crater
				f.fillStyle(0x13331a, fade * 0.38);
				f.fillCircle(swX, swY, r * 0.85);
				f.lineStyle(20, 0x1b4020, fade * 0.5);
				f.strokeCircle(swX, swY, r);

				// Expanding Volumetric Cyclone Rings
				g.lineStyle(26, 0x00e676, fade * 0.45);
				g.strokeCircle(swX, swY, r);
				g.lineStyle(14, 0x00e5ff, fade * 0.82);
				g.strokeCircle(swX, swY, r);
				g.lineStyle(6, 0xffd700, fade * 0.95);
				g.strokeCircle(swX, swY, r);
				g.lineStyle(2.5, 0xffffff, fade);
				g.strokeCircle(swX, swY, r);

				// Inner secondary compression shockwave ring
				g.lineStyle(4, 0x76ff03, fade * 0.85);
				g.strokeCircle(swX, swY, r * 0.65);

				// 12 Radial Sacred Lightning Fissures bursting outward
				for (let i = 0; i < 12; i++) {
					const a = (i * Math.PI) / 6 + progress * 0.6;
					const inner = r * 0.3;
					const outer = r * 1.18;
					g.lineStyle(2.5, 0x64ffda, fade * 0.9);
					g.lineBetween(
						swX + Math.cos(a) * inner,
						swY + Math.sin(a) * inner,
						swX + Math.cos(a) * outer,
						swY + Math.sin(a) * outer
					);
				}

				// Blinding Core Starburst
				g.fillStyle(0xffffff, fade * 0.95);
				g.fillCircle(swX, swY, 18);
				g.lineStyle(3, 0xffd700, fade);
				g.strokeCircle(swX, swY, 28);
			}
		}

		// 3. Bagan Phalanx Wall: Royal Interlocking Singha Shield Barricade
		if (this.phalanx.active) {
			const pw = this.phalanx;
			const alpha = Math.min(1, pw.duration);
			const normX = -Math.sin(pw.angle) * (pw.width / 2);
			const normY = Math.cos(pw.angle) * (pw.width / 2);

			const x1 = pw.x - normX;
			const y1 = pw.y - normY;
			const x2 = pw.x + normX;
			const y2 = pw.y + normY;

			// Translucent emerald sanctuary barrier on ground
			f.fillStyle(0x0e3a14, alpha * 0.45);
			f.fillCircle(pw.x, pw.y, pw.width * 0.55);
			f.fillStyle(0x00e676, alpha * 0.15 + Math.sin(time * 5) * 0.05);
			f.fillCircle(pw.x, pw.y, pw.width * 0.35);

			// Glowing Hexagonal Energy Barrier Lattice
			g.lineStyle(8, 0x1b5e20, alpha * 0.6);
			g.lineBetween(x1, y1, x2, y2);
			g.lineStyle(3, 0x00e676, alpha * 0.9);
			g.lineBetween(x1, y1, x2, y2);
			g.lineStyle(1.5, 0xffffff, alpha * 0.95);
			g.lineBetween(x1, y1, x2, y2);

			// 5 Royal Bagan Singha Tower Shields along the barricade
			const shieldCount = 5;
			for (let i = 0; i < shieldCount; i++) {
				const t = (i + 0.5) / shieldCount;
				const sx = x1 + (x2 - x1) * t;
				const sy = y1 + (y2 - y1) * t;

				// Shield Base (Heavy curved Bagan pavise)
				// Outer gilded frame
				g.fillStyle(0xd4af37, alpha);
				g.fillCircle(sx, sy, 9);
				g.lineStyle(2, 0x080e19, alpha);
				g.strokeCircle(sx, sy, 9);

				// Emerald lacquer shield face
				g.fillStyle(0x1b5e20, alpha * 0.95);
				g.fillCircle(sx, sy, 6.5);

				// Singha Lion golden emblem at shield center
				g.fillStyle(0xffd700, alpha);
				g.fillCircle(sx, sy, 3.5);
				g.fillStyle(0xffffff, alpha);
				g.fillCircle(sx, sy, 1.2);

				// Heavy Steel-tipped Pike jutting forward at 45 degrees
				const pikeLen = 22;
				const forwardX = Math.cos(pw.angle) * pikeLen;
				const forwardY = Math.sin(pw.angle) * pikeLen;

				// Pike iron shaft
				g.lineStyle(3, 0x3e2723, alpha * 0.95);
				g.lineBetween(sx, sy, sx + forwardX, sy + forwardY);
				// Gold socket
				g.lineStyle(2, 0xffd700, alpha);
				g.lineBetween(sx + forwardX * 0.7, sy + forwardY * 0.7, sx + forwardX, sy + forwardY);
				// Gleaming silver pike tip
				g.fillStyle(0xffffff, alpha);
				g.fillCircle(sx + forwardX, sy + forwardY, 2.5);
			}

			// Fortified Royal Terminal Pillars
			for (const [px, py] of [[x1, y1], [x2, y2]]) {
				g.fillStyle(0x1b5e20, alpha);
				g.fillCircle(px, py, 11);
				g.lineStyle(2.5, 0xd4af37, alpha);
				g.strokeCircle(px, py, 11);
				g.fillStyle(0xffd700, alpha);
				g.fillCircle(px, py, 6);
				g.fillStyle(0xffffff, alpha);
				g.fillCircle(px, py, 2.5);
			}

			// Ancient Bagan Protection Runes (*Inn*) floating along barrier
			for (let i = 0; i < 4; i++) {
				const runeT = (i + 1) / 5;
				const rx = x1 + (x2 - x1) * runeT + Math.cos(pw.angle) * (8 + Math.sin(time * 4 + i) * 3);
				const ry = y1 + (y2 - y1) * runeT + Math.sin(pw.angle) * (8 + Math.sin(time * 4 + i) * 3);
				g.fillStyle(0x69f0ae, alpha * 0.85);
				g.fillCircle(rx, ry, 2);
				g.lineStyle(1, 0xffffff, alpha * 0.7);
				g.strokeCircle(rx, ry, 3.5);
			}
		}

		// 4. Arindama's Thunderbolt: Plunged Celestial Spear & Recursive Lightning
		for (const sp of this.spears) {
			// Ground Electric Plasma Crater & Radiating Fissures
			f.fillStyle(0x004d40, 0.45);
			f.fillCircle(sp.x, sp.y, 52);
			f.fillStyle(0x00e676, 0.28 + Math.sin(time * 8) * 0.08);
			f.fillCircle(sp.x, sp.y, 32);

			// Magma / Emerald electric ground fissure cracks radiating outward
			f.lineStyle(2, 0x64ffda, 0.7);
			for (let i = 0; i < 6; i++) {
				const fissureA = (i * Math.PI) / 3 + 0.2;
				const fDist = 48 + Math.sin(time * 10 + i) * 8;
				const midDist = fDist * 0.5;
				const midX = sp.x + Math.cos(fissureA) * midDist + Math.sin(time * 14 + i) * 5;
				const midY = sp.y + Math.sin(fissureA) * midDist + Math.cos(time * 14 + i) * 5;
				f.lineBetween(sp.x, sp.y, midX, midY);
				f.lineBetween(midX, midY, sp.x + Math.cos(fissureA) * fDist, sp.y + Math.sin(fissureA) * fDist);
			}

			// Sacred Arindama Spear plunged into the earth at 75-degree tilt
			const spearAngle = -Math.PI / 2 + 0.18;
			const spearLen = 58;
			const tipX = sp.x;
			const tipY = sp.y;
			const buttX = sp.x + Math.cos(spearAngle) * spearLen;
			const buttY = sp.y + Math.sin(spearAngle) * spearLen;

			// Ironwood shaft
			g.lineStyle(6, 0x3e2723, 0.95);
			g.lineBetween(tipX, tipY, buttX, buttY);
			// Gold spiral grips & runes
			g.lineStyle(3, 0xffd700, 0.95);
			g.lineBetween(tipX, tipY, buttX, buttY);
			g.lineStyle(1.5, 0xffffff, 0.95);
			g.lineBetween(tipX, tipY, buttX, buttY);

			// Plunged spearhead collar with horsehair plume
			g.fillStyle(0xd50000, 1);
			g.fillCircle(tipX + Math.cos(spearAngle) * 14, tipY + Math.sin(spearAngle) * 14, 6);

			// Radiant Arindama Spearhead
			g.fillStyle(0xffffff, 1);
			g.fillCircle(buttX, buttY, 7);
			g.lineStyle(2.5, 0x00e5ff, 1);
			g.strokeCircle(buttX, buttY, 9);

			// Authentic Multi-Branching Recursive Fractal Lightning Bolts
			for (let i = 0; i < 5; i++) {
				const targetA = time * 8 + (i * Math.PI * 2) / 5;
				const targetDist = 75 + Math.sin(time * 16 + i) * 20;
				const endX = sp.x + Math.cos(targetA) * targetDist;
				const endY = sp.y + Math.sin(targetA) * targetDist;

				// 3-Segment Jagged Fractal Lightning Path
				const mid1X = buttX + (endX - buttX) * 0.35 + Math.sin(time * 25 + i * 2) * 14;
				const mid1Y = buttY + (endY - buttY) * 0.35 + Math.cos(time * 25 + i * 2) * 14;
				const mid2X = buttX + (endX - buttX) * 0.7 + Math.sin(time * 30 + i * 3) * 12;
				const mid2Y = buttY + (endY - buttY) * 0.7 + Math.cos(time * 30 + i * 3) * 12;

				// Cyan/Emerald ion glow
				g.lineStyle(3.5, 0x00e676, 0.75);
				g.lineBetween(buttX, buttY, mid1X, mid1Y);
				g.lineBetween(mid1X, mid1Y, mid2X, mid2Y);
				g.lineBetween(mid2X, mid2Y, endX, endY);

				// Intense white-hot lightning core
				g.lineStyle(1.5, 0xffffff, 0.95);
				g.lineBetween(buttX, buttY, mid1X, mid1Y);
				g.lineBetween(mid1X, mid1Y, mid2X, mid2Y);
				g.lineBetween(mid2X, mid2Y, endX, endY);

				// Ground strike sparks
				g.fillStyle(0xffffff, 1);
				g.fillCircle(endX, endY, 3);
				g.lineStyle(1.5, 0x64ffda, 0.85);
				g.strokeCircle(endX, endY, 5);
			}

			// If detonating: Column of Celestial Lightning striking from sky
			if (sp.detonated) {
				g.lineStyle(18, 0x00e676, 0.65);
				g.lineBetween(sp.x, sp.y, sp.x, sp.y - 300);
				g.lineStyle(8, 0xffd700, 0.85);
				g.lineBetween(sp.x, sp.y, sp.x, sp.y - 300);
				g.lineStyle(3, 0xffffff, 1);
				g.lineBetween(sp.x, sp.y, sp.x, sp.y - 300);

				// Radial thunder shockwave ring
				g.lineStyle(4, 0x64ffda, 0.9);
				g.strokeCircle(sp.x, sp.y, 65);
				g.lineStyle(2, 0xffffff, 0.95);
				g.strokeCircle(sp.x, sp.y, 85);
			}
		}
	}
}
