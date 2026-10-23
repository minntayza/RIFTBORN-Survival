
## Hand, leg and eye correction

Fox Ronin, Street Ace and Star Courier now map their anatomical left/right arm cells to the correct screen sides. Each affected glove has measured palm registration instead of a generic fingertip anchor. Street Ace's open fingers have texture padding that preserves the palm and shoulder positions without clipping fingertips. Courier legs now fit her asymmetric hip positions and preserve a common standing ground line with a visible gap.

Star Courier's eyes were edited with the built-in image-generation tool: defined dark pupils, violet iris shading and small white catchlights, preserving her confident expression. Updated atlas: `public/assets/cosmetics/survivors-v2/courier-atlas.png`; the prior version is retained as `output/survivor-review/courier-before-eyes.png`.

The eye-edit prompt requested an eyes-only change to the existing transparent atlas, with violet irises, ordinary dark pupils, white sclera, focused eyelids, one principal catchlight and a tiny reflection; all component framing and outfit details were to remain in place. The generated atlas was inspected and remeasured before integration.

Verified: all three corrected outfits aiming right and walking left in the native ArenaScene rehearsal; gallery, shared canvas/SVG registration, 49 focused tests passing, production build passing. Captures: `hands-legs-eyes-fixed.png`, `<fox|street|courier>-hands-right-fixed.png`, and `<fox|street|courier>-walking-left-fixed.png`. Browser viewport override was reset after checks.
