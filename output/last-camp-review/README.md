# Last Camp — Daily Challenge

Implemented: seeded daily survivor/weapon and temporary featured outfit (never grants ownership or changes saved loadout); 600-health central camp; marked siege roles on existing heavy enemies and later basic enemies; telegraphed camp strikes; directional entrances; stronger wave 5/10 siege packs; clear all enemies for wave completion; camp defeat and player defeat; ten-wave victory; one repair/strength/defense reward per wave; camp health HUD; bounded court and camp-core collision; dedicated courtyard and beacon artwork; separate fire and ember animation; reduced-motion and wide-view particle reductions; existing sound/music controls retained.

## Verification
- 47 focused automated tests pass (camp, retention, hero abilities, cosmetic ownership, HUD portraits).
- Production build passes; existing large-bundle warning remains.
- Native scene rehearsal: all 10 waves advanced through actual wave completion / reward / next-wave methods, reaching VICTORY. This accelerated check clears enemies through the development UI; it is not a natural full-length balance playthrough.
- Repair restored 500/600 to 600/600. Strength and reinforcement rewards selected on alternating subsequent waves. Duplicate rewards and armor cap tested automatically.
- Camp defeat, player defeat, restart, all five hero scene loads, regular Daily Challenge entry, 1×/2×, narrow viewport and reduced-motion rendering checked.
- Rehearsal uses a disposable save and never persists progress.
- New art generated through the imagegen skill and copied into public/assets/maps/last-camp/.

## Remaining limits
- Full-length difficulty/balance needs player playtesting; no claim of a natural ten-wave victory.
- Mobile layout was checked in a narrow browser viewport, not on a physical phone.
- Siege roles reuse existing enemy art with warning markers; no new siege monster sprite set.
- Courtyard outer boundary and camp core are collidable; the illustrated camp's small props are decorative.
- Existing background music now blends between menu, camp, and siege volume levels while honoring the mute choice; no new soundtrack was composed.
