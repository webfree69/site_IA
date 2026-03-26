const ARTICLES_PER_PAGE = 12;

let allArticles = [];
let filteredArticles = [];
let currentPage = 1;
let currentSource = 'all';
let searchQuery = '';

async function init() {
  try {
    const resp = await fetch('feed.json?' + Date.now());
    const data = await resp.json();
    allArticles = data.articles || [];
    
    updateStats(data);
    buildFilters();
    applyFilters();
  } catch (err) {
    console.error('Erreur chargement feed:', err);
    document.getElementById('articlesGrid').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📡</div>
        <div class="empty-title">Chargement en cours...</div>
        <div class="empty-text">Les articles seront bientôt disponibles.</div>
      </div>
    `;
  }
}

function updateStats(data) {
  const totalEl = document.getElementById('totalArticles');
  const updateEl = document.getElementById('lastUpdate');
  
  if (totalEl) totalEl.textContent = data.totalArticles || allArticles.length;
  
  if (updateEl && data.lastUpdated) {
    const date = new Date(data.lastUpdated);
    updateEl.textContent = `MAJ: ${date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
  }
}

function buildFilters() {
  const sources = [...new Set(allArticles.map(a => a.source))];
  const filtersEl = document.getElementById('filters');
  
  filtersEl.innerHTML = '<button class="filter-btn active" data-source="all">Toutes</button>';
  
  sources.forEach(source => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.source = source;
    btn.textContent = source;
    filtersEl.appendChild(btn);
  });

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    
    filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentSource = btn.dataset.source;
    currentPage = 1;
    applyFilters();
  });
}

function applyFilters() {
  filteredArticles = allArticles.filter(article => {
    const matchSource = currentSource === 'all' || article.source === currentSource;
    const matchSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.contentSnippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSource && matchSearch;
  });

  renderArticles();
  renderPagination();
}

function renderArticles() {
  const grid = document.getElementById('articlesGrid');
  const start = (currentPage - 1) * ARTICLES_PER_PAGE;
  const pageArticles = filteredArticles.slice(start, start + ARTICLES_PER_PAGE);

  if (pageArticles.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">Aucun article trouvé</div>
        <div class="empty-text">Essayez de modifier votre recherche ou vos filtres.</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = pageArticles.map((article, i) => `
    <a href="${article.link}" target="_blank" rel="noopener" class="article-card" style="animation-delay: ${i * 0.05}s">
      ${article.image 
        ? `<img class="article-image" src="${article.image}" alt="" loading="lazy" onerror="this.outerHTML='<div class=\\'article-image-placeholder\\'>🤖</div>'">` 
        : '<div class="article-image-placeholder">🤖</div>'
      }
      <div class="article-body">
        <div class="article-meta">
          <span class="source-badge" style="background: ${article.sourceColor || '#6366f1'}">${escapeHtml(article.source)}</span>
          <span class="article-date">${formatDate(article.pubDate)}</span>
        </div>
        <h3 class="article-title">${escapeHtml(article.title)}</h3>
        <p class="article-excerpt">${escapeHtml(article.contentSnippet)}</p>
        <span class="article-link">Lire la suite →</span>
      </div>
    </a>
  `).join('');
}

function renderPagination() {
  const el = document.getElementById('pagination');
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

  if (totalPages <= 1) {
    el.innerHTML = '';
    return;
  }

  let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">‹</button>`;

  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    html += `<button class="page-btn" data-page="1">1</button>`;
    if (startPage > 2) html += `<span class="page-info">...</span>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<span class="page-info">...</span>`;
    html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
  }

  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">›</button>`;

  el.innerHTML = html;

  el.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page);
      if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderArticles();
        renderPagination();
        document.getElementById('news').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return '';
  
  const now = new Date();
  const diffMs = now - date;
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffH < 1) return 'À l\'instant';
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD < 7) return `Il y a ${diffD}j`;
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  currentPage = 1;
  applyFilters();
});

init();