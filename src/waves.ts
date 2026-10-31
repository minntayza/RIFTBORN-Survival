import {encounterRhythm} from './run-design';
import { ENEMIES, type EnemyId } from './config';
import type { BossConfig } from './retention';
import type { EnemyFaction } from './robot-enemies';
export const waveBudget = (wave: number) => 100 + 30 * (wave - 1) + 4 * (wave - 1) ** 2;
export const scaling = (wave: number) => ({ health: 1 + (wave - 1) * .06, damage: 1 + (wave - 1) * .045, speed: 1 + Math.min((wave - 1) * .012, .3) });
export type Spawn = {
    time: number;
    type: EnemyId;
    count: number;
    formation: number;
    faction?: EnemyFaction;
};
export function wavePlan(w: number, random=Math.random, dailyBosses?: { wave5: BossConfig; wave10: BossConfig }, endless=false): Spawn[] {
    if (w === 1)
        return [{ time: 0, type: 'basic', count: 4, formation: 0 }, { time: 6, type: 'basic', count: 3, formation: 1 }, { time: 6, type: 'runner', count: 1, formation: 1 }, { time: 12, type: 'basic', count: 3, formation: 2 }, { time: 18, type: 'runner', count: 2, formation: 3 }, { time: 24, type: 'basic', count: 3, formation: 0 }, { time: 24, type: 'runner', count: 1, formation: 0 }, { time: 30, type: 'basic', count: 3, formation: 2 }, { time: 35, type: 'brute', count: 1, formation: 1 }];
    const counts: Partial<Record<EnemyId, number>>[] = [{}, {},
      {basic:20,runner:6,brute:1},
      {basic:23,runner:7,spitter:3},
      {basic:26,runner:8,spitter:4,brute:2},
      {basic:30,runner:9,spitter:5,brute:3,elite:1},
      {basic:34,runner:10,spitter:6,brute:3,armoured:5},
      {basic:38,runner:12,spitter:6,brute:4,armoured:6,rifle:2},
      {basic:44,runner:14,spitter:7,brute:4,armoured:7,rifle:3,elite:1},
      {basic:48,runner:16,spitter:8,brute:5,armoured:8,rifle:4,commander:1},
      {basic:54,runner:18,spitter:8,brute:5,armoured:9,rifle:5,commander:1,boss:1}];
    if (dailyBosses && w <= 10) {
        if (w === 5) counts[5] = { basic: 16, runner: 4, spitter: 2, [dailyBosses.wave5.type]: 1 };
        else if (w === 9) counts[9] = { basic: 28, runner: 8, spitter: 4, brute: 3, armoured: 4, rifle: 2 };
        else if (w === 10) counts[10] = { basic: 24, runner: 6, spitter: 3, armoured: 4, [dailyBosses.wave10.type]: 1 };
        else if (w >= 2 && counts[w]) {
            const c = counts[w];
            for (const key of Object.keys(c) as EnemyId[]) {
                if (c[key] && c[key]! > 2) c[key] = Math.max(2, Math.round(c[key]! * 0.8));
            }
        }
    }
    if(endless&&!dailyBosses&&w>=5&&w<=9){
        const target=[3,4,6,8,10][w-5],extra=target-(counts[w].rifle??0);
        counts[w].basic=(counts[w].basic??0)-extra;counts[w].rifle=target;
    }
    const out: Spawn[] = [];
    if (w <= 10) {
        for (const [type, n] of Object.entries(counts[w])) {
            let left = n;
            let i = 0;
            while (left > 0) {
                const count = Math.min(left, type === 'basic' ? 4 : 2);
                const isDailyW5Boss = !!dailyBosses && w === 5 && type === dailyBosses.wave5.type;
                const isDailyW10Boss = !!dailyBosses && w === 10 && type === dailyBosses.wave10.type;
                const faction = isDailyW5Boss ? dailyBosses!.wave5.faction : isDailyW10Boss ? dailyBosses!.wave10.faction : undefined;
                const isBoss = isDailyW5Boss || isDailyW10Boss || type === 'boss';
                out.push({
                    time: isBoss ? 0 : type==='commander'?20: Math.min(39, i * 38 / Math.max(1,Math.ceil(n/(type==='basic'?4:2))-1) + (type === 'basic' ? 0 : 2)),
                    type: type as EnemyId,
                    count,
                    formation: i % 6,
                    ...(faction ? { faction } : {})
                });
                left -= count;
                i++;
            }
        }
    }
    else {
        const windows = [[0, 10, .2], [10, 25, .35], [25, 35, .25], [35, 40, .2]];
        for (const [a, b, f] of windows) {
            let budget = Math.floor(waveBudget(w) * f * encounterRhythm(w).density), i = 0;
            while (budget >= 5) {
                const variant=(w-11)%4;
                const keys: EnemyId[] = [...(variant===1?['runner' as EnemyId,'runner' as EnemyId,'runner' as EnemyId]:['basic' as EnemyId,'basic' as EnemyId]), 'runner', 'spitter', 'armoured', 'brute', 'cleaver', ...(w>=12?['spear' as EnemyId]:[]), ...(w>=13?['rifle' as EnemyId,'bioScreer' as EnemyId]:[]), ...(w>=14?['abomination' as EnemyId]:[]), ...(w>=15?['shadowLurker' as EnemyId,'shadowLurker' as EnemyId]:[]), ...(w % 4 === 0 ? ['elite' as EnemyId] : [])];
                const affordable=keys.filter(type=>ENEMIES[type].cost<=budget);
                const type = affordable.length?affordable[Math.floor(random() * affordable.length)]:'basic';
                if (ENEMIES[type].cost > budget)
                    continue;
                out.push({ time: a + (b - a) * random(), type, count: 1, formation: variant===1?3:i++ % 6 });
                budget -= ENEMIES[type].cost;
            }
        }
        out.push({time:6,type:w===11?'cleaver':w===12?'spear':'rifle',count:1,formation:1});
        if(w%5===1)out.push({time:0,type:'shooterBoss',count:1,formation:0});
        if(w%5===3)out.push({time:0,type:'commander',count:1,formation:0});
        if (w % 5 === 0)
            out.push({ time: 0, type: 'boss', count: 1, formation: 0 });
    }
    if(w>10){
        // Smaller supporting packs leave room for the post-wave-10 robot encounters.
        const extra=Math.round(Math.min(48,20+(w-8)*4)*encounterRhythm(w).density);
        const batches=Math.ceil(extra/8);
        for(let i=0;i<batches;i++){
            const count=Math.min(8,extra-i*8),runners=Math.floor(count/4),time=2+i*37/Math.max(1,batches-1);
            out.push({time,type:'basic',count:count-runners,formation:i%2===0?3:1});
            if(runners)out.push({time:Math.min(39,time+.4),type:'runner',count:runners,formation:3});
        }
    }
    if(endless&&!dailyBosses&&(w===13||w===14)){
        let remaining=w===13?6:8;
        // Exchange supporting melee units, preserving the total population.
        for(const pack of [...out].reverse()){
            if(pack.type!=='basic'||remaining===0)continue;
            const count=Math.min(remaining,pack.count);pack.count-=count;remaining-=count;
            out.push({time:Math.min(39,pack.time+.8),type:'rifle',count,formation:pack.formation,faction:'robot'});
        }
    }
    // Three short gaps let players collect drops without stopping the encounter.
    if(w>=3)for(const spawn of out)if(spawn.time>=12&&spawn.time<15||spawn.time>=26&&spawn.time<29)spawn.time=Math.min(39,spawn.time+3);
    return out.filter(pack=>pack.count>0).sort((a, b) => a.time - b.time);
}
export const damageValue = (base: number, multiplier: number, crit: boolean, armour = false) => Math.round(base * multiplier * (crit ? 1.8 : 1) * (armour ? .55 : 1));
export const cooldownValue = (base: number, rate: number, reduction = 0) => Math.max(.08, base / rate * (1 - Math.min(.75, reduction)));

// Remaining scheduled leaders count too: killing the General before the Commander
// arrives must not skip the final zombie encounter.
export function zombieFinaleCleared(bossDefeated:boolean,plan:readonly Spawn[],enemies:readonly {type:EnemyId;active:boolean}[]){
    const leader=(type:EnemyId)=>type==='boss'||type==='commander'||type==='shooterBoss';
    return bossDefeated&&!plan.some(pack=>pack.count>0&&leader(pack.type))&&!enemies.some(enemy=>enemy.active&&leader(enemy.type));
}
