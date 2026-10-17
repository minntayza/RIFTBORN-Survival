import test from 'node:test';
import assert from 'node:assert/strict';
import {zombieGuide,robotGuide} from '../src/enemy-guide';
test('guide contains nine approved zombie redesigns with existing stats and seven implemented robot roles',()=>{
 const zombies=zombieGuide(),robots=robotGuide();
 assert.equal((zombies.match(/<article /g)||[]).length,9);assert.equal((robots.match(/<article /g)||[]).length,7);
 for(const name of ['Butcher','Pike Guard','Siege Gunner'])assert.ok(!zombies.includes(name));
 for(const name of ['Zombie Dog','Wanderer','Horde Commander','Zombie General'])assert.ok(zombies.includes(name));
 assert.match(zombies,/gameplay sprites have not changed yet/);assert.match(robots,/wave 11 onward/);assert.ok(!robots.includes('mini-stats'));
 assert.equal((zombies.match(/gameplay illustration/g)||[]).length,5);assert.equal((robots.match(/colorful 2D robot|Pulse Shooter gameplay illustration/g)||[]).length,7);
});

test('approved cute concepts appear for all four requested zombies',()=>{
 const html=zombieGuide();assert.equal((html.match(/approved concept illustration/g)||[]).length,4);
 assert.equal((html.match(/NEW DESIGN · CONCEPT PREVIEW/g)||[]).length,4);
 assert.ok(html.includes('cute-zombie-concepts-transparent-v1.png'));assert.ok(html.includes('cute-zombie-dog-transparent-v1.png'));
});
