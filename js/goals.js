// js/goals.js — Goals tracking dengan progress bar otomatis

function getCurrentValue(type) {
  const latest = DB.getLatestStats();
  if (!latest) return 0;
  if (type === 'followers') return latest.followers;
  if (type === 'impressions') return latest.impressions;
  return 0; // custom = manual, gak dihitung otomatis
}

function setupForm() {
  document.getElementById('btnAddGoal').addEventListener('click', () => {
    const name = document.getElementById('inpGoalName').value.trim();
    const type = document.getElementById('inpGoalType').value;
    const target = Number(document.getElementById('inpGoalTarget').value);

    if (!name) { alert('Nama goal wajib diisi'); return; }
    if (!target || target <= 0) { alert('Target harus angka lebih dari 0'); return; }

    DB.addGoal({
      name,
      type,
      target,
      currentManual: 0, // dipakai kalau type = custom
    });

    renderGoals();

    document.getElementById('inpGoalName').value = '';
    document.getElementById('inpGoalTarget').value = '';
  });
}

function renderGoals() {
  const goals = DB.getGoals();
  const container = document.getElementById('goalList');

  if (goals.length === 0) {
    container.innerHTML = `<div class="empty-state">Belum ada goal. Tambahin target lu di atas — misal "Reach 1,000 followers".</div>`;
    return;
  }

  container.innerHTML = goals.map(g => {
    const current = g.type === 'custom' ? (g.currentManual || 0) : getCurrentValue(g.type);
    const percent = Math.min(100, Math.round((current / g.target) * 100));
    const isDone = percent >= 100;

    return `
      <div class="goal-card ${isDone ? 'completed' : ''}">
        <div class="goal-head">
          <span class="goal-name">${g.name}</span>
          <button class="goal-delete" data-id="${g.id}">Hapus</button>
        </div>
        <div class="goal-progress-text">
          <span>${current} / ${g.target}</span>
          <span>${percent}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${percent}%"></div>
        </div>
        ${g.type === 'custom' ? `
          <div style="margin-top:10px; display:flex; gap:8px;">
            <input type="number" class="manual-input" data-id="${g.id}" placeholder="Update progress manual" style="flex:1; background:var(--elevated); border:1px solid var(--border); border-radius:8px; padding:8px; color:var(--text); font-size:13px;">
            <button class="btn-primary manual-update" data-id="${g.id}" style="width:auto; padding:8px 14px; font-size:12px;">Update</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  // hapus goal
  container.querySelectorAll('.goal-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Hapus goal ini?')) {
        DB.deleteGoal(btn.dataset.id);
        renderGoals();
      }
    });
  });

  // update manual progress (buat goal tipe custom, misal "monetisasi")
  container.querySelectorAll('.manual-update').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const input = container.querySelector(`.manual-input[data-id="${id}"]`);
      const value = Number(input.value);
      if (!value) return;
      DB.updateGoal(id, { currentManual: value });
      renderGoals();
    });
  });
}

setupForm();
renderGoals();
renderBottomNav('goals');
