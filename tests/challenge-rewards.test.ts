import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshSave,validateSave,purchase} from '../src/save';
import {buyCosmetic} from '../src/cosmetics';
import {FOX_RONIN_REWARD,recordChallengeClear,challengeRewardState,claimChallengeReward} from '../src/challenge-rewards';
import {challengeRewardsUi} from '../src/challenge-rewards-ui';
import {PLAYTEST} from '../src/config';
test('Wave 15 must be cleared; grant is permanent and idempotent without changing loadout or currency',()=>{
 const s=freshSave();s.gold=9999;s.petals=999;
 s.bestWave=15;assert.equal(challengeRewardState(s,'lethwei'),'locked');
 recordChallengeClear(s,14);assert.equal(s.heroes.includes('lethwei'),false);
 assert.deepEqual(recordChallengeClear(s,15),['lethwei']);
 assert.equal(s.heroes.includes('lethwei'),false);assert.equal(challengeRewardState(validateSave(s),'lethwei'),'claimable');assert.ok(claimChallengeReward(s,'lethwei'));assert.equal(claimChallengeReward(s,'lethwei'),false);
 assert.deepEqual(recordChallengeClear(s,16),[]);
 assert.equal(s.heroes.filter(h=>h==='lethwei').length,1);
 assert.equal(s.hero,'ninja');assert.equal(s.gold,9999);assert.equal(s.petals,999);
 assert.ok(validateSave(s).heroes.includes('lethwei'));
});
test('first Daily victory grants only Fox Ronin outfit once, including saved history',()=>{
 const s=freshSave();recordChallengeClear(s,9);assert.equal(s.cosmetics.owned.includes(FOX_RONIN_REWARD),false);
 assert.deepEqual(recordChallengeClear(s,10,true),[FOX_RONIN_REWARD]);
 assert.equal(s.cosmetics.owned.includes(FOX_RONIN_REWARD),false);assert.equal(challengeRewardState(validateSave(s),FOX_RONIN_REWARD),'claimable');assert.ok(claimChallengeReward(s,FOX_RONIN_REWARD));
 assert.deepEqual(recordChallengeClear(s,10,true),[]);
 assert.equal(s.heroes.includes('samurai'),false);assert.deepEqual(s.cosmetics.equipped,{});
 const old=freshSave();old.daily['2026-10-29']={wins:1,score:4000};
 assert.equal(challengeRewardState(validateSave(old),FOX_RONIN_REWARD),'claimable');
});
test('challenge rewards cannot be purchased even with unlimited playtest currencies',()=>{
 const oldGold=PLAYTEST.unlimitedGold,oldPetals=PLAYTEST.unlimitedPetals;
 try{PLAYTEST.unlimitedGold=true;PLAYTEST.unlimitedPetals=true;const s=freshSave();s.gold=s.petals=100000;
 assert.equal(purchase(s,'heroes','lethwei'),false);assert.equal(buyCosmetic(s,FOX_RONIN_REWARD),false);
 assert.equal(s.gold,100000);assert.equal(s.petals,100000);
 }finally{PLAYTEST.unlimitedGold=oldGold;PLAYTEST.unlimitedPetals=oldPetals;}
});
test('legacy wave records conservatively infer completed waves and preserve ownership',()=>{
 const legacy={...freshSave(),bestWave:15,bestClearedWave:undefined};assert.equal(validateSave(legacy).heroes.includes('lethwei'),false);
 legacy.bestWave=16;assert.equal(challengeRewardState(validateSave(legacy),'lethwei'),'claimable');
 const owned=freshSave();owned.heroes.push('lethwei');owned.cosmetics.owned.push(FOX_RONIN_REWARD);
 const loaded=validateSave(owned);assert.ok(loaded.heroes.includes('lethwei'));assert.ok(loaded.cosmetics.owned.includes(FOX_RONIN_REWARD));
});
test('reward presentation includes progress, exact conditions, no price, and safe celebration',()=>{
 const s=freshSave();s.bestClearedWave=8;const html=challengeRewardsUi(s);
 assert.match(html,/Best clear: Wave 8/);assert.match(html,/Clear Wave 15/);assert.match(html,/first Daily Challenge/);
 assert.doesNotMatch(html,/Buy|petal-coin|gold-coin/);
 assert.doesNotMatch(challengeRewardsUi(s,'Unlocked!',['lethwei']),/data-action/);
});

test('gift keeps ! for unfinished and claimable rewards, clearing only after both are claimed',async()=>{
 const {challengeGiftButton}=await import('../src/challenge-rewards-ui');
 const s=freshSave();
 assert.match(challengeGiftButton(s),/gift-count">!<\/span>/);
 assert.equal(claimChallengeReward(s,'lethwei'),false);
 recordChallengeClear(s,15);assert.match(challengeGiftButton(s),/Claim rewards/);
 assert.match(challengeGiftButton(s),/gift-count">!<\/span>/);
 claimChallengeReward(s,'lethwei');assert.match(challengeGiftButton(s),/gift-count">!<\/span>/);
 recordChallengeClear(s,10,true);s.daily={};
 const restored=validateSave(s);assert.equal(challengeRewardState(restored,FOX_RONIN_REWARD),'claimable');
 assert.match(challengeRewardsUi(restored,'Challenge Gifts',undefined,true),/reward-claim:fox/);
 claimChallengeReward(restored,FOX_RONIN_REWARD);assert.match(challengeGiftButton(restored),/gift-count">✓<\/span>/);
 assert.doesNotMatch(challengeGiftButton(restored),/gift-count">!<\/span>/);
});
