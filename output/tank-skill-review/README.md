# Shield Tank skill visual review

Replay: http://127.0.0.1:5174/tests/tank-skills-preview.html

The preview uses the actual ArenaScene, equipment renderer, ability activation, projectile absorption and movement methods with a disposable save. It does not overwrite the player's loadout or purchases. Choose outfit, weapon and independent weapon style; replay a skill or freeze a chosen time. It includes facing, steering, map view, reduced motion, sound, enemy warnings, cap/rejection tests and lifecycle controls.

## Changes

- Ground Slam: immediate connected weapon downstroke, planted feet, short recovery, single damage-centered shockwave, branching fractures, small contact star, chunky fragments and dust. Damage remains immediate; there is deliberately no delayed pre-hit windup.
- Magnetic Bulwark: directional frontal arc exactly matching absorption coverage, five energy-based charge marks, themed crest, absorbed-projectile convergence trails, brief compression and one release ring. The shield arc disappears at release.
- Wrecking March: movement-driven stepping, responsive forward lean applied to the complete rig, alternating foot pulses and dust, actual-displacement marks, planted final stomp and compact impact ring.
- Outfit-derived steel/teal, royal gold/blue, forge copper/orange and polar frost palettes, crests and fragments. Weapon selection stays independent.
- Two reusable graphics layers, at most 24 short-lived visual events; no random-number consumption, new dependencies, new sound or added shake. Secondary effects reduce at 2× and under reduced motion. Warning depth remains above decoration.

## Evidence

72 named frames cover four outfits × three weapons × three skills × two map views. Files follow `<outfit>-<weapon>-<skill>-<view>x.png`. The matrix image collects the 36 2× frames. Additional Forge frames show absorption, release and final stomp. `mobile-reduced-*.png` shows a 390×844 mobile viewport with reduced motion, left facing and 2× map view. These are rendered frames, not generated concept images.

Browser checks confirmed:
- Full charge at 80/80 from five actual damage-16 projectiles at 1.9 seconds.
- Rear projectile rejected; eighth accepted shot releases and resets stored energy.
- March steering changes heading and position while active (90-degree turn tested).
- Pause/freeze, restart, interruption and death controls work; interruption/death leave zero visual events.
- Enemy warning remains visible over decorative impacts.
- Both facing directions and all equipment textures render in the comparison scene.

## Tests

55 focused tests passed: tank-active-motion, hero-abilities, tank-skill-fx, tank, cosmetic-effect-profiles, cosmetics and tank-weapon-designs. Production TypeScript/Vite build passed (existing bundle-size warning).

A broader run including outfit-effects passed 57/58: its icon test expects legacy SVG `data-outfit` markup, which the current icon artwork no longer supplies. An additional older tank-outfit-arms suite also fails its legacy portrait/anchor assertions against the current redesigned art. These unrelated artwork checks were not rewritten to conceal failures.

## Limits

Browser testing uses the actual game scene in a controlled rehearsal with stationary targets, not a complete survival run on physical phones. No physical-device frame-rate or touch-latency measurements were made. Saves/music were left untouched; the preview intentionally disables music. Ground Slam cannot gain a pre-contact windup without changing its existing instant damage timing. The baseline artwork is retained; animation is procedural through the existing rig.

## Second visual pass

Replaced thin wave outlines with filled wave bands and a clean highlight edge. Added fractured impact wedges, larger two-tone outlined shards and layered dust plumes. Bulwark now has five translucent armor facets contained in the real absorption sector; royal facets have crown edges, forge facets have rivets, and polar facets have crystal tips. March has movement-driven directional wakes and more substantial footfall plumes. No combat values, animation timers, audio or input rules changed in this pass.

`bold-<theme>-<skill>.png` captures the latest four outfit themes; `bold-skills.jpg` shows the Forge set. Additional captures check release, 2× and reduced motion. All 55 focused tests and the production build passed again after this pass. The older 72-frame matrix documents the first visual pass, not the stronger final artwork.
