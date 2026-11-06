const CardRenderer = (() => {
  const CARD_W = 320;
  const GAP = 14;
  const MAX_CARDS = 4;

  // UI labels per output language, so the whole card matches the selected language.
  const STRINGS = {
    en: { trigger: 'Explain with KnowFlow', close: 'Close', loading: 'Loading', failed: 'Lookup failed', recent: 'Recent', related: 'Related concepts', sources: 'Sources', open: 'open', save: 'Save to Obsidian', googleSearch: 'Google Search', capturedFrom: 'Captured from', page: 'Page', captured: 'Captured', tool: 'Tool' },
    'zh-CN': { trigger: '用 KnowFlow 解释', close: '关闭', loading: '加载中', failed: '查询失败', recent: '最新', related: '相关概念', sources: '来源', open: '打开', save: '保存到 Obsidian', googleSearch: 'Google 搜索', capturedFrom: '摘自', page: '页面', captured: '采集时间', tool: '工具' },
    'zh-TW': { trigger: '用 KnowFlow 解釋', close: '關閉', loading: '載入中', failed: '查詢失敗', recent: '最新', related: '相關概念', sources: '來源', open: '開啟', save: '儲存到 Obsidian', googleSearch: 'Google 搜尋', capturedFrom: '摘自', page: '頁面', captured: '擷取時間', tool: '工具' },
    ja: { trigger: 'KnowFlow で説明', close: '閉じる', loading: '読み込み中', failed: '検索に失敗しました', recent: '最新', related: '関連概念', sources: '出典', open: '開く', save: 'Obsidian に保存', googleSearch: 'Google 検索', capturedFrom: '取得元', page: 'ページ', captured: '取得日時', tool: 'ツール' },
    ko: { trigger: 'KnowFlow로 설명', close: '닫기', loading: '불러오는 중', failed: '조회 실패', recent: '최신', related: '관련 개념', sources: '출처', open: '열기', save: 'Obsidian에 저장', googleSearch: 'Google 검색', capturedFrom: '출처 페이지', page: '페이지', captured: '캡처 시간', tool: '도구' },
    es: { trigger: 'Explicar con KnowFlow', close: 'Cerrar', loading: 'Cargando', failed: 'Búsqueda fallida', recent: 'Reciente', related: 'Conceptos relacionados', sources: 'Fuentes', open: 'abrir', save: 'Guardar en Obsidian', googleSearch: 'Búsqueda en Google', capturedFrom: 'Capturado de', page: 'Página', captured: 'Capturado', tool: 'Herramienta' },
    fr: { trigger: 'Expliquer avec KnowFlow', close: 'Fermer', loading: 'Chargement', failed: 'Échec de la recherche', recent: 'Récent', related: 'Concepts associés', sources: 'Sources', open: 'ouvrir', save: 'Enregistrer dans Obsidian', googleSearch: 'Recherche Google', capturedFrom: 'Capturé depuis', page: 'Page', captured: 'Capturé', tool: 'Outil' },
    de: { trigger: 'Mit KnowFlow erklären', close: 'Schließen', loading: 'Wird geladen', failed: 'Suche fehlgeschlagen', recent: 'Aktuell', related: 'Verwandte Konzepte', sources: 'Quellen', open: 'öffnen', save: 'In Obsidian speichern', googleSearch: 'Google-Suche', capturedFrom: 'Erfasst von', page: 'Seite', captured: 'Erfasst', tool: 'Werkzeug' },
    ru: { trigger: 'Объяснить через KnowFlow', close: 'Закрыть', loading: 'Загрузка', failed: 'Ошибка поиска', recent: 'Недавнее', related: 'Связанные понятия', sources: 'Источники', open: 'открыть', save: 'Сохранить в Obsidian', googleSearch: 'Поиск Google', capturedFrom: 'Источник', page: 'Страница', captured: 'Сохранено', tool: 'Инструмент' }
  };

  let cards = [];
  let rowTop = null;
  let fetcher = null;
  let triggerEl = null;
  let obsidianVault = '';
  let lang = 'en';

  function setLanguage(code) { lang = STRINGS[code] ? code : 'en'; }
  function t(key) { return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key; }

  const SPARKLE_SVG = `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M12 3l1.6 4.6a4 4 0 0 0 2.5 2.5L20.7 12l-4.6 1.6a4 4 0 0 0-2.5 2.5L12 20.7l-1.6-4.6a4 4 0 0 0-2.5-2.5L3.3 12l4.6-1.6a4 4 0 0 0 2.5-2.5L12 3z"/></svg>`;

  function setFetcher(fn) { fetcher = fn; }
  function setObsidianVault(name) { obsidianVault = String(name || '').trim(); }

  function showTrigger(rect, onClick) {
    removeTrigger();
    triggerEl = document.createElement('button');
    triggerEl.type = 'button';
    triggerEl.className = 'knowflow-trigger';
    triggerEl.title = t('trigger');
    triggerEl.innerHTML = SPARKLE_SVG;
    triggerEl.style.left = (rect.right + window.scrollX + 8) + 'px';
    triggerEl.style.top = (rect.top + window.scrollY - 3) + 'px';
    triggerEl.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); });
    triggerEl.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onClick(); });
    document.body.appendChild(triggerEl);
    requestAnimationFrame(() => triggerEl.classList.add('knowflow-trigger-visible'));
  }

  function removeTrigger() {
    if (triggerEl) {
      triggerEl.remove();
      triggerEl = null;
    }
  }

  function isInsideTrigger(el) {
    while (el) {
      if (el.classList && el.classList.contains('knowflow-trigger')) return true;
      el = el.parentElement;
    }
    return false;
  }

  async function lookup(term, context, x, y) {
    removeAllCards();
    const card = spawnCard({ x, y });
    await load(card, term, context);
  }

  async function lookupChild(term, context) {
    const card = spawnCard({});
    await load(card, term, context);
  }

  function spawnCard({ x = 0, y = 0 } = {}) {
    const el = document.createElement('div');
    el.className = 'knowflow-card';
    el.style.width = CARD_W + 'px';
    el.style.zIndex = 2147483000 + cards.length;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('knowflow-card-visible'));

    const card = { el };
    if (cards.length === 0) positionFirst(el, x, y);
    else positionNext(el);

    cards.push(card);
    enforceMax();
    ensureRowVisible();
    return card;
  }

  function positionFirst(el, x, y) {
    const sx = window.scrollX, sy = window.scrollY;
    const vw = window.innerWidth;
    let left = x + sx - CARD_W / 2;
    let top = y + sy + 12;
    if (left < sx + 12) left = sx + 12;
    if (left + CARD_W > vw + sx - 12) left = vw + sx - CARD_W - 12;
    if (top < sy + 12) top = sy + 12;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    rowTop = top;
  }

  function positionNext(el) {
    const prev = cards[cards.length - 1].el;
    const prevLeft = parseFloat(prev.style.left) || 0;
    el.style.left = (prevLeft + CARD_W + GAP) + 'px';
    el.style.top = (rowTop != null ? rowTop : (parseFloat(prev.style.top) || 0)) + 'px';
  }

  function ensureRowVisible() {
    if (cards.length === 0) return;
    const sx = window.scrollX, vw = window.innerWidth;
    const last = cards[cards.length - 1].el;
    const rightEdge = (parseFloat(last.style.left) || 0) + CARD_W;
    const maxRight = vw + sx - 12;
    if (rightEdge > maxRight) {
      const delta = rightEdge - maxRight;
      cards.forEach(c => {
        c.el.style.left = ((parseFloat(c.el.style.left) || 0) - delta) + 'px';
      });
    }
  }

  function enforceMax() {
    while (cards.length > MAX_CARDS) {
      const old = cards.shift();
      old.el.classList.remove('knowflow-card-visible');
      const e = old.el;
      setTimeout(() => e.remove(), 180);
    }
  }

  async function load(card, term, context) {
    renderLoading(card, term);
    try {
      const data = normalize(await fetcher(term, context), term);
      renderContent(card, data);
    } catch (err) {
      renderContent(card, {
        name: term,
        explain: t('failed'),
        detail: err.message || 'Unknown error',
        recent: '',
        related: [],
        sources: []
      });
    }
  }

  function normalize(data, term) {
    if (!data) data = {};
    let related = data.related;
    if (!related && Array.isArray(data.related_terms)) {
      related = data.related_terms.map(t => ({ term: t, relation: '' }));
    }
    return {
      name: data.name || term,
      explain: data.explain || '',
      detail: data.detail || '',
      recent: data.recent || '',
      related: Array.isArray(related) ? related : [],
      sources: Array.isArray(data.sources) ? data.sources : []
    };
  }

  function renderLoading(card, term) {
    card.el.innerHTML = `
      <div class="knowflow-head">
        <span class="knowflow-title">${escapeHtml(term)}</span>
        <button class="knowflow-close" type="button" title="${escapeHtml(t('close'))}">${closeIcon()}</button>
      </div>
      <div class="knowflow-skeleton" aria-label="${escapeHtml(t('loading'))}">
        <div class="knowflow-sk-line" style="width:72%"></div>
        <div class="knowflow-sk-line" style="width:100%"></div>
        <div class="knowflow-sk-line" style="width:88%"></div>
      </div>`;
    bindClose(card);
  }

  function renderContent(card, d) {
    const detail = markTerms(d.detail, (d.related || []).map(r => r.term));

    const relatedHTML = (d.related || []).map(r => `
      <div class="knowflow-rel">
        <button class="knowflow-pill" type="button" data-term="${escapeHtml(r.term)}">${escapeHtml(r.term)}</button>
        ${r.relation ? `<span class="knowflow-rel-desc">${escapeHtml(r.relation)}</span>` : ''}
      </div>`).join('');

    const sourcesHTML = buildSources(d).map(s =>
      `<a class="knowflow-link" href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.title)}<span class="knowflow-link-arrow">${escapeHtml(t('open'))}</span></a>`
    ).join('');

    card.el.innerHTML = `
      <div class="knowflow-head">
        <span class="knowflow-title">${escapeHtml(d.name)}</span>
        <button class="knowflow-close" type="button" title="${escapeHtml(t('close'))}">${closeIcon()}</button>
      </div>
      ${d.explain ? `<div class="knowflow-explain">${escapeHtml(d.explain)}</div>` : ''}
      ${detail ? `<div class="knowflow-detail">${detail}</div>` : ''}
      ${d.recent ? `<div class="knowflow-recent"><span class="knowflow-recent-tag">${escapeHtml(t('recent'))}</span>${escapeHtml(d.recent)}</div>` : ''}
      ${relatedHTML ? `<div class="knowflow-section"><div class="knowflow-label">${escapeHtml(t('related'))}</div><div class="knowflow-rels">${relatedHTML}</div></div>` : ''}
      ${sourcesHTML ? `<div class="knowflow-section"><div class="knowflow-label">${escapeHtml(t('sources'))}</div><div class="knowflow-links">${sourcesHTML}</div></div>` : ''}
      <div class="knowflow-actions">
        <button class="knowflow-save" type="button">${escapeHtml(t('save'))}</button>
      </div>
    `;

    bindClose(card);
    card.el.querySelector('.knowflow-save').addEventListener('click', (e) => {
      e.stopPropagation();
      saveToObsidian(d);
    });
    card.el.querySelectorAll('.knowflow-pill, .knowflow-inline').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        lookupChild(el.dataset.term, '');
      });
    });
    requestAnimationFrame(clampRowVertical);
  }

  function buildSources(d) {
    const out = (d.sources || []).map(s => ({
      title: s.title || 'Search',
      url: `https://www.google.com/search?q=${encodeURIComponent(s.query || s.title || d.name)}`
    }));
    if (out.length === 0 && d.name) {
      out.push({ title: t('googleSearch'), url: `https://www.google.com/search?q=${encodeURIComponent(d.name)}` });
    }
    return out;
  }

  function saveToObsidian(d) {
    const noteName = sanitizeNoteName(d.name || 'KnowFlow note');
    const params = [];
    if (obsidianVault) params.push(['vault', obsidianVault]);
    params.push(['name', noteName]);
    params.push(['content', buildObsidianMarkdown(d)]);

    const link = document.createElement('a');
    link.href = `obsidian://new?${encodeUriParams(params)}`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function buildObsidianMarkdown(d) {
    const sources = buildSources(d);
    const related = (d.related || []).filter(r => r && r.term);
    const pageTitle = document.title || 'Untitled page';
    const pageUrl = window.location.href;
    const capturedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const lines = [
      `# ${escapeMarkdown(d.name || 'KnowFlow note')}`,
      '',
      d.explain ? `> ${escapeMarkdown(d.explain)}` : '',
      '',
      d.detail ? escapeMarkdown(d.detail) : '',
      ''
    ];

    if (d.recent) {
      lines.push(`## ${t('recent')}`, '', escapeMarkdown(d.recent), '');
    }

    if (related.length) {
      lines.push(`## ${t('related')}`, '');
      related.forEach(r => {
        const relation = r.relation ? ` - ${escapeMarkdown(r.relation)}` : '';
        lines.push(`- [[${escapeWikiLink(r.term)}]]${relation}`);
      });
      lines.push('');
    }

    if (sources.length) {
      lines.push(`## ${t('sources')}`, '');
      sources.forEach(s => lines.push(`- [${escapeMarkdown(s.title)}](${s.url})`));
      lines.push('');
    }

    lines.push(`## ${t('capturedFrom')}`, '');
    lines.push(`- ${t('page')}: [${escapeMarkdown(pageTitle)}](${pageUrl})`);
    lines.push(`- ${t('captured')}: ${capturedAt}`);
    lines.push(`- ${t('tool')}: KnowFlow`);

    return lines.filter((line, index, arr) => !(line === '' && arr[index - 1] === '')).join('\n');
  }

  function bindClose(card) {
    card.el.querySelector('.knowflow-close').addEventListener('click', (e) => {
      e.stopPropagation();
      removeCard(card);
    });
  }

  function removeCard(card) {
    const i = cards.indexOf(card);
    if (i !== -1) cards.splice(i, 1);
    card.el.classList.remove('knowflow-card-visible');
    const e = card.el;
    setTimeout(() => e.remove(), 180);
  }

  function clampRowVertical() {
    if (cards.length === 0) return;
    let maxBottom = 0;
    cards.forEach(c => { maxBottom = Math.max(maxBottom, c.el.getBoundingClientRect().bottom); });
    if (maxBottom > window.innerHeight - 12) {
      const shift = maxBottom - (window.innerHeight - 12);
      const minTop = window.scrollY + 12;
      const curTop = rowTop != null ? rowTop : minTop;
      const newTop = Math.max(minTop, curTop - shift);
      const applied = curTop - newTop;
      if (applied > 0) {
        rowTop = newTop;
        cards.forEach(c => {
          c.el.style.top = ((parseFloat(c.el.style.top) || 0) - applied) + 'px';
        });
      }
    }
  }

  function removeAllCards() {
    cards.forEach(c => {
      c.el.classList.remove('knowflow-card-visible');
      const e = c.el;
      setTimeout(() => e.remove(), 180);
    });
    cards = [];
    rowTop = null;
  }

  function hasActiveCards() { return cards.length > 0; }

  function isInsideCard(el) {
    while (el) {
      if (el.classList && el.classList.contains('knowflow-card')) return true;
      el = el.parentElement;
    }
    return false;
  }

  function getCardEl(el) {
    while (el) {
      if (el.classList && el.classList.contains('knowflow-card')) return el;
      el = el.parentElement;
    }
    return null;
  }

  function markTerms(text, terms) {
    if (!terms || terms.length === 0) return escapeHtml(text);
    let result = escapeHtml(text);
    [...terms].filter(Boolean).sort((a, b) => b.length - a.length).forEach(term => {
      const escaped = escapeHtml(term);
      result = result.replace(new RegExp(escapeRegex(escaped), 'g'),
        `<span class="knowflow-inline" data-term="${escaped}">${escaped}</span>`);
    });
    return result;
  }

  function closeIcon() {
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function sanitizeNoteName(name) {
    return String(name)
      .replace(/[\\/:*?"<>|#^[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80) || 'KnowFlow note';
  }

  function escapeMarkdown(str) {
    return String(str == null ? '' : str).replace(/([\\`*_{}[\]()#+.!|-])/g, '\\$1');
  }

  function escapeWikiLink(str) {
    return String(str == null ? '' : str).replace(/[\[\]|#^]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function encodeUriParams(params) {
    return params
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  return {
    setFetcher, setObsidianVault, setLanguage, showTrigger, removeTrigger, isInsideTrigger,
    lookup, lookupChild, removeAllCards, hasActiveCards, isInsideCard, getCardEl
  };
})();
