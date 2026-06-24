#!/bin/bash
python3 << 'PYEOF'
files = ["index.html","journal.html","uploader.html","coach.html","content.html","lab.html","goals.html"]

for f in files:
    with open(f, "r") as file:
        content = file.read()

    if "sw-cleanup.js" in content:
        print(f"{f} sudah ada cleanup script, skip")
        continue

    pattern = "</body>"
    insert = '<script src="sw-cleanup.js"></script>\n</body>'
    if pattern in content:
        new_content = content.replace(pattern, insert, 1)
        with open(f, "w") as file:
            file.write(new_content)
        print(f"Cleanup script ditambahkan ke {f}")
    else:
        print(f"PERINGATAN: tidak ketemu </body> di {f}")
PYEOF
