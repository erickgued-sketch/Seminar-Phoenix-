"""Turn the 1024 px Higgsfield renders of the 3D icon set into the app's 256 px WebP files.

Usage: python3 scripts/make-icons.py <folder of <name>.png renders>
Each render is trimmed to its opaque area and centred on a square with a 6 % margin, so every icon has the
same optical size whatever the model framed. Output: assets/icons/<name>.webp (≈13 KB each).
"""
import glob, os, sys
from PIL import Image

src = sys.argv[1]
out = os.path.join(os.path.dirname(__file__), '..', 'assets', 'icons')
os.makedirs(out, exist_ok=True)
for f in sorted(glob.glob(os.path.join(src, '*.png'))):
    im = Image.open(f).convert('RGBA')
    box = im.split()[3].point(lambda v: 255 if v > 12 else 0).getbbox()
    im = im.crop(box)
    side = int(max(im.size) * 1.06)
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    sq.paste(im, ((side - im.size[0]) // 2, (side - im.size[1]) // 2))
    name = os.path.splitext(os.path.basename(f))[0]
    sq.resize((256, 256), Image.LANCZOS).save(os.path.join(out, name + '.webp'), 'WEBP', quality=88, method=6)
    print(name)
