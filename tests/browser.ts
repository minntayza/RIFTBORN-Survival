import {weaponPose} from '../src/weapon-effects';
import {updateHud} from '../src/hud-dom';
import Phaser from 'phaser';
import { ArenaScene } from '../src/combat';
import { AudioManager } from '../src/audio';
import { freshSave, validateSave, purchase, storeSave, loadSave } from '../src/save';
const lines: string[] = [];
const out = document.querySelector('#results')!;
let failures = 0;
function check(name: string, fn: () => void) { try {
    fn();
    lines.push('PASS · ' + name);
}
catch (e) {
    failures++;
    lines.push('FAIL · ' + name + ' · ' + String(e));
} out.textContent = lines.join('\n'); }
function ok(v: unknown) { if (!v)
    throw Error('Assertion failed'); }
const save = freshSave();
check('HUD updates preserve button identity and focus across changing threats and cooldowns',()=>{
 const host=document.createElement('div');document.body.append(host);
 updateHud(host,'<div class="combat-hud"><button data-hud="pause">Pause</button><button data-hud="ability" disabled>3s</button></div>');
 const pause=host.querySelector<HTMLButtonElement>('[data-hud="pause"]')!,ability=host.querySelector('[data-hud="ability"]');pause.focus();
 for(let i=0;i<20;i++)updateHud(host,`${i%2?'<div class="edge-threat">Threat</div>':''}<div class="combat-hud"><button data-hud="pause">Pause</button><button data-hud="ability" aria-label="Ready">Ready</button></div>`);
 ok(host.querySelector('[data-hud="pause"]')===pause&&document.activeElement===pause);
 ok(host.querySelector('[data-hud="ability"]')===ability&&!ability!.hasAttribute('disabled')&&ability!.textContent==='Ready');host.remove();
});
const scene = new ArenaScene(save, new AudioManager(), () => { }, () => { }, () => { });
const game = new Phaser.Game({ type: Phaser.CANVAS, parent: 'fixture', width: 1200, height: 760, scene: [scene], audio: { noAudio: true } });
game.events.once('ready', () => {
    setTimeout(() => {
        game.loop.stop();
        check('Wave ten boss drops one magnet that collects distant XP and gold once',()=>{
          scene.stats.wave=10;scene.spawn('boss');
          const boss=scene.enemies.find(e=>e.active&&e.type==='boss')!;boss.x=scene.x+300;boss.y=scene.y;scene.kill(boss);
          ok(scene.bossMagnet?.active);scene.drop(scene.x+3000,scene.y,25,false);scene.drop(scene.x-3000,scene.y,30,true);
          const xp=scene.xp,gold=scene.save.gold;scene.xpNeed=100000;
          scene.x=scene.bossMagnet!.x;scene.y=scene.bossMagnet!.y;
          for(let i=0;i<240;i++)scene.updateDrops(1/60);
          ok(!scene.bossMagnet!.active&&scene.xp>=xp+25&&scene.save.gold>=gold+30&&!scene.drops.some(d=>d.active&&d.vacuum));
          const after=scene.save.gold;scene.collectBossMagnet();ok(scene.save.gold===after);
          scene.bossMagnet=undefined;scene.stats.wave=1;
        });
        check('Map view doubles visible world dimensions without resizing the canvas',()=>{
 const width=game.canvas.width,height=game.canvas.height;scene.save.settings.mapView=1;scene.applyMapView();const standard=scene.cameras.main.zoom;
 scene.save.settings.mapView=2;scene.applyMapView();ok(scene.cameras.main.zoom===standard/2&&game.canvas.width===width&&game.canvas.height===height);
 scene.save.settings.mapView=1;scene.applyMapView();
 });
        check('Corrupt and prototype-name saves recover', () => { const s = validateSave({ version: 1, heroes: ['toString', '__proto__'], weapons: ['constructor'], gold: NaN }); ok(s.heroes.length === 1 && s.weapons.length === 4 && s.gold === 0); });
        check('Purchases are persisted and selected compatible gear recovers', () => { const saved = localStorage.getItem('zombie-last-stand.v1'); try {
            const s = freshSave();
            s.gold = 1500;
            ok(purchase(s, 'heroes', 'samurai'));
            ok(!purchase(s, 'heroes', 'gunner'));
            s.hero = 'samurai';
            storeSave(s);
            const loaded = loadSave();
            ok(loaded.hero === 'samurai' && loaded.weapon === 'nodachi' && loaded.gold === 700);
        }
        finally {
            if (saved === null)
                localStorage.removeItem('zombie-last-stand.v1');
            else
                localStorage.setItem('zombie-last-stand.v1', saved);
        } });
        check('Ninja dash grants invulnerability and damages crossed enemies', () => { scene.hero = 'ninja'; scene.weapon = 'katana'; scene.spawn('basic'); const e = scene.enemies[0]; e.x = scene.x + 10; e.y = scene.y; const hp = e.hp; scene.activate(1, 0); scene.update(0, 16); ok(scene.invuln > 0 && e.hp < hp); });
        check('Samurai counter ignores hit and retaliates', () => { scene.hero = 'samurai'; scene.weapon = 'nodachi'; scene.ability = 0; scene.invuln = 0; scene.activate(0, 0); const hp = scene.hp; scene.hurt(30); ok(scene.hp === hp && scene.counter === 0 && !scene.save.mastery.samurai); });
        check('Gunner Overdrive instantly reloads without dashing', () => { scene.hero = 'gunner'; scene.weapon = 'pistols'; scene.ammo = 0; scene.reload = 1; scene.ability = 0;scene.dash=0; scene.activate(1, 0); ok(scene.ammo === scene.maxAmmo && scene.reload === 0 && scene.overdrive===3 && scene.dash===0); });
        check('Tank Ground Slam damages and slows nearby enemies', () => { scene.hero = 'tank'; scene.weapon = 'shield'; scene.ability = 0; scene.spawn('brute');const e=scene.enemies.find(e=>e.active&&e.type==='brute')!;e.x=scene.x+70;e.y=scene.y;const hp=e.hp;scene.activate(1, 0);ok(scene.dash===0&&e.hp<hp&&e.slow===2); });
        check('Boss and ordinary enemies survive a 50 second transition', () => { scene.hero = 'ninja'; scene.weapon = 'katana'; scene.paused = false; scene.dash = 0; scene.invuln = 100; scene.strongStop = 0; scene.waveTime = 49.99; scene.spawn('boss'); const boss = scene.enemies.find(e => e.active && e.type === 'boss')!; boss.x = 70; boss.y = 70; scene.spawnIndex = scene.plan.length; scene.update(0, 20); ok(scene.waiting && scene.paused && boss.active); scene.nextWave(); for (let i = 0; i < 126; i++)
            scene.update(0, 40); ok(scene.stats.wave === 2 && boss.active); });
        check('Paused update preserves health and wave clock', () => { scene.paused = true; const t = scene.waveTime, hp = scene.hp; scene.update(0, 40); ok(scene.waveTime === t && scene.hp === hp); scene.paused = false; });
        check('150 enemies remain responsive and safety cap holds', () => { for (const e of scene.enemies)
            e.active = false; for (let i = 0; i < 150; i++)
            scene.spawn('basic', i % 4, i / 150); ok(scene.count === 150); scene.invuln = 100; scene.waveTime = 1; scene.spawnIndex = scene.plan.length; const start = performance.now(); for (let i = 0; i < 120; i++)
            scene.update(0, 16.67); const avg = (performance.now() - start) / 120; lines.push(`MEASURE · 150-enemy update/render ${avg.toFixed(2)}ms average (Canvas)`); ok(avg < 16.67); for (let i = 0; i < 150; i++)
            scene.spawn('basic'); ok(scene.count === 240); });
        check('Enemy, particle, bullet and pickup pools reuse inactive entries', () => { for (const e of scene.enemies)
            e.active = false; const size = scene.enemies.length; scene.spawn('basic'); ok(scene.enemies.length === size); scene.shoot(100, 100, 0, 20); const b = scene.bullets[0]; b.active = false; const n = scene.bullets.length; scene.shoot(100, 100, 0, 20); ok(scene.bullets.length === n); scene.drop(100, 100, 2, true); for (const d of scene.drops)
            d.active = false; const nd = scene.drops.length; scene.drop(100, 100, 2, true); ok(scene.drops.length === nd); });
    check('Touch joystick retains aim without wasting shots into empty space',()=>{
 scene.paused=false;scene.ended=false;scene.waiting=false;scene.countdown=0;scene.waveTime=1;scene.touch={enabled:true,x:0,y:1};scene.hero='gunner';scene.weapon='pistols';scene.dash=0;scene.strongStop=0;scene.reload=0;scene.ammo=12;scene.attack=0;scene.xp=0;scene.xpNeed=10000;scene.invuln=100;for(const e of scene.enemies)e.active=false;for(const d of scene.drops)d.active=false;
 const before=scene.y;scene.update(0,16);ok(scene.y>before&&Math.abs(scene.angle-Math.PI/2)<.001&&scene.ammo===12);
 scene.touch.x=0;scene.touch.y=0;const stopped=scene.y;scene.attack=0;scene.update(0,16);ok(scene.y===stopped&&Math.abs(scene.angle-Math.PI/2)<.001&&scene.ammo===12);
 scene.touch.x=-1;scene.update(0,16);ok(Math.abs(Math.abs(scene.angle)-Math.PI)<.001);scene.touch=undefined;
 });
     check('Open world movement and projectiles work beyond original arena boundaries',()=>{
 scene.paused=false;scene.ended=false;scene.countdown=0;scene.strongStop=0;scene.touch={enabled:true,x:1,y:0};scene.dash=0;scene.x=2000;scene.y=-1000;scene.waveTime=1;scene.spawnIndex=scene.plan.length;scene.xp=0;scene.xpNeed=10000;for(const e of scene.enemies)e.active=false;for(const d of scene.drops)d.active=false;
 scene.update(0,16);ok(scene.x>2000&&scene.y===-1000);scene.shoot(scene.x,scene.y,0,10);const shot=scene.bullets.find(b=>b.active&&b.x===scene.x)!;scene.updateBullets(.01);ok(shot.active);scene.render();scene.spawn('basic',0,.5);const e=scene.enemies.find(e=>e.active)!;ok(Math.abs(e.x-scene.x)>100);scene.stats.wave=11;scene.startWave();ok(scene.floorTheme===1);scene.touch=undefined;
 });
 check('Rewards apply once and timed boosts start with the next wave',()=>{
 scene.stats.wave=11;scene.hp=50;scene.maxHp=100;scene.grantReward('heal');ok(scene.hp===75);scene.grantReward('shield');ok(scene.rewardShield===3);scene.invuln=0;scene.hurt(20);ok(scene.hp===75&&scene.rewardShield===2);
 scene.grantReward('damage');ok(scene.boostDamage===0);scene.stats.wave=12;scene.startWave();ok(scene.boostDamage===15&&scene.pendingReward===undefined);scene.startWave();ok(scene.boostDamage===0);
 const gold=scene.stats.gold;scene.grantReward('gold');ok(scene.stats.gold===gold+136);
 });
 check('Level-up cards continue beyond wave 19',()=>{
 scene.stats.wave=20;scene.paused=false;scene.hp=50;scene.xp=scene.xpNeed;scene.updateDrops(0);ok(scene.paused);scene.paused=false;
 });
 check('Laptop auto-attacks without a held mouse and abilities activate',()=>{
 const oldHero=scene.hero,oldWeapon=scene.weapon;scene.hero='gunner';scene.weapon='pistols';scene.touch={enabled:false,x:0,y:0};scene.paused=false;scene.ended=false;scene.countdown=0;scene.strongStop=0;scene.attack=0;scene.reload=0;scene.ammo=12;scene.plan=[];scene.waveTime=0;
 for(const e of scene.enemies)e.active=false;for(const b of scene.bullets)b.active=false;
 scene.spawn('basic');const target=scene.enemies.find(e=>e.active)!;target.x=scene.x+100;target.y=scene.y;target.hp=10000;
 scene.update(0,16);ok(scene.bullets.some(b=>b.active&&!b.hostile));
 scene.ability=0;scene.activate(0,0);ok(scene.overdrive>0&&scene.ability>0);scene.overdrive=0;scene.hero=oldHero;scene.weapon=oldWeapon;
 });
 check('Hero knockback is reduced 35% and boss attacks use normal timing',()=>{
 for(const e of scene.enemies)e.active=false;scene.spawn('basic');const e=scene.enemies.find(e=>e.active)!;e.x=scene.x+100;e.y=scene.y;e.hp=10000;scene.hit(e,1,100);ok(Math.abs(e.x-scene.x-165)<.001);
 scene.spawn('boss');const boss=scene.enemies.find(e=>e.active&&e.type==='boss')!;boss.attack=0;scene.updateEnemies(.01);ok(boss.telegraph===1.15&&boss.attack===4);
 });
 check('Weapon evolution changes firing and melee damage coverage',()=>{
 for(const e of scene.enemies)e.active=false;for(const b of scene.bullets)b.active=false;scene.hero='gunner';scene.weapon='pistols';scene.ammo=12;scene.reload=0;scene.options.mode='endless';scene.awakened=undefined;scene.fullEvolution=false;scene.stats.wave=10;scene.evolve('reach');scene.stats.wave=20;scene.evolve('reach');scene.basicAttack();const b=scene.bullets.find(b=>b.active&&!b.hostile)!;ok(b.pierce>=4&&!b.explosive);
 });
 check('Short mode waits for its final boss before awarding victory',()=>{
 scene.options.mode='short';scene.stats.wave=10;scene.paused=false;scene.waiting=false;scene.ended=false;scene.bossDefeated=false;scene.waveTime=50;scene.finishWave();ok(!scene.ended&&!scene.victory);for(const e of scene.enemies)e.active=false;scene.bossDefeated=true;scene.finishWave();ok(scene.ended&&scene.victory);scene.ended=false;scene.victory=false;scene.waiting=false;scene.options.mode='endless';
 });
 check('Legacy mastery techniques no longer change abilities; daily disables purchased bonuses',()=>{
 scene.paused=false;scene.ended=false;scene.hero='ninja';scene.weapon='katana';scene.ability=0;scene.options.technique='swift';scene.options.build='assault';scene.activate(1,0);ok(scene.dash===.35);scene.ability=0;scene.options.technique='fortified';scene.activate(1,0);ok(scene.dash===.35&&!scene.decoy);scene.save.permanent.damage=2;scene.options.mode='daily';ok(scene.meta('damage')===0);scene.options.mode='endless';ok(scene.meta('damage')===2);
 });
 check('Exploration objectives grant rewards exactly once',()=>{
 scene.stats.wave=4;scene.eventName='Hold the zone';scene.zone={x:scene.x,y:scene.y,progress:19.99,done:false};scene.waveObjectives=0;const gold=scene.stats.gold;scene.updateEvent(.02);ok(scene.zone.done&&scene.waveObjectives===1&&scene.stats.gold>gold);const earned=scene.stats.gold;scene.updateEvent(.1);ok(scene.stats.gold===earned);
 });
 check('Armed melee attacks can be dodged and riflemen lock before firing',()=>{
 scene.options.technique='standard';scene.options.build='assault';scene.options.mode='endless';scene.paused=false;scene.invuln=0;scene.rewardShield=0;scene.waveWard=false;scene.counter=0;scene.hero='ninja';scene.x=600;scene.y=380;scene.render();for(const e of scene.enemies)e.active=false;scene.spawn('spear');const guard=scene.enemies.find(e=>e.active)!;guard.x=scene.x-100;guard.y=scene.y;guard.attack=0;scene.updateEnemies(.01);ok(guard.telegraph===.8);scene.y+=100;const hp=scene.hp;scene.updateEnemies(.8);ok(scene.hp===hp);guard.active=false;scene.y=380;scene.spawn('rifle');const rifle=scene.enemies.find(e=>e.active)!;rifle.x=scene.x+120;rifle.y=scene.y;rifle.attack=0;scene.updateEnemies(.01);ok(rifle.telegraph===.9);const target=rifle.targetY;scene.y+=80;scene.updateEnemies(.9);ok(rifle.targetY===target&&scene.bullets.some(b=>b.active&&b.hostile));
 });
 check('Wind slash has a wide piercing hit area and damage feedback reports actual hits',()=>{
 for(const e of scene.enemies)e.active=false;for(const b of scene.bullets)b.active=false;scene.hero='samurai';scene.weapon='nodachi';scene.x=600;scene.y=380;scene.angle=0;scene.strongStop=0;scene.windSlash(20);const wind=scene.bullets.find(b=>b.active)!;ok(wind.kind==='wind'&&Math.hypot(wind.vx,wind.vy)===460);scene.spawn('basic');const e=scene.enemies.find(e=>e.active)!;e.x=scene.x+5;e.y=scene.y+30;e.hp=1000;scene.updateBullets(.01);ok(e.hp<1000&&wind.active);scene.invuln=0;scene.rewardShield=0;scene.waveWard=false;scene.counter=0;scene.hero='ninja';scene.hurt(12,e,Math.PI);ok(scene.damageFeedback.value===12&&Math.abs(scene.damageFeedback.angle-Math.atan2(e.y-scene.y,e.x-scene.x))<.001&&scene.damageFeedback.time>0);
 });
 check('SMG and hammer keep standard abilities despite legacy mastery',()=>{
 scene.paused=false;scene.ended=false;scene.options.mode='endless';scene.options.technique='fortified';scene.hero='gunner';scene.weapon='smg';scene.ability=0;scene.save.mastery.gunner={kills:250};scene.activate(1,0);ok(scene.maxAmmo===28+scene.u('magazine')*4&&scene.ammo===scene.maxAmmo&&scene.overdrive===3);scene.hero='tank';scene.weapon='hammer';scene.ability=0;scene.activate(0,0);ok(scene.dash===0);
 });
 check('Legacy Counter Wave technique no longer adds projectiles',()=>{
 scene.hero='samurai';scene.weapon='naginata';scene.options.technique='fortified';scene.paused=false;scene.ended=false;scene.ability=0;scene.invuln=0;scene.rewardShield=0;scene.waveWard=false;for(const b of scene.bullets)b.active=false;scene.activate(0,0);scene.hurt(20);ok(scene.counter===0&&!scene.bullets.some(b=>b.active&&b.kind==='wind'));
 });
 check('Legacy Covering Fire no longer adds backward shots',()=>{
 scene.hero='ninja';scene.weapon='kama';scene.x=600;scene.y=380;scene.decoy={x:500,y:380,life:4,angle:0};for(const e of scene.enemies)e.active=false;scene.spawn('basic');const e=scene.enemies.find(e=>e.active)!;e.x=560;e.y=380;const before=e.x;scene.updateEnemies(.01);ok(e.x<before);scene.decoy=undefined;for(const e of scene.enemies)e.active=false;for(const b of scene.bullets)b.active=false;scene.hero='gunner';scene.weapon='smg';scene.options.technique='fortified';scene.overdrive=3;scene.coveringClock=0;scene.touch={enabled:true,x:1,y:0};scene.angle=0;scene.paused=false;scene.ended=false;scene.countdown=0;scene.strongStop=0;scene.dash=0;scene.waveTime=1;scene.spawnIndex=scene.plan.length;scene.update(0,16);ok(scene.bullets.filter(b=>b.active&&!b.hostile&&b.vx<0).length===0);scene.touch=undefined;
 });
 check('Melee damage waits for the contact phase and firearm shots start at their muzzle',()=>{
 scene.hero='ninja';scene.weapon='katana';scene.angle=0;scene.x=600;scene.y=380;scene.touch=undefined;scene.paused=false;scene.ended=false;scene.strongStop=0;scene.dash=0;scene.pendingStrikes=[];for(const e of scene.enemies)e.active=false;scene.spawn('brute');const e=scene.enemies.find(e=>e.active)!;e.x=scene.x+70;e.y=scene.y;e.hp=1000;const hp=e.hp;scene.basicAttack();ok(e.hp===hp&&scene.pendingStrikes.length===1);scene.resolveStrike(scene.pendingStrikes[0]);ok(e.hp<hp);scene.pendingStrikes=[];for(const b of scene.bullets)b.active=false;scene.hero='gunner';scene.weapon='smg';scene.ammo=28;scene.reload=0;scene.basicAttack();const b=scene.bullets.find(b=>b.active&&!b.hostile)!;ok(b.x>scene.x+35&&Math.abs(b.y-scene.y)>1);
 });
 check('Card evolutions apply once alongside wave 10 awakening and wave 20 full evolution',()=>{
 scene.options.mode='endless';scene.awakened=undefined;scene.fullEvolution=false;scene.stats.wave=9;ok(!scene.evolutionDue);scene.stats.wave=10;ok(scene.evolutionDue);scene.evolve('reach');ok(scene.awakened==='reach'&&scene.evolution.reach===1&&!scene.evolutionDue);scene.stats.wave=19;ok(!scene.evolutionDue);scene.stats.wave=20;ok(scene.evolutionDue);scene.evolve('power');ok(scene.evolution.reach===2&&scene.evolution.power===0&&scene.fullEvolution&&!scene.evolutionDue);scene.levels.damage=5;scene.paused=true;scene.apply('evolve:damage');ok(scene.cardEvolutions.damage&&scene.levels.damage===6&&!scene.paused);scene.apply('evolve:damage');ok(scene.levels.damage===6);scene.stats.wave=20;scene.levels.orbit=3;scene.apply('evolve:orbit');ok(scene.cardEvolutions.orbit);
 });
 check('Elemental weapons chain lightning and apply burning without infinite procs',()=>{
 for(const e of scene.enemies)e.active=false;scene.hero='ninja';scene.weapon='katana';scene.evolution.reach=2;scene.evolution.power=2;scene.elementClock=0;scene.spawn('brute');scene.spawn('brute');const es=scene.enemies.filter(e=>e.active);es[0].x=scene.x+40;es[0].y=scene.y;es[1].x=scene.x+90;es[1].y=scene.y;es.forEach(e=>e.hp=10000);scene.hit(es[0],20,0);ok(es[0].burn===3&&es[1].hp<10000);
 });
 check('Mini bosses fire volleys and command reinforcements with a timed aura',()=>{
 for(const e of scene.enemies)e.active=false;for(const b of scene.bullets)b.active=false;scene.spawn('shooterBoss');const shooter=scene.enemies.find(e=>e.active)!;shooter.x=scene.x+100;shooter.y=scene.y;shooter.telegraph=.01;shooter.targetX=scene.x;shooter.targetY=scene.y;scene.updateEnemies(.02);scene.updateEnemies(.15);scene.updateEnemies(.15);ok(scene.bullets.filter(b=>b.active&&b.hostile).length>=3);shooter.active=false;scene.spawn('commander');const c=scene.enemies.find(e=>e.active)!;c.x=scene.x+100;c.y=scene.y;c.telegraph=.01;scene.updateEnemies(.02);ok(c.commandTime>0&&scene.count>=5);
 });
 check('General charge travels along its locked path and does not teleport or track the hero',()=>{
 scene.mapCars=[];
 for(const e of scene.enemies)e.active=false;scene.firePatches=[];scene.spawn('boss');const b=scene.enemies.find(e=>e.active)!;scene.x=600;scene.y=600;b.x=400;b.y=380;b.targetX=600;b.targetY=380;b.phase=2;b.telegraph=.01;b.attack=4;scene.updateEnemies(.02);ok(b.x===400&&b.chargeTime===.65);scene.updateEnemies(.2);ok(b.x>400&&b.x<600&&b.y===380);scene.updateEnemies(.5);ok(b.x===600&&b.y===380&&b.chargeTime===0);
 });
 check('Hero identities reward movement, separate hits, reloads and close combat',()=>{
 for(const e of scene.enemies)e.active=false;scene.firePatches=[];scene.evolution={reach:0,power:0,tempo:0};scene.cardEvolutions={};scene.pendingStrikes=[];scene.levels={};scene.hero='ninja';scene.weapon='katana';scene.identityCharge=100;scene.basicAttack();ok(scene.identityCharge===100);scene.spawn('brute');const ninjaTarget=scene.enemies.find(e=>e.active)!;const pose=weaponPose('katana',scene.x,scene.y,scene.angle,.55,true,scene.attackSequence);ninjaTarget.x=pose.tip.x;ninjaTarget.y=pose.tip.y;ninjaTarget.hp=100000;scene.resolveStrike(scene.pendingStrikes.shift()!);ok(scene.identityCharge===0&&scene.pendingStrikes.some(s=>s.echo));scene.pendingStrikes=[];ninjaTarget.active=false;
 scene.hero='samurai';scene.weapon='nodachi';scene.identityCharge=0;scene.identitySequence=-1;scene.spawn('brute');const target=scene.enemies.find(e=>e.active)!;target.hp=100000;target.x=scene.x+30;target.y=scene.y;for(let i=0;i<5;i++){scene.attackSequence++;scene.hit(target,1,0);}ok(scene.identityCharge===100);const previous=scene.identityCharge;scene.hit(target,1,0);ok(scene.identityCharge===previous);
 scene.hero='gunner';scene.weapon='pistols';scene.reload=.01;scene.openingShots=0;scene.paused=false;scene.ended=false;scene.countdown=0;scene.strongStop=0;scene.touch={enabled:false,x:0,y:0};scene.waveTime=0;scene.plan=[];scene.update(0,20);ok(scene.openingShots===3);
 scene.hero='tank';scene.weapon='hammer';scene.identityCharge=100;scene.hit(target,1,0);ok(scene.identityCharge===0);
 });
 check('Optional landmarks reward completion once, and recovery allows safe collection',()=>{
 for(const e of scene.enemies)e.active=false;scene.landmark={kind:'beacon',x:scene.x,y:scene.y,progress:.01,done:false,guards:[]};const before=scene.objectives;scene.updateLandmark(6);ok(scene.landmark.done&&scene.objectives===before+1);scene.updateLandmark(6);ok(scene.objectives===before+1);
 scene.landmark={kind:'cache',x:scene.x,y:scene.y,progress:0,done:false,guards:[]};scene.updateLandmark(.02);ok(!scene.landmark.done&&scene.landmark.guards.length===3);for(const guard of [...scene.landmark.guards])scene.kill(guard);scene.updateLandmark(.02);ok(scene.landmark.done);
 scene.paused=false;scene.ended=false;scene.strongStop=0;scene.countdown=3;scene.touch={enabled:true,x:1,y:0};const x=scene.x,hp=scene.hp;scene.update(0,40);ok(scene.x>x&&scene.hp===hp&&scene.countdown<3);
 });
 check('Mobile aim assistance targets a pursuer while movement still retreats',()=>{
 for(const e of scene.enemies)e.active=false;for(const d of scene.drops)d.active=false;scene.hero='gunner';scene.weapon='pistols';scene.levels={};scene.evolution={reach:0,power:0,tempo:0};scene.pendingStrikes=[];scene.firePatches=[];scene.touch={enabled:true,x:1,y:0};scene.save.settings.aimAssist=true;scene.spawn('brute');const e=scene.enemies.find(e=>e.active)!;e.x=scene.x-90;e.y=scene.y;e.hp=10000;scene.paused=false;scene.ended=false;scene.countdown=0;scene.strongStop=0;scene.reload=0;scene.attack=0;scene.ammo=12;scene.spawnIndex=scene.plan.length;scene.waveTime=1;scene.xp=0;scene.xpNeed=10000;const x=scene.x;scene.update(0,16);ok(scene.x>x&&Math.cos(scene.angle)<-.9&&scene.ammo===11);scene.touch=undefined;
 });
 check('Wind spreads fire, counters return shots, and dash kills extend a shadow',()=>{
 for(const e of scene.enemies)e.active=false;for(const b of scene.bullets)b.active=false;scene.hero='samurai';scene.weapon='nodachi';scene.evolution={reach:0,power:0,tempo:0};scene.levels={wind:1,fire:1};scene.spawn('brute');scene.spawn('brute');const es=scene.enemies.filter(e=>e.active);es.forEach((e,i)=>{e.x=scene.x+80+i*40;e.y=scene.y;e.hp=10000;e.burn=0;});scene.shoot(es[0].x,es[0].y,0,1,false,4,false,false,'wind');scene.updateBullets(.001);ok(es[0].burn>0&&es[1].burn>0);
 for(const b of scene.bullets)b.active=false;scene.shoot(scene.x+70,scene.y,Math.PI,10,true);scene.counter=.5;scene.invuln=0;scene.rewardShield=0;scene.waveWard=false;scene.hurt(10,undefined,0,'Rifle shot');ok(scene.bullets.some(b=>b.active&&!b.hostile&&b.source==='Steel Reversal'));for(const b of scene.bullets)b.active=false;scene.shoot(scene.x+1,scene.y,Math.PI,10,true);scene.counter=.5;scene.invuln=0;scene.updateBullets(.001);ok(scene.bullets.some(b=>b.active&&!b.hostile&&b.source==='Steel Reversal'));
 scene.hero='ninja';scene.weapon='katana';scene.levels={double:1};scene.clone=0;scene.dash=.2;scene.synergyClock=0;scene.kill(es[0]);ok(scene.clone>=3&&scene.clone<=8);scene.dash=0;
 });
 check('Combat caches grant XP, early wave clears grant no bonus level-ups, damage direction remains clear',()=>{
 for(const e of scene.enemies)e.active=false;scene.landmark=undefined;scene.hero='ninja';scene.levels={};scene.stats.kills=9;scene.combatCaches.clear();scene.spawn('basic');const e=scene.enemies.find(e=>e.active)!;scene.xp=0;scene.xpNeed=100;scene.kill(e);ok(scene.xp===45&&scene.combatCaches.has(10));scene.invuln=0;scene.counter=0;scene.rewardShield=0;scene.waveWard=false;scene.hp=scene.maxHp;e.x=scene.x-50;e.y=scene.y;scene.hurt(1,e,0);ok(Math.cos(scene.damageFeedback.angle)<-.99);scene.stats.wave=3;scene.waveStats.kills=40;scene.waveStats.damage=1;scene.waiting=false;scene.ended=false;scene.finishWave();ok(scene.xp===45);
 });
 check('Gunner piercing splits once and Tank Slam leaves a damaging aftershock',()=>{
 for(const e of scene.enemies)e.active=false;for(const b of scene.bullets)b.active=false;scene.hero='gunner';scene.weapon='pistols';scene.levels={pierce:1,ricochet:1};scene.evolution={reach:0,power:0,tempo:0};scene.spawn('brute');scene.spawn('brute');const targets=scene.enemies.filter(e=>e.active);targets[0].x=scene.x+80;targets[0].y=scene.y;targets[1].x=scene.x+120;targets[1].y=scene.y+60;targets.forEach(e=>e.hp=10000);scene.shoot(targets[0].x,targets[0].y,0,2,false,1);const original=scene.bullets.find(b=>b.active)!;scene.updateBullets(.001);ok(original.vy===0&&scene.bullets.filter(b=>b.active&&b.source==='Crossfire').length===1);
 scene.hero='tank';scene.weapon='hammer';scene.levels={rush:1,fire:1};scene.paused=false;scene.ended=false;scene.ability=0;scene.firePatches=[];scene.activate(1,0);ok(scene.firePatches.length===1&&scene.firePatches[0].life===3);
 });
 check('Crowd pressure defers ordinary packs without postponing the boss',()=>{
 for(const e of scene.enemies)e.active=false;scene.landmark=undefined;scene.hero='ninja';scene.weapon='katana';scene.levels={};scene.pendingStrikes=[];scene.pendingEchoes=[];scene.firePatches=[];scene.touch=undefined;scene.paused=false;scene.ended=false;scene.countdown=0;scene.strongStop=0;scene.waveTime=1;scene.spawnPulse=0;scene.spawnIndex=0;scene.plan=[{time:0,type:'basic',count:4,formation:0},{time:0,type:'boss',count:1,formation:0}];scene.xp=0;scene.xpNeed=10000;for(let i=0;i<18;i++){const e=scene.spawn('basic')!;e.x=scene.x+100+Math.cos(i)*20;e.y=scene.y+Math.sin(i)*20;}scene.update(0,16);ok(scene.plan[0].count===4&&scene.enemies.some(e=>e.active&&e.type==='boss'));
 });
 check('Wave five grants one hero awakening and its power remains in late waves',()=>{
 scene.options.mode='endless';scene.stats.wave=5;scene.waiting=false;scene.ended=false;scene.earlyAwakened=false;scene.finishWave();ok(scene.earlyAwakened&&scene.earlyPower);scene.stats.wave=11;ok(scene.earlyPower);
 });
 check('Only XP causes upgrade choices; damage labels merge in a crowded early fight',()=>{
 scene.stats.wave=4;scene.xp=scene.xpNeed;scene.paused=false;let choices=0;const original=scene.onChoice;scene.onChoice=wave=>{if(!wave)choices++;};scene.updateDrops(0);ok(choices===1&&scene.paused);scene.onChoice=original;
 scene.numbers.forEach(n=>n.life=0);scene.number(100,100,10);scene.number(100,100,15);ok(scene.numbers.filter(n=>n.life>0).length===1&&scene.numbers.find(n=>n.life>0)!.text.text==='25');
 });
 check('Final boss clears pursuit and victory preserves legacy mastery',()=>{
 const legacyMastery=JSON.stringify(scene.save.mastery);scene.options.mode='short';scene.stats.wave=10;scene.ended=false;scene.waiting=false;scene.bossDefeated=false;scene.bossMagnet=undefined;scene.spawn('basic');scene.spawn('boss');const boss=scene.enemies.find(e=>e.active&&e.type==='boss')!;scene.kill(boss);ok(!scene.enemies.some(e=>e.active));scene.xp=200;scene.collectBossMagnet();for(let i=0;i<240;i++)scene.updateDrops(1/60);scene.finishWave();ok(scene.victory&&JSON.stringify(scene.save.mastery)===legacyMastery);
 });
 check('Healing feedback reports actual HP restored and stays silent at full health',()=>{
 scene.hp=96;scene.maxHp=100;scene.hpChanges=[];scene.heal(20);ok(scene.hp===100&&scene.hpChanges[0].delta===4);scene.hpChanges=[];scene.heal(10);ok(scene.hpChanges.length===0);scene.showHpChange(-4);scene.showHpChange(-6);ok(scene.hpChanges.length===2&&scene.hpChanges[0].delta===-4&&scene.hpChanges[1].delta===-6&&scene.hpChanges[0].id!==scene.hpChanges[1].id);
 });
 check('Two Wanderers produce separate real bite damage and popups; repeated bites and dash remain protected',()=>{
 scene.ended=false;scene.paused=false;scene.hero='ninja';scene.weapon='katana';scene.counter=0;scene.rewardShield=0;scene.waveWard=false;scene.invuln=0;scene.hp=100;scene.maxHp=100;scene.hpChanges=[];scene.enemies.forEach(e=>e.active=false);const first=scene.spawn('basic')!,second=scene.spawn('basic')!;
 scene.hurt(4,first,0,'Zombie bite',true);scene.hurt(4,second,0,'Zombie bite',true);ok(scene.hp===92&&scene.hpChanges.length===2&&scene.hpChanges.every(p=>p.delta===-4));scene.hurt(4,first,0,'Zombie bite',true);ok(scene.hp===92&&scene.hpChanges.length===2);
 scene.ability=0;scene.activate(1,0);const third=scene.spawn('basic')!;scene.hurt(4,third,0,'Zombie bite',true);ok(scene.hp===92&&scene.hpChanges.length===2);
 });
 check('Robot factory and gardens share stable coordinates and movement collision in both directions',()=>{
 scene.stats.wave=11;scene.robotOrigin={x:600,y:380};scene.x=600;scene.y=380;scene.drawFloor();scene.render();ok(scene.robotSector==='ROBOT FACTORY'&&scene.mapCars.length>0);const anchor=scene.robotOrigin;const floors=scene.children.list.filter((child):child is Phaser.GameObjects.Image=>child instanceof Phaser.GameObjects.Image&&child.visible&&child.texture.key==='robot-factory-ground');ok(floors.length>0&&floors.every(image=>image.frame.name==='__BASE'));
 scene.x=3400;scene.render();ok(scene.robotSector==='REACTOR GARDENS'&&scene.robotOrigin===anchor);scene.x=600;scene.render();ok(scene.robotSector==='ROBOT FACTORY'&&scene.robotOrigin===anchor);
 const prop=scene.mapCars[0];const p=scene.moveOnGround(prop.x,prop.y,1,0,17);ok(Math.abs(p.x-prop.x)>=prop.halfW+17||Math.abs(p.y-prop.y)>=prop.halfH+17);
 });
 check('Bosses resist hit knockback and stagger while ordinary enemies still react',()=>{
 scene.enemies.forEach(e=>e.active=false);scene.stats.wave=10;scene.hero='ninja';scene.weapon='hammer';scene.x=600;scene.y=380;
 for(const type of ['boss','shooterBoss','commander','basic'] as const){
 const e=scene.spawn(type)!;e.x=850;e.y=380;e.hp=e.max=10000;const x=e.x,y=e.y;
 scene.hit(e,1,100,false,false);
 if(type==='basic')ok(Math.hypot(e.x-x,e.y-y)>0&&e.stagger>0);else ok(e.x===x&&e.y===y&&e.stagger===0&&e.hp<10000);
 e.active=false;
 }
 });
 check('Boss pattern waits for warning, damages once, pauses and cancels on death',()=>{
 scene.ended=false;scene.paused=true;scene.stats.wave=10;scene.enemies.forEach(e=>e.active=false);scene.bossMarks=[];scene.x=600;scene.y=380;
 scene.dash=0;scene.counter=0;scene.rewardShield=0;scene.invuln=0;scene.hp=1000;scene.maxHp=1000;scene.hero='ninja';
 const boss=scene.spawn('boss')!;boss.x=200;boss.y=100;boss.phase=0;boss.telegraph=0;boss.attack=999;boss.targetX=600;boss.targetY=380;scene.markBoss(boss);
 ok(scene.bossMarks.length===3);const delay=scene.bossMarks[0].remaining;scene.update(0,100);ok(scene.bossMarks[0].remaining===delay);
 scene.updateEnemies(.5);ok(scene.hp===1000);scene.updateEnemies(.66);ok(scene.hp<1000&&scene.bossMarks[0].fired);
 const hp=scene.hp;scene.updateEnemies(.001);ok(scene.hp===hp);
 scene.kill(boss);ok(scene.bossMarks.length===0);scene.spawn('basic');ok(scene.bossMarks.length===0);
 });
 lines.push(`\n${failures ? `${failures} CHECKS FAILED` : 'ALL INTEGRATION CHECKS PASSED'}`);
        out.textContent = lines.join('\n');
        game.destroy(true);
    }, 300);
});
