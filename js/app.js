// js/app.js — logika halaman Dashboard

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function renderStatGrid() {
  const latest = DB.getLatestStats();
  const grid = document.getElementById('statGrid');

  if (!latest) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">
      Belum ada data. <a href="journal.html">Isi Journal hari ini</a> buat mulai tracking.
    </div>`;
    return;
  }

  const growth = DB.getGrowthPercent();
  const stats = [
    { label: 'Followers', value: latest.followers },
    { label: 'Impressions', value: latest.impressions },
    { label: 'Likes', value: latest.likes },
    { label: 'Reposts', value: latest.reposts },
    { label: 'Replies', value: latest.replies },
    { label: 'Growth %', value: growth + '%', isGrowth: true },
  ];

  grid.innerHTML = stats.map(s => `
    <div class="stat-card">
      <div class="label">${s.label}</div>
      <div class="value">${s.isGrowth ? s.value : formatNumber(s.value)}</div>
    </div>
  `).join('');
}

function renderInsightCards() {
  const journal = DB.getJournal();
  const container = document.getElementById('insightCards');

  if (journal.length === 0) {
    container.innerHTML = '';
    return;
  }

  // Best performing day (by impressions)
  const bestDay = journal.reduce((a, b) => (b.impressions > a.impressions ? b : a));

  // Fastest growth day (selisih follower terbesar antar hari)
  let fastestGrowth = { date: '-', diff: 0 };
  for (let i = 1; i < journal.length; i++) {
    const diff = journal[i].followers - journal[i - 1].followers;
    if (diff > fastestGrowth.diff) fastestGrowth = { date: journal[i].date, diff };
  }

  // Best performing topic (rata-rata impressions per topik)
  const topicStats = {};
  journal.forEach(entry => {
    (entry.topics || []).forEach(topic => {
      if (!topicStats[topic]) topicStats[topic] = { total: 0, count: 0 };
      topicStats[topic].total += entry.impressions;
      topicStats[topic].count += 1;
    });
  });
  let bestTopic = '-';
  let bestAvg = 0;
  Object.entries(topicStats).forEach(([topic, s]) => {
    const avg = s.total / s.count;
    if (avg > bestAvg) { bestAvg = avg; bestTopic = topic; }
  });

  // Average daily impressions
  const avgImpressions = Math.round(
    journal.reduce((sum, e) => sum + e.impressions, 0) / journal.length
  );

  const cards = [
    { label: 'Best Performing Day', value: bestDay.date },
    { label: 'Best Performing Topic', value: bestTopic },
    { label: 'Fastest Growth Day', value: fastestGrowth.date !== '-' ? `${fastestGrowth.date} (+${fastestGrowth.diff})` : '-' },
    { label: 'Average Daily Impressions', value: formatNumber(avgImpressions) },
  ];

  container.innerHTML = cards.map(c => `
    <div class="insight-card">
      <span class="label">${c.label}</span>
      <span class="value">${c.value}</span>
    </div>
  `).join('');
}

function renderCharts() {
  const journal = DB.getJournal();
  if (journal.length === 0) return;

  const labels = journal.map(e => e.date);
  const chartDefaults = {
    type: 'line',
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#7B8794', font: { size: 10 } }, grid: { color: '#232B3A' } },
        y: { ticks: { color: '#7B8794', font: { size: 10 } }, grid: { color: '#232B3A' } },
      },
      elements: { point: { radius: 2 } },
    },
  };

  new Chart(document.getElementById('chartFollowers'), {
    ...chartDefaults,
    data: {
      labels,
      datasets: [{
        data: journal.map(e => e.followers),
        borderColor: '#3B9EFF',
        backgroundColor: 'rgba(59,158,255,0.1)',
        fill: true,
        tension: 0.3,
      }],
    },
  });

  new Chart(document.getElementById('chartImpressions'), {
    ...chartDefaults,
    data: {
      labels,
      datasets: [{
        data: journal.map(e => e.impressions),
        borderColor: '#F5A623',
        backgroundColor: 'rgba(245,166,35,0.1)',
        fill: true,
        tension: 0.3,
      }],
    },
  });

  new Chart(document.getElementById('chartEngagement'), {
    ...chartDefaults,
    data: {
      labels,
      datasets: [{
        data: journal.map(e => e.likes + e.reposts + e.replies),
        borderColor: '#4ADE80',
        backgroundColor: 'rgba(74,222,128,0.1)',
        fill: true,
        tension: 0.3,
      }],
    },
  });
}

// ---- jalankan semua ----
renderStatGrid();
renderInsightCards();
renderCharts();
renderBottomNav('dashboard');
