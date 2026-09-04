import os
from PIL import Image
from rembg import remove, new_session

input_path = "C:/MAZEEDA/MAZEEDA CODING/New folder/static/images/zakat_bg.png"
input_image = Image.open(input_path)

print("Running rembg with isnet-general-use model...")
session = new_session("isnet-general-use")
output_image = remove(input_image, session=session)
output_image.save(input_path, "PNG")
print("Done!")
