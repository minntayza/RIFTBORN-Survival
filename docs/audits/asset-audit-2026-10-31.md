# RIFTBORN asset audit — 2026-10-31

Read-only audit. No assets removed and no production deployment changed.

## Size

- Production build: 214.22 MiB of actual file contents (224,624,076 bytes).
- Public files: 211.53 MiB; artwork accounts for 208.50 MiB.
- The earlier 252 MB figure came from filesystem allocated space (`du`), not actual file contents.
- Nearly all deployment bytes are public assets, rather than application JavaScript.

## Findings

Conservative static scan identifies **239 candidate files totaling 54.89 MiB** outside protected dynamic-path directories. This is a review list, not a deletion manifest.

Verified examples:

| Candidate | Why review it |
| --- | --- |
| `public/audio/across-the-ridge-preview.mp3` | Preview/test reference; production music loads `riftborn-last-light-v1.mp3`. |
| `public/assets/card-concepts/lethwei-upgrades-v2.png` | Current card renderer loads `lethwei-upgrades-v3.png`. |
| `public/assets/card-concepts/archer-upgrades-v1.png` | Preview reference; current card renderer loads `archer-upgrades-v2.png`. |
| `public/assets/cosmetics/ninja-modern-rig-v2.png` | Current cosmetic catalog selects `ninja-modern-rig-v3.png`. |
| `public/assets/characters/zawgyi-rig-v1.png`, `v2.png`, `v3.png` | Current Zawgyi rig is `zawgyi-rig-v4.png`. |
| Kyansittha concept sheets | Referenced by development previews; removed from the playable roster. Some legacy rig code remains, so do not remove all similarly named files indiscriminately. |

## Important safeguards

- Many asset URLs are constructed dynamically. Those directories were conservatively protected, including zombie sheets, maps, evolution art, weapon cards and cosmetic atlases.
- Tank arm URLs can be derived through a string replacement. These were protected too.
- A source reference does not prove a file is reached in active gameplay; lack of a literal reference does not prove it is unused.
- Preview-only assets are still useful for development. Move them outside `public/` with updated previews, or exclude them from deployment in a verified build step, rather than blindly deleting them.
- Check `public/manifest.webmanifest`, HTML and CSS dependencies before touching icons, fonts or linked pages.

## Recommended next change

Archive verified obsolete versions outside `public/`, preserve preview assets with their development pages, rebuild, then verify all seven survivors, outfits, cards, awakenings, enemy types, both modes and mobile layout. Keep source artwork recoverable in Git.

Excluding roughly 55 MiB of candidates could reduce each future deployment by about one quarter, subject to final reference validation. It does not remove already-retained Vercel deployments. The dashboard's 10.17 GB retained-storage total was not independently inspected in this local audit.

See [the file-by-file inventory](asset-reference-audit.tsv) for exact paths, sizes and classifications.
