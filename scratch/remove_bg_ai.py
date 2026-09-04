import os
from PIL import Image
from rembg import remove

def process_image(input_path):
    print(f"Processing {os.path.basename(input_path)} with AI...")
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(input_path, "PNG")
        print(f"Success: {os.path.basename(input_path)}")
    except Exception as e:
        print(f"Failed {os.path.basename(input_path)}: {e}")

images = [
    "kiblat_bg.png",
    "zakat_bg.png",
    "faraidh_bg.png",
    "kalender_bg.png",
    "tasbih_icon.png",
    "cashflow_icon.png",
    "kas_angkatan_icon.jpg",
    "quiz_icon.png",
    "kepengurusan_bg.png",
    "journey_compass.png",
    "logo_emabror.png",
    "logo_alimaf.png",
    "logo_rayhar.png",
    "logo_wepose.png"
]

base_dir = "C:/MAZEEDA/MAZEEDA CODING/New folder/static/images"

for name in images:
    path = os.path.join(base_dir, name)
    if os.path.exists(path):
        process_image(path)
    else:
        print(f"File not found: {name}")

print("Done processing all images with AI!")
