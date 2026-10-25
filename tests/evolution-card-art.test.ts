import test from 'node:test';
import assert from 'node:assert/strict';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {upgradeVisual} from '../src/upgrade-ui';
test('every supported card evolution has full artwork instead of a tiny actor diagram',()=>{for(const u of UPGRADES){const e=CARD_EVOLUTIONS[u.id];if(!e)continue;const html=upgradeVisual({...u,id:'evolve:'+u.id,evolves:u.id,name:e.name},u.hero||'zawgyi','mysticstaff');assert.ok(html.includes('upgrade-concept-demo'),u.id);assert.ok(html.includes('EVOLUTION'),u.id);assert.ok(!html.includes('upgrade-actor'),u.id);assert.ok(!html.includes('upgrade-zombie'),u.id);}});
test('Phantom Blades uses its own two-blade artwork, while the base orbit card stays unchanged',()=>{const u=UPGRADES.find(u=>u.id==='orbit')!;assert.ok(upgradeVisual({...u,evolves:'orbit',name:'Phantom Blades'},'zawgyi','mysticstaff').includes('phantom-blades-v2.png'));assert.ok(upgradeVisual(u,'zawgyi','mysticstaff').includes('skill-art-v1.webp'));});
