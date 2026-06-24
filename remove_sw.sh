#!/bin/bash
python3 << 'PYEOF'
files = ["index.html","journal.html","uploader.html","coach.html","content.html","lab.html","goals.html"]

sw_block = '''<script>
if ("serviceWorker" in navigator) { navigator.serviceWorker.register("sw.js"); }
</script>
'''

for f in files:
    with open(f, "r") as file:
        content = file.read()

    if sw_block in content:
        new_content = content.replace(sw_block, "")
        with open(f, "w") as file:
            file.write(new_content)
        print(f"Service worker dihapus dari {f}")
    else:
        print(f"PERINGATAN: blok service worker tidak ketemu persis di {f}, cek manual")
PYEOF
