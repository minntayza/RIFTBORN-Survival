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
      // Repel and damage cleanly
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

  // Draw Crescent Sweep Arc
  if (this.sweepTime > 0) {
   const sweepRadius = (WEAPONS[this.s.weapon]?.range || 160) * 1.1;
   g.lineStyle(6, 0x76ff03, 0.85);
   g.beginPath();
   g.arc(this.s.x, this.s.y, sweepRadius, this.sweepAim - 2.1, this.sweepAim + 2.1);
   g.strokePath();

   g.lineStyle(2, 0xffffff, 0.95);
   g.beginPath();
   g.arc(this.s.x, this.s.y, sweepRadius - 4, this.sweepAim - 2.0, this.sweepAim + 2.0);
   g.strokePath();
  }

  // Draw Lunge Piercing Beam
  if (this.thrustTime > 0.2 && this.thrustTime <= 0.28) {
   const lungeDist = 220;
   const lx = this.s.x + Math.cos(this.sweepAim) * lungeDist;
   const ly = this.s.y + Math.sin(this.sweepAim) * lungeDist;
   g.lineStyle(8, 0xffd700, 0.7);
   g.lineBetween(this.s.x, this.s.y, lx, ly);
   g.lineStyle(3, 0xffffff, 0.95);
   g.lineBetween(this.s.x, this.s.y, lx, ly);
  }

  // Draw Phalanx Wall
  if (this.phalanx.active) {
   const pw = this.phalanx;
   const alpha = Math.min(1, pw.duration);
   const normX = -Math.sin(pw.angle) * (pw.width / 2);
   const normY = Math.cos(pw.angle) * (pw.width / 2);

   const x1 = pw.x - normX;
   const y1 = pw.y - normY;
   const x2 = pw.x + normX;
   const y2 = pw.y + normY;

   f.fillStyle(0x1b5e20, alpha * 0.35);
   f.fillCircle(pw.x, pw.y, pw.width / 2);

   g.lineStyle(8, 0x4caf50, alpha * 0.85);
   g.lineBetween(x1, y1, x2, y2);
   g.lineStyle(3, 0x76ff03, alpha * 0.95);
   g.lineBetween(x1, y1, x2, y2);

   // Energy shield posts at ends
   g.fillStyle(0xffd700, alpha);
   g.fillCircle(x1, y1, 6);
   g.fillCircle(x2, y2, 6);
  }

  // Draw Divine Spears & Lightning
  for (const sp of this.spears) {
   // Spear in ground
   f.fillStyle(0x00e676, 0.25);
   f.fillCircle(sp.x, sp.y, 45);

   g.lineStyle(5, 0xffd700, 0.95);
   g.lineBetween(sp.x, sp.y, sp.x, sp.y - 48);
   g.fillStyle(0x00e676, 1);
   g.fillCircle(sp.x, sp.y - 48, 6);

   // Lightning arcs
   for (let i = 0; i < 4; i++) {
    const a = time * 8 + (i * Math.PI) / 2;
    const lx = sp.x + Math.cos(a) * 65;
    const ly = sp.y + Math.sin(a) * 55;
    g.lineStyle(2, 0x64ffda, 0.8);
    g.lineBetween(sp.x, sp.y - 20, lx, ly);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(lx, ly, 2.5);
   }
  }
 }
}
