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

export class PyusawhtiCombat {
 readonly equipped: [PyusawhtiSkill, PyusawhtiSkill];
 cooldowns: [number, number] = [0, 0];
 windFocusTime = 0;
 readonly arrows: Arrow[] = [];
 readonly bursts: SunBurst[] = [];
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
   for (let i = -3; i <= 3; i++) {
    const a = angle + i * 0.15;
    const speed = 720;
    this.arrows.push({
     x: s.x + Math.cos(a) * 20,
     y: s.y + Math.sin(a) * 20,
     vx: Math.cos(a) * speed,
     vy: Math.sin(a) * speed,
     angle: a,
     damage: baseDmg,
     pierce: 3,
     remainingRange: 650,
     hitEnemies: new Set()
    });
   }
   s.audio.play('shotgun');
   s.notifyCombat('GALE VOLLEY');
  } else if (id === 'windfocus') {
   this.windFocusTime = 5;
   s.audio.play('overdrive');
   s.notifyCombat('WIND FOCUS');
  } else if (id === 'banepierce') {
   const baseDmg = (WEAPONS[s.weapon]?.damage || 28) * 3.4;
   const speed = 640;
   this.arrows.push({
    x: s.x + Math.cos(angle) * 25,
    y: s.y + Math.sin(angle) * 25,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    angle,
    damage: baseDmg,
    pierce: 99,
    remainingRange: 750,
    giant: true,
    sunburst: true,
    hitEnemies: new Set()
   });
   s.cameras.main.shake(120, 0.003);
   s.audio.play('tank-slam');
   s.notifyCombat('FIVE-BANE PIERCE');
  }
  return true;
 }

 bowAttack() {
  const s = this.s;
  if (s.paused || s.ended || s.swing > 0) return;
  s.attackSequence++;
  const w = WEAPONS[s.weapon];
  const speed = s.weapon === 'solarcrossbow' ? 820 : s.weapon === 'greatbow' ? 580 : 700;
  const pierce = (this.windFocusTime > 0 ? 12 : s.weapon === 'greatbow' ? 2 : 1) + s.u('pierce');
  const damage = (w?.damage || 28) * (this.windFocusTime > 0 ? 1.2 : 1) * (1 + s.u('damage') * 0.15);

  s.swing = (w?.cooldown || 0.35) / this.attackRateMultiplier;
  this.arrows.push({
   x: s.x + Math.cos(s.angle) * 22,
   y: s.y + Math.sin(s.angle) * 22,
   vx: Math.cos(s.angle) * speed,
   vy: Math.sin(s.angle) * speed,
   angle: s.angle,
   damage,
   pierce,
   remainingRange: w?.range || 650,
   sunburst: s.weapon === 'greatbow',
   hitEnemies: new Set()
  });

  s.audio.play('reload-swish');
 }

 private explodeSun(x: number, y: number, radius: number, damage: number) {
  const s = this.s;
  this.bursts.push({ x, y, age: 0, maxAge: 0.65, radius });
  for (const e of s.enemies) {
   if (e.active && Math.hypot(e.x - x, e.y - y) <= radius + e.r) {
    s.hit(e, damage, 45, false, false, 'Sunburst');
    if (e.active) e.burn = Math.max(e.burn, 3.5);
   }
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

  for (let i = this.bursts.length - 1; i >= 0; i--) {
   this.bursts[i].age += dt;
   if (this.bursts[i].age >= this.bursts[i].maxAge) {
    this.bursts.splice(i, 1);
   }
  }

  for (let i = this.arrows.length - 1; i >= 0; i--) {
   const a = this.arrows[i];
   const stepDist = Math.hypot(a.vx * dt, a.vy * dt);
   a.x += a.vx * dt;
   a.y += a.vy * dt;
   a.remainingRange -= stepDist;

   for (const e of s.enemies) {
    if (!e.active || a.hitEnemies.has(e)) continue;
    const hitRadius = e.r + (a.giant ? 16 : 8);
    if (Math.hypot(e.x - a.x, e.y - a.y) <= hitRadius) {
     a.hitEnemies.add(e);
     s.hit(e, a.damage, a.giant ? 60 : 18);
     s.burst(a.x, a.y, a.giant ? 0xffd700 : 0xf4cb55, a.giant ? 10 : 4);
     a.pierce--;
     if (a.giant) {
      e.stagger = Math.max(e.stagger, 0.4);
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
  this.windFocusTime = 0;
 }

 render(time: number) {
  const g = this.effects;
  const f = this.ground;
  g.clear();
  f.clear();

  if (this.windFocusTime > 0) {
   const pulse = 18 + Math.sin(time * 8) * 3;
   g.lineStyle(2, 0xfff099, 0.7);
   g.strokeCircle(this.s.x, this.s.y, pulse);
   for (let i = 0; i < 4; i++) {
    const angle = time * 5 + (i * Math.PI) / 2;
    const px = this.s.x + Math.cos(angle) * (pulse + 6);
    const py = this.s.y + Math.sin(angle) * (pulse + 6);
    g.fillStyle(0xffe066, 0.8);
    g.fillCircle(px, py, 2.5);
   }
  }

  for (const b of this.bursts) {
   const progress = b.age / b.maxAge;
   const fade = 1 - progress;
   const r = b.radius * Math.min(1, 0.3 + progress * 1.8);
   f.fillStyle(0xffae33, fade * 0.25);
   f.fillCircle(b.x, b.y, r);
   g.lineStyle(3, 0xffe680, fade);
   g.strokeCircle(b.x, b.y, r);
   g.fillStyle(0xfff7c2, fade * 0.8);
   g.fillCircle(b.x, b.y, r * 0.35);
  }

  for (const a of this.arrows) {
   const len = a.giant ? 38 : 18;
   const headX = a.x;
   const headY = a.y;
   const tailX = a.x - Math.cos(a.angle) * len;
   const tailY = a.y - Math.sin(a.angle) * len;

   g.lineStyle(a.giant ? 5 : 2.5, a.giant ? 0xffdf66 : 0xfffae0, 0.95);
   g.lineBetween(tailX, tailY, headX, headY);

   g.fillStyle(a.giant ? 0xffbb00 : 0xffd700, 1);
   g.fillCircle(headX, headY, a.giant ? 6 : 3);
  }
 }
}
