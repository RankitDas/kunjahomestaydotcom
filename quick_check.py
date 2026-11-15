import os
from PIL import Image

src_dir = r"D:\kunjahomestaydotcom\assets\images"
files = sorted([f for f in os.listdir(src_dir) if f.endswith('.jpeg')])

info = []
for f in files:
    p = os.path.join(src_dir, f)
    with Image.open(p) as img:
        w, h = img.size
        info.append((f, w, h, round(w/h, 2)))

print(f"Total: {len(info)}")
# photo_57 is (631, 661) - almost 1:1, typical map crop
print("photo_57:", [x for x in info if x[0] == 'photo_57.jpeg'])
