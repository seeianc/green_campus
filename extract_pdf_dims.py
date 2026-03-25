import re
import os

os.chdir('/Users/iancollins/Downloads/Campus-Energy-Map/attached_assets')

pdfs = ['RLS_1774377678641.pdf', 'EDS_1774377678641.pdf', 'STG_1774377678635.pdf', 'LCS_1774377678641.pdf', 'CES_1774377678641.pdf']

for pdf in pdfs:
    try:
        with open(pdf, 'rb') as f:
            content = f.read(50000)
            matches = re.findall(br'/MediaBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\]', content)
            if matches:
                x0, y0, x1, y1 = [float(x.decode()) for x in matches[0]]
                w = x1 - x0
                h = y1 - y0
                px_w = int(w * 96 / 72)
                px_h = int(h * 96 / 72)
                print(f"{pdf.split('_')[0]}: {w:.0f} x {h:.0f} points → {px_w} x {px_h} px")
            else:
                matches = re.findall(br'/CropBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\]', content)
                if matches:
                    x0, y0, x1, y1 = [float(x.decode()) for x in matches[0]]
                    w = x1 - x0
                    h = y1 - y0
                    px_w = int(w * 96 / 72)
                    px_h = int(h * 96 / 72)
                    print(f"{pdf.split('_')[0]} (CropBox): {w:.0f} x {h:.0f} points → {px_w} x {px_h} px")
    except Exception as e:
        print(f"{pdf.split('_')[0]}: Error - {e}")
