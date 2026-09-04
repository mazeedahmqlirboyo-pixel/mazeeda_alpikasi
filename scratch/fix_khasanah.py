import os
import shutil
from PIL import Image
from rembg import remove, new_session

base_dir = r"C:\MAZEEDA\MAZEEDA CODING\New folder\static\images"
session = new_session("isnet-general-use")

# 1. Restore the correct dark mode versions for journey_compass and kepengurusan
print("Restoring journey_compass and kepengurusan dark versions...")
compass_in = os.path.join(base_dir, "journey_compass.png")
compass_out = os.path.join(base_dir, "journey_compass_dark.png")
if os.path.exists(compass_in):
    out = remove(Image.open(compass_in), session=session)
    out.save(compass_out, "PNG")

kepeng_in = os.path.join(base_dir, "kepengurusan_bg.png")
kepeng_out = os.path.join(base_dir, "kepengurusan_bg_dark.png")
if os.path.exists(kepeng_in):
    out = remove(Image.open(kepeng_in), session=session)
    out.save(kepeng_out, "PNG")

# 2. Setup the Khasanah images
print("Setting up Khasanah images...")
mosque_jpg = r"C:\Users\LENOVO\.gemini\antigravity\brain\38ff9938-4fd9-4743-87dc-25f2b15ae5c6\mosque_new_1785701640820.jpg"
khasanah_light = os.path.join(base_dir, "khasanah_bg.png")
khasanah_dark = os.path.join(base_dir, "khasanah_bg_dark.png")

if os.path.exists(mosque_jpg):
    # Save the light version (just copy the jpg as png or convert it)
    Image.open(mosque_jpg).save(khasanah_light, "PNG")
    # Generate the dark version
    out_khasanah = remove(Image.open(mosque_jpg), session=session)
    out_khasanah.save(khasanah_dark, "PNG")

print("Done restoring and setting up Khasanah images!")
