// js/content.js — Content Database

function setupForm() {
  document.getElementById('inpDate').value = new Date().toISOString().split('T')[0];

  document.getElementById('btnSaveTweet').addEventListener('click', () => {
    const text = document.getElementById('inpText').value.trim();
    if (!text) { alert('Tweet text wajib diisi'); return; }

    const tweet = {
      text,
      topic: document.getElementById('inpTopic').value.trim() || 'Lainnya',
      date: document.getElementById('inpDate').value,
      impressions: Number(document.getElementById('inpImpressions').value) || 0,
      likes: Number(document.getElementById('inpLikes').value) || 0,
      reposts: Number(document.getElementById('inpReposts').value) || 0,
      replies: Number(document.getElementById('inpReplies').value) || 0,
    };

    DB.addTweet(tweet);
    renderAll();

    ['inpText','inpTopic','inpImpressions','inpLikes','inpReposts','inpReplies']
      .forEach(id => document.getElementById(id).value = '');

    alert('Tweet tersimpan!');
  });
}

function engagementScore(t) {
  return t.likes + t.reposts + t.replies;
}

function renderSummary() {
  const tweets = DB.getContent();
  const container = document.getElementById('summaryCards');

  if (tweets.length === 0) {
    container.innerHTML = `<div class="empty-state">Belum ada tweet tersimpan.</div>`;
    return;
  }

  const best = tweets.reduce((a, b) => (b.impressions > a.impressions ? b : a));
  const worst = tweets.reduce((a, b) => (b.impressions < a.impressions ? b : a));

  // topik dengan rata-rata performa terbaik
  const topicStats = {};
  tweets.forEach(t => {
    if (!topicStats[t.topic]) topicStats[t.topic] = { total: 0, count: 0 };
    topicStats[t.topic].total += t.impressions;
    topicStats[t.topic].count += 1;
  });
  const bestTopic = Object.entries(topicStats)
    .map(([topic, s]) => ({ topic, avg: s.total / s.count }))
    .sort((a, b) => b.avg - a.avg)[0];

  const cards = [
    { label: 'Best Tweet', value: `${best.impressions} impressions` },
    { label: 'Worst Tweet', value: `${worst.impressions} impressions` },
    { label: 'Topik Tersukses', value: bestTopic.topic },
    { label: 'Total Tweet Tercatat', value: tweets.length },
  ];

  container.innerHTML = cards.map(c => `
    <div class="insight-card">
      <span class="label">${c.label}</span>
      <span class="value">${c.value}</span>
    </div>
  `).join('');
}

function renderTopicTable() {
  const tweets = DB.getContent();
  const container = document.getElementById('topicTable');

  if (tweets.length === 0) { container.innerHTML = ''; return; }

  const topicStats = {};
  tweets.forEach(t => {
    if (!topicStats[t.topic]) topicStats[t.topic] = { impTotal: 0, engTotal: 0, count: 0 };
    topicStats[t.topic].impTotal += t.impressions;
    topicStats[t.topic].engTotal += engagementScore(t);
    topicStats[t.topic].count += 1;
  });

  const rows = Object.entries(topicStats)
    .map(([topic, s]) => ({
      topic,
      avgImp: Math.round(s.impTotal / s.count),
      avgEng: Math.round(s.engTotal / s.count),
      count: s.count,
    }))
    .sort((a, b) => b.avgImp - a.avgImp);

  container.innerHTML = rows.map(r => `
    <div class="topic-row">
      <span class="topic-name">${r.topic} <span style="color:var(--muted); font-weight:400;">(${r.count}x)</span></span>
      <span class="topic-avg">${r.avgImp} imp / ${r.avgEng} eng</span>
    </div>
  `).join('');
}

function renderTweetList() {
  const tweets = DB.getContent().slice().sort((a, b) => b.date.localeCompare(a.date));
  const container = document.getElementById('tweetList');

  if (tweets.length === 0) {
    container.innerHTML = `<div class="empty-state">Belum ada tweet. Isi form di atas.</div>`;
    return;
  }

  const best = tweets.reduce((a, b) => (b.impressions > a.impressions ? b : a));
  const worst = tweets.reduce((a, b) => (b.impressions < a.impressions ? b : a));

  container.innerHTML = tweets.map(t => {
    let cls = '';
    if (t.id === best.id) cls = 'best';
    if (t.id === worst.id && tweets.length > 1) cls = 'worst';

    return `
      <div class="tweet-item ${cls}">
        <div class="tweet-text">${t.text}</div>
        <div class="tweet-meta">
          <span>${t.topic} · ${t.date}</span>
          <button class="tweet-delete" data-id="${t.id}">Hapus</button>
        </div>
        <div class="tweet-stats">
          <span>👁️ ${t.impressions}</span>
          <span>❤️ ${t.likes}</span>
          <span>🔁 ${t.reposts}</span>
          <span>💬 ${t.replies}</span>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.tweet-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Hapus tweet ini?')) {
        DB.deleteTweet(btn.dataset.id);
        renderAll();
      }
    });
  });
}

function renderAll() {
  renderSummary();
  renderTopicTable();
  renderTweetList();
}

setupForm();
renderAll();
renderBottomNav('content');
