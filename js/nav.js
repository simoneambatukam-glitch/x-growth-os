// js/nav.js
function renderBottomNav(activePage) {
  const items = [
    { id: 'dashboard', href: 'index.html', icon: '📊', label: 'Home' },
    { id: 'journal', href: 'journal.html', icon: '📝', label: 'Journal' },
    { id: 'uploader', href: 'uploader.html', icon: '📷', label: 'Upload' },
    { id: 'coach', href: 'coach.html', icon: '🧠', label: 'Coach' },
    { id: 'content', href: 'content.html', icon: '🗂️', label: 'Tweets' },
    { id: 'lab', href: 'lab.html', icon: '🧪', label: 'Lab' },
    { id: 'goals', href: 'goals.html', icon: '🎯', label: 'Goals' },
  ];

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.innerHTML = items.map(item => `
    <a href="${item.href}" class="${item.id === activePage ? 'active' : ''}">
      <span class="icon">${item.icon}</span>
      <span>${item.label}</span>
    </a>
  `).join('');
  document.body.appendChild(nav);
}
