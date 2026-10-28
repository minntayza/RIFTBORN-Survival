import cv2
import numpy as np
from PIL import Image
import os

out_dir = "public/assets/characters"
os.makedirs(out_dir, exist_ok=True)

def clean_white(img_bgr, tol=25):
    h, w = img_bgr.shape[:2]
    mask = np.zeros((h+2, w+2), np.uint8)
    for pt in [(0,0), (w-1,0), (0,h-1), (w-1,h-1), (w//2,0), (w//2,h-1), (0,h//2), (w-1,h//2)]:
        cv2.floodFill(img_bgr.copy(), mask, pt, (0,0,0), (tol,tol,tol), (tol,tol,tol), cv2.FLOODFILL_FIXED_RANGE)
    bg = (mask[1:h+1, 1:w+1] == 1)
    
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    is_white = (gray > 225).astype(np.uint8)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(is_white)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] > 200:
            bg = bg | (labels == i)
            
    dist_fg = cv2.distanceTransform((~bg).astype(np.uint8), cv2.DIST_L2, 3)
    alpha = np.clip(dist_fg / 1.5, 0, 1.0)
    alpha[bg] = 0.0
    
    bgr_f = img_bgr.astype(np.float32)
    edge = (alpha > 0.05) & (alpha < 0.95)
    for c in range(3):
        bgr_f[edge, c] = np.clip((bgr_f[edge, c] - (1.0 - alpha[edge]) * 255.0) / np.maximum(alpha[edge], 0.1), 0, 255)
        
    rgb = cv2.cvtColor(bgr_f.astype(np.uint8), cv2.COLOR_BGR2RGB)
    rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
    
    y_idx, x_idx = np.where(rgba[:, :, 3] > 10)
    if len(y_idx) > 0:
        return Image.fromarray(rgba[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
    return Image.fromarray(rgba)

def clean_black(img_bgr, tol=20):
    h, w = img_bgr.shape[:2]
    mask = np.zeros((h+2, w+2), np.uint8)
    for pt in [(0,0), (w-1,0), (0,h-1), (w-1,h-1), (w//2,0), (w//2,h-1), (0,h//2), (w-1,h//2)]:
        cv2.floodFill(img_bgr.copy(), mask, pt, (255,255,255), (tol,tol,tol), (tol,tol,tol), cv2.FLOODFILL_FIXED_RANGE)
    bg = (mask[1:h+1, 1:w+1] == 1)
    
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    is_black = (gray < 22).astype(np.uint8)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(is_black)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] > 150:
            bg = bg | (labels == i)
            
    dist_fg = cv2.distanceTransform((~bg).astype(np.uint8), cv2.DIST_L2, 3)
    alpha = np.clip(dist_fg / 1.5, 0, 1.0)
    alpha[bg] = 0.0
    
    bgr_f = img_bgr.astype(np.float32)
    edge = (alpha > 0.05) & (alpha < 0.95)
    for c in range(3):
        bgr_f[edge, c] = np.clip(bgr_f[edge, c] / np.maximum(alpha[edge], 0.1), 0, 255)
        
    rgb = cv2.cvtColor(bgr_f.astype(np.uint8), cv2.COLOR_BGR2RGB)
    rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
    
    y_idx, x_idx = np.where(rgba[:, :, 3] > 10)
    if len(y_idx) > 0:
        return Image.fromarray(rgba[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
    return Image.fromarray(rgba)

# =========================================================================
# 1. KYANSITTHA PORTRAIT (9.1.jpg)
# =========================================================================
print("Processing Kyansittha portrait 9.1...")
im91 = cv2.imread("9.1.jpg")
kyan_portrait = clean_white(im91, tol=25)
kyan_portrait.save(f"{out_dir}/kyansittha-portrait-v2.png", "PNG")
kyan_portrait.save(f"{out_dir}/kyansittha-portrait-v2.webp", "WEBP")
print("Kyansittha portrait saved:", kyan_portrait.size)

# =========================================================================
# 2. PYUSAWHTI PORTRAIT (9.3.jpg)
# =========================================================================
print("Processing Pyusawhti portrait 9.3...")
im93 = cv2.imread("9.3.jpg")
pyu_portrait = clean_black(im93, tol=20)
pyu_portrait.save(f"{out_dir}/pyusawhti-portrait-v2.png", "PNG")
pyu_portrait.save(f"{out_dir}/pyusawhti-portrait-v2.webp", "WEBP")
print("Pyusawhti portrait saved:", pyu_portrait.size)

# =========================================================================
# 3. KYANSITTHA COMBAT RIG (9.2.jpg)
# =========================================================================
print("Processing Kyansittha parts 9.2...")
im92 = cv2.imread("9.2.jpg")

# Crops:
head_im = clean_white(im92[12:12+373, 11:11+404], tol=25)
torso_im = clean_white(im92[142:142+356, 407:407+320], tol=25)
cape_im = clean_white(im92[414:414+330, 22:22+353], tol=25)
skirt_im = clean_white(im92[497:497+310, 376:376+305], tol=25)

# Assemble clean armless body:
canvas = Image.new('RGBA', (500, 650), (0,0,0,0))
cx = 250
canvas.alpha_composite(cape_im, (cx - cape_im.width//2, 170))
canvas.alpha_composite(skirt_im, (cx - skirt_im.width//2, 310))
canvas.alpha_composite(torso_im, (cx - torso_im.width//2, 150))
canvas.alpha_composite(head_im, (cx - head_im.width//2, 0))

arr = np.array(canvas)
y_idx, x_idx = np.where(arr[:, :, 3] > 10)
kyan_body = Image.fromarray(arr[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
kyan_body.save(f"{out_dir}/kyansittha-body-v2.png", "PNG")
kyan_body.save(f"{out_dir}/kyansittha-body-v2.webp", "WEBP")
print("Kyansittha body saved:", kyan_body.size)

# Limbs & spear:
spear_im = clean_white(im92[9:9+809, 1077:1077+180], tol=25)
spear_im.save(f"{out_dir}/kyansittha-spear-v2.png", "PNG")
spear_im.save(f"{out_dir}/kyansittha-spear-v2.webp", "WEBP")

arm_l_im = clean_white(im92[149:149+308, 758:758+143], tol=25)
arm_l_im.save(f"{out_dir}/kyansittha-arm-left-v2.png", "PNG")
arm_l_im.save(f"{out_dir}/kyansittha-arm-left-v2.webp", "WEBP")

arm_r_im = clean_white(im92[143:143+320, 958:958+141], tol=25)
arm_r_im.save(f"{out_dir}/kyansittha-arm-right-v2.png", "PNG")
arm_r_im.save(f"{out_dir}/kyansittha-arm-right-v2.webp", "WEBP")

leg_l_im = clean_white(im92[519:519+287, 704:704+141], tol=25)
leg_l_im.save(f"{out_dir}/kyansittha-leg-left-v2.png", "PNG")
leg_l_im.save(f"{out_dir}/kyansittha-leg-left-v2.webp", "WEBP")

leg_r_im = clean_white(im92[517:517+289, 902:902+143], tol=25)
leg_r_im.save(f"{out_dir}/kyansittha-leg-right-v2.png", "PNG")
leg_r_im.save(f"{out_dir}/kyansittha-leg-right-v2.webp", "WEBP")
print("Kyansittha limbs and spear saved!")

# =========================================================================
# 4. PYUSAWHTI COMBAT RIG (9.4.jpg)
# =========================================================================
print("Processing Pyusawhti parts 9.4...")
im94 = cv2.imread("9.4.jpg")

# 4a. Clean armless & legless body
pyu_body_zone = im94[40:620, 80:420].copy()
# Inpaint bandage areas across chest (y: 320..500, x: 60..280)
gray = cv2.cvtColor(pyu_body_zone, cv2.COLOR_BGR2GRAY)
bandage_mask = np.zeros_like(gray)
sub = (pyu_body_zone[320:500, 60:280, 0] > 130) & (pyu_body_zone[320:500, 60:280, 1] > 150) & (pyu_body_zone[320:500, 60:280, 2] > 180)
bandage_mask[320:500, 60:280] = sub.astype(np.uint8) * 255
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
bandage_mask = cv2.dilate(bandage_mask, kernel)
inpainted_zone = cv2.inpaint(pyu_body_zone, bandage_mask, 5, cv2.INPAINT_TELEA)

h, w = inpainted_zone.shape[:2]
gray_inp = cv2.cvtColor(inpainted_zone, cv2.COLOR_BGR2GRAY)
mask_pyu = (gray_inp < 25)
mask_pyu[330:490, :65] = True
mask_pyu[330:490, 275:] = True
mask_pyu[540:, :] = True

dist_fg = cv2.distanceTransform((~mask_pyu).astype(np.uint8), cv2.DIST_L2, 3)
alpha = np.clip(dist_fg / 1.5, 0, 1.0)
alpha[mask_pyu] = 0.0

bgr_f = inpainted_zone.astype(np.float32)
edge = (alpha > 0.05) & (alpha < 0.95)
for c in range(3):
    bgr_f[edge, c] = np.clip(bgr_f[edge, c] / np.maximum(alpha[edge], 0.1), 0, 255)

rgb = cv2.cvtColor(bgr_f.astype(np.uint8), cv2.COLOR_BGR2RGB)
rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
y_idx, x_idx = np.where(rgba[:, :, 3] > 10)
pyu_body = Image.fromarray(rgba[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
pyu_body.save(f"{out_dir}/pyusawhti-body-v2.png", "PNG")
pyu_body.save(f"{out_dir}/pyusawhti-body-v2.webp", "WEBP")
print("Pyusawhti body saved:", pyu_body.size)

# 4b. Bow
pyu_bow = clean_black(im94[130:130+562, 996:996+166], tol=20)
pyu_bow.save(f"{out_dir}/pyusawhti-bow-v2.png", "PNG")
pyu_bow.save(f"{out_dir}/pyusawhti-bow-v2.webp", "WEBP")

# 4c. Arm L
u1 = clean_black(im94[159:159+149, 507:507+144], tol=20)
f1 = clean_black(im94[281:281+129, 534:534+121], tol=20)
arm_l_canvas = Image.new('RGBA', (200, 260), (0,0,0,0))
arm_l_canvas.alpha_composite(u1, (30, 0))
arm_l_canvas.alpha_composite(f1, (35, u1.height - 25))
arr = np.array(arm_l_canvas)
y_idx, x_idx = np.where(arr[:, :, 3] > 10)
pyu_arm_l = Image.fromarray(arr[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
pyu_arm_l.save(f"{out_dir}/pyusawhti-arm-left-v2.png", "PNG")
pyu_arm_l.save(f"{out_dir}/pyusawhti-arm-left-v2.webp", "WEBP")

# 4d. Arm R
u2 = clean_black(im94[159:159+149, 800:800+144], tol=20)
f2 = clean_black(im94[281:281+129, 796:796+121], tol=20)
arm_r_canvas = Image.new('RGBA', (200, 260), (0,0,0,0))
arm_r_canvas.alpha_composite(u2, (30, 0))
arm_r_canvas.alpha_composite(f2, (25, u2.height - 25))
arr = np.array(arm_r_canvas)
y_idx, x_idx = np.where(arr[:, :, 3] > 10)
pyu_arm_r = Image.fromarray(arr[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
pyu_arm_r.save(f"{out_dir}/pyusawhti-arm-right-v2.png", "PNG")
pyu_arm_r.save(f"{out_dir}/pyusawhti-arm-right-v2.webp", "WEBP")

# 4e. Leg L
t1 = clean_black(im94[451:451+176, 494:494+164], tol=20)
l1 = clean_black(im94[615:615+115, 475:475+99], tol=20)
leg_l_canvas = Image.new('RGBA', (200, 280), (0,0,0,0))
leg_l_canvas.alpha_composite(t1, (20, 0))
leg_l_canvas.alpha_composite(l1, (45, t1.height - 20))
arr = np.array(leg_l_canvas)
y_idx, x_idx = np.where(arr[:, :, 3] > 10)
pyu_leg_l = Image.fromarray(arr[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
pyu_leg_l.save(f"{out_dir}/pyusawhti-leg-left-v2.png", "PNG")
pyu_leg_l.save(f"{out_dir}/pyusawhti-leg-left-v2.webp", "WEBP")

# 4f. Leg R
t2 = clean_black(im94[451:451+169, 792:792+160], tol=20)
l2 = clean_black(im94[615:615+120, 877:877+94], tol=20)
leg_r_canvas = Image.new('RGBA', (200, 280), (0,0,0,0))
leg_r_canvas.alpha_composite(t2, (20, 0))
leg_r_canvas.alpha_composite(l2, (35, t2.height - 20))
arr = np.array(leg_r_canvas)
y_idx, x_idx = np.where(arr[:, :, 3] > 10)
pyu_leg_r = Image.fromarray(arr[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
pyu_leg_r.save(f"{out_dir}/pyusawhti-leg-right-v2.png", "PNG")
pyu_leg_r.save(f"{out_dir}/pyusawhti-leg-right-v2.webp", "WEBP")

print("All Pyusawhti limbs and bow saved successfully!")
