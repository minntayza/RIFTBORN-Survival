import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {cardEvolutionGuide} from '../src/guide-ui';
import {freshSave} from '../src/save';
import {HEROES,type HeroId} from '../src/config';
import {UPGRADES} from '../src/upgrades';
import {CARD_EVOLUTIONS} from '../src/card-evolutions';
import {evolutionCardArt} from '../src/evolution-art';
test('every active hero guide renders existing shared and signature evolution artwork',()=>{
 for(const hero of Object.keys(HEROES) as HeroId[]){
  const html=cardEvolutionGuide(freshSave(),hero);
  const cards=UPGRADES.filter(u=>(!u.hero||u.hero===hero)&&CARD_EVOLUTIONS[u.id]);
  assert.ok(cards.length>0,hero);
  assert.equal((html.match(/class="upgrade choice-card/g)||[]).length,cards.length,hero);
  for(const card of cards){assert.ok(html.includes(CARD_EVOLUTIONS[card.id].name),`${hero}: ${card.id}`);const art=evolutionCardArt(hero,card.id);if(art)assert.ok(html.includes(art),`${hero}: current approved artwork for ${card.id}`);}
  const assets=[...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)];assert.ok(assets.length>=cards.length,hero);
  for(const m of assets)assert.ok(existsSync('public'+m[1]),`${hero}: ${m[1]}`);
  assert.ok(html.includes('MAX LEVEL'),hero);assert.ok(html.includes('Wave 11+'),hero);
 }
});
