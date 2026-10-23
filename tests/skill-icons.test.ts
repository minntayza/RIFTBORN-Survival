import test from 'node:test';
import assert from 'node:assert/strict';
import {skillIcon,SKILL_ICON_SHEET} from '../src/skill-icons';
import {existsSync} from 'node:fs';
test('approved sheet supplies all thirteen existing skills with distinct cropped artwork',()=>{assert.ok(existsSync('public'+SKILL_ICON_SHEET));const ids=['dash','counter','draw','mark','overdrive','beacon','breach','slam','bulwark','march','datlone','flame','staffslam'];const views=ids.map(id=>{const svg=skillIcon(id);assert.ok(svg.includes(`data-skill-icon="${id}"`));assert.ok(svg.includes('aria-hidden="true"'));return svg.match(/viewBox="([^"]+)"/)![1];});assert.equal(new Set(views).size,13);});
test('Tank cosmetics use the approved three distinct Ground Slam variants',()=>{const variants=['sakura','jade','starlight'].map(theme=>skillIcon('slam','tank',theme));assert.equal(new Set(variants.map(v=>v.match(/viewBox="([^"]+)"/)![1])).size,3);for(const svg of variants)assert.ok(svg.includes('data-ultimate="tank"'));});
