import type {ArenaScene, Enemy} from './combat';
import {LETHWEI_SKILLS,validLethweiLoadout,type LethweiSkill} from './lethwei';
import {WEAPONS} from './config';

type Clone = {
 x: number;
 y: number;
 angle: number;
 punchCooldown: number;
 punchVisual: number;
};

type Ring = {
 active: boolean;
 x: number;
 y: number;
 radius: number;
 duration: number;
 maxDuration: number;
};

export class LethweiCombat {
 readonly equipped: [LethweiSkill, LethweiSkill];
 cooldowns: [number, number] = [0, 0];
 blitzTime = 0;
 private blitzAim = 0;
 ironChinTime = 0;
 ring: Ring = { active: false, x: 0, y: 0, radius: 220, duration: 0, maxDuration: 9 };
 readonly clones: Clone[] = [];
 private ground;
 private effects;

 constructor(private s: ArenaScene) {
  this.equipped = validLethweiLoadout(s.save.lethweiSkills);
  this.ground = s.add.graphics().setDepth(1.1);
  this.effects = s.add.graphics().setDepth(4.6);
 }

 get damageReductionMultiplier(): number {
  let red = 1;
  if (this.ring.active && Math.hypot(this.s.x - this.ring.x, this.s.y - this.ring.y) <= this.ring.radius) {
   red *= 0.6; // 40% reduction
  }
  if (this.ironChinTime > 0) {
   red *= 0.5; // 50% reduction
  }
  if (this.s.u('goldenbelt') > 0 && this.s.hp < this.s.maxHp * 0.5) {
   red *= 0.65; // 35% extra reduction
  }
  return red;
 }

 activate(slot: number, dx = 0, dy = 0) {
  const s = this.s;
  if ((slot !== 0 && slot !== 1) || s.hero !== 'lethwei' || s.paused || s.ended || s.countdown > 0 || this.cooldowns[slot] > 0) {
   return false;
  }
  const id = this.equipped[slot];
  const angle = dx || dy ? Math.atan2(dy, dx) : s.angle;
  this.cooldowns[slot] = LETHWEI_SKILLS[id].cooldown * (s.options.build === 'mobility' ? 0.9 : 1);

  if (id === 'blitz') {
   this.blitzTime = 0.32 * (1 + s.u('ironshins') * 0.1);
   this.blitzAim = angle;
   s.protect(0.35);
   s.audio.play('moon-dash');
   s.notifyCombat('NINE-LIMB BLITZ');
  } else if (id === 'ironchin') {
   this.ironChinTime = 3.5;
   s.audio.play('lotus-guard');
   s.notifyCombat('IRON CHIN');
  } else if (id === 'lethweiring') {
   this.ring = {
    active: true,
    x: s.x,
    y: s.y,
    radius: 220,
    duration: 9,
    maxDuration: 9
   };
   this.clones.length = 0;
   const cloneCount = s.evolved('ringmaster') ? 4 : 2;
   for (let i = 0; i < cloneCount; i++) {
    const a = (i * Math.PI * 2) / cloneCount;
    this.clones.push({
     x: s.x + Math.cos(a) * 45,
     y: s.y + Math.sin(a) * 45,
     angle: a,
     punchCooldown: 0.2 + i * 0.15,
     punchVisual: 0
    });
   }
   s.cameras.main.shake(140, 0.0035);
   s.audio.play('tank-slam');
   s.notifyCombat(s.evolved('ringmaster') ? 'LETHWEI COLOSSEUM' : 'LETHWEI RING OF HONOR');
  }
  return true;
 }

 onDamageTaken(dmg: number) {
  if (this.ironChinTime > 0) {
   const s = this.s;
   const reflect = dmg * 0.7;
   for (const e of s.enemies) {
    if (e.active && Math.hypot(e.x - s.x, e.y - s.y) <= 120 + e.r) {
     s.hit(e, reflect, 35, false, false, 'Iron Chin Reflect');
    }
   }
   s.burst(s.x, s.y, 0xff5252, 10);
  }
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
  if (this.ironChinTime > 0) {
   this.ironChinTime = Math.max(0, this.ironChinTime - dt);
  }

  // Handle Blitz Dash
  if (this.blitzTime > 0) {
   const travel = Math.min(dt, this.blitzTime) * 820;
   const px = Math.cos(this.blitzAim) * travel;
   const py = Math.sin(this.blitzAim) * travel;
   const next = s.moveOnGround(s.x, s.y, px, py, 18);
   s.x = next.x;
   s.y = next.y;

   for (const e of s.enemies) {
    if (e.active && Math.hypot(e.x - s.x, e.y - s.y) <= 52 + e.r) {
     const dmg = (WEAPONS[s.weapon]?.damage || 25) * 1.8 * (1 + s.u('nineweapons') * 0.3);
     s.hit(e, dmg, 65);
     e.stagger = Math.max(e.stagger || 0, 0.7 + s.u('headbutt') * 0.25);
     if (s.evolved('headbutt')) e.flash = 0.4;
     s.burst(e.x, e.y, s.evolved('nineweapons') ? 0xff9800 : 0xff5252, s.evolved('nineweapons') ? 12 : 6);
    }
   }

   this.blitzTime = Math.max(0, this.blitzTime - dt);
  }

  // Handle Boxing Ring & Spirit Clones
  if (this.ring.active) {
   this.ring.duration -= dt;
   if (this.ring.duration <= 0) {
    this.ring.active = false;
    this.clones.length = 0;
   } else {
    // Ring rope collision: bounce enemies attempting to cross the perimeter
    for (const e of s.enemies) {
     if (!e.active) continue;
     const dist = Math.hypot(e.x - this.ring.x, e.y - this.ring.y);
     if (Math.abs(dist - this.ring.radius) <= 18 + e.r) {
      // Rebound inward safely
      const angleIn = Math.atan2(this.ring.y - e.y, this.ring.x - e.x);
      e.x = this.ring.x - Math.cos(angleIn) * (this.ring.radius - 28);
      e.y = this.ring.y - Math.sin(angleIn) * (this.ring.radius - 28);
      s.hit(e, 22, 40, false, false, 'Ring Ropes');
      s.burst(e.x, e.y, 0xffd700, 5);
     }
    }

    // Clones auto-fight
    for (const c of this.clones) {
     c.punchCooldown -= dt;
     c.punchVisual = Math.max(0, c.punchVisual - dt);

     // Find closest enemy inside or near ring
     let target: Enemy | null = null;
     let minDist = 240;
     for (const e of s.enemies) {
      if (!e.active) continue;
      const d = Math.hypot(e.x - c.x, e.y - c.y);
      if (d < minDist) {
       minDist = d;
       target = e;
      }
     }

     if (target) {
      c.angle = Math.atan2(target.y - c.y, target.x - c.x);
      if (minDist > 50) {
       const speed = 280 * dt;
       c.x += Math.cos(c.angle) * speed;
       c.y += Math.sin(c.angle) * speed;
       // Restrict clone to ring
       const dCenter = Math.hypot(c.x - this.ring.x, c.y - this.ring.y);
       if (dCenter > this.ring.radius - 20) {
        c.x = this.ring.x + (c.x - this.ring.x) / dCenter * (this.ring.radius - 20);
        c.y = this.ring.y + (c.y - this.ring.y) / dCenter * (this.ring.radius - 20);
       }
      } else if (c.punchCooldown <= 0) {
       // Punch target!
       c.punchCooldown = 0.35;
       c.punchVisual = 0.18;
       s.hit(target, (WEAPONS[s.weapon]?.damage || 25) * 1.1, 28, false, false, 'Spirit Clone Strike');
       s.burst(target.x, target.y, 0xff7043, 6);
      }
     }
    }
   }
  }
 }

 clear() {
  this.ring.active = false;
  this.clones.length = 0;
  this.blitzTime = 0;
  this.ironChinTime = 0;
 }

 render(time: number) {
  const g = this.effects;
  const f = this.ground;
  g.clear();
  f.clear();

  if (this.ironChinTime > 0) {
   f.fillStyle(0xd32f2f, 0.18);
   f.fillCircle(this.s.x, this.s.y, 35);
   g.lineStyle(2.5, 0xff5252, 0.85);
   g.strokeCircle(this.s.x, this.s.y, 30 + Math.sin(time * 10) * 3);
  }

  if (this.ring.active) {
   const rx = this.ring.x;
   const ry = this.ring.y;
   const r = this.ring.radius;
   const alpha = Math.min(1, this.ring.duration);

   // Ring canvas floor
   f.fillStyle(0x3e1818, alpha * 0.22);
   f.fillCircle(rx, ry, r);

   // Outer ring ropes (3 glowing levels)
   for (let i = 0; i < 3; i++) {
    const ropeR = r - i * 6;
    g.lineStyle(2, i === 0 ? 0xffd700 : i === 1 ? 0xff9800 : 0xd32f2f, alpha * 0.85);
    g.strokeCircle(rx, ry, ropeR);
   }

   // 4 Corner Posts (မြောက်၊ တောင်၊ အရှေ့၊ အနောက် သို့မဟုတ် ၄ ထောင့်)
   for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const px = rx + Math.cos(a) * r;
    const py = ry + Math.sin(a) * r;
    g.fillStyle(i % 2 === 0 ? 0xd32f2f : 0x1976d2, alpha);
    g.fillCircle(px, py, 7);
    g.lineStyle(1.5, 0xffffff, alpha);
    g.strokeCircle(px, py, 7);
   }

   // Clones rendering
   for (const c of this.clones) {
    // Glowing spirit body
    g.fillStyle(0xff5722, 0.65);
    g.fillCircle(c.x, c.y, 14);
    g.lineStyle(2, 0xffd700, 0.85);
    g.strokeCircle(c.x, c.y, 14);

    // Punch fist visual
    if (c.punchVisual > 0) {
     const fx = c.x + Math.cos(c.angle) * 24;
     const fy = c.y + Math.sin(c.angle) * 24;
     g.fillStyle(0xffd700, 0.9);
     g.fillCircle(fx, fy, 7);
     g.lineStyle(3, 0xffab00, 0.8);
     g.lineBetween(c.x, c.y, fx, fy);
    }
   }
  }
 }
}
