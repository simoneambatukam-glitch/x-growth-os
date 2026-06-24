#!/bin/bash
# add_pwa.sh — otomatis nambahin manifest + service worker ke semua HTML

FILES="index.html journal.html uploader.html coach.html content.html lab.html goals.html"

for f in $FILES; do
  if [ -f "$f" ]; then
    # tambah manifest + theme-color setelah baris stylesheet (kalau belum ada)
    if ! grep -q "manifest.json" "$f"; then
      sed -i 's#<link rel="stylesheet" href="css/style.css">#<link rel="stylesheet" href="css/style.css">\n<link rel="manifest" href="manifest.json">\n<meta name="theme-color" content="#0A0E14">#' "$f"
      echo "Manifest ditambahkan ke $f"
    else
      echo "$f sudah ada manifest, skip"
    fi

    # tambah service worker registration sebelum </body> (kalau belum ada)
    if ! grep -q "serviceWorker" "$f"; then
      sed -i 's#</body>#<script>\nif ("serviceWorker" in navigator) { navigator.serviceWorker.register("sw.js"); }\n</script>\n</body>#' "$f"
      echo "Service worker ditambahkan ke $f"
    else
      echo "$f sudah ada service worker, skip"
    fi
  else
    echo "PERINGATAN: $f tidak ditemukan"
  fi
done

echo "Selesai!"
