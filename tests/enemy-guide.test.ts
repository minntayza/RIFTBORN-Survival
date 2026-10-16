import test from 'node:test';
import assert from 'node:assert/strict';
import {zombieGuide,robotGuide} from '../src/enemy-guide';
test('guide contains nine approved zombie redesigns with existing stats and seven clearly labelled robot previews',()=>{
 const zombies=zombieGuide(),robots=robotGuide();
 assert.equal((zombies.match(/<article /g)||[]).length,9);assert.equal((robots.match(/<article /g)||[]).length,7);
 for(const name of ['Butcher','Pike Guard','Siege Gunner'])assert.ok(!zombies.includes(name));
 for(const name of ['Zombie Dog','Wanderer','Horde Commander','Zombie General'])assert.ok(zombies.includes(name));
 assert.match(zombies,/now appear in gameplay/);assert.match(robots,/not implemented yet/);assert.ok(!robots.includes('mini-stats'));
 assert.equal((zombies.match(/clip-path=/g)||[]).length,7);assert.equal((robots.match(/clip-path=/g)||[]).length,7);
});
