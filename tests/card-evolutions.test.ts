import test from 'node:test';

import assert from 'node:assert/strict';

import {UPGRADES,upgradeChoices} from '../src/upgrades';

import {CARD_EVOLUTIONS} from '../src/card-evolutions';

import {visualUpgradeCard} from '../src/upgrade-ui';

import {wavePlan} from '../src/waves';

import {seededRandom} from '../src/retention';

import type {HeroId,WeaponId} from '../src/config';



test('every evolution entry has a valid name and effect',()=>{

 for(const [id, evo] of Object.entries(CARD_EVOLUTIONS)){

  assert.ok(evo.name);

  assert.ok(evo.effect);

  assert.ok(UPGRADES.some(u=>u.id===id));

 }

});

test('maxed cards evolve on the next level-up at any wave',()=>{

 const levels={damage:5};for(const wave of [1,2,5,10,11]){assert.ok(upgradeChoices('ninja',levels,()=>0,'katana',wave,{}).some(u=>u.evolves==='damage'));assert.ok(upgradeChoices('ninja',{damage:4},()=>0,'katana',wave,{}).every(u=>!u.evolves));}

 assert.ok(upgradeChoices('ninja',levels,()=>0,'katana',50,{damage:true}).every(u=>u.evolves!=='damage'));

});

test('mini bosses spawn after wave 10 and alternate before major bosses',()=>{

 for(let w=1;w<=8;w++)assert.ok(wavePlan(w).every(s=>!['shooterBoss','commander'].includes(s.type)));

 assert.ok(wavePlan(11,seededRandom(1)).some(s=>s.type==='shooterBoss'));assert.ok(wavePlan(13,seededRandom(1)).some(s=>s.type==='commander'));assert.ok(wavePlan(15).some(s=>s.type==='boss'));

});

test('in-game evolution cards display designed evolution artwork for all hero builds',()=>{

 const heroWeapons:Record<HeroId,WeaponId>={ninja:'katana',samurai:'nodachi',gunner:'pistols',tank:'shield',zawgyi:'mysticstaff',pyusawhti:'aungzeyabow',lethwei:'hempwraps',kyansittha:'arindamaspear'};

 for(const hero of ['ninja','samurai','gunner','tank'] as HeroId[]){

  const heroCards=UPGRADES.filter(u=>(!u.hero||u.hero===hero)&&CARD_EVOLUTIONS[u.id]);

  const expectedCount=['ninja','samurai'].includes(hero)?14:15;

  assert.equal(heroCards.length,expectedCount);

  for(const u of heroCards){

   const evo={...u,id:'evolve:'+u.id,evolves:u.id,name:CARD_EVOLUTIONS[u.id].name,description:CARD_EVOLUTIONS[u.id].effect,max:1};

   const html=visualUpgradeCard(evo,0,hero,heroWeapons[hero],1);

   assert.ok(html.includes('evolution-card'));

   const shared=['health','speed','crit','magnet','regen','ward','fire','orbit','damage','cooldown'].includes(u.id);
   const ninjaUnique=hero==='ninja'&&['wide','double','trail','clone'].includes(u.id);
   const samuraiUnique=hero==='samurai'&&['range','bleed','counter','wind'].includes(u.id);
   const gunnerUnique=hero==='gunner'&&['magazine','pierce','ricochet','explosive','reload'].includes(u.id);
   const tankUnique=hero==='tank'&&['stamina','block','reflect','spikes','rush'].includes(u.id);
   assert.ok(html.includes(shared?'common-evolutions-v1.png':ninjaUnique?'ninja-upgrades-v1.png':samuraiUnique?'samurai-upgrades-v1.png':gunnerUnique?'gunner-upgrades-v1.png':tankUnique?'tank-upgrades-v1.png':`/assets/evolution-cards/${hero}-${u.id}.webp`));

  }

 }

});

