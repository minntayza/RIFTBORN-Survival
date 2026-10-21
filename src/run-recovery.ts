import {HEROES,WEAPONS} from './config';
import type {HeroId,WeaponId} from './config';
import type {RunOptions} from './retention';
/** Only gameplay data crosses the save boundary; Phaser objects and callbacks never do. */
export const RUN_FIELDS = (`x y angle hp maxHp xp level xpNeed stamina ammo reload reloadDuration attack ability invuln dash dashX dashY counter blockCharge honour momentum combo comboTime waveTime elapsed spawnIndex plan levels stats waveStats waiting countdown tick clone rerolls waveWard strongStop objectives waveObjectives earned zoneSpawnClock bossDefeated lastCause combatCaches escapeAngle escapeClock spawnPulse synergyClock awakened fullEvolution earlyAwakened identityCharge openingShots identitySequence identityProcs damageSources cardEvolutions pendingEchoes speedCharge speedBurst lifePulse vacuumClock elementClock enemyBursts reinforcementMarks firePatches overdrive coveringClock decoy boostDamage boostSpeed rewardShield pendingReward evolution eventName supplies zone huntTarget hazardClock hazard enemies bullets drops bossMagnet dashHits bossMarks pendingStrikes attackSequence spawnSerial robotOrigin`).split(' ');
export type RunRecovery={version:1;hero:HeroId;weapon:WeaponId;options:RunOptions;state:Record<string,any>;ui:'game'|'choice'|'evolution';choices:string[];waveChoice:boolean;randomState?:number;cardRandomState?:number};
function plain(value:unknown,depth=0):boolean {
 if(depth>20)return false;
 if(value===null||typeof value==='boolean')return true;
 if(typeof value==='number')return Number.isFinite(value)&&Math.abs(value)<1e15;
 if(typeof value==='string')return value.length<10000;
 if(Array.isArray(value))return value.length<=10000&&value.every(v=>plain(v,depth+1));
 if(value&&typeof value==='object')return Object.entries(value).length<10000&&Object.entries(value).every(([k,v])=>!['__proto__','constructor','prototype'].includes(k)&&plain(v,depth+1));
 return false;
}
export function validRun(raw:unknown):raw is RunRecovery {
 if(!raw||typeof raw!=='object')return false;const r=raw as RunRecovery,s=r.state;
 return r.version===1&&Object.hasOwn(HEROES,r.hero)&&Object.hasOwn(WEAPONS,r.weapon)&&WEAPONS[r.weapon].hero===r.hero&&!!s&&plain(raw)&&['game','choice','evolution'].includes(r.ui)&&Array.isArray(r.choices)&&r.choices.length<=3&&r.choices.every(x=>typeof x==='string')&&typeof r.waveChoice==='boolean'&&['endless','daily','short'].includes(r.options?.mode)&&['assault','mobility','guard'].includes(r.options?.build)&&s.hp>0&&s.maxHp>=s.hp&&s.level>=1&&s.xpNeed>0&&s.stats?.wave>=1&&typeof s.elapsed==='number'&&typeof s.x==='number'&&typeof s.y==='number'&&Array.isArray(s.enemies)&&Array.isArray(s.bullets)&&Array.isArray(s.drops)&&Array.isArray(s.plan)&&!!s.levels&&!!s.evolution&&!!s.cardEvolutions&&Object.keys(s).every(k=>RUN_FIELDS.includes(k));
}
export function captureRun(scene:any,ui:RunRecovery['ui'],choices:string[]=[],waveChoice=false):RunRecovery {
 const state:Record<string,unknown>={};
 for(const key of RUN_FIELDS)if(scene[key]!==undefined)state[key]=scene[key];
 // Enemy references inside projectiles, marks and objectives keep their identity.
 const refs=new Map<object,number>(scene.enemies.map((e:object,i:number)=>[e,i]));
 state.enemies=scene.enemies.map((e:object)=>({...e}));
 const encoded=JSON.parse(JSON.stringify(state,(_key,v)=>refs.has(v)?{$enemy:refs.get(v)}:v instanceof Set?{$set:[...v]}:v));
 return {version:1,hero:scene.hero,weapon:scene.weapon,options:{...scene.options,hero:scene.hero,weapon:scene.weapon},state:encoded,ui,choices,waveChoice,randomState:scene.random.getState?.(),cardRandomState:scene.cardRandom.getState?.()};
}
export function restoreRun(scene:any,recovery:RunRecovery){
 if(!validRun(recovery))throw Error('The saved run is invalid.');
 const state=JSON.parse(JSON.stringify(recovery.state)),enemies=state.enemies;
 function decode(v:any):any{if(!v||typeof v!=='object')return v;if(Object.hasOwn(v,'$enemy')){if(!Number.isInteger(v.$enemy)||!enemies[v.$enemy])throw Error('Invalid saved enemy reference');return enemies[v.$enemy];}if(Object.hasOwn(v,'$set'))return new Set(v.$set.map(decode));if(Array.isArray(v))return v.map(decode);return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,decode(x)]));}
 for(const key of RUN_FIELDS)scene[key]=Object.hasOwn(state,key)?decode(state[key]):undefined;
 // Use the same enemy instances that decoded references point to.
 scene.enemies=enemies;scene.particles=[];scene.paused=true;scene.ended=false;
 scene.random.setState?.(recovery.randomState);scene.cardRandom.setState?.(recovery.cardRandomState);
 scene.drawFloor();scene.applyMapView();scene.render();
}
