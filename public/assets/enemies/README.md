# Zombie gameplay sprites

`zombie-overhead.png` is the transparent overhead adaptation of the nine approved Field Guide zombies. Generated with the built-in image-generation tool, then integrated as actual Phaser gameplay textures. Originals are preserved outside the repository.

Atlas order: Wanderer, Runner, Spitter; Armoured, Brute, Elite; Fallen Rifleman, Horde Commander, Zombie General. All face south in the source; `src/zombie-sprites.ts` rotates them to the renderer's east-facing convention and builds three subtle gait poses. Gutter-aware cropping preserves the Spitter's droplet without leaking into the Elite.

Final prompt: “Preserve the nine approved designs, colors and bold cartoon outlines in a transparent 3×3 overhead gameplay sprite atlas. All characters face south, hands reach forward, feet trail behind. Rifle barrel points south in both hands. Brute's face is on the forward side of the head. Keep each silhouette isolated; no labels, ground or shadows.”

## Readability revision

The active gameplay assets are now `zombie-swarm-walk.png`, `zombie-heavy-walk.png`, and `zombie-officers-walk.png`. The earlier detailed `zombie-overhead.png` is retained for reference but is no longer loaded. Each active sheet contains three characters in rows and three actual drawn poses in columns. The texture builder uses a shared crop across poses to avoid size pulsing, caches the crop, and fills more of the existing display footprint. Collision sizes and combat rules are unchanged.

Generated using the built-in image-generation tool. Prompt set: adapt the approved identities for 25–50px cartoon mobile gameplay; large face, yellow eyes, large hands, simple flat color blocks, one shadow tone, thick navy outline; no grime or tiny texture. All face south. Each row contains idle, left stride, right stride on transparent background. Swarm: brown Wanderer, white-shirt/red-shoe Runner, purple-throat Spitter. Heavy: blue riot Armoured, olive huge-fist Brute, burgundy/ivory-spiked Elite. Officers: olive Rifleman with south-facing rifle, maroon Commander with radio, dark General with gold epaulettes and one mutated arm.

## Continuous walking revision

Gameplay no longer alternates between separately illustrated full-body poses. `src/zombie-walk.ts` defines per-type stride lengths, arm/foot motion, dragging-foot weights and turn speeds. `zombieWalkCanvases` uses the idle drawing as a continuous weighted limb rig, baking 24 loop poses with a fixed face and torso. Feet have a longer planted phase and shorter recovery; rifle arms stay fixed. Per-enemy phases advance from actual travel distance, stop at rest, and ignore attack windups and teleports. Poses are cached for scene restarts. This preserves the artwork without the head/clothing changes in the generated walk frames. No new art generation was needed for this revision.

## Wide-map stability fix

Below 0.8 camera zoom, zombies rendered under 64 screen pixels use the stable idle silhouette while moving, avoiding subpixel limb-frame shimmer. Large sprites and normal zoom retain their walk cycles. Attack/hit locks preserve the current phase rather than snapping to idle. Illustrated zombies use a gentle damage tint instead of a solid fill, size jolt and rotation jolt. Movement, collision, damage and attack timing are unchanged.

## Separate-part rig (active)

Active assets: `zombie-swarm-parts.png`, `zombie-heavy-parts.png`, `zombie-officers-parts.png`. These contain six genuinely separate drawings per enemy: head, torso, left/right arms, left/right legs. Exact transparent-part bounds are recorded in `src/zombie-rig-frames.json`; the earlier complete-body sprite sheets remain as references and are no longer loaded.

`rigPose` keeps head and torso joints invariant. Separate limbs rotate at fixed shoulder and hip joints. The renderer bakes idle and 24 walking phases at full and reduced strength, plus prefiltered 64px versions for wide view. Start/stop strength eases between those cycles. The new facing state uses a horizontal dead zone and 0.22-second dwell, flips the upright 3/4 artwork left/right, and never rotates the body. Rifle hands and gun aim as a separate assembly. Slightly wider bounded crowd separation and depth ordering keep silhouettes distinct without changing enemy health, attack timings, collision radii or damage.

Built-in image generation prompt set: create a transparent cutout rig atlas with three enemy rows and six separate body-part columns, rounded hidden joint ends, matching elevated front 3/4 view, original approved identities, thick navy outlines, large yellow eyes, simple cartoon shading, no backgrounds or labels. Swarm: brown-shirt Wanderer, white-shirt/red-sneaker Runner, purple-throat Spitter. Heavy: blue riot Armoured, olive huge-fist Brute, burgundy/bone-spiked Elite. Officers: olive Rifleman, maroon/radio Commander, navy/gold General with asymmetric mutated arm.

QA pages: `tests/zombie-rig-combat.html` exercises the real `ArenaScene.updateEnemies` and renderer against a moving hero, a car, single Wanderer and 16-enemy crowd, with a 1×/2× toggle and measured body rotation. `tests/zombie-rig-mobile.html` runs the same check inside a 390px phone viewport. The lineup test also checks identical head pixels across all poses for all nine enemies.

## Colorful 2D revision, bald Wanderer and zombie dog

The active atlases now have the `-parts-v2.png` suffix. All nine use full-color 2D cartoon artwork: flat colors, simple shadow areas and bold navy outlines. The Wanderer has a bald green scalp. The `runner` enemy ID is preserved for saved games and wave schedules but now displays as **Zombie Dog**, with canine head, horizontal torso/tail and four distinct paw/leg parts. Its gait alternates diagonal pairs with stable head and body; its speed, health, damage and rewards remain the same. The Field Guide's Wanderer and dog portraits use the active gameplay artwork.

Generated using the built-in image tool. Prompt set: edit the swarm cutout atlas to remove all Wanderer hair and replace the human Runner row with a pointed-ear, yellow-eyed zombie dog (head, horizontal body/tail, two front legs, two hind legs), preserving the Spitter. Recolor the heavy and officer atlases with brighter saturated colors, crisp outlines and simple 2D cel shading; preserve costumes and bald Brute/Elite heads; no realistic textures, detailed gore, scenery or labels. Original source images are preserved; the unused heavy variant that introduced hats was discarded.

## Dog visibility pass

Active swarm asset: `zombie-swarm-parts-v3.png`. The dog's dark fur is replaced by warm ivory/cream with rust-orange patches and brighter infected skin, retaining a dark cartoon outline. Its displayed silhouette and shadow are enlarged by 20% in both zoom views; this stacks with the existing 17% wide-map visual boost. Hitboxes and combat stats remain unchanged. Field Guide artwork uses the same updated atlas. Built-in image-tool prompt: recolor only second-row dog pieces for visibility on dark blue-grey ground; mostly light ivory fur, bold rust-orange patches, bright yellow-green exposed skin, thick navy outline; preserve shapes, other rows and transparency; no realistic texture, glow or scenery.
