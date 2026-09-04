import os
import shutil

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
    "journey_compass.png"
]

base_dir = "C:/MAZEEDA/MAZEEDA CODING/New folder/static/images"

for name in images:
    path = os.path.join(base_dir, name)
    if os.path.exists(path):
        name_no_ext, ext = os.path.splitext(name)
        # Some are named _bg, some are _icon. Let's just append _dark to whatever it is.
        dark_name = name_no_ext + "_dark" + ".png" # always save as png for dark mode transparent
        dark_path = os.path.join(base_dir, dark_name)
        
        # Copy current transparent image to _dark.png
        shutil.copy(path, dark_path)
        print(f"Copied {name} to {dark_name}")

print("Done copying transparent images for dark mode.")
