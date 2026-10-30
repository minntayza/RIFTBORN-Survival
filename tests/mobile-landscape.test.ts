import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shouldSuggestLandscape} from '../src/mobile-landscape';
test('portrait phones get rotation guidance while desktops and landscape phones do not',()=>{
 assert.ok(shouldSuggestLandscape(390,844,true));assert.ok(shouldSuggestLandscape(430,932,true));
 assert.equal(shouldSuggestLandscape(932,430,true),false);assert.equal(shouldSuggestLandscape(390,844,false),false);assert.equal(shouldSuggestLandscape(900,1200,true),false);
});
