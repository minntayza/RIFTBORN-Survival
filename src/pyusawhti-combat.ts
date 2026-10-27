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
	readonly arrows: Arrow[] = [];
	readonly bursts: SunBurst[] = [];
	readonly laserBeams: SolarLaserBeam[] = [];
	private ground;
	private effects;

	constructor(private s: ArenaScene) {
		this.equipped = validPyusawhtiLoadout(s.save.pyusawhtiSkills);
		this.ground = s.add.graphics().setDepth(1.2);
		this.effects = s.add.graphics().setDepth(5);
	}

	get speedMultiplier() {
		return this.windFocusTime > 0 ? 1.25 : 1;
	}

	get attackRateMultiplier() {
		return this.windFocusTime > 0 ? 1.8 : 1;
	}

	activate(slot: number, dx = 0, dy = 0) {
		const s = this.s;
		if ((slot !== 0 && slot !== 1) || s.hero !== 'pyusawhti' || s.paused || s.ended || s.countdown > 0 || this.cooldowns[slot] > 0) {
			return false;
		}
		const id = this.equipped[slot];
		const angle = dx || dy ? Math.atan2(dy, dx) : s.angle;
		this.cooldowns[slot] = PYUSAWHTI_SKILLS[id].cooldown * (s.options.build === 'mobility' ? 0.9 : 1);

		if (id === 'multishot') {
			const baseDmg = (WEAPONS[s.weapon]?.damage || 28) * 1.1;
			const flankBonus = s.u('arrowstorm') * 2;
			const totalArrows = s.evolved('arrowstorm') ? 8 : (7 + flankBonus);
			for (let i = 0; i < totalArrows; i++) {
				const a = s.evolved('arrowstorm') ? (i * Math.PI * 2 / 8) : (angle + (i - Math.floor(totalArrows / 2)) * 0.13);
				const speed = 720 * (1 + s.u('windfocuscard') * 0.25);
				this.arrows.push({
					x: s.x + Math.cos(a) * 20,
					y: s.y + Math.sin(a) * 20,
					vx: Math.cos(a) * speed,
					vy: Math.sin(a) * speed,
					angle: a,
					damage: baseDmg,
					pierce: 3 + s.u('piercingeye') * 2 + (s.evolved('piercingeye') ? 99 : 0),
					remainingRange: 650,
					sunburst: s.evolved('sunburstcard') || Math.random() < s.u('sunburstcard') * 0.25,
					hitEnemies: new Set()
				});
			}
			s.audio.play('shotgun');
			s.notifyCombat('GALE VOLLEY');
		} else if (id === 'windfocus') {
			this.windFocusTime = 5 + s.u('windfocuscard') * 1.2;
			s.audio.play('overdrive');
			s.notifyCombat('WIND FOCUS');
		} else if (id === 'banepierce') {
			// Five-Bane Pierce: Devastating 96px-wide (3 enemies wide) Solar Laser Beam Arrow
			const baseDmg = (WEAPONS[s.weapon]?.damage || 28) * 5.4 * (1 + s.u('beasthunter') * 0.35);
			const beamLen = 920;
			const beamWidth = 96; // 3 enemies wide (~96px)
			const startX = s.x + Math.cos(angle) * 22;
			const startY = s.y + Math.sin(angle) * 22;

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

			// If sunburst evolved, leave radiant solar fire patches along the laser corridor
			if (s.evolved('sunburstcard')) {
				for (let f = 1; f <= 5; f++) {
					const fx = startX + Math.cos(angle) * (beamLen * (f / 6));
					const fy = startY + Math.sin(angle) * (beamLen * (f / 6));
					if (s.firePatches.length >= 25) s.firePatches.shift();
					s.firePatches.push({ x: fx, y: fy, life: 3.5 });
				}
			}

			s.cameras.main.shake(200, 0.007);
			s.audio.play('tank-slam');
			s.notifyCombat('FIVE-BANE PIERCE · SOLAR RAY');
		}
		return true;
	}

	bowAttack() {
		const s = this.s;
		if (s.paused || s.ended || s.swing > 0) return;
		s.attackSequence++;
		const w = WEAPONS[s.weapon];
		const speed = (s.weapon === 'solarcrossbow' ? 820 : s.weapon === 'greatbow' ? 580 : 700) * (1 + s.u('windfocuscard') * 0.25);
		const pierce = (this.windFocusTime > 0 ? 12 : s.weapon === 'greatbow' ? 2 : 1) + s.u('pierce') + s.u('piercingeye') * 2 + (s.evolved('piercingeye') ? 99 : 0);
		const damage = (w?.damage || 28) * (this.windFocusTime > 0 ? 1.2 : 1) * (1 + s.u('damage') * 0.15);

		s.swing = (w?.cooldown || 0.35) / this.attackRateMultiplier;

		const angles = [s.angle];
		if (s.evolved('arrowstorm')) {
			for (let i = 1; i < 8; i++) angles.push(s.angle + (i * Math.PI * 2 / 8));
		} else if (s.u('arrowstorm') > 0) {
			const extra = s.u('arrowstorm');
			for (let i = 1; i <= extra; i++) {
				angles.push(s.angle - i * 0.12);
				angles.push(s.angle + i * 0.12);
			}
		}

		for (const a of angles) {
			this.arrows.push({
				x: s.x + Math.cos(a) * 22,
				y: s.y + Math.sin(a) * 22,
				vx: Math.cos(a) * speed,
				vy: Math.sin(a) * speed,
				angle: a,
				damage,
				pierce,
				remainingRange: w?.range || 650,
				sunburst: s.weapon === 'greatbow' || s.evolved('sunburstcard') || Math.random() < s.u('sunburstcard') * 0.25,
				hitEnemies: new Set()
			});
		}

		s.audio.play('reload-swish');
	}

	private explodeSun(x: number, y: number, radius: number, damage: number) {
		const s = this.s;
		this.bursts.push({ x, y, age: 0, maxAge: 0.65, radius });
		for (const e of s.enemies) {
			if (e.active && Math.hypot(e.x - x, e.y - y) <= radius + e.r) {
				s.hit(e, damage, 45, false, false, 'Sunburst');
				if (e.active) e.burn = Math.max(e.burn || 0, 3.5);
			}
		}
		if (s.evolved('sunburstcard')) {
			if (s.firePatches.length >= 20) s.firePatches.shift();
			s.firePatches.push({ x, y, life: 3.5 });
		}
		s.audio.play('tank-slam');
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
						const isBoss = ['elite', 'boss', 'shooterBoss', 'commander'].includes(e.type);
						const dmg = b.damage * (isBoss ? (1 + s.u('beasthunter') * 0.3) : 1);
						s.hit(e, dmg, 85);
						e.burn = Math.max(e.burn || 0, 4.5);
						e.stagger = Math.max(e.stagger || 0, 0.85);
						if (isBoss && e.hp <= 0 && s.evolved('beasthunter')) {
							s.invuln = Math.max(s.invuln, 4);
							s.heal(25);
							s.notifyCombat('LEGEND OF BAGAN · INVULNERABLE');
						}
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

			for (const e of s.enemies) {
				if (!e.active || a.hitEnemies.has(e)) continue;
				const hitRadius = e.r + (a.giant ? 24 : 8);
				if (Math.hypot(e.x - a.x, e.y - a.y) <= hitRadius) {
					a.hitEnemies.add(e);
					const isBoss = ['elite', 'boss', 'shooterBoss', 'commander'].includes(e.type);
					s.hit(e, a.damage * (isBoss ? (1 + s.u('beasthunter') * 0.3) : 1), a.giant ? 65 : 18);
					if (isBoss && e.hp <= 0 && s.evolved('beasthunter')) {
						s.invuln = Math.max(s.invuln, 4);
						s.heal(25);
						s.notifyCombat('LEGEND OF BAGAN · INVULNERABLE');
					}
					s.burst(a.x, a.y, a.giant ? 0xffd700 : 0xf4cb55, a.giant ? 10 : 4);
					a.pierce--;
					if (a.giant) {
						e.stagger = Math.max(e.stagger, 0.5);
					}
					if (a.pierce <= 0) break;
				}
			}

			if (a.pierce <= 0 || a.remainingRange <= 0) {
				if (a.sunburst || a.giant) {
					this.explodeSun(a.x, a.y, a.giant ? 175 : 85, a.damage * 0.9);
				}
				this.arrows.splice(i, 1);
			}
		}
	}

	clear() {
		this.arrows.length = 0;
		this.bursts.length = 0;
		this.laserBeams.length = 0;
		this.windFocusTime = 0;
	}

	render(time: number) {
		const g = this.effects;
		const f = this.ground;
		g.clear();
		f.clear();

		// 1. Wind Focus: Swirling Royal Gale Vortex & Sniper Aim Reticle
		if (this.windFocusTime > 0) {
			const pulse = 24 + Math.sin(time * 8) * 3;

			// Swirling ground thermal aura & dust particles
			f.fillStyle(0xffd54f, 0.12 + Math.sin(time * 6) * 0.04);
			f.fillCircle(this.s.x, this.s.y, pulse * 1.5);

			// Outer supersonic gale ring
			g.lineStyle(2.5, 0xfff099, 0.75);
			g.strokeCircle(this.s.x, this.s.y, pulse);

			// Inner swirling wind spirals
			for (let i = 0; i < 4; i++) {
				const startA = time * 7 + (i * Math.PI) / 2;
				g.lineStyle(2, 0xffe082, 0.85);
				g.beginPath();
				g.arc(this.s.x, this.s.y, pulse - 5, startA, startA + 1.1);
				g.strokePath();
			}

			// Swirling sacred golden embers / Bodhi leaves
			for (let i = 0; i < 6; i++) {
				const leafA = time * 4.2 + (i * Math.PI) / 3;
				const dist = pulse * (0.6 + 0.4 * Math.sin(time * 3 + i));
				const lx = this.s.x + Math.cos(leafA) * dist;
				const ly = this.s.y + Math.sin(leafA) * dist;
				g.fillStyle(0xffd700, 0.9);
				g.fillCircle(lx, ly, 2.2);
				g.lineStyle(1.2, 0xffa000, 0.8);
				g.lineBetween(lx, ly, lx - Math.sin(leafA) * 6, ly + Math.cos(leafA) * 6);
			}
		}

		// 2. Five-Bane Pierce: 96px Wide Colossal Solar Laser Beam
		for (const b of this.laserBeams) {
			const progress = 1 - b.duration / b.maxDuration;
			const fade = Math.max(0, 1 - progress);
			const lx = Math.cos(b.angle);
			const ly = Math.sin(b.angle);
			const perpA = b.angle + Math.PI / 2;
			const endX = b.x + lx * b.length;
			const endY = b.y + ly * b.length;

			// Scorched Earth Trench under 96px wide laser beam
			f.lineStyle(b.width * 0.95, 0x2e1100, fade * 0.5);
			f.lineBetween(b.x, b.y, endX, endY);
			f.lineStyle(b.width * 0.55, 0xff6f00, fade * 0.38);
			f.lineBetween(b.x, b.y, endX, endY);

			// Multi-Tier Volumetric Solar Laser Ray
			// Tier 1: Outer burning solar plasma halo (full 96px width)
			g.lineStyle(b.width, 0xff6d00, fade * 0.35);
			g.lineBetween(b.x, b.y, endX, endY);

			// Tier 2: Solar amber plasma stream
			g.lineStyle(b.width * 0.65, 0xffa000, fade * 0.7);
			g.lineBetween(b.x, b.y, endX, endY);

			// Tier 3: Concentrated radiant golden core
			g.lineStyle(b.width * 0.38, 0xffeb3b, fade * 0.92);
			g.lineBetween(b.x, b.y, endX, endY);

			// Tier 4: Hyper-dense white-hot laser spine
			g.lineStyle(16, 0xffffff, fade);
			g.lineBetween(b.x, b.y, endX, endY);

			// Pulsating Solar Shock Diamonds along laser corridor
			const step = 65;
			const steps = Math.floor(b.length / step);
			for (let i = 1; i <= steps; i++) {
				const px = b.x + lx * (i * step);
				const py = b.y + ly * (i * step);
				const diamondW = (b.width * 0.45) * (0.8 + 0.2 * Math.sin(time * 16 + i));

				// Diamond shock front
				g.lineStyle(2, 0xffffff, fade * 0.9);
				g.lineBetween(px - Math.cos(perpA) * diamondW, py - Math.sin(perpA) * diamondW, px + lx * 15, py + ly * 15);
				g.lineBetween(px + Math.cos(perpA) * diamondW, py + Math.sin(perpA) * diamondW, px + lx * 15, py + ly * 15);
				g.lineBetween(px - Math.cos(perpA) * diamondW, py - Math.sin(perpA) * diamondW, px - lx * 15, py - ly * 15);
				g.lineBetween(px + Math.cos(perpA) * diamondW, py + Math.sin(perpA) * diamondW, px - lx * 15, py - ly * 15);

				// Perpendicular solar flare sparks
				if (i % 2 === 0) {
					const flareLen = diamondW + 12;
					g.lineStyle(1.5, 0xffd700, fade * 0.75);
					g.lineBetween(px, py, px + Math.cos(perpA) * flareLen, py + Math.sin(perpA) * flareLen);
					g.lineBetween(px, py, px - Math.cos(perpA) * flareLen, py - Math.sin(perpA) * flareLen);
				}
			}

			// Blinding launch muzzle flash at bow
			g.fillStyle(0xffffff, fade);
			g.fillCircle(b.x, b.y, 22);
			g.lineStyle(4, 0xffd700, fade);
			g.strokeCircle(b.x, b.y, 32);
		}

		// 3. Solar Burst Nova Explosions
		for (const b of this.bursts) {
			const progress = b.age / b.maxAge;
			const fade = 1 - progress;
			const r = b.radius * Math.min(1, 0.25 + progress * 1.7);

			// Scorched crater ground with radiating glowing fracture fissures
			f.fillStyle(0x3e1800, fade * 0.4);
			f.fillCircle(b.x, b.y, r);
			f.fillStyle(0xff6f00, fade * 0.32);
			f.fillCircle(b.x, b.y, r * 0.75);

			// Molten ground fissure lines radiating outward
			f.lineStyle(2, 0xffab00, fade * 0.6);
			for (let i = 0; i < 6; i++) {
				const fissureA = (i * Math.PI) / 3 + 0.15;
				const fDist = r * 0.85;
				const midDist = fDist * 0.5;
				const jX = b.x + Math.cos(fissureA) * midDist + Math.sin(i * 3) * 6;
				const jY = b.y + Math.sin(fissureA) * midDist + Math.cos(i * 3) * 6;
				f.lineBetween(b.x, b.y, jX, jY);
				f.lineBetween(jX, jY, b.x + Math.cos(fissureA) * fDist, b.y + Math.sin(fissureA) * fDist);
			}

			// Radiant Solar Starburst Rays (12 Cardinal & Diagonal Rays)
			g.lineStyle(2.5, 0xffeb3b, fade * 0.95);
			for (let i = 0; i < 12; i++) {
				const a = (i * Math.PI) / 6 + progress * 0.5;
				const innerDist = r * 0.3;
				const outerDist = r * (1.1 + (i % 2 === 0 ? 0.25 : 0));
				g.lineBetween(
					b.x + Math.cos(a) * innerDist,
					b.y + Math.sin(a) * innerDist,
					b.x + Math.cos(a) * outerDist,
					b.y + Math.sin(a) * outerDist
				);
			}

			// Triple-tiered expanding shockwave rings
			g.lineStyle(3.5, 0xffb300, fade * 0.9);
			g.strokeCircle(b.x, b.y, r);
			g.lineStyle(2, 0xffe082, fade * 0.95);
			g.strokeCircle(b.x, b.y, r * 0.82);
			g.lineStyle(1.5, 0xffffff, fade);
			g.strokeCircle(b.x, b.y, r * 0.65);

			// Blinding white-hot core
			g.fillStyle(0xffffff, fade * 0.95);
			g.fillCircle(b.x, b.y, r * 0.3);
		}

		// 4. Realistic Myanmar War Arrows & Colossal Ballista Bolts
		for (const a of this.arrows) {
			const len = a.giant ? 52 : 26;
			const headX = a.x;
			const headY = a.y;
			const tailX = a.x - Math.cos(a.angle) * len;
			const tailY = a.y - Math.sin(a.angle) * len;

			if (a.giant) {
				// Giant Vanguard Bolt: twin rotating dragon fire aura
				const coilR = 14;
				for (let s = -1; s <= 1; s += 2) {
					const coilA = time * 20 * s;
					const perpA = a.angle + Math.PI / 2;
					const cx = headX - Math.cos(a.angle) * 18 + Math.cos(perpA) * Math.sin(coilA) * coilR;
					const cy = headY - Math.sin(a.angle) * 18 + Math.sin(perpA) * Math.sin(coilA) * coilR;
					g.fillStyle(0xffd700, 0.9);
					g.fillCircle(cx, cy, 4.5);
					g.lineStyle(2.5, 0xff6f00, 0.8);
					g.lineBetween(cx, cy, tailX, tailY);
				}

				// Giant arrow sonic boom compression cones
				for (let c = 1; c <= 3; c++) {
					const coneDist = c * 16;
					const cx = headX - Math.cos(a.angle) * coneDist;
					const cy = headY - Math.sin(a.angle) * coneDist;
					const coneW = 12 + c * 6;
					const perpA = a.angle + Math.PI / 2;
					g.lineStyle(2, 0xffecb3, 0.75 - c * 0.18);
					g.lineBetween(
						cx - Math.cos(perpA) * coneW,
						cy - Math.sin(perpA) * coneW,
						cx + Math.cos(a.angle) * 9,
						cy + Math.sin(a.angle) * 9
					);
					g.lineBetween(
						cx + Math.cos(perpA) * coneW,
						cy + Math.sin(perpA) * coneW,
						cx + Math.cos(a.angle) * 9,
						cy + Math.sin(a.angle) * 9
					);
				}
			} else {
				// Normal Arrow: Supersonic Cavitation Wake & Mach Diamonds
				const wakeLen = 28;
				const wakeTailX = tailX - Math.cos(a.angle) * wakeLen;
				const wakeTailY = tailY - Math.sin(a.angle) * wakeLen;

				// Translucent vapor cavitation trail
				g.lineStyle(4, 0xffd54f, 0.35);
				g.lineBetween(wakeTailX, wakeTailY, headX, headY);
				g.lineStyle(1.8, 0xffffff, 0.7);
				g.lineBetween(wakeTailX + Math.cos(a.angle) * 10, wakeTailY + Math.sin(a.angle) * 10, headX, headY);

				// Mach Shock Diamonds along flight path if Wind Focus is active
				if (this.windFocusTime > 0) {
					for (let d = 1; d <= 2; d++) {
						const dx = tailX - Math.cos(a.angle) * (d * 12);
						const dy = tailY - Math.sin(a.angle) * (d * 12);
						const perpA = a.angle + Math.PI / 2;
						g.lineStyle(1.5, 0xffeb3b, 0.85);
						g.lineBetween(dx - Math.cos(perpA) * 3, dy - Math.sin(perpA) * 3, dx + Math.cos(a.angle) * 4, dy + Math.sin(a.angle) * 4);
						g.lineBetween(dx + Math.cos(perpA) * 3, dy + Math.sin(perpA) * 3, dx + Math.cos(a.angle) * 4, dy + Math.sin(a.angle) * 4);
						g.lineBetween(dx - Math.cos(perpA) * 3, dy - Math.sin(perpA) * 3, dx - Math.cos(a.angle) * 4, dy - Math.sin(a.angle) * 4);
						g.lineBetween(dx + Math.cos(perpA) * 3, dy + Math.sin(perpA) * 3, dx - Math.cos(a.angle) * 4, dy - Math.sin(a.angle) * 4);
					}
				}
			}

			// Main Arrow Shaft: Cedar/Bamboo core with polished golden spine
			g.lineStyle(a.giant ? 6 : 3, a.giant ? 0xff8f00 : 0x8d5b2d, 0.95);
			g.lineBetween(tailX, tailY, headX, headY);
			g.lineStyle(a.giant ? 3 : 1.5, 0xffffff, 0.95);
			g.lineBetween(tailX, tailY, headX, headY);

			// Triple-Layer Fletching Fins at tail (angled scarlet & gold peacock feathers)
			const perpA = a.angle + Math.PI / 2;
			const finW = a.giant ? 10 : 5;
			const fletchOffset = a.giant ? 6 : 3;

			// Scarlet feathers angled backwards
			g.lineStyle(a.giant ? 3.5 : 2, 0xd32f2f, 0.95);
			g.lineBetween(
				tailX - Math.cos(perpA) * finW - Math.cos(a.angle) * fletchOffset,
				tailY - Math.sin(perpA) * finW - Math.sin(a.angle) * fletchOffset,
				tailX,
				tailY
			);
			g.lineBetween(
				tailX + Math.cos(perpA) * finW - Math.cos(a.angle) * fletchOffset,
				tailY + Math.sin(perpA) * finW - Math.sin(a.angle) * fletchOffset,
				tailX,
				tailY
			);

			// Gold feather highlights
			g.lineStyle(1.5, 0xffd700, 0.9);
			g.lineBetween(
				tailX - Math.cos(perpA) * (finW * 0.6),
				tailY - Math.sin(perpA) * (finW * 0.6),
				tailX,
				tailY
			);
			g.lineBetween(
				tailX + Math.cos(perpA) * (finW * 0.6),
				tailY + Math.sin(perpA) * (finW * 0.6),
				tailX,
				tailY
			);

			// Bodkin Arrowhead with specular gleam
			g.fillStyle(0xffffff, 1);
			g.fillCircle(headX, headY, a.giant ? 7 : 3.8);
			g.lineStyle(2, a.giant ? 0xff6f00 : 0xffd700, 0.95);
			g.strokeCircle(headX, headY, a.giant ? 9 : 4.8);
		}
	}
}
