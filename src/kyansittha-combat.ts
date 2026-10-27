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

export class KyansitthaCombat {
	readonly equipped: [KyansitthaSkill, KyansitthaSkill];
	cooldowns: [number, number] = [0, 0];
	sweepTime = 0;
	thrustTime = 0;
	sweepAim = 0;
	phalanx: PhalanxWall = { active: false, x: 0, y: 0, angle: 0, duration: 0, maxDuration: 4.5, width: 140 };
	readonly spears: LightningSpear[] = [];
	private ground;
	private effects;

	constructor(private s: ArenaScene) {
		this.equipped = validKyansitthaLoadout(s.save.kyansitthaSkills);
		this.ground = s.add.graphics().setDepth(1.1);
		this.effects = s.add.graphics().setDepth(4.7);
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
			this.sweepTime = 0.28;
			this.thrustTime = 0.55;
			this.sweepAim = angle;
			s.audio.play('naginata');
			s.notifyCombat('CRESCENT SWEEP & LUNGE');
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

		// Handle Crescent Sweep
		if (this.sweepTime > 0) {
			this.sweepTime = Math.max(0, this.sweepTime - dt);
			const sweepRadius = (WEAPONS[s.weapon]?.range || 160) * (s.u('spearwhirl') > 0 ? 1.3 : 1.1);
			for (const e of s.enemies) {
				if (!e.active) continue;
				const d = Math.hypot(e.x - s.x, e.y - s.y);
				if (d <= sweepRadius + e.r) {
					if (s.evolved('spearwhirl')) {
						e.x += (s.x - e.x) * 0.12;
						e.y += (s.y - e.y) * 0.12;
					}
					const diff = Math.atan2(e.y - s.y, e.x - s.x) - this.sweepAim;
					const normalized = Math.atan2(Math.sin(diff), Math.cos(diff));
					if (s.u('spearwhirl') > 0 || Math.abs(normalized) <= 2.1) {
						s.hit(e, (WEAPONS[s.weapon]?.damage || 52) * (0.9 + s.u('spearwhirl') * 0.15), 70);
						s.burst(e.x, e.y, 0x76ff03, 5);
					}
				}
			}
		}

		// Handle Forward Lunge
		if (this.thrustTime > 0) {
			this.thrustTime = Math.max(0, this.thrustTime - dt);
			if (this.thrustTime <= 0.28 && this.thrustTime > 0.2) {
				const lungeDist = 220 * (1 + (s.u('thunderthrust') > 0 ? 0.4 : 0));
				const lx = Math.cos(this.sweepAim);
				const ly = Math.sin(this.sweepAim);
				for (const e of s.enemies) {
					if (!e.active) continue;
					const dx = e.x - s.x;
					const dy = e.y - s.y;
					const dot = dx * lx + dy * ly;
					if (dot > 0 && dot <= lungeDist) {
						const projX = dot * lx;
						const projY = dot * ly;
						const perpDist = Math.hypot(dx - projX, dy - projY);
						if (perpDist <= 32 + e.r) {
							const lungeDmg = (WEAPONS[s.weapon]?.damage || 52) * 1.6 * (1 + s.u('thunderthrust') * 0.3);
							s.hit(e, lungeDmg, 90);
							e.stagger = Math.max(e.stagger || 0, 0.6);
							s.burst(e.x, e.y, s.evolved('thunderthrust') ? 0x00e5ff : 0xffd700, 6);
						}
					}
				}
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
		this.sweepTime = 0;
		this.thrustTime = 0;
		this.phalanx.active = false;
		this.spears.length = 0;
	}

	render(time: number) {
		const g = this.effects;
		const f = this.ground;
		g.clear();
		f.clear();

		// 1. Crescent Sweep: Volumetric Emerald & Jade Dragon Blade Ribbon
		if (this.sweepTime > 0) {
			const sweepRadius = (WEAPONS[this.s.weapon]?.range || 160) * 1.14;
			const progress = 1 - this.sweepTime / 0.28;
			const alpha = Math.max(0, 1 - progress * 0.7);

			// Outer emerald wind vortex
			g.lineStyle(14, 0x00e676, alpha * 0.45);
			g.beginPath();
			g.arc(this.s.x, this.s.y, sweepRadius, this.sweepAim - 2.2, this.sweepAim + 2.2);
			g.strokePath();

			// Core radiant jade blade ribbon
			g.lineStyle(6, 0x69f0ae, alpha * 0.95);
			g.beginPath();
			g.arc(this.s.x, this.s.y, sweepRadius - 2, this.sweepAim - 2.1, this.sweepAim + 2.1);
			g.strokePath();

			// Razor white-hot cutting edge
			g.lineStyle(2, 0xffffff, alpha);
			g.beginPath();
			g.arc(this.s.x, this.s.y, sweepRadius - 4, this.sweepAim - 2.0, this.sweepAim + 2.0);
			g.strokePath();

			// Centrifugal cutting sparks flying tangentially
			for (let i = 0; i < 7; i++) {
				const sparkA = this.sweepAim - 2.0 + (i / 6) * 4.0;
				const r = sweepRadius + (Math.sin(time * 15 + i) * 10);
				const sx = this.s.x + Math.cos(sparkA) * r;
				const sy = this.s.y + Math.sin(sparkA) * r;
				// Tangential vector
				const tanX = -Math.sin(sparkA) * (6 + i * 2);
				const tanY = Math.cos(sparkA) * (6 + i * 2);
				g.fillStyle(0xffffff, alpha);
				g.fillCircle(sx, sy, 2);
				g.lineStyle(1.5, 0x76ff03, alpha * 0.8);
				g.lineBetween(sx, sy, sx + tanX, sy + tanY);
			}

			// Leading blade glint
			const tipA = this.sweepAim + 2.1;
			g.fillStyle(0xffffff, 1);
			g.fillCircle(this.s.x + Math.cos(tipA) * sweepRadius, this.s.y + Math.sin(tipA) * sweepRadius, 5.5);
			g.lineStyle(1.5, 0x00e5ff, 0.9);
			g.strokeCircle(this.s.x + Math.cos(tipA) * sweepRadius, this.s.y + Math.sin(tipA) * sweepRadius, 8);
		}

		// 2. Piercing Lunge: Spiraling Golden-Cyan Conical Drill Beam
		if (this.thrustTime > 0.18 && this.thrustTime <= 0.28) {
			const lungeDist = 230;
			const lx = this.s.x + Math.cos(this.sweepAim) * lungeDist;
			const ly = this.s.y + Math.sin(this.sweepAim) * lungeDist;
			const perpA = this.sweepAim + Math.PI / 2;

			// Ground fracture lines under thrust trajectory
			f.lineStyle(3, 0x1b5e20, 0.6);
			f.lineBetween(this.s.x, this.s.y, lx, ly);
			f.lineStyle(1.5, 0x00e676, 0.4);
			for (let i = 1; i <= 6; i++) {
				const frac = i / 7;
				const gx = this.s.x + Math.cos(this.sweepAim) * (lungeDist * frac);
				const gy = this.s.y + Math.sin(this.sweepAim) * (lungeDist * frac);
				const off = (i % 2 === 0 ? 1 : -1) * 9;
				f.lineBetween(gx, gy, gx + Math.cos(perpA) * off, gy + Math.sin(perpA) * off);
			}

			// Main piercing energy shaft
			g.lineStyle(14, 0x00e676, 0.4);
			g.lineBetween(this.s.x, this.s.y, lx, ly);
			g.lineStyle(6, 0xffd700, 0.85);
			g.lineBetween(this.s.x, this.s.y, lx, ly);
			g.lineStyle(2, 0xffffff, 1);
			g.lineBetween(this.s.x, this.s.y, lx, ly);

			// Spiraling sonic drill flutes
			for (let i = 1; i <= 5; i++) {
				const frac = i / 6;
				const px = this.s.x + Math.cos(this.sweepAim) * (lungeDist * frac);
				const py = this.s.y + Math.sin(this.sweepAim) * (lungeDist * frac);
				const ringW = 16 * (1 - frac * 0.45);

				// Sonic compression rings
				g.lineStyle(2.5, 0x64ffda, 0.95);
				g.lineBetween(
					px - Math.cos(perpA) * ringW,
					py - Math.sin(perpA) * ringW,
					px + Math.cos(perpA) * ringW,
					py + Math.sin(perpA) * ringW
				);

				// Forward conical arrowheads
				g.lineStyle(1.5, 0xffffff, 0.8);
				g.lineBetween(
					px - Math.cos(perpA) * ringW,
					py - Math.sin(perpA) * ringW,
					px + Math.cos(this.sweepAim) * 10,
					py + Math.sin(this.sweepAim) * 10
				);
				g.lineBetween(
					px + Math.cos(perpA) * ringW,
					py + Math.sin(perpA) * ringW,
					px + Math.cos(this.sweepAim) * 10,
					py + Math.sin(this.sweepAim) * 10
				);
			}

			// Conical spearhead impact tip
			g.fillStyle(0xffffff, 1);
			g.fillCircle(lx, ly, 7);
			g.lineStyle(3, 0xffd700, 0.95);
			g.strokeCircle(lx, ly, 11);
			g.lineStyle(1.5, 0x00e5ff, 0.9);
			g.strokeCircle(lx, ly, 16);
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
