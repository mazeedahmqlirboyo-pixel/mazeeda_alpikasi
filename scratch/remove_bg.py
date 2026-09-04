import os
from PIL import Image

def remove_white_bg(input_path, output_path, threshold=220):
    print(f"Processing {os.path.basename(input_path)}...")
    
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        r, g, b, a = item
        
        # Calculate how close the pixel is to white (255, 255, 255)
        # Average brightness
        avg = (r + g + b) / 3
        
        if avg > threshold and r > 200 and g > 200 and b > 200:
            # If it's near white, we calculate alpha to make it fade smoothly
            # Distance from threshold (e.g. 220) to 255 is 35.
            # If avg is 255, alpha is 0. If avg is 220, alpha is original.
            fade_range = 255 - threshold
            opacity_ratio = max(0, min(1.0, (255 - avg) / fade_range))
            
            new_alpha = int(a * opacity_ratio)
            
            # To avoid grey edges, we can push the color slightly towards the image's overall color or just keep it as is.
            # If we keep it white with low alpha, it acts like a glow. That's fine!
            new_data.append((r, g, b, new_alpha))
        else:
            # Keep original
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved {os.path.basename(output_path)}")

images = [
    "kiblat_bg.png",
    "zakat_bg.png",
    "faraidh_bg.png",
    "kalender_bg.png",
    "tasbih_icon.png",
    "cashflow_icon.png",
    "kas_angkatan_icon.jpg",
    "quiz_icon.png",
    "kepengurusan_bg.png"
]

base_dir = "C:/MAZEEDA/MAZEEDA CODING/New folder/static/images"

for name in images:
    path = os.path.join(base_dir, name)
    if os.path.exists(path):
        remove_white_bg(path, path) # Overwrite original with transparent PNG
    else:
        print(f"File not found: {name}")

print("Done making images transparent!")
