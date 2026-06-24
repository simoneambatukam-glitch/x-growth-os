#!/bin/bash
python3 << 'PYEOF'
import re

files = ["index.html","journal.html","uploader.html","coach.html","content.html","lab.html","goals.html"]

insert = '<link rel="manifest" href="manifest.json">\n<meta name="theme-color" content="#0A0E14">'

for f in files:
    with open(f, "r") as file:
        content = file.read()

    if "manifest.json" in content:
        print(f"{f} sudah ada manifest, skip")
        continue

    pattern = '<link rel="stylesheet" href="css/style.css">'
    if pattern in content:
        new_content = content.replace(pattern, pattern + "\n" + insert, 1)
        with open(f, "w") as file:
            file.write(new_content)
        print(f"Manifest berhasil ditambahkan ke {f}")
    else:
        print(f"PERINGATAN: pattern tidak ketemu di {f}")
PYEOF
