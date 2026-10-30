import type {Save} from './save';
export const FOX_RONIN_REWARD='character:samurai:jade';
export const rewardRequirement=(id:string)=>id==='lethwei'?'Clear Wave 15':id===FOX_RONIN_REWARD?'Clear your first Daily Challenge':'';
export function challengeRewardState(s:Save,id:string):'locked'|'claimable'|'claimed'{
 if(id==='lethwei')return s.heroes.includes('lethwei')?'claimed':s.bestClearedWave>=15?'claimable':'locked';
 if(id===FOX_RONIN_REWARD)return s.cosmetics.owned.includes(id)?'claimed':s.firstDailyCleared||Object.values(s.daily).some(d=>d.wins>0)?'claimable':'locked';
 return 'locked';
}
/** Only an explicit claim adds ownership; gear and currencies stay unchanged. */
export function claimChallengeReward(s:Save,id:string){
 if(challengeRewardState(s,id)!=='claimable')return false;
 if(id==='lethwei')s.heroes.push('lethwei');
 else if(id===FOX_RONIN_REWARD)s.cosmetics.owned.push(id);
 else return false;
 return true;
}
export function recordChallengeClear(s:Save,wave:number,dailyWin=false){
 const ids=['lethwei',FOX_RONIN_REWARD],before=ids.map(id=>challengeRewardState(s,id));
 s.bestClearedWave=Math.max(s.bestClearedWave||0,wave);
 if(dailyWin)s.firstDailyCleared=true;
 return ids.filter((id,i)=>before[i]==='locked'&&challengeRewardState(s,id)==='claimable');
}
