// js/lab.js — Growth Lab: Content Pattern Analysis

function getCategoryData() {
  const tweets = DB.getContent();
  const journal = DB.getJournal();

  const stats = {};

  function addStat(topic, impressions, engagement) {
    if (!topic) return;
    if (!stats[topic]) stats[topic] = { impTotal: 0, engTotal: 0, count: 0 };
    stats[topic].impTotal += impressions;
    stats[topic].engTotal += engagement;
    stats[topic].count += 1;
  }

  // sumber utama: Content Database (per-tweet, paling akurat)
  tweets.forEach(t => addStat(t.topic, t.impressions, t.likes + t.reposts + t.replies));

  // sumber tambahan: Journal topics (kalau ada hari yang topiknya gak ada di Content DB)
  journal.forEach(e => {
    (e.topics || []).forEach(topic => {
      // hindari double count kalau topik yang sama udah representatif dari Content DB
      addStat(topic, e.impressions, e.likes + e.reposts + e.replies);
    });
  });

  return Object.entries(stats)
    .map(([topic, s]) => ({
      topic,
      avgImpressions: Math.round(s.impTotal / s.count),
      avgEngagement: Math.round(s.engTotal / s.count),
      count: s.count,
    }))
    .sort((a, b) => b.avgImpressions - a.avgImpressions);
}

function renderChart(data) {
  const ctx = document.getElementById('chartCategory');
  if (data.length === 0) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.topic),
      datasets: [{
        label: 'Avg Impressions',
        data: data.map(d => d.avgImpressions),
        backgroundColor: '#3B9EFF',
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#7B8794', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#7B8794', font: { size: 10 } }, grid: { color: '#232B3A' } },
      },
    },
  });
}

function renderRanking(data) {
  const container = document.getElementById('categoryRanking');

  if (data.length === 0) {
    container.innerHTML = `<div class="empty-state">Belum ada data kategori. Isi Content Database atau Journal dengan topik dulu.</div>`;
    return;
  }

  container.innerHTML = data.map((d, i) => `
    <div class="rank-row ${i === 0 ? 'gold' : ''}">
      <span class="rank-number">#${i + 1}</span>
      <div class="rank-info">
        <div class="rank-name">${d.topic}</div>
        <div class="rank-meta">${d.count} data point · ${d.avgEngagement} avg engagement</div>
      </div>
      <span class="rank-score">${d.avgImpressions}</span>
    </div>
  `).join('');
}

function renderPatternInsights(data) {
  const container = document.getElementById('patternInsights');

  if (data.length < 2) {
    container.innerHTML = `<div class="empty-state">Butuh minimal 2 kategori berbeda buat deteksi pola.</div>`;
    return;
  }

  const best = data[0];
  const worst = data[data.length - 1];
  const gap = best.avgImpressions - worst.avgImpressions;
  const gapPercent = worst.avgImpressions > 0 ? Math.round((gap / worst.avgImpressions) * 100) : 0;

  const insights = [];

  insights.push({
    title: 'Gap Performa',
    text: `Kategori "${best.topic}" tampil ${gapPercent}% lebih baik dari "${worst.topic}". Ini sinyal kuat soal apa yang resonan sama audiens lu.`,
  });

  // deteksi kategori dengan engagement tinggi tapi impressions rendah (niche tapi loyal)
  const engagementRatio = data.map(d => ({ ...d, ratio: d.avgEngagement / (d.avgImpressions || 1) }));
  const highEngagementLowReach = engagementRatio
    .filter(d => d.avgImpressions < best.avgImpressions * 0.7)
    .sort((a, b) => b.ratio - a.ratio)[0];

  if (highEngagementLowReach && highEngagementLowReach.topic !== best.topic) {
    insights.push({
      title: 'Niche Tersembunyi',
      text: `"${highEngagementLowReach.topic}" reach-nya gak gede, tapi rasio engagement-nya tinggi. Audiens yang dapet konten ini lebih engaged — coba eksplor lebih dalam.`,
    });
  }

  insights.push({
    title: 'Rekomendasi Alokasi Konten',
    text: `Coba alokasikan 60% konten ke "${best.topic}", sisanya buat eksperimen kategori lain biar gak monoton dan tetap nemuin pola baru.`,
  });

  container.innerHTML = insights.map(i => `
    <div class="coach-card">
      <div class="coach-title">${i.title}</div>
      <div class="coach-text">${i.text}</div>
    </div>
  `).join('');
}

// ---- jalankan ----
const categoryData = getCategoryData();
renderChart(categoryData);
renderRanking(categoryData);
renderPatternInsights(categoryData);
renderBottomNav('lab');
