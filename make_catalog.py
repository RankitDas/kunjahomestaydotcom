import os

src_dir = r"D:\kunjahomestaydotcom\assets\images"
html = ["""<!DOCTYPE html>
<html>
<head><title>Kunja Photo Catalog</title>
<style>
body { font-family: sans-serif; background: #fafafa; padding: 20px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.card { background: #fff; border: 1px solid #ddd; padding: 10px; border-radius: 6px; text-align: center; }
img { width: 100%; height: 180px; object-fit: cover; border-radius: 4px; }
.name { font-size: 13px; font-weight: bold; margin-top: 6px; }
</style>
</head>
<body>
<h1>Kunja Homestay - Photo Catalog</h1>
<div class="grid">
"""]

for f in sorted(os.listdir(src_dir)):
    if f.endswith('.jpeg'):
        html.append(f'<div class="card"><img src="assets/images/{f}"><div class="name">{f}</div></div>\n')

html.append("""</div></body></html>""")

with open(r"D:\kunjahomestaydotcom\catalog.html", "w", encoding="utf-8") as out:
    out.write("".join(html))

print("catalog.html generated")
