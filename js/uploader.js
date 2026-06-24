// js/uploader.js — OCR screenshot analytics X

document.getElementById('btnPick').addEventListener('click', () => {
  document.getElementById('inpFile').click();
});

document.getElementById('inpFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // tampilkan preview gambar
  const imgUrl = URL.createObjectURL(file);
  document.getElementById('imgPreview').src = imgUrl;
  document.getElementById('previewBox').style.display = 'block';

  const status = document.getElementById('ocrStatus');
  status.textContent = 'Membaca gambar... (bisa 10-30 detik)';

  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          status.textContent = `Membaca gambar... ${Math.round(m.progress * 100)}%`;
        }
      },
    });

    const text = result.data.text;
    document.getElementById('rawText').textContent = text || '(kosong)';
    status.textContent = 'Selesai membaca. Periksa hasil di bawah.';

    extractNumbers(text);
  } catch (err) {
    status.textContent = 'Gagal membaca gambar: ' + err.message;
  }
});

// Cari angka-angka di teks hasil OCR, urutan tebakan: followers, impressions, likes, reposts, replies
// User tetap bisa edit manual kalau salah tebak
function extractNumbers(text) {
  // bersihkan: ambil semua angka (boleh ada koma/titik ribuan, atau singkatan k/rb)
  const matches = text.match(/[\d.,]+\s?[kK]?/g) || [];

  const numbers = matches
    .map(m => {
      let clean = m.trim().toLowerCase();
      let multiplier = 1;
      if (clean.endsWith('k')) {
        multiplier = 1000;
        clean = clean.replace('k', '');
      }
      clean = clean.replace(/[.,]/g, '');
      const val = parseInt(clean, 10);
      return isNaN(val) ? null : val * multiplier;
    })
    .filter(n => n !== null && n > 0);

  // isi form pakai tebakan urutan angka yang ketemu (dari atas screenshot ke bawah)
  document.getElementById('extDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('extFollowers').value = numbers[0] || '';
  document.getElementById('extImpressions').value = numbers[1] || '';
  document.getElementById('extLikes').value = numbers[2] || '';
  document.getElementById('extReposts').value = numbers[3] || '';
  document.getElementById('extReplies').value = numbers[4] || '';

  document.getElementById('resultSection').style.display = 'block';
}

document.getElementById('btnConfirm').addEventListener('click', () => {
  const date = document.getElementById('extDate').value;
  if (!date) { alert('Tanggal wajib diisi'); return; }

  const entry = {
    date,
    followers: Number(document.getElementById('extFollowers').value) || 0,
    impressions: Number(document.getElementById('extImpressions').value) || 0,
    likes: Number(document.getElementById('extLikes').value) || 0,
    reposts: Number(document.getElementById('extReposts').value) || 0,
    replies: Number(document.getElementById('extReplies').value) || 0,
    topics: [],
    notes: '(disimpan dari screenshot upload)',
    observations: '',
  };

  DB.addJournalEntry(entry);
  alert('Tersimpan ke Journal untuk tanggal ' + date);
  document.getElementById('resultSection').style.display = 'none';
  document.getElementById('ocrStatus').textContent = 'Tersimpan!';
});

renderBottomNav('uploader');
