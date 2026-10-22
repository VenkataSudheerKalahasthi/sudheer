import os
import glob
from PIL import Image

upload_dir = r"C:\Users\venka\.gemini\antigravity-ide\brain\e4835ba0-bcd1-4405-a1f0-2e19d9c20721\.user_uploaded"
files = glob.glob(os.path.join(upload_dir, "media_1792601*.png"))
files.sort(key=lambda x: os.path.getmtime(x))

for f in files:
    try:
        im = Image.open(f)
        print(f"{os.path.basename(f)}: size={im.size}, mtime={os.path.getmtime(f)}")
    except Exception as e:
        print(f"{os.path.basename(f)}: error {e}")
