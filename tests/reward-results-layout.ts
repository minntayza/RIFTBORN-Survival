import '../src/style.css';
import '../src/challenge-rewards.css';
import '../src/mobile-landscape.css';
import {freshSave} from '../src/save';
import {recordChallengeClear} from '../src/challenge-rewards';
import {challengeRewardsUi} from '../src/challenge-rewards-ui';
const save=freshSave(),ids=recordChallengeClear(save,10,true);
document.querySelector('#result')!.innerHTML=challengeRewardsUi(save,'Rewards ready to claim!',ids)+`<header class="camp-result-heading"><small>LAST SAFE CAMP · DAILY CHALLENGE</small><h2>Area secured!</h2></header><section class="camp-result-metrics"><div class="camp-result-metric"><b>10</b><small>Waves cleared</small></div><div class="camp-result-metric"><b>7:16</b><small>Time survived</small></div><div class="camp-result-metric"><b>417</b><small>Enemies defeated</small></div></section><div class="camp-result-actions"><button>Back to camp</button></div>`;
