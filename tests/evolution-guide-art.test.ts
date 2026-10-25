import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {cardEvolutionGuide} from '../src/guide-ui';
import {freshSave} from '../src/save';
test('every hero guide uses working shared evolution artwork, including Zawgyi',()=>{for(const hero of ['zawgyi','ninja','samurai','gunner','tank'] as const){const html=cardEvolutionGuide(freshSave(),hero);assert.ok(!html.includes('/assets/evolution-cards/'),hero);assert.ok(html.includes('phantom-blades-v2.png'),hero);for(const m of html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g))assert.ok(existsSync('public'+m[1]),`${hero}: ${m[1]}`);assert.ok(html.includes('ANY WAVE'));}});
