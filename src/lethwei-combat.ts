import type {ArenaScene, Enemy} from './combat';
import {LETHWEI_SKILLS,validLethweiLoadout,type LethweiSkill} from './lethwei';
import {WEAPONS} from './config';
import {LethweiCloneRig} from './lethwei-rig';

type Clone = {
 x: number;
 y: number;
 angle: number;
 punchCooldown: number;
 punchVisual: number;
 moving?: boolean;
 punchSequence: number;
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
 private blitzDuration = .54 / 1.3;
 private blitzAfterimages: LethweiCloneRig[] = [];
 private blitzBeat = 0;
 private blitzPops: {x:number;y:number;angle:number;beat:number;life:number}[] = [];
 ironChinTime = 0;
 ring: Ring = { active: false, x: 0, y: 0, radius: 175, duration: 0, maxDuration: 6 };
 readonly clones: Clone[] = [];
 private cloneRigs: LethweiCloneRig[] = [];
 private blitzTrails: { x: number; y: number; angle: number; alpha: number }[] = [];
 private ropeCooldown: Map<Enemy, number> = new Map();
 private ground;
 private effects;

 constructor(private s: ArenaScene) {
  this.equipped = validLethweiLoadout(s.save.lethweiSkills);
  this.ground = s.add.graphics().setDepth(1.1);
  this.effects = s.add.graphics().setDepth(4.6);
 }

 get damageReductionMultiplier(): number {
  let red = 1;
  const inRing =
   this.ring.active &&
   Math.abs(this.s.x - this.ring.x) <= this.ring.radius &&
   Math.abs(this.s.y - this.ring.y) <= this.ring.radius;
  if (inRing) {
   red *= 0.8; // 20% reduction (balanced from 40%)
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
   this.blitzDuration = (.54 / 1.3) * (1 + s.u('ironshins') * 0.1);
   this.blitzTime = this.blitzDuration;this.blitzBeat=0;this.blitzPops=[];
   this.blitzAim = angle;
   s.protect(this.blitzDuration + .03);
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
    radius: 175,
    duration: 6,
    maxDuration: 6
   };
   this.clones.length = 0;
   const cloneCount = s.evolved('ringmaster') ? 2 : 1;
   for (let i = 0; i < cloneCount; i++) {
    const a = (i * Math.PI * 2) / cloneCount;
    this.clones.push({
     x: s.x + Math.cos(a) * 45,
     y: s.y + Math.sin(a) * 45,
     angle: a,
     punchCooldown: 0.3 + i * 0.2,
     punchVisual: 0,
     moving: false,
     punchSequence: i
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
   this.blitzTrails.push({ x: s.x, y: s.y, angle: this.blitzAim, alpha: 0.85 });
   const travel = Math.min(dt, this.blitzTime) * (145 / (.54 / 1.3));
   const next = s.moveOnGround(s.x, s.y, Math.cos(this.blitzAim)*travel, Math.sin(this.blitzAim)*travel, 18);
   s.x = next.x;s.y = next.y;
   this.blitzTime = Math.max(0, this.blitzTime - dt);
   const progress=1-this.blitzTime/this.blitzDuration;
   // Three deliberate contacts: punch, elbow, then a stronger finishing contact.
   while(this.blitzBeat<3&&progress>=[.12,.46,.82][this.blitzBeat]){
    const beat=this.blitzBeat++;
    const x=s.x+Math.cos(this.blitzAim)*24,y=s.y+Math.sin(this.blitzAim)*24;
    this.blitzPops.push({x,y,angle:this.blitzAim,beat,life:beat===2?.5:.28});
    s.swing=.18;s.attackSequence++;
    for(const e of s.enemies){
     if(!e.active||Math.hypot(e.x-x,e.y-y)>(beat===2?65:48)+e.r)continue;
     const dmg=(WEAPONS[s.weapon]?.damage||25)*(beat===2?.8:.5)*(1+s.u('nineweapons')*.3);
     s.hit(e,dmg,beat===2?65:24,false,false,'Nine-Limb Blitz');
     e.stagger=Math.max(e.stagger||0,beat===2?.7+s.u('headbutt')*.25:.18);
     if(s.evolved('headbutt'))e.flash=.4;
     s.burst(e.x,e.y,beat===2?0xffcc61:0xfff1d1,beat===2?8:4);
    }
   }
  }
  for(const pop of this.blitzPops)pop.life-=dt;
  this.blitzPops=this.blitzPops.filter(pop=>pop.life>0);

  // Fade Blitz dash ghost trails
  for (const t of this.blitzTrails) {
   t.alpha -= dt * 3.8;
  }
  this.blitzTrails = this.blitzTrails.filter(t => t.alpha > 0);

  // Decay rope bounce cooldowns per enemy
  for (const [e, cd] of this.ropeCooldown.entries()) {
   if (cd <= dt || !e.active) this.ropeCooldown.delete(e);
   else this.ropeCooldown.set(e, cd - dt);
  }

  // Handle Boxing Ring & Spirit Clones
  if (this.ring.active) {
   this.ring.duration -= dt;
   if (this.ring.duration <= 0) {
    this.ring.active = false;
    this.clones.length = 0;
   } else {
    // Square Ring rope collision: bounce enemies attempting to cross any of the 4 ropes
    const rx = this.ring.x, ry = this.ring.y, W = this.ring.radius;
    const left = rx - W, right = rx + W, top = ry - W, bottom = ry + W;

    for (const e of s.enemies) {
     if (!e.active || this.ropeCooldown.has(e)) continue;
     if (e.x >= left - 24 && e.x <= right + 24 && e.y >= top - 24 && e.y <= bottom + 24) {
      const dLeft = Math.abs(e.x - left);
      const dRight = Math.abs(e.x - right);
      const dTop = Math.abs(e.y - top);
      const dBottom = Math.abs(e.y - bottom);
      const minD = Math.min(dLeft, dRight, dTop, dBottom);
      if (minD <= 18 + e.r) {
       // Rebound inward off the corresponding rope side
       if (minD === dLeft) e.x = left + 28;
       else if (minD === dRight) e.x = right - 28;
       else if (minD === dTop) e.y = top + 28;
       else if (minD === dBottom) e.y = bottom - 28;

       this.ropeCooldown.set(e, 0.65); // 0.65s cooldown per enemy
       s.hit(e, 18, 45, false, false, 'Ring Ropes');
       s.burst(e.x, e.y, 0xffd700, 6);
      }
     }
    }

    // Clones auto-fight
    for (const c of this.clones) {
     c.punchCooldown -= dt;
     c.punchVisual = Math.max(0, c.punchVisual - dt);

     // Find closest enemy inside or near ring
     let target: Enemy | null = null;
     let minDist = 180;
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
      if (minDist > 48) {
       c.moving = true;
       const speed = 220 * dt;
       c.x += Math.cos(c.angle) * speed;
       c.y += Math.sin(c.angle) * speed;
       // Restrict clone to square ring
       c.x = Math.max(left + 24, Math.min(right - 24, c.x));
       c.y = Math.max(top + 24, Math.min(bottom - 24, c.y));
      } else {
       c.moving = false;
       if (c.punchCooldown <= 0) {
        // Punch target!
        c.punchCooldown = 0.6; // Balanced from 0.35s to 0.6s
        c.punchVisual = 0.18;
        c.punchSequence++;
        const cloneDmg = (WEAPONS[s.weapon]?.damage || 25) * 0.6; // Balanced from 1.1x to 0.6x
        s.hit(target, cloneDmg, 24, false, false, 'Spirit Clone Strike');
        s.burst(target.x, target.y, 0xff7043, 5);
       }
      }
     } else {
      c.moving = false;
     }
    }
   }
  }
 }

 clear() {
  this.ring.active = false;
  this.clones.length = 0;
  this.ropeCooldown.clear();
  this.blitzTime = 0;
  this.ironChinTime = 0;
  this.blitzTrails.length = 0;
  for(const rig of this.blitzAfterimages)rig.setVisible(false);
  this.blitzPops.length = 0;this.blitzBeat=0;
  for (const rig of this.cloneRigs) {
   rig.setVisible(false);
  }
 }

 destroy() {
  this.clear();
  for (const rig of this.cloneRigs) {
   rig.destroy();
  }
  this.cloneRigs.length = 0;
  for(const rig of this.blitzAfterimages)rig.destroy();
  this.blitzAfterimages.length=0;
 }

 render(time: number) {
  const g = this.effects;
  const f = this.ground;
  g.clear();
  f.clear();

  // Two ivory silhouettes follow recent positions; no opaque cloud hides enemies.
  const trails=this.blitzTrails;
  for(let i=0;i<2;i++){
   if(!this.blitzAfterimages[i]&&trails.length)this.blitzAfterimages[i]=new LethweiCloneRig(this.s,2.9-i*.02);
   const rig=this.blitzAfterimages[i];if(!rig)continue;
   const targetAlpha=.85-(i+1)*.06*3.8;
   const t=trails.reduce<typeof trails[number]|undefined>((best,t)=>!best||Math.abs(t.alpha-targetAlpha)<Math.abs(best.alpha-targetAlpha)?t:best,undefined);
   if(t&&t.alpha<.78){rig.render(t.x,t.y,t.angle,time,true,.09,i,.18,Math.min(.25,t.alpha*(i===0?.35:.22)));}else rig.setVisible(false);
  }
  for(const [i,t] of trails.entries()){
   if(i%3!==0)continue;
   const fade=Math.max(0,t.alpha/.85),side=i%2?1:-1;
   const x=t.x-Math.sin(t.angle)*side*12,y=t.y+Math.cos(t.angle)*side*12;
   g.lineStyle(1.5,0xfff1d5,fade*.65);g.beginPath();g.arc(x,y,14,t.angle+Math.PI-.5,t.angle+Math.PI+.5);g.strokePath();
  }
  for(const pop of this.blitzPops){
   const alpha=Math.min(1,pop.life*7),x=pop.x,y=pop.y;
   for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5+pop.angle,r=18+(1-alpha)*15;
    const sx=x+Math.cos(a)*r,sy=y+Math.sin(a)*r;
    g.lineStyle(2,0xffe4a0,alpha);g.lineBetween(sx-3,sy,sx+3,sy);g.lineBetween(sx,sy-3,sx,sy+3);
   }
   if(pop.beat<2){
    g.lineStyle(pop.beat===0?4:3,0xfff2d7,alpha);g.beginPath();g.arc(x,y,13+(1-alpha)*8,pop.angle-1.1,pop.angle+1.1);g.strokePath();
    // Rounded contact puff rather than a sharp weapon slash.
    g.fillStyle(0xfff7e6,alpha*.75);g.fillCircle(x,y,6);g.fillCircle(x-5,y+2,4);g.fillCircle(x+5,y+2,4);
   }else{
    // Compact gold-and-ivory starburst marks the final contact.
    g.fillStyle(0xffd16d,alpha*.32);g.fillCircle(x,y,18+(1-alpha)*10);
    g.lineStyle(3,0xffd16d,alpha);
    for(let i=0;i<8;i++){
     const a=i*Math.PI/4+pop.angle,r=12+(1-alpha)*14;
     g.lineBetween(x+Math.cos(a)*r,y+Math.sin(a)*r,x+Math.cos(a)*(r+7),y+Math.sin(a)*(r+7));
    }
    g.fillStyle(0xfff7e6,alpha);g.fillCircle(x,y,6);

   }
  }

  // Iron Chin: Inwa Talisman Protection Mandala
  if (this.ironChinTime > 0) {
   const sx = this.s.x, sy = this.s.y;
   f.fillStyle(0xd32f2f, 0.22);
   f.fillCircle(sx, sy, 36);

   const wardR = 34 + Math.sin(time * 6) * 2;
   g.lineStyle(2.5, 0xffc107, 0.85);
   g.strokeCircle(sx, sy, wardR);
   g.lineStyle(1.5, 0xd32f2f, 0.9);
   g.strokeCircle(sx, sy, wardR - 6);

   // 6 Sacred talisman runes orbiting around fighter
   for (let i = 0; i < 6; i++) {
    const a = time * 2.5 + (i * Math.PI) / 3;
    const px = sx + Math.cos(a) * wardR;
    const py = sy + Math.sin(a) * wardR;
    g.fillStyle(0xffd700, 0.95);
    g.fillCircle(px, py, 3.5);
    g.lineStyle(1, 0xff5252, 0.8);
    g.strokeCircle(px, py, 5.5);
   }

   // 3 Floating Hexagonal Golden Deflection Shields
   for (let i = 0; i < 3; i++) {
    const a = -time * 2 + (i * Math.PI * 2) / 3;
    const hx = sx + Math.cos(a) * (wardR + 10);
    const hy = sy + Math.sin(a) * (wardR + 10);
    g.lineStyle(2, 0xffeb3b, 0.85);
    g.fillStyle(0x7f0000, 0.45);
    g.beginPath();
    for (let k = 0; k < 6; k++) {
     const ha = a + (k * Math.PI) / 3;
     const xk = hx + Math.cos(ha) * 7;
     const yk = hy + Math.sin(ha) * 7;
     if (k === 0) g.moveTo(xk, yk);
     else g.lineTo(xk, yk);
    }
    g.closePath();
    g.fillPath();
    g.strokePath();
   }
  }

  // Real Square Boxing Ring (မြန်မာ့လက်ဝှေ့ လေးထောင့် ကြိုးဝိုင်း)
  if (this.ring.active) {
   const rx = this.ring.x, ry = this.ring.y;
   const W = this.ring.radius;
   const alpha = Math.min(1, this.ring.duration);
   const apron = 24;

   const x0 = rx - W, y0 = ry - W; // Top-Left (Red Corner)
   const x1 = rx + W, y1 = ry - W; // Top-Right (Blue Corner)
   const x2 = rx + W, y2 = ry + W; // Bottom-Right (Neutral Corner)
   const x3 = rx - W, y3 = ry + W; // Bottom-Left (Neutral Corner)

   // 1. Elevated Wooden Platform Base & Apron (ကြိုးဝိုင်း စင်အောက်ခံ နှင့် အပြင်ဘောင်)
   // Platform drop shadow
   f.fillStyle(0x0a0304, alpha * 0.5);
   f.fillRect(rx - W - apron + 4, ry - W - apron + 6, (W + apron) * 2, (W + apron) * 2 + 6);

   // Platform apron surface (Dark stained teak wood / heavy canvas border)
   f.fillStyle(0x19080a, alpha * 0.7);
   f.fillRect(rx - W - apron, ry - W - apron, (W + apron) * 2, (W + apron) * 2);

   // Platform outer bevel trim
   g.lineStyle(3, 0x5d1d24, alpha * 0.85);
   g.strokeRect(rx - W - apron, ry - W - apron, (W + apron) * 2, (W + apron) * 2);

   // 2. Main Square Fighting Canvas (ကြိုးဝိုင်း ကြမ်းပြင် မတ်)
   f.fillStyle(0x280e12, alpha * 0.6);
   f.fillRect(x0, y0, W * 2, W * 2);

   // Corner Triangular Floor Pads (ထောင့်အခင်းများ)
   // Red Corner Triangle (Top-Left)
   f.fillStyle(0xd32f2f, alpha * 0.45);
   f.beginPath();
   f.moveTo(x0, y0);
   f.lineTo(x0 + 64, y0);
   f.lineTo(x0, y0 + 64);
   f.closePath();
   f.fillPath();

   // Blue Corner Triangle (Top-Right)
   f.fillStyle(0x1565c0, alpha * 0.45);
   f.beginPath();
   f.moveTo(x1, y1);
   f.lineTo(x1 - 64, y1);
   f.lineTo(x1, y1 + 64);
   f.closePath();
   f.fillPath();

   // Neutral White Corner Triangles (Bottom-Left & Bottom-Right)
   f.fillStyle(0xfff8e1, alpha * 0.28);
   f.beginPath();
   f.moveTo(x2, y2);
   f.lineTo(x2 - 48, y2);
   f.lineTo(x2, y2 - 48);
   f.closePath();
   f.fillPath();

   f.beginPath();
   f.moveTo(x3, y3);
   f.lineTo(x3 + 48, y3);
   f.lineTo(x3, y3 - 48);
   f.closePath();
   f.fillPath();

   // Canvas Boundary Lines (Painted 10px inside ropes)
   g.lineStyle(2, 0xffd54f, alpha * 0.65);
   g.strokeRect(x0 + 10, y0 + 10, (W - 10) * 2, (W - 10) * 2);

   // Center Ring Fight Circle & Lethwei Emblem (အလယ်ဗဟို အဝိုင်းနှင့် အမှတ်တံဆိပ်)
   g.lineStyle(2.5, 0xffc107, alpha * 0.65);
   g.strokeCircle(rx, ry, 54);
   g.lineStyle(1.5, 0xd32f2f, alpha * 0.5);
   g.strokeCircle(rx, ry, 48);

   // Crossed sacred cords emblem at center
   g.lineStyle(2, 0xffd700, alpha * 0.75);
   g.lineBetween(rx - 32, ry - 32, rx + 32, ry + 32);
   g.lineBetween(rx + 32, ry - 32, rx - 32, ry + 32);
   g.strokeRect(rx - 16, ry - 16, 32, 32);

   // Spiritual Protection Shimmer inside square canvas
   f.fillStyle(0xffd700, alpha * (0.04 + Math.sin(time * 3) * 0.02));
   f.fillRect(x0 + 10, y0 + 10, (W - 10) * 2, (W - 10) * 2);

   // 3. Four Straight Ropes on all 4 Sides (၄ ဘက် ကြိုးတန်း ၃ ထပ်စီ)
   const ropeTiers = [
    { offset: 0, color: 0xffd700, width: 3.5, core: true },
    { offset: 4, color: 0xff9800, width: 2.5, core: false },
    { offset: 8, color: 0xd32f2f, width: 2, core: false }
   ];

   for (const tier of ropeTiers) {
    const o = tier.offset;
    g.lineStyle(tier.width, tier.color, alpha * 0.95);
    // Top side: (x0, y0 + o) to (x1, y1 + o)
    g.lineBetween(x0, y0 + o, x1, y1 + o);
    // Right side: (x1 - o, y1) to (x1 - o, y2)
    g.lineBetween(x1 - o, y1, x1 - o, y2);
    // Bottom side: (x3, y2 - o) to (x2, y2 - o)
    g.lineBetween(x3, y2 - o, x2, y2 - o);
    // Left side: (x0 + o, y0) to (x0 + o, y3)
    g.lineBetween(x0 + o, y0, x0 + o, y3);

    if (tier.core) {
     g.lineStyle(1.5, 0xffffff, alpha * 0.95);
     g.lineBetween(x0, y0 + o, x1, y1 + o);
     g.lineBetween(x1 - o, y1, x1 - o, y2);
     g.lineBetween(x3, y2 - o, x2, y2 - o);
     g.lineBetween(x0 + o, y0, x0 + o, y3);
    }
   }

   // 4. Vertical Canvas Spacer Straps (ကြိုးထိန်း ကြိုးပြားများ)
   const strapOffsets = [0.33, 0.67];
   for (const frac of strapOffsets) {
    // Top side straps
    const topX = x0 + W * 2 * frac;
    g.lineStyle(5, 0x1a0608, alpha);
    g.lineBetween(topX, y0 - 1, topX, y0 + 10);
    g.lineStyle(2.5, 0xffca28, alpha);
    g.lineBetween(topX, y0 - 1, topX, y0 + 10);
    g.fillStyle(0xffffff, alpha);
    g.fillCircle(topX, y0, 1.8);
    g.fillCircle(topX, y0 + 4, 1.8);
    g.fillCircle(topX, y0 + 8, 1.8);

    // Bottom side straps
    const botX = x3 + W * 2 * frac;
    g.lineStyle(5, 0x1a0608, alpha);
    g.lineBetween(botX, y2 + 1, botX, y2 - 10);
    g.lineStyle(2.5, 0xffca28, alpha);
    g.lineBetween(botX, y2 + 1, botX, y2 - 10);
    g.fillCircle(botX, y2, 1.8);
    g.fillCircle(botX, y2 - 4, 1.8);
    g.fillCircle(botX, y2 - 8, 1.8);

    // Left side straps
    const leftY = y0 + W * 2 * frac;
    g.lineStyle(5, 0x1a0608, alpha);
    g.lineBetween(x0 - 1, leftY, x0 + 10, leftY);
    g.lineStyle(2.5, 0xffca28, alpha);
    g.lineBetween(x0 - 1, leftY, x0 + 10, leftY);
    g.fillCircle(x0, leftY, 1.8);
    g.fillCircle(x0 + 4, leftY, 1.8);
    g.fillCircle(x0 + 8, leftY, 1.8);

    // Right side straps
    const rightY = y1 + W * 2 * frac;
    g.lineStyle(5, 0x1a0608, alpha);
    g.lineBetween(x1 + 1, rightY, x1 - 10, rightY);
    g.lineStyle(2.5, 0xffca28, alpha);
    g.lineBetween(x1 + 1, rightY, x1 - 10, rightY);
    g.fillCircle(x1, rightY, 1.8);
    g.fillCircle(x1 - 4, rightY, 1.8);
    g.fillCircle(x1 - 8, rightY, 1.8);
   }

   // 5. Four Corner Posts & Padded Turnbuckle Cushions (ထောင့်တိုင်များနှင့် ထောင့်အကာအုံးများ)
   const corners = [
    { x: x0, y: y0, dx: -1, dy: -1, padColor: 0xd32f2f, name: 'Red Corner' },
    { x: x1, y: y1, dx: 1, dy: -1, padColor: 0x1565c0, name: 'Blue Corner' },
    { x: x2, y: y2, dx: 1, dy: 1, padColor: 0xf5f5f5, name: 'Neutral White' },
    { x: x3, y: y3, dx: -1, dy: 1, padColor: 0xf5f5f5, name: 'Neutral White' }
   ];

   for (const c of corners) {
    const postX = c.x + c.dx * 13;
    const postY = c.y + c.dy * 13;

    // Steel post base cylinder
    g.fillStyle(0x1a1a1a, alpha);
    g.fillCircle(postX, postY, 11);
    g.lineStyle(2, 0x424242, alpha);
    g.strokeCircle(postX, postY, 11);

    // Steel Turnbuckle hook cables connecting post to corner pad
    g.lineStyle(2.5, 0x9e9e9e, alpha * 0.9);
    g.lineBetween(postX, postY, c.x, c.y);
    g.lineStyle(1.5, 0xffffff, alpha * 0.9);
    g.lineBetween(postX, postY, c.x, c.y);

    // Heavy Padded Corner Turnbuckle Cushion (ထောင့်အကာအုံး)
    g.fillStyle(c.padColor, alpha);
    g.fillCircle(c.x, c.y, 11);

    g.lineStyle(2, c.padColor === 0xf5f5f5 ? 0x880e4f : 0xffffff, alpha * 0.95);
    g.strokeCircle(c.x, c.y, 11);

    // Cushion horizontal laces (အကာအုံး အချည်ကြိုး ၃ တန်း)
    g.lineStyle(1.5, 0xffffff, alpha * 0.9);
    g.lineBetween(c.x - 6, c.y - 4, c.x + 6, c.y - 4);
    g.lineBetween(c.x - 7, c.y, c.x + 7, c.y);
    g.lineBetween(c.x - 6, c.y + 4, c.x + 6, c.y + 4);

    // Polished Post Cap on top of steel post
    g.fillStyle(0xffeb3b, alpha);
    g.fillCircle(postX, postY, 4.5);
    g.lineStyle(1.5, 0xffffff, alpha * 0.85);
    g.lineBetween(postX - 7, postY, postX + 7, postY);
    g.lineBetween(postX, postY - 7, postX, postY + 7);
   }

   // 6. Corner Ring Steps (ကြိုးဝိုင်း လှေကားငယ်များ)
   // Red Corner Steps (Top-Left)
   f.fillStyle(0x3e1014, alpha * 0.8);
   f.fillRect(x0 - apron - 14, y0, 12, 34);
   g.lineStyle(1.5, 0xffd54f, alpha * 0.7);
   g.strokeRect(x0 - apron - 14, y0, 12, 34);
   g.lineBetween(x0 - apron - 14, y0 + 11, x0 - apron - 2, y0 + 11);
   g.lineBetween(x0 - apron - 14, y0 + 22, x0 - apron - 2, y0 + 22);

   // Blue Corner Steps (Top-Right)
   f.fillStyle(0x0d2b45, alpha * 0.8);
   f.fillRect(x1 + apron + 2, y1, 12, 34);
   g.lineStyle(1.5, 0x64b5f6, alpha * 0.7);
   g.strokeRect(x1 + apron + 2, y1, 12, 34);
   g.lineBetween(x1 + apron + 2, y1 + 11, x1 + apron + 14, y1 + 11);
   g.lineBetween(x1 + apron + 2, y1 + 22, x1 + apron + 14, y1 + 22);

   // 7. Ambient Spiritual Embers Floating Inside Arena
   for (let i = 0; i < 8; i++) {
    const ea = (i * Math.PI * 2) / 8 + time * 0.3;
    const er = (W * 0.25) + ((i * 37) % (W * 0.55));
    const ex = rx + Math.cos(ea) * er;
    const ey = ry + Math.sin(ea) * er - ((time * 30 + i * 20) % 50);
    g.fillStyle(0xffd54f, alpha * 0.7);
    g.fillCircle(ex, ey, 2 + (i % 2));
   }

   // 8. Clones: Real Animated Character Rigs & Spiritual Aura
   for (let i = 0; i < this.clones.length; i++) {
    const c = this.clones[i];

    // Ethereal golden shadow & spirit lotus footprint
    f.fillStyle(0x3e1508, 0.4);
    f.fillCircle(c.x, c.y + 10, 15);
    f.fillStyle(0xffa726, 0.18 + Math.sin(time * 6 + i) * 0.06);
    f.fillCircle(c.x, c.y, 22);

    // Render real character clone rig
    const rig = (this.cloneRigs[i] ??= new LethweiCloneRig(this.s));
    rig.render(c.x, c.y, c.angle, time, c.moving ?? false, c.punchVisual, c.punchSequence, 0.18);

    // Punch strike visual effects
    if (c.punchVisual > 0) {
     const progress = 1 - c.punchVisual / 0.18;
     const fx = c.x + Math.cos(c.angle) * (26 + progress * 12);
     const fy = c.y + Math.sin(c.angle) * (26 + progress * 12);

     // Concussive golden air shockwave ring
     g.lineStyle(3, 0xffeb3b, (1 - progress) * 0.95);
     g.strokeCircle(fx, fy, 8 + progress * 14);

     // Striking fist energy flare
     g.fillStyle(0xffd700, 0.95);
     g.fillCircle(fx, fy, 7);
     g.lineStyle(2, 0xffffff, 0.9);
     g.strokeCircle(fx, fy, 7);

     // Golden punch impact force lines
     for (let k = -1; k <= 1; k++) {
      const sparkA = c.angle + k * 0.35;
      g.lineStyle(2, 0xffa000, 0.85);
      g.lineBetween(fx, fy, fx + Math.cos(sparkA) * 16, fy + Math.sin(sparkA) * 16);
     }
    }
   }

   // Hide any unused rigs
   for (let i = this.clones.length; i < this.cloneRigs.length; i++) {
    this.cloneRigs[i].setVisible(false);
   }
  } else {
   for (const rig of this.cloneRigs) {
    rig.setVisible(false);
   }
  }
 }
}
