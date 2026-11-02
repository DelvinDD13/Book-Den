"""Blade panels -> pixel sprites: background removed, scaled to a sprite grid, palette cut, pixels upscaled crisp."""
import sys, pathlib
from PIL import Image, ImageFilter
from rembg import remove, new_session

SRC = pathlib.Path('/tmp/claude-0/blades'); OUT = pathlib.Path('/home/claude/book-den/art/blades')
NAMES = ['oathbringer', 'sunraiser', 'firestorm', 'mayalaran', 'sylblade', 'sylspear', 'ivory', 'wyndleblade', 'wyndlefork', 'pattern', 'eshonai', 'nightblood']
GRID_H = int(sys.argv[1]) if len(sys.argv) > 1 else 120   # sprite height in pixels before the x4 upscale
COLORS = int(sys.argv[2]) if len(sys.argv) > 2 else 28
session = new_session('isnet-general-use')

def sprite(name):
    im = Image.open(SRC / (name + '.jpg')).convert('RGB')
    cut = remove(im, session=session, alpha_matting=False, post_process_mask=True).convert('RGBA')
    # drop faint halo pixels, then trim to the blade
    a = cut.getchannel('A').point(lambda v: 255 if v > 140 else 0)
    cut.putalpha(a)
    # the name painted across the blade: find its white strokes in the label band and paint the blade back over them
    import numpy as np, cv2
    arr = np.asarray(cut).copy(); H, W = arr.shape[:2]; y0, y1 = int(.505 * H), int(.55 * H)
    # the label is wider than the blade: in its band, anything outside the blade's own width (taken from the rows just above and below) goes
    ref = np.concatenate([arr[max(0, y0 - 8):y0, :, 3], arr[y1:y1 + 8, :, 3]]) > 0
    cols = np.where(ref.any(axis=0))[0]
    if len(cols):
        lo, hi = max(0, cols.min() - 2), min(W, cols.max() + 3)
        arr[y0:y1, :lo, 3] = 0; arr[y0:y1, hi:, 3] = 0
    rgb = arr[..., :3].astype(int); white = (rgb.min(axis=2) > 165) & ((rgb.max(axis=2) - rgb.min(axis=2)) < 30); dark = rgb.max(axis=2) < 70
    m = np.zeros((H, W), np.uint8); m[y0:y1] = (white | dark)[y0:y1]
    m = cv2.dilate(m, np.ones((5, 5), np.uint8), iterations=2)
    clear = arr[..., 3] == 0
    if m[~clear].any():
        # transparent pixels are masked too, so the fill is painted from the blade alone, never from the black outside it
        bgr = cv2.cvtColor(arr[..., :3], cv2.COLOR_RGB2BGR)
        fixed = cv2.inpaint(bgr, np.maximum(m, clear.astype(np.uint8)), 6, cv2.INPAINT_TELEA)
        keep = (m > 0) & ~clear
        arr[..., :3][keep] = cv2.cvtColor(fixed, cv2.COLOR_BGR2RGB)[keep]
        cut = Image.fromarray(arr, 'RGBA')
    box = cut.getbbox()
    if not box: raise SystemExit('nothing left of ' + name)
    cut = cut.crop(box)
    cut.save(SRC / ('cut_' + name + '.png'))
    # sprite grid: fixed height, width to match
    w, h = cut.size; gw = max(8, round(w * GRID_H / h))
    small = cut.resize((gw, GRID_H), Image.LANCZOS)
    alpha = small.getchannel('A').point(lambda v: 255 if v > 110 else 0)
    rgb = small.convert('RGB').quantize(colors=COLORS, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    px = Image.new('RGBA', small.size, (0, 0, 0, 0)); px.paste(rgb, (0, 0), alpha)
    big = px.resize((gw * 4, GRID_H * 4), Image.NEAREST)
    big.save(OUT / ('s_' + name + '.png'), optimize=True)
    return big.size

if __name__ == '__main__':
    for n in NAMES: print(n, sprite(n))
