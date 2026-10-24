# Daily Challenge collision fix

Cause: the daily scene bypassed wreck collision and only clamped movement to a rectangle plus a small center circle. The camp supplies, barricades, courtyard walls and pillars had no registered ground shapes. Destination-only checks also allowed large movements to cross solids, and crowd separation modified positions without resolving camp collisions.

Fix: register ground footprints for the camp base, supplies, barricades, lantern supports, courtyard walls and pillars; resolve movement in 6-unit substeps; prevent large recovery projections from turning into movement shortcuts; correct crowd pushes; keep four entry lanes open; route regular enemies around camp with visible-corner paths and a waypoint-arrival tolerance; let siege enemies damage reachable outer camp structures instead of trying to enter the beacon.

Verification:
- Original regression was reproduced: actors could occupy the left supply crates and north wall (2 failing assertions before the fix).
- 61 focused tests pass, including player/heavy/boss sizes, all obstacle centers, dense overlapping-corner samples, long dashes, all entrance offsets, and normal-speed navigation.
- Native preview: walk PASS, dash PASS, zombie routing PASS with 0 overlaps.
- Native siege strike: camp 600 → 580 from outside solid geometry, preserving the attack warning.
- Production build passes with existing chunk-size warning.

Collision follows solid ground footprints. Raised flames, banners, leaves and light glows are not blocking shapes. Combat damage/reach, saved purchases, and Endless terrain are unchanged.
