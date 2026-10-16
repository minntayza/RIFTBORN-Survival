import test from 'node:test';
import assert from 'node:assert/strict';
import {WALK_FRAMES,WALK_PROFILES} from '../src/zombie-walk';
import {ZOMBIE_SPRITES} from '../src/zombie-sprites';
test('every approved zombie has a bounded independent movement profile',()=>{
 assert.equal(WALK_FRAMES,24);assert.deepEqual(Object.keys(WALK_PROFILES).sort(),[...ZOMBIE_SPRITES].sort());
 for(const p of Object.values(WALK_PROFILES)){assert.ok(p.stride>0&&p.arms>=0&&p.feet>0&&p.drag>=0&&p.drag<1);}
 assert.equal(WALK_PROFILES.rifle.arms,0);
});
