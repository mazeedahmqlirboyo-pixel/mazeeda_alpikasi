import os
from PIL import Image

def analyze_image(path):
    if not os.path.exists(path):
        return f"File not found: {path}"
    
    img = Image.open(path)
    mode = img.mode
    
    # Check 4 corners
    w, h = img.size
    corners = [
        (0, 0), (w-1, 0), (0, h-1), (w-1, h-1)
    ]
    
    corner_pixels = []
    for x, y in corners:
        corner_pixels.append(img.getpixel((x, y)))
        
    return f"Mode: {mode}, Size: {w}x{h}, Corners: {corner_pixels}"

paths = [
    "C:/MAZEEDA/MAZEEDA CODING/New folder/static/images/kiblat_bg.png",
    "C:/MAZEEDA/MAZEEDA CODING/New folder/static/images/sangu_bg.png"
]

for p in paths:
    print(f"{os.path.basename(p)}: {analyze_image(p)}")
