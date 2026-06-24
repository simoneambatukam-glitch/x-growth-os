// js/coach.js — AI Growth Coach (rule-based, jalan tanpa API/backend)

function analyzeData() {
  const journal = DB.getJournal();
  const content = DB.getContent();

  if (journal.length < 2) {
    return { ready: false };
  }

  // ---- analisis topik dari journal ----
  const topicStats = {};
  journal.forEach(e => {
    (e.topics || []).forEach(topic => {
      if (!topicStats[topic]) topicStats[topic] = { totalImpressions: 0, totalEngagement: 0, count: 0 };
      topicStats[topic].totalImpressions += e.impressions;
      topicStats[topic].totalEngagement += (e.likes + e.reposts + e.replies);
      topicStats[topic].count += 1;
    });
  });

  const topicRanked = Object.entries(topicStats)
    .map(([topic, s]) => ({
      topic,
      avgImpressions: Math.round(s.totalImpressions / s.count),
      avgEngagement: Math.round(s.totalEngagement / s.count),
    }))
    .sort((a, b) => b.avgImpressions - a.avgImpressions);

  const bestTopic = topicRanked[0] || null;
  const worstTopic = topicRanked[topicRanked.length - 1] || null;

  // ---- analisis tren growth ----
  const recent = journal.slice(-7); // 7 entri terakhir
  const older = journal.slice(-14, -7);

  const avg = (arr, key) => arr.length ? arr.reduce((s, e) => s + e[key], 0) / arr.length : 0;

  const recentAvgFollowerGain = recent.length > 1
    ? (recent[recent.length - 1].followers - recent[0].followers) / recent.length
    : 0;

  const recentAvgImpressions = avg(recent, 'impressions');
  const olderAvgImpressions = avg(older, 'impressions');
  const impressionTrend = olderAvgImpressions > 0
    ? ((recentAvgImpressions - olderAvgImpressions) / olderAvgImpressions) * 100
    : 0;

  const recentAvgEngagement = avg(recent, 'likes') + avg(recent, 'reposts') + avg(recent, 'replies');

  // ---- best posting day pattern (hari dalam minggu) ----
  const dayOfWeekStats = {};
  journal.forEach(e => {
    const day = new Date(e.date).toLocaleDateString('id-ID', { weekday: 'long' });
    if (!dayOfWeekStats[day]) dayOfWeekStats[day] = { total: 0, count: 0 };
    dayOfWeekStats[day].total += e.impressions;
    dayOfWeekStats[day].count += 1;
  });
  const bestDayOfWeek = Object.entries(dayOfWeekStats)
    .map(([day, s]) => ({ day, avg: s.total / s.count }))
    .sort((a, b) => b.avg - a.avg)[0];

  return {
    ready: true,
    bestTopic,
    worstTopic,
    topicRanked,
    recentAvgFollowerGain,
    impressionTrend,
    recentAvgEngagement,
    bestDayOfWeek,
    totalEntries: journal.length,
  };
}

function renderCoach() {
  const a = analyzeData();
  const summaryEl = document.getElementById('coachSummary');
  const insightList = document.getElementById('insightList');
  const recoList = document.getElementById('recoList');

  if (!a.ready) {
    summaryEl.textContent = 'Coach butuh minimal 2 hari data buat mulai analisis. Isi Daily Journal beberapa hari dulu, baru balik ke sini.';
    insightList.innerHTML = '';
    recoList.innerHTML = '';
    return;
  }

  // ---- ringkasan utama, gaya mentor ----
  let summary = '';
  if (a.bestTopic) {
    summary += `Topik "${a.bestTopic.topic}" lagi jadi andalan lu, rata-rata dapet ${a.bestTopic.avgImpressions} impressions per post. `;
  }
  if (a.impressionTrend > 5) {
    summary += `Impressions lu naik ${a.impressionTrend.toFixed(0)}% dibanding periode sebelumnya — momentum lagi bagus, jangan ganti gaya sekarang. `;
  } else if (a.impressionTrend < -5) {
    summary += `Impressions lu turun ${Math.abs(a.impressionTrend).toFixed(0)}% dibanding periode sebelumnya — saatnya eksperimen topik atau format baru. `;
  } else {
    summary += `Growth lu stabil, belum ada lonjakan besar. `;
  }
  if (a.recentAvgFollowerGain > 0) {
    summary += `Rata-rata nambah ${a.recentAvgFollowerGain.toFixed(1)} follower per hari belakangan ini.`;
  }
  summaryEl.textContent = summary;

  // ---- insight cards ----
  const insights = [];

  if (a.bestTopic) {
    insights.push({
      title: 'Topik Terbaik',
      text: `"${a.bestTopic.topic}" — rata-rata ${a.bestTopic.avgImpressions} impressions & ${a.bestTopic.avgEngagement} engagement per post.`,
    });
  }
  if (a.worstTopic && a.topicRanked.length > 1) {
    insights.push({
      title: 'Topik Paling Lemah',
      text: `"${a.worstTopic.topic}" — cuma rata-rata ${a.worstTopic.avgImpressions} impressions. Pertimbangkan kurangi frekuensi atau ubah angle-nya.`,
    });
  }
  if (a.bestDayOfWeek) {
    insights.push({
      title: 'Hari Posting Terbaik',
      text: `Hari ${a.bestDayOfWeek.day} secara historis kasih impressions paling tinggi (rata-rata ${Math.round(a.bestDayOfWeek.avg)}).`,
    });
  }
  insights.push({
    title: 'Tren Impressions',
    text: a.impressionTrend >= 0
      ? `Naik ${a.impressionTrend.toFixed(0)}% dibanding minggu sebelumnya.`
      : `Turun ${Math.abs(a.impressionTrend).toFixed(0)}% dibanding minggu sebelumnya.`,
  });

  insightList.innerHTML = insights.map(i => `
    <div class="coach-card">
      <div class="coach-title">${i.title}</div>
      <div class="coach-text">${i.text}</div>
    </div>
  `).join('');

  // ---- rekomendasi gaya mentor ----
  const recos = [];

  if (a.bestTopic) {
    recos.push(`Apa yang harus gue tweet selanjutnya? → Lanjutin topik "${a.bestTopic.topic}", itu yang paling kerja buat lu sekarang. Coba angle baru biar gak monoton.`);
  }
  if (a.worstTopic && a.bestTopic && a.worstTopic.topic !== a.bestTopic.topic) {
    recos.push(`Topik apa yang harus difokuskan? → Geser porsi konten dari "${a.worstTopic.topic}" ke "${a.bestTopic.topic}". Gak usah berhenti total, tapi kurangin frekuensinya.`);
  }
  if (a.bestDayOfWeek) {
    recos.push(`Kapan waktu posting terbaik? → Berdasarkan histori, hari ${a.bestDayOfWeek.day} performanya paling tinggi. Coba jadwalin konten penting di hari itu.`);
  }
  if (a.impressionTrend < -5) {
    recos.push(`Konten tipe apa yang lagi works? → Impressions lu lagi turun, ini saat yang pas buat nyoba format baru (thread, hook beda, atau topik yang belum pernah lu coba).`);
  } else if (a.impressionTrend > 5) {
    recos.push(`Konten tipe apa yang lagi works? → Apapun yang lu lakuin minggu ini, jalan terus. Momentum lagi naik, jangan banyak berubah dulu.`);
  }

  recoList.innerHTML = recos.map(r => `
    <div class="coach-card reco">
      <div class="coach-text">${r}</div>
    </div>
  `).join('');
}

renderCoach();
renderBottomNav('coach');
