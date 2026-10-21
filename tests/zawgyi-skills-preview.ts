import {zawgyiSlamContact} from '../src/zawgyi-motion';
import {ZAWGYI_SLAM} from '../src/zawgyi-slam-motion';
import {startHomeScene} from '../src/home-scene';
import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {AudioManager} from '../src/audio';
import {freshSave,validateSave} from '../src/save';
import {ZAWGYI_SKILLS,validZawgyiLoadout,type ZawgyiLoadout} from '../src/zawgyi';
let game:Phaser.Game|undefined,scene:ArenaScene|undefined;let wideView=false;
const lines:string[]=[],checks=document.querySelector('#checks')!,status=document.querySelector('#status')!,controls=document.querySelector('#controls')!;
function assert(ok:unknown,message:string){if(!ok)throw Error(message);}
const pairs:ZawgyiLoadout[]=[['datlone','flame'],['datlone','slam'],['flame','slam']];
async function launch(pair:ZawgyiLoadout,verify=false){game?.destroy(true);scene=undefined;controls.innerHTML='';return new Promise<void>((resolve,reject)=>{
 const save=freshSave();save.heroes.push('zawgyi');save.hero='zawgyi';save.weapon='mysticstaff';save.zawgyiSkills=pair;save.settings.sound=false;save.settings.music=false;save.settings.shake=false;save.settings.mapView=wideView?2:1;save.settings.mapViewChosen=true;
 const audio=new AudioManager();audio.sound=false;audio.music=false;
 const s=new ArenaScene(save,audio,()=>{s.xp=0;s.paused=false;},()=>{},()=>{}, {mode:'endless',build:'assault',technique:'standard'});scene=s;
 s.onLoadingError=()=>{status.textContent='Preview artwork failed to load.';reject(Error('Loading failed'));};
 s.onArenaReady=()=>{try{s.plan=[];s.enemies=[];s.random=()=>.99;s.xpNeed=100000;
 if(verify){
 assert(s.textures.exists('zawgyi-hero'),'Missing Zawgyi artwork');
 for(const aim of [0,Math.PI]){s.angle=aim;s.visuals.zawgyiSlam=ZAWGYI_SLAM.impact;s.visuals.zawgyiLift=0;s.render();const sprites=s.children.list.filter(c=>c instanceof Phaser.GameObjects.Image) as Phaser.GameObjects.Image[];const arm=sprites.find(c=>c.texture.key==='zawgyi-part-rightArm')!,staff=sprites.find(c=>c.texture.key==='zawgyi-part-staff')!;const hand=arm.getWorldTransformMatrix().transformPoint(((arm.flipX?1-.77:.77)-arm.originX)*arm.width,(.89-arm.originY)*arm.height);assert(Math.hypot(hand.x-staff.x,hand.y-staff.y)<.001,'Staff detaches from hand when facing left');const contact=staff.getWorldTransformMatrix().transformPoint((.5-staff.originX)*staff.width,(1-staff.originY)*staff.height),expected=zawgyiSlamContact(s.x,s.y,aim);assert(Math.hypot(contact.x-expected.x,contact.y-expected.y)<.001,'Rendered staff tip and impact origin disagree');}s.visuals.zawgyiSlam=-1;s.angle=0;
for(const protection of [0,.38,1]){s.invuln=protection;s.render();const parts=s.children.list.filter(c=>c instanceof Phaser.GameObjects.Image&&c.texture.key.startsWith('zawgyi-part-')) as Phaser.GameObjects.Image[];assert(parts.every(p=>p.texture.getSourceImage().height<100),'Gameplay artwork is not prefiltered');assert(parts.length===6&&parts.every(p=>p.alpha===1&&p.tintTopLeft===0xffffff),'Zawgyi changes color or opacity during protection');}s.invuln=0;
assert(JSON.stringify(s.zawgyi?.equipped)===JSON.stringify(pair),'Wrong skill pairing');assert(JSON.stringify(validateSave(save).zawgyiSkills)===JSON.stringify(pair),'Pair does not persist');
 const target=s.spawn('basic')!;Object.assign(target,{x:s.x+65,y:s.y-10,hp:10000,max:10000,speed:0,damage:0});s.basicAttack();assert(!s.bullets.some(b=>b.active&&b.source==='Cane Spark'),'Staff still fires wind projectiles');for(let n=0;n<15;n++)s.zawgyi!.update(.02);assert(target.hp<10000,'Staff did not hit a nearby target');assert(s.identityCharge>0,'Staff did not charge harmony');const afterSwing=target.hp;for(let n=0;n<10;n++)s.zawgyi!.update(.02);assert(target.hp===afterSwing,'A single staff swing damages twice');s.hp=s.maxHp-40;s.identityCharge=0;for(let n=0;n<6;n++)s.zawgyi!.boltHit();assert(Math.abs(s.hp-(s.maxHp-40+s.maxHp*.05))<.001,'Full harmony does not heal 5%');assert(s.identityCharge===0,'Harmony does not reset');
 const far=s.spawn('basic')!;Object.assign(far,{x:s.x+200,y:s.y,hp:10000,max:10000,speed:0});target.active=false;s.basicAttack();for(let n=0;n<15;n++)s.zawgyi!.update(.02);assert(far.hp===10000,'Staff reaches distant enemies');far.active=false;target.active=true;
 const advance=(seconds:number)=>{for(let t=0;t<seconds-1e-6;t+=.02)s.zawgyi!.update(Math.min(.02,seconds-t));};
 for(let i=0;i<2;i++){const skill=pair[i];s.hp=s.maxHp-45;target.x=s.x+45;target.y=s.y;target.slow=0;target.burn=0;assert(s.zawgyi!.activate(i,1,0),'Skill would not activate');assert(s.zawgyi!.cooldowns[i]>0,'Cooldown did not start');assert(!s.zawgyi!.activate(i,1,0),'Cooldown allows repeated cast');if(i===0)assert(s.zawgyi!.cooldowns[1]===0,'First skill blocks second cooldown');
 if(skill==='datlone'){
  advance(.35);const orb=s.zawgyi!.spheres[0];assert(orb&&orb.flight===0,'Dat Lone never lands');target.x=orb.x+95;target.y=orb.y;const before=target.hp,beforeX=target.x;const heavy=s.spawn('boss')!;Object.assign(heavy,{x:orb.x+95,y:orb.y+20,hp:10000,max:10000,speed:0,damage:0});const bossX=heavy.x;advance(.5);assert(target.x<beforeX-60,'Sphere does not pull ordinary enemies');assert(bossX-heavy.x<15,'Boss does not resist the pull');assert(target.hp===before,'Sphere explodes before its 2-second pull');advance(1.5);assert(s.zawgyi!.spheres.length===0,'Sphere never explodes');assert(target.hp<before&&target.burn>0,'Explosion did not damage and ignite enemies');heavy.active=false;
 }
 if(skill==='flame'){
  assert(s.zawgyi!.flameTime===.32,'Flame Step is not a short dash');assert(s.zawgyi!.actionLocked,'Dash does not lock other casts');const x=s.x,y=s.y;advance(.32);assert(Math.abs(Math.hypot(s.x-x,s.y-y)-204.8)<1,'Dash distance is incorrect');assert(s.zawgyi!.flameTime===0,'Dash never ends');assert(s.zawgyi!.flames.length>8,'Dash leaves no continuous flame trail');const patch=s.zawgyi!.flames.at(-1)!;target.x=patch.x;target.y=patch.y;s.zawgyi!.update(.02);assert(target.burn>0&&target.slow>0,'Flame trail does not burn and slow');advance(2.1);assert(s.zawgyi!.flames.length===0,'Flames never expire');s.x=x;s.y=y;
 }
 if(skill==='slam'){
  const elite=s.spawn('elite')!;Object.assign(elite,{x:s.x+55,y:s.y,hp:10000,max:10000,speed:0,stagger:0});const hp=elite.hp,x=elite.x,heroHp=s.hp;s.hurt(20,target,0,'Bite',true);assert(s.hp===heroHp,'Slam hop does not protect the player');advance(.32);assert(s.zawgyi!.lift>10&&s.zawgyi!.lift<=16,'Slam lift is not short');assert(elite.hp===hp,'Damage occurs before staff contact');advance(ZAWGYI_SLAM.impact-.32-.001);assert(elite.hp===hp,'Damage precedes contact');advance(.002);assert(elite.hp<hp&&elite.x>x+50,'Shockwave does not damage and knock back at contact');assert(elite.stagger>=1.1,'Heavy/elite enemy is not stunned');assert(s.strongStop>0,'Missing impact hit-stop');const impactHp=elite.hp;advance(.12);assert(elite.hp===impactHp,'Impact hits more than once');assert(s.zawgyi!.slamTime>0,'Missing low recovery pose');advance(.03);assert(!s.zawgyi!.actionLocked,'Slam still locks movement after the planted impact');advance(.27);assert(s.zawgyi!.slamTime===0,'Slam never recovers');elite.active=false;
 }
 s.invuln=0;
 }
 s.zawgyi!.cooldowns=[0,0];s.paused=true;assert(!s.zawgyi!.activate(0),'Skills work while paused');s.paused=false;s.ended=true;assert(!s.zawgyi!.activate(0),'Skills work after run ends');s.ended=false;
 lines.push('PASS · '+pair.map(id=>ZAWGYI_SKILLS[id].name).join(' + ')+': artwork, save, short staff attacks, 5% healing, skill mechanics, independent cooldowns & pause guards');checks.textContent=lines.join('\n');
 s.paused=true;
 }else{s.protect(1e6);addEnemies();status.textContent='Move with WASD or arrows. Q / Space: skill 1. E: skill 2. Practice enemies cannot damage you.';controls.innerHTML=pair.map((id,i)=>`<button data-slot="${i}">${i===0?'Q / SPACE':'E'} · ${ZAWGYI_SKILLS[id].name}</button>`).join('');}
 s.render();resolve();}catch(e){status.textContent=String(e);lines.push('FAIL · '+e);checks.textContent=lines.join('\n');reject(e);}};
 const rect=document.querySelector('#arena')!.getBoundingClientRect();game=new Phaser.Game({type:Phaser.AUTO,parent:'arena',width:rect.width,height:rect.height,scene:[s],audio:{noAudio:true},banner:false});
 });}
function addEnemies(){const s=scene;if(!s)return;for(let i=0;i<6;i++){const e=s.spawn(i%3===0?'armoured':'basic');if(e){e.x=s.x+Math.cos(i*Math.PI/3)*180;e.y=s.y+Math.sin(i*Math.PI/3)*150;e.damage=0;e.hp=e.max=200;e.speed=12;}}}
controls.addEventListener('click',e=>{const b=(e.target as Element).closest<HTMLButtonElement>('[data-slot]');if(b)scene?.zawgyi?.activate(Number(b.dataset.slot));});
document.querySelector('#map-view')!.addEventListener('click',()=>{wideView=!wideView;if(scene){scene.save.settings.mapView=wideView?2:1;scene.applyMapView();}document.querySelector('#map-view')!.textContent=`Map view · ${wideView?2:1}×`;});
document.querySelector('#pair')!.addEventListener('change',e=>{void launch(validZawgyiLoadout((e.target as HTMLSelectElement).value.split(',')));});document.querySelector('#enemies')!.addEventListener('click',addEnemies);
setInterval(()=>{const s=scene;if(!s?.zawgyi)return;for(const b of Array.from(controls.querySelectorAll<HTMLButtonElement>('button'))){const slot=Number(b.dataset.slot),left=s.zawgyi.cooldowns[slot];b.disabled=left>0||s.zawgyi.slamTime>0;b.textContent=`${slot===0?'Q / SPACE':'E'} · ${ZAWGYI_SKILLS[s.zawgyi.equipped[slot]].name}${left>0?' · '+Math.ceil(left)+'s':''}`;}},100);
try{for(const pair of pairs)await launch(pair,true);checks.textContent+='\nALL 3 PAIRINGS PASS';for(const portrait of [false,true]){const canvas=document.createElement('canvas');canvas.style.display='none';document.body.append(canvas);await startHomeScene(canvas,'zawgyi','mysticstaff',portrait);const first=canvas.toDataURL();await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));assert(canvas.dataset.ready==='true'&&canvas.toDataURL()===first,'Home/loadout pose is moving');canvas.remove();}checks.textContent+='\nPASS · Home and loadout remain completely still';await launch(['datlone','flame']);}catch(e){status.textContent=String(e);}
