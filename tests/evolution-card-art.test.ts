import test from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {upgradeVisual} from '../src/upgrade-ui';
test('every supported card evolution has full artwork instead of a tiny actor diagram',()=>{for(const u of UPGRADES){const e=CARD_EVOLUTIONS[u.id];if(!e)continue;const html=upgradeVisual({...u,id:'evolve:'+u.id,evolves:u.id,name:e.name},u.hero||'zawgyi','mysticstaff');assert.ok(html.includes('upgrade-concept-demo'),u.id);assert.ok(html.includes('EVOLUTION'),u.id);assert.ok(!html.includes('upgrade-actor'),u.id);assert.ok(!html.includes('upgrade-zombie'),u.id);}});
test('Phantom Blades evolution uses the designed webp card artwork',()=>{const u=UPGRADES.find(u=>u.id==='orbit')!;assert.ok(u,'orbit upgrade must exist');const html=upgradeVisual({...u,evolves:'orbit',name:'Phantom Blades'},'ninja','katana');assert.ok(html.includes('evolution-card-reference')||html.includes('ninja-orbit.webp'));assert.ok(upgradeVisual(u,'ninja','katana').includes('skill-art-v1.webp'));});

test('ten common evolution illustrations are shared across all survivors; unique art stays separate',async()=>{
 const {commonEvolutionArt,evolutionCardImage}=await import('../src/evolution-art');
 const {HEROES}=await import('../src/config');
 const ids=['health','speed','crit','magnet','regen','ward','fire','orbit','damage','cooldown'];
 for(const id of ids){const u=UPGRADES.find(v=>v.id===id)!;for(const hero of Object.keys(HEROES) as (keyof typeof HEROES)[]){
  const html=upgradeVisual({...u,id:'evolve:'+id,evolves:id,name:CARD_EVOLUTIONS[id].name},hero,'katana');
  assert.ok(html.includes('common-evolutions-v1.png'),hero+':'+id);assert.ok(html.includes(`data-common-evolution="${id}"`));
 }}
 assert.equal(commonEvolutionArt('nineweapons'),'');assert.equal(commonEvolutionArt('arrowstorm'),'');
 assert.equal(evolutionCardImage('lethwei','nineweapons'),'/assets/evolution-cards/lethwei-nineweapons.webp');
 assert.equal(evolutionCardImage('zawgyi','celestial'),'/assets/card-concepts/zawgyi-ruby-sun-evolution-v1.png');
});
