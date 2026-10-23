"""Measure isolated generated sprite parts without resampling the source artwork."""
from PIL import Image
from pathlib import Path
import json
out = {}
for path in Path('public/assets/cosmetics/survivors-v2').glob('*-atlas.png'):
    image = Image.open(path)
    width, height = image.size
    parts = []
    for index in range(5):
        # Generated fingers/belt extend slightly below the nominal top row.
        columns = [(0, .38), (.38, 2/3), (2/3, 1)] if index < 3 else [(0, 1/3), (1/3, 2/3), (2/3, 1)]
        left, right = (int(v * width) for v in columns[index % 3])
        top, bottom = (4, int(height*.57)) if index < 3 else (int(height*.55), height-4)
        left += 4
        right -= 4
        mask = image.crop((left, top, right, bottom)).getchannel('A')
        w, h = mask.size
        data = mask.tobytes()
        seen = bytearray(w*h)
        largest = []
        for pixel in range(w*h):
            if seen[pixel] or data[pixel] < 160:
                continue
            group = [pixel]
            seen[pixel] = 1
            cursor = 0
            while cursor < len(group):
                q = group[cursor]
                cursor += 1
                x = q % w
                for n in ([q-1] if x else []) + ([q+1] if x<w-1 else []) + [q-w, q+w]:
                    if 0 <= n < len(data) and not seen[n] and data[n] >= 160:
                        seen[n] = 1
                        group.append(n)
            if len(group) > len(largest):
                largest = group
        xs, ys = [n % w for n in largest], [n // w for n in largest]
        x, y = min(xs), min(ys)
        parts.append([left+x, top+y, max(xs)-x+1, max(ys)-y+1])
    out[path.stem.replace('-atlas', '')] = dict(width=width, height=height, parts=parts)
Path('src/survivor-atlas-data.ts').write_text('export const SURVIVOR_ATLASES=' + json.dumps(out) + ';\n')
