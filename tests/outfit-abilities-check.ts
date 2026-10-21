import Phaser from 'phaser';
import {ArenaScene} from '../src/combat';
import {AudioManager} from '../src/audio';
import {freshSave} from '../src/save';
import {COSMETICS} from '../src/cosmetics';
import {HEROES,WEAPONS,type HeroId,type WeaponId} from '../src/config';
import {outfitEffectProfile,outfitUltimateIcon} from '../src/outfit-effect-profiles';
import {abilityIcons} from '../src/combat-hud';
const lines:string[]=[],out=document.querySelector('#results')!;
for(const c of COSMETICS.filter(c=>c.kind==='character')){const save=freshSave(),hero=c.target as HeroId;save.heroes=Object.keys(HEROES) as HeroId[];save.weapons=Object.keys(WEAPONS) as WeaponId[];save.hero=hero;save.weapon=Object.keys(WEAPONS).find(w=>WEAPONS[w as WeaponId].hero===hero&&WEAPONS[w as WeaponId].price===0) as WeaponId;save.cosmetics.owned=[c.id];save.cosmetics.equipped[`character:${hero}`]=c.id;
 await new Promise<void>((resolve,reject)=>{const audio=new AudioManager();audio.sound=false;audio.music=false;const s=new ArenaScene(save,audio,()=>{},()=>{},()=>{});let game:Phaser.Game;
  s.onLoadingError=()=>reject(Error(`Artwork failed: ${c.name}`));s.onArenaReady=()=>{s.paused=true;try{
   const run=(themed:boolean)=>{if(themed)save.cosmetics.equipped[`character:${hero}`]=c.id;else delete save.cosmetics.equipped[`character:${hero}`];s.enemies.forEach(e=>e.active=false);s.paused=false;s.ended=false;s.ability=0;s.counter=0;s.dash=0;s.overdrive=0;s.invuln=0;s.rewardShield=0;s.waveWard=false;s.ammo=s.maxAmmo;s.reload=0;s.random=()=>.99;s.hp=s.maxHp;const e=s.spawn('brute')!;if(!e)throw Error('Missing test target');e.x=s.x+70;e.y=s.y;e.hp=10000;s.activate(1,0);if(hero==='samurai')s.hurt(20);s.paused=true;return {cooldown:s.ability,dash:s.dash,counter:s.counter,overdrive:s.overdrive,hp:s.hp,ammo:s.ammo,enemyHp:e.hp,slow:e.slow};};
   const baseline=run(false),themed=run(true);if(JSON.stringify(baseline)!==JSON.stringify(themed))throw Error('Ability mechanics changed');
   if(s.outfitFx.profileId!==c.id||s.outfitFx.activeCount===0)throw Error('Themed ability did not trigger');
   const p=outfitEffectProfile(save,hero)!;s.render();for(let i=0;i<100;i++)s.outfitFx.render(p,{x:s.x,y:s.y,angle:0,time:i/100,dash:hero==='ninja'?.35:0,counter:hero==='samurai'?.6:0,overdrive:hero==='gunner'?3:0,reduced:i%2===0});if(s.outfitFx.activeCount>160)throw Error('Effects exceeded bound');
   const card=document.createElement('article');card.innerHTML=outfitUltimateIcon(save,hero,abilityIcons[hero])+`<h3>${c.name}</h3><p>${p.name}</p>`;document.querySelector('#cards')!.append(card);lines.push(`PASS · ${c.name}: themed activation, desktop/touch icon, unchanged mechanics`);
  }catch(e){lines.push(`FAIL · ${c.name}: ${e}`);}out.textContent=lines.join('\n');setTimeout(()=>{game.destroy(true);resolve();},0);};
  game=new Phaser.Game({type:Phaser.CANVAS,parent:'arena',width:1200,height:760,scene:[s],audio:{noAudio:true},banner:false});
 });
}
out.textContent=lines.join('\n')+`\n${lines.length===12&&!lines.some(l=>l.startsWith('FAIL'))?'ALL 12 PASS':'CHECKS FAILED'}`;
