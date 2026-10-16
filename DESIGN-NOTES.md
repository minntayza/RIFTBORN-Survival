# Enemy, boss and map direction

Recorded 2026-10-16. Design direction; implementation remains pending.

## Agreed constraints
- Keep dense survivor-style hordes and the risk of being surrounded. Do not guarantee escape corridors.
- Ordinary zombies need artwork and movement matching the heroes; preserve their existing combat stats unless a later change is explicitly agreed.
- Robots should feel stronger than zombies through combat identity and readable power, without excessive durability.
- Rifleman has no pre-shot aiming line. Bosses and mini-bosses resist hit knockback and stagger.

## Boss animation priority
The boss's body must explain its skill without relying on ground markers.
- Slam: plant feet, bend knees, lift heavy arm, hold, drive shoulder/torso/fist down together, contact the ground, recover slowly.
- Synchronize damage, cracks, dust and shockwaves with visible contact.
- General uses its mutated arm. Sentinel braces four legs and drives its chassis/reactor down. Gunner braces, elevates cannon and recoils. Commander raises its signal arm and orders reinforcements.
- Ground markers support attack readability. They do not replace acting.

## Proposed robot changes
- Distinct pursuit, flanking, ranged, protection and command behavior within small squads.
- Limit support overlap and avoid multiplying durability with Commander support.
- Different silhouettes/equipment for different attacks, including elite variants.
- Introduce a small robot patrol among zombies at wave 11, increase the robot share over subsequent waves.

## Proposed zombie changes
- Preserve overwhelming horde behavior; emphasize distinct movement and attack poses.
- Prioritize attacks and projectiles over decorative visual clutter.
- Keep damage and control tools effective against ordinary crowds.

## Proposed map changes
- Make visual obstacle footprints match actual collision; remove invisible snag points.
- Use a mix of plazas, tight passages and clustered cover without guaranteed safe routes.
- Give factory and gardens different obstacle arrangements and encounter composition.
- Add recognizable landmarks and reduce obvious repetition.

## Proposed order and validation
1. Boss acting and impact synchronization.
2. Robot role readability, support limits and durability tuning.
3. Mixed faction introduction.
4. Map collision/readability and layout variety; zombie crowd readability.
Verify at phone size and during dense combat. Playtest robot kill time, overlapping support, boss anticipation/contact/recovery, and obstacle traversal. No numerical balance targets are agreed yet.
