from decimal import Decimal
from io import BytesIO
import json
import re
import sys

TOTAL = re.compile(r"\b(?:grand\s+total|amount\s+due|total)\b.*?(\d[\d,]*\.\d{2})(?!\d)", re.I)


def extract(lines):
    for line in reversed(lines):
        if re.search(r"\bsub\s*total\b", line, re.I):
            continue
        match = TOTAL.search(line)
        if match:
            return {"merchant": lines[0][:200], "amount": float(Decimal(match[1].replace(",", "")))}
    return {"merchant": lines[0][:200] if lines else None, "amount": None}


def scan(data, models):
    from PIL import Image

    with Image.open(BytesIO(data), formats=["PNG", "JPEG"]) as image:
        if image.width * image.height > 4_000_000:
            raise ValueError("Unsupported image")
        image.load()
        import numpy as np
        pixels = np.asarray(image.convert("RGB"))

    import easyocr
    reader = easyocr.Reader(
        ["en"], gpu=False, model_storage_directory=models,
        download_enabled=False, verbose=False,
    )
    return extract(reader.readtext(pixels, detail=0))


if __name__ == "__main__":
    from PIL import Image

    try:
        print(json.dumps(scan(sys.stdin.buffer.read(2 * 1024 * 1024 + 1), sys.argv[1])))
    except (Image.UnidentifiedImageError, Image.DecompressionBombError, ValueError):
        sys.exit(2)
