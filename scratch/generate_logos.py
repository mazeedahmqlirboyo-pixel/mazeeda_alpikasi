import os
from PIL import Image, ImageDraw

output_dir = r"C:\MAZEEDA\MAZEEDA CODING\New folder\static\images"
os.makedirs(output_dir, exist_ok=True)

size = (400, 400)
line_color = (0, 0, 0, 255) # Solid black
line_width = 30

# 1. logo_emabror.png (Overlapping Triangles)
img1 = Image.new('RGBA', size, (255, 255, 255, 0))
draw1 = ImageDraw.Draw(img1)
draw1.polygon([(200, 50), (100, 300), (300, 300)], outline=line_color, width=line_width)
draw1.polygon([(200, 350), (100, 100), (300, 100)], outline=line_color, width=line_width)
img1.save(os.path.join(output_dir, "logo_emabror.png"))

# 2. logo_alimaf.png (Concentric/Overlapping Circles)
img2 = Image.new('RGBA', size, (255, 255, 255, 0))
draw2 = ImageDraw.Draw(img2)
draw2.ellipse([(50, 100), (250, 300)], outline=line_color, width=line_width)
draw2.ellipse([(150, 100), (350, 300)], outline=line_color, width=line_width)
img2.save(os.path.join(output_dir, "logo_alimaf.png"))

# 3. logo_rayhar.png (Diamond and Square)
img3 = Image.new('RGBA', size, (255, 255, 255, 0))
draw3 = ImageDraw.Draw(img3)
draw3.polygon([(200, 50), (350, 200), (200, 350), (50, 200)], outline=line_color, width=line_width)
draw3.rectangle([(120, 120), (280, 280)], outline=line_color, width=line_width)
img3.save(os.path.join(output_dir, "logo_rayhar.png"))

# 4. logo_wepose.png (Hexagon with cross lines)
img4 = Image.new('RGBA', size, (255, 255, 255, 0))
draw4 = ImageDraw.Draw(img4)
pts = [(200, 50), (330, 125), (330, 275), (200, 350), (70, 275), (70, 125)]
draw4.polygon(pts, outline=line_color, width=line_width)
draw4.line([(200, 50), (200, 350)], fill=line_color, width=line_width)
draw4.line([(70, 125), (330, 275)], fill=line_color, width=line_width)
draw4.line([(70, 275), (330, 125)], fill=line_color, width=line_width)
img4.save(os.path.join(output_dir, "logo_wepose.png"))

print("Generated 4 random geometric logos as transparent PNGs!")
