// js/journal.js — logika halaman Daily Journal

function renderEntryList() {
  const journal = DB.getJournal().slice().reverse(); // terbaru di atas
  const container = document.getElementById('entryList');

  if (journal.length === 0) {
    container.innerHTML = `<div class="empty-state">Belum ada entri. Isi form di atas buat mulai.</div>`;
    return;
  }

  container.innerHTML = journal.map(e => `
    <div class="entry-item">
      <div class="entry-head">
        <span class="entry-date">${e.date}</span>
        <button class="entry-delete" data-date="${e.date}">Hapus</button>
      </div>
      <div class="entry-stats">
        <span>👤 ${e.followers}</span>
        <span>👁️ ${e.impressions}</span>
        <span>❤️ ${e.likes}</span>
        <span>🔁 ${e.reposts}</span>
        <span>💬 ${e.replies}</span>
      </div>
      ${e.topics && e.topics.length ? `
        <div class="entry-topics">
          ${e.topics.map(t => `<span class="topic-tag">${t}</span>`).join('')}
        </div>` : ''}
      ${e.notes ? `<div class="entry-notes"><strong>Catatan:</strong> ${e.notes}</div>` : ''}
      ${e.observations ? `<div class="entry-notes"><strong>Observasi:</strong> ${e.observations}</div>` : ''}
    </div>
  `).join('');

  // pasang event listener tombol hapus
  container.querySelectorAll('.entry-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Hapus entri tanggal ' + btn.dataset.date + '?')) {
        DB.deleteJournalEntry(btn.dataset.date);
        renderEntryList();
      }
    });
  });
}

function setupForm() {
  // default tanggal = hari ini
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('inpDate').value = today;

  document.getElementById('btnSave').addEventListener('click', () => {
    const date = document.getElementById('inpDate').value;
    if (!date) { alert('Tanggal wajib diisi'); return; }

    const topicsRaw = document.getElementById('inpTopics').value;
    const topics = topicsRaw.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const entry = {
      date,
      followers: Number(document.getElementById('inpFollowers').value) || 0,
      impressions: Number(document.getElementById('inpImpressions').value) || 0,
      likes: Number(document.getElementById('inpLikes').value) || 0,
      reposts: Number(document.getElementById('inpReposts').value) || 0,
      replies: Number(document.getElementById('inpReplies').value) || 0,
      topics,
      notes: document.getElementById('inpNotes').value,
      observations: document.getElementById('inpObservations').value,
    };

    DB.addJournalEntry(entry);
    renderEntryList();

    // reset form (kecuali tanggal, biar gampang lanjut isi besok)
    ['inpFollowers','inpImpressions','inpLikes','inpReposts','inpReplies','inpTopics','inpNotes','inpObservations']
      .forEach(id => document.getElementById(id).value = '');

    alert('Entri tersimpan!');
  });
}

// ---- jalankan ----
setupForm();
renderEntryList();
renderBottomNav('journal');
