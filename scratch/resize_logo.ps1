New-Item -ItemType Directory -Force -Path assets

Add-Type -AssemblyName System.Drawing

# Resize logo to 1024x1024 for icon-only and icon-foreground
$src = [System.Drawing.Image]::FromFile('static/logo.png')
$bmp = New-Object System.Drawing.Bitmap(1024, 1024)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, 0, 0, 1024, 1024)
$g.Dispose()
$src.Dispose()
$bmp.Save('assets/icon-only.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save('assets/icon-foreground.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# Create solid white background image
$bmpBg = New-Object System.Drawing.Bitmap(1024, 1024)
$gBg = [System.Drawing.Graphics]::FromImage($bmpBg)
$gBg.Clear([System.Drawing.Color]::White)
$gBg.Dispose()
$bmpBg.Save('assets/icon-background.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmpBg.Dispose()

Write-Output "Assets created successfully:"
Get-ChildItem assets
