import type {RunMode} from './retention';
/** Per-wave totals include all pickups, bounties, objectives and clear bonuses. */
export function waveGoldBudget(mode:RunMode,wave:number):number|undefined{
 if(mode!=='endless'&&mode!=='daily')return undefined;
 return 50+7*wave+(mode==='endless'&&wave===15?10:mode==='daily'&&wave===10?15:0);
}
export function cappedWaveGold(mode:RunMode,wave:number,alreadyPaid:number,requested:number){
 const budget=waveGoldBudget(mode,wave);
 return Math.max(0,Math.min(requested,budget===undefined?Infinity:Math.max(0,budget-alreadyPaid)));
}
