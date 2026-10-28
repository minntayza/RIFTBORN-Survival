import cv2
import numpy as np
from PIL import Image
import os

out_dir = "public/assets/characters"
os.makedirs(out_dir, exist_ok=True)

# -----------------------------------------------------------------
# 1. KYANSITTHA (From pristine 9.1 portrait)
# -----------------------------------------------------------------
im91 = Image.open(f"{out_dir}/kyansittha-portrait-v2.png")
w91, h91 = im91.size
arr91 = np.array(im91)

# Body: Upper body containing head, crown, cape, torso, arms holding Arindama spear (y: 0..815)
body_kyan = arr91[:815, :].copy()
y_idx, x_idx = np.where(body_kyan[:, :, 3] > 10)
body_kyan_crop = Image.fromarray(body_kyan[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
body_kyan_crop.save(f"{out_dir}/kyansittha-body-v2.png", "PNG")
body_kyan_crop.save(f"{out_dir}/kyansittha-body-v2.webp", "WEBP")
print("Kyansittha clean body saved:", body_kyan_crop.size)

# Left Leg: Front leg with golden shin guard and boot (y: 745..1169, x: 190..470)
leg_l_kyan = arr91[745:, 190:470].copy()
y_idx, x_idx = np.where(leg_l_kyan[:, :, 3] > 10)
leg_l_kyan_crop = Image.fromarray(leg_l_kyan[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
leg_l_kyan_crop.save(f"{out_dir}/kyansittha-leg-left-v2.png", "PNG")
leg_l_kyan_crop.save(f"{out_dir}/kyansittha-leg-left-v2.webp", "WEBP")
print("Kyansittha clean left leg saved:", leg_l_kyan_crop.size)

# Right Leg: Back leg with golden shin guard and boot (y: 745..1169, x: 470..730)
leg_r_kyan = arr91[745:, 470:730].copy()
y_idx, x_idx = np.where(leg_r_kyan[:, :, 3] > 10)
leg_r_kyan_crop = Image.fromarray(leg_r_kyan[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
leg_r_kyan_crop.save(f"{out_dir}/kyansittha-leg-right-v2.png", "PNG")
leg_r_kyan_crop.save(f"{out_dir}/kyansittha-leg-right-v2.webp", "WEBP")
print("Kyansittha clean right leg saved:", leg_r_kyan_crop.size)


# -----------------------------------------------------------------
# 2. PYUSAWHTI (From pristine 9.3 portrait)
# -----------------------------------------------------------------
im93 = Image.open(f"{out_dir}/pyusawhti-portrait-v2.png")
w93, h93 = im93.size
arr93 = np.array(im93)

# Body: Upper body containing head, golden circlet, quiver, torso, sash, arms holding bow (y: 0..775)
body_pyu = arr93[:775, :].copy()
y_idx, x_idx = np.where(body_pyu[:, :, 3] > 10)
body_pyu_crop = Image.fromarray(body_pyu[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
body_pyu_crop.save(f"{out_dir}/pyusawhti-body-v2.png", "PNG")
body_pyu_crop.save(f"{out_dir}/pyusawhti-body-v2.webp", "WEBP")
print("Pyusawhti clean body saved:", body_pyu_crop.size)

# Left Leg: Front leg with royal longyi and foot (y: 715..1184, x: 235..510)
leg_l_pyu = arr93[715:, 235:510].copy()
y_idx, x_idx = np.where(leg_l_pyu[:, :, 3] > 10)
leg_l_pyu_crop = Image.fromarray(leg_l_pyu[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
leg_l_pyu_crop.save(f"{out_dir}/pyusawhti-leg-left-v2.png", "PNG")
leg_l_pyu_crop.save(f"{out_dir}/pyusawhti-leg-left-v2.webp", "WEBP")
print("Pyusawhti clean left leg saved:", leg_l_pyu_crop.size)

# Right Leg: Back leg with royal longyi and foot (y: 715..1184, x: 510..765)
leg_r_pyu = arr93[715:, 510:765].copy()
y_idx, x_idx = np.where(leg_r_pyu[:, :, 3] > 10)
leg_r_pyu_crop = Image.fromarray(leg_r_pyu[y_idx.min():y_idx.max()+1, x_idx.min():x_idx.max()+1])
leg_r_pyu_crop.save(f"{out_dir}/pyusawhti-leg-right-v2.png", "PNG")
leg_r_pyu_crop.save(f"{out_dir}/pyusawhti-leg-right-v2.webp", "WEBP")
print("Pyusawhti clean right leg saved:", leg_r_pyu_crop.size)

print("Export completed successfully!")
