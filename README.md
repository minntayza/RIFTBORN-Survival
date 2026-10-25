# RIFTBORN

A mobile-first zombie survival roguelite built with **TypeScript, Phaser 3, and Vite**. Fight through growing hordes, combine upgrades, awaken your weapon, and survive as long as you can.

The game runs entirely in the browser. Progress is stored locally; no account, server, or database is required. Character illustrations, gameplay textures, and sound effects are generated locally.

## Quick start

Requires **Node.js 20.19+ or 22.12+** and npm.

```bash
git clone https://github.com/minntayza/zombie-last-stand.git
cd zombie-last-stand
npm ci
npm run dev
```

Open the address printed by Vite. To play on a phone connected to the same Wi-Fi network, use the network address printed by the development server. The server listens on all network interfaces.

```bash
npm run build    # Type-check and build to dist/
npm run preview  # Serve the production build locally
npm test         # Run automated unit tests
```

## Controls

| Platform | Action | Control |
| --- | --- | --- |
| Mobile | Move | On-screen joystick |
| Mobile | Attack | Automatic when a target is in range |
| Mobile | Ability | Large ability button |
| Desktop | Move | WASD or arrow keys |
| Desktop | Aim / attack | Mouse / hold left click |
| Desktop | Ability | Space |
| Desktop | Pause | Escape or the pause button |
| Desktop | Choose an upgrade | 1, 2, or 3 |

Mobile aim assistance helps target nearby enemies while retreating and can be disabled in Settings. Joystick side and size are configurable. Open **Your Build** from the equipped-effect icons to pause and inspect upgrades, evolution requirements, and combinations.

## Features

- **Four survivors:** Ninja, Samurai, Gunner, and Shield Tank, each with a distinct ability, passive mechanic, and personal records.
- **Twelve weapons:** Katana, Dual Blades, Kama, Nodachi, Cursed Blade, Naginata, Twin Pistols, Shotgun, SMG, Round Shield, Spiked Shield, and War Hammer.
- **Run modes:** Endless, a ten-wave Last Stand mission, and a seeded daily challenge with local personal-best records.
- **Open-world movement:** scrolling terrain, optional supply wrecks, XP beacons, elite patrols, and desert terrain with sandstorms after wave ten.
- **Enemies:** ordinary hordes, armed zombies, elites, Siege Gunner and Horde Commander mini-bosses, and the Zombie General.
- **Readable combat:** attack warnings, off-screen threat indicators, damage direction, weapon-specific impacts, and a compact mobile HUD.
- **Wave pacing:** alternating encounter intensity, staggered packs, crowd-pressure limits, and short recovery periods.
- **Progression:** XP upgrade choices, permanent purchases, and browser-local records.

### Evolutions

Regular upgrades come from level-ups. Starting in **wave 11**, a maxed card can offer its one-time evolution alongside normal choices.

In **Endless**, clearing **wave 10** unlocks a weapon awakening. Clearing **wave 20** fully evolves that same element:

| Element | Awakening | Full evolution |
| --- | --- | --- |
| Lightning | Chain to one nearby enemy | Chain to three enemies and gain piercing attacks |
| Wildfire | Briefly ignite targets | Explosive fire attacks and burning ground |
| Phantom | Faster attacks and periodic echoes | Stronger attack speed with an echo on every attack |

The ten-wave finite modes end at their final boss; use Endless to play through both weapon milestones. The **Field Guide** includes locked previews, requirements, and saved discovery/usage states for card and weapon evolutions.

### Build combinations

| Combination | Requirements | Effect |
| --- | --- | --- |
| Firestorm | Fire upgrade + a wind attack | Wind hits spread fire to nearby enemies |
| Steel Reversal | Samurai + Storm Blade | Perfect counters return nearby enemy shots |
| Shadow Harvest | Ninja + Echo Slash, Phantom Ally, or Phantom evolution | Dash kills summon or extend a fighting shadow |
| Crossfire | Through the Dark + Trick Shot | Piercing rounds split a weaker shot toward another enemy |
| Burning Aftershock | Ground Slam + Ember Circle | Ground Slam leaves burning ground |

Combinations activate automatically when requirements are met. The build panel shows active combinations and ones to work toward.

## Playtest configuration

**Unlimited gold is currently enabled for testing.** Change `PLAYTEST.unlimitedGold` in [`src/config.ts`](src/config.ts) to `false` before testing the normal purchase economy or releasing the game.

Saves belong to the current browser and site origin. Moving between localhost, a phone's network address, or a hosted site creates separate save storage. Clearing browser storage removes local progress. Daily records are local; there is no online leaderboard.

## Testing

```bash
npm test
npm run build
```

With the development server running, open:

- `/tests/browser.html` — in-engine integration checks for combat, abilities, saves, evolutions, synergies, crowd pacing, and touch behavior.
- `/tests/hud-preview.html` — phone HUD and build-panel preview.
- `/tests/evolution-showcase.html` — upgrade cards and weapon awakening previews.
- `/tests/weapon-motion.html` — weapon motion preview.

Automated checks are supplemented by browser inspection. Real-phone playtesting is still needed to tune comfort, difficulty, and long-session performance.

## Project structure

```text
src/
  main.ts             Menus, navigation, HUD integration, and persistence
  combat.ts           Phaser scene, combat, enemies, pickups, and wave lifecycle
  combat-hud.ts       Combat HUD and paused build details
  combat-feel.ts      Aim assistance, spawn routing, and build combinations
  config.ts           Hero, weapon, enemy, and balance data
  waves.ts            Wave schedules and scaling
  upgrades.ts         Upgrade selection and eligibility
  card-evolutions.ts  Card evolution definitions
  progression.ts      Weapon evolution options and encounter events
  retention.ts        Run modes, daily seeds, and threat indicators
  mastery.ts          Legacy save compatibility helpers
  save.ts             Save validation and purchases
  art.ts              Original vector art and gameplay texture generation
  visuals.ts          Gameplay actors, equipment, and animation
  weapon-effects.ts   Shared weapon movement and contact geometry
  touch.ts            Mobile joystick and ability controls
  audio.ts            Synthesized audio
  style.css           Responsive menus and HUD styling
tests/                Unit tests, browser checks, and visual fixtures
```

## Hosting

Run `npm run build` and deploy the contents of `dist/` to a static host. For hosting under a subdirectory, configure Vite's base path for that location. No backend environment variables are required.
