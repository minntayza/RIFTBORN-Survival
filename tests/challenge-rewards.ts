import '../src/challenge-rewards.css';
import {freshSave} from '../src/save';
import {recordChallengeClear} from '../src/challenge-rewards';
import {challengeRewardsUi,challengeGiftButton} from '../src/challenge-rewards-ui';
let s=freshSave();s.bestClearedWave=8;
const render=(ids?:string[])=>{document.querySelector('#rewards')!.innerHTML=challengeGiftButton(s)+challengeRewardsUi(s,'Your next rewards',undefined,true)+(ids?.length?challengeRewardsUi(s,'Rewards ready to claim!',ids):'');};
document.querySelector('#wave')!.addEventListener('click',()=>render(recordChallengeClear(s,15)));
document.querySelector('#daily')!.addEventListener('click',()=>render(recordChallengeClear(s,10,true)));
document.querySelector('#reset')!.addEventListener('click',()=>{s=freshSave();s.bestClearedWave=8;render();});
render();

document.querySelector('#rewards')!.addEventListener('click',async e=>{const button=(e.target as Element).closest<HTMLButtonElement>('[data-action^="reward-claim:"]');if(!button)return;const {claimChallengeReward,FOX_RONIN_REWARD}=await import('../src/challenge-rewards');claimChallengeReward(s,button.dataset.action==='reward-claim:lethwei'?'lethwei':FOX_RONIN_REWARD);render();});
