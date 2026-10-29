import {LethweiTechniques} from './lethwei-techniques';
import type {ArenaScene, Enemy} from './combat';
import {LETHWEI_SKILLS,validLethweiLoadout,type LethweiSkill} from './lethwei';
import {WEAPONS} from './config';
import {LethweiCloneRig,fighterPose} from './lethwei-rig';

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
 readonly techniques:LethweiTechniques;
 readonly equipped: [LethweiSkill, LethweiSkill];
 cooldowns: [number, number] = [0, 0];
 blitzTime = 0;
 private blitzAim = 0;
 private blitzDuration = .54 / 1.3;
 private blitzAfterimages: LethweiCloneRig[] = [];
 private blitzBeat = 0;
 private blitzPops: {x:number;y:number;angle:number;beat:number;life:number}[] = [];
 ironChinTime = 0;
 private chinFlash=0;
 private chinFade=0;
 private chinPulses:{x:number;y:number;tx:number;ty:number;life:number}[]=[];
 ring: Ring = { active: false, x: 0, y: 0, radius: 175, duration: 0, maxDuration: 6 };
 readonly clones: Clone[] = [];
 private cloneRigs: LethweiCloneRig[] = [];
 private blitzTrails: { x: number; y: number; angle: number; alpha: number }[] = [];
 private ropeCooldown: Map<Enemy, number> = new Map();
 private ground;
 private effects;
 private ringBack;

 constructor(private s: ArenaScene) {
  this.techniques=new LethweiTechniques(s);
  this.equipped = validLethweiLoadout(s.save.lethweiSkills);
  this.ground = s.add.graphics().setDepth(1.1);
  this.effects = s.add.graphics().setDepth(4.6);
  this.ringBack=s.add.graphics().setDepth(2.7);
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
   this.blitzDuration = .54 / 1.3;
   this.blitzTime = this.blitzDuration;this.blitzBeat=0;this.blitzPops=[];
   this.blitzAim = angle;
   s.protect(this.blitzDuration + .03);
   s.audio.play('moon-dash');
   s.notifyCombat('NINE-LIMB BLITZ');
  } else if (id === 'ironchin') {
   this.ironChinTime = 3.5;this.chinFlash=.3;this.chinFade=0;this.chinPulses=[];
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
     this.chinPulses.push({x:s.x,y:s.y-8,tx:e.x,ty:e.y,life:.3});
    }
   }
   this.chinFlash=.24;
   s.burst(s.x,s.y-8,0xffdf94,7);
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
  this.chinFlash=Math.max(0,this.chinFlash-dt);this.chinFade=Math.max(0,this.chinFade-dt);
  for(const p of this.chinPulses)p.life-=dt;
  this.chinPulses=this.chinPulses.filter(p=>p.life>0);
  if (this.ironChinTime > 0) {
   this.ironChinTime = Math.max(0, this.ironChinTime - dt);
   if(this.ironChinTime===0)this.chinFade=.4;
  }

  this.techniques.update(dt,this.ring);

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
     const dmg=(WEAPONS[s.weapon]?.damage||25)*(beat===2?.8:.5);
     s.hit(e,dmg,beat===2?65:24,false,false,'Nine-Limb Blitz');
     e.stagger=Math.max(e.stagger||0,beat===2?.7:.18);
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
  this.techniques.clear();
  this.ring.active = false;
  this.clones.length = 0;
  this.ropeCooldown.clear();
  this.blitzTime = 0;
  this.ironChinTime = 0;this.chinFlash=0;this.chinFade=0;this.chinPulses=[];
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
  this.ringBack.clear();
  this.techniques.render(g);

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

  // Champion guard: a polished title belt, glowing wraps and a readable reflected pulse.
  if(this.ironChinTime>0||(this.s.u('goldenbelt')>0&&this.s.hp<this.s.maxHp*.5)){
   const sx=this.s.x,sy=this.s.y,age=3.5-this.ironChinTime;
   const alpha=this.ironChinTime>0?Math.min(1,this.ironChinTime/.5):1,flash=this.chinFlash/.3;
   f.fillStyle(0xffce72,alpha*.09);f.fillEllipse(sx,sy+30,42,12);
   // A brief upward sweep announces activation, then leaves the face unobscured.
   if(age<.3){const y=sy+25-age/.3*70;g.lineStyle(3,0xffefbf,(1-age/.3)*.8);g.lineBetween(sx-17,y,sx+17,y);}
   // A real championship belt sits at the waist: leather strap, side plates and a grand center medallion.
   const by=sy+9;
   g.fillStyle(0x171d26,alpha*.95);g.fillRoundedRect(sx-22,by-5,44,11,4);
   g.lineStyle(1,0xb98032,alpha);g.strokeRoundedRect(sx-22,by-5,44,11,4);
   for(const dx of [-15,15]){
    g.fillStyle(0xe1ad49,alpha);g.fillRoundedRect(sx+dx-4,by-4,8,9,2);
    g.fillStyle(0xa83c45,alpha);g.fillCircle(sx+dx,by+.5,2);
    g.lineStyle(1,0xffedb2,alpha);g.lineBetween(sx+dx-2,by-3,sx+dx+2,by-3);
   }
   g.fillStyle(0xffcf69,alpha);g.fillEllipse(sx,by,20,18);
   g.lineStyle(1.5,0xfff0be,alpha);g.strokeEllipse(sx,by,20,18);
   g.fillStyle(0x963442,alpha);g.fillCircle(sx,by-1,6);
   g.fillStyle(0xffe6a0,alpha);g.fillTriangle(sx-4,by-3,sx,by-6,sx+4,by-3);g.fillRoundedRect(sx-4,by-3,8,5,1);
   // A restrained moving glint gives the metal a polished finish.
   const glint=Math.sin(time*3)*8;
   g.lineStyle(1,0xfff8da,alpha*.8);g.lineBetween(sx+glint-2,by-6,sx+glint+2,by+5);
   if(flash>0){
    for(let i=0;i<8;i++){const a=i*Math.PI/4,r=17+(1-flash)*8;g.lineStyle(1.5,0xffe09b,flash);g.lineBetween(sx+Math.cos(a)*r,by+Math.sin(a)*r*.65,sx+Math.cos(a)*(r+4),by+Math.sin(a)*(r+4)*.65);}
   }
   const flip=Math.cos(this.s.angle)<0,aim=Math.atan2(Math.sin(this.s.angle),Math.abs(Math.cos(this.s.angle)));
   for(const p of fighterPose(time,false,this.s.swing,this.s.attackSequence,undefined,.18,aim).filter(p=>p.part.includes('Forearm'))){
    const length=(.82-p.oy)*p.h;
    const x=sx+(p.x-Math.sin(p.r)*length)*.58*(flip?-1:1),y=sy+(p.y+Math.cos(p.r)*length-4)*.58;
    g.fillStyle(0xffe6a1,alpha*(.16+flash*.22));g.fillCircle(x,y,6);
    g.lineStyle(1,0xfff3ce,alpha*.65);g.beginPath();g.arc(x,y,5,-2.5,-.5);g.strokePath();
   }
  }
  for(const p of this.chinPulses){
   const t=1-p.life/.3,x=p.x+(p.tx-p.x)*t,y=p.y+(p.ty-p.y)*t;
   g.lineStyle(2,0xffda84,p.life/.3*.8);g.lineBetween(p.x+(p.tx-p.x)*Math.max(0,t-.22),p.y+(p.ty-p.y)*Math.max(0,t-.22),x,y);
   g.fillStyle(0xfff4d5,p.life/.3);g.fillCircle(x,y,3);
  }
  if(this.chinFade>0){
   const t=1-this.chinFade/.4;
   for(let i=0;i<12;i++){const a=i*Math.PI/6;g.fillStyle(0xffd985,(1-t)*.7);g.fillCircle(this.s.x+Math.cos(a)*(20+t*16),this.s.y-8+Math.sin(a)*25-t*8,1.5);}
  }

  // Physical ring: translucent canvas, elevated red ropes and polished padded posts.
  if (this.ring.active) {
   const rx=this.ring.x,ry=this.ring.y,W=this.ring.radius;
   const age=this.ring.maxDuration-this.ring.duration;
   const alpha=Math.min(1,age/.2,this.ring.duration/.6);
   const x0=rx-W,x1=rx+W,y0=ry-W,y1=ry+W;
   const back=this.ringBack;
   f.fillStyle(0x07131c,alpha*.35);f.fillRoundedRect(x0-20,y0-13,W*2+40,W*2+40,10);
   f.fillStyle(0x253641,alpha*.78);f.fillRoundedRect(x0-16,y0-16,W*2+32,W*2+32,8);
   // Front apron gives the platform a little depth without changing the collision boundary.
   f.fillStyle(0x14232d,alpha*.8);f.fillRoundedRect(x0-16,y1+3,W*2+32,14,5);
   f.fillStyle(0xe9bf79,alpha*.27);f.fillRect(x0,y0,W*2,W*2);
   f.lineStyle(2,0xffdfa0,alpha*.55);f.strokeRect(x0+9,y0+9,W*2-18,W*2-18);
   f.lineStyle(2,0xffe8b5,alpha*.3);f.strokeCircle(rx,ry,42);
   f.lineStyle(1,0xffe8b5,alpha*.2);f.strokeCircle(rx,ry,49);
   for(const [cx,cy,dx,dy,color] of [[x0,y0,1,1,0xf05b61],[x1,y0,-1,1,0x659adb],[x0,y1,1,-1,0xf3e4cb],[x1,y1,-1,-1,0xf3e4cb]]){
    f.fillStyle(color,alpha*.32);f.fillTriangle(cx,cy,cx+dx*43,cy,cx,cy+dy*43);
   }
   const corners=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
   for(let side=0;side<4;side++){
    const [ax,ay]=corners[side],[bx,by]=corners[(side+1)%4];
    const near=side===2?Math.abs(this.s.y-y1)<38&&this.s.x>x0-15&&this.s.x<x1+15:side===1?Math.abs(this.s.x-x1)<25:side===3?Math.abs(this.s.x-x0)<25:false;
    const rope=side===2?g:back,opacity=alpha*(near?.28:.94);
    for(const height of [8,18,28]){
     const lean=side===1?height*.24:side===3?-height*.24:0;
     rope.lineStyle(5,0x651c2a,opacity);rope.lineBetween(ax+lean,ay-height,bx+lean,by-height);
     rope.lineStyle(3,0xeb4b56,opacity);rope.lineBetween(ax+lean,ay-height-1,bx+lean,by-height-1);
     rope.lineStyle(1,0xffb3a3,opacity*.75);rope.lineBetween(ax+lean,ay-height-2,bx+lean,by-height-2);
    }
    for(const fraction of [.33,.67]){
     const x=ax+(bx-ax)*fraction,y=ay+(by-ay)*fraction;
     rope.lineStyle(3,0xffe3c3,opacity*.8);rope.lineBetween(x,y-30,x,y-6);
    }
   }
   corners.forEach(([x,y],i)=>{
    const post=i<2?back:g,color=i===0?0xe94c59:i===1?0x558aca:0xeee1c9;
    const fade=alpha*(Math.hypot(this.s.x-x,this.s.y-y)<35?.35:1);
    post.fillStyle(0x111d27,fade);post.fillEllipse(x,y+3,24,10);
    post.fillStyle(0x46596a,fade);post.fillRoundedRect(x-7,y-39,14,43,5);
    post.fillStyle(0xa9bbc5,fade);post.fillRoundedRect(x-5,y-38,4,39,2);
    post.fillStyle(0xd4e0e2,fade);post.fillEllipse(x,y-38,13,6);
    for(const h of [9,19,29]){
     post.fillStyle(0x752f39,fade);post.fillRoundedRect(x-11,y-h-5,22,10,4);
     post.fillStyle(color,fade);post.fillRoundedRect(x-10,y-h-5,20,8,3);
     post.lineStyle(1,0xfff3d6,fade*.7);post.lineBetween(x-5,y-h-3,x+4,y-h-3);
    }
    const light=this.ring.duration<2?.45+.35*Math.sin(time*8):.8;
    post.fillStyle(0xffd779,fade*light);post.fillCircle(x,y-39,3);
   });

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
