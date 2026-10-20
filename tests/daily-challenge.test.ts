import test from 'node:test';
import assert from 'node:assert/strict';
import { dailySetup } from '../src/retention';
import { wavePlan } from '../src/waves';

test('daily setup defines 10-wave rotating bosses where wave 5 is from first 2 and wave 10 is from last 2', () => {
    // Test across several dates
    const dates = ['2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'];
    for (const date of dates) {
        const setup = dailySetup(date);
        assert.equal(setup.mode, 'daily');
        assert.ok(setup.dailyBosses, 'dailyBosses must be configured');

        const { wave5, wave10 } = setup.dailyBosses;
        // First 2 bosses: Horde Commander (zombie commander) or Zombie General (zombie boss)
        assert.equal(wave5.faction, 'zombie');
        assert.ok(wave5.type === 'commander' || wave5.type === 'boss');

        // Last 2 bosses: Command Unit (robot commander) or Factory Sentinel (robot boss)
        assert.equal(wave10.faction, 'robot');
        assert.ok(wave10.type === 'commander' || wave10.type === 'boss');

        // The two bosses must never be identical
        assert.notEqual(`${wave5.type}:${wave5.faction}`, `${wave10.type}:${wave10.faction}`);
    }
});

test('daily wave plan schedules wave 5 and wave 10 bosses with appropriate factions and tuning', () => {
    const setup = dailySetup('2026-10-20');
    assert.ok(setup.dailyBosses);

    // Wave 5 schedule
    const planW5 = wavePlan(5, Math.random, setup.dailyBosses);
    const bossW5 = planW5.find(s => s.type === setup.dailyBosses!.wave5.type && s.time === 0);
    assert.ok(bossW5, 'Wave 5 boss should spawn at time 0');
    assert.equal(bossW5.faction, setup.dailyBosses.wave5.faction);

    // Wave 10 schedule
    const planW10 = wavePlan(10, Math.random, setup.dailyBosses);
    const bossW10 = planW10.find(s => s.type === setup.dailyBosses!.wave10.type && s.time === 0);
    assert.ok(bossW10, 'Wave 10 boss should spawn at time 0');
    assert.equal(bossW10.faction, setup.dailyBosses.wave10.faction);
});
