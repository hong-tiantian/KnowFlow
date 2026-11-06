(() => {
  let settings = { enabled: true, cacheEnabled: true, disabledSites: [] };
  let termCache = {};

  CardRenderer.setFetcher(async (term, context) => {
    const key = (settings.language || 'en') + '::' + term;
    if (termCache[key]) return termCache[key];
    const response = await chrome.runtime.sendMessage({ type: 'QUERY_TERM', term, context });
    if (!response) throw new Error('No response from the extension background service. Reload the page and try again.');
    if (response.error) throw new Error(response.error);
    const data = response.data;
    if (settings.cacheEnabled) { termCache[key] = data; saveCache(); }
    return data;
  });

  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousedown', onMouseDown, true);

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings) {
      settings = { ...settings, ...changes.settings.newValue };
      syncRendererSettings();
    }
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'CLEAR_CACHE') {
      termCache = {};
      try { localStorage.removeItem('knowflow_cache'); } catch {}
    }
  });

  loadSettings().then(s => {
    settings = { ...settings, ...s };
    syncRendererSettings();
    if (settings.cacheEnabled) loadCache();
  });

  function syncRendererSettings() {
    CardRenderer.setObsidianVault(settings.obsidianVault || '');
    CardRenderer.setLanguage(settings.language || 'en');
  }

  function onMouseDown(e) {
    if (CardRenderer.isInsideTrigger(e.target)) return;
    CardRenderer.removeTrigger();
    if (CardRenderer.isInsideCard(e.target)) return;
    if (CardRenderer.hasActiveCards()) CardRenderer.removeAllCards();
  }

  function onMouseUp(e) {
    if (settings.enabled === false) return;
    if (isSiteDisabled()) return;
    if (CardRenderer.isInsideTrigger(e.target)) return;

    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';

      if (!text || text.length < 1 || text.length > 60) {
        CardRenderer.removeTrigger();
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const context = getSelectionContext(sel);

      const anchorNode = sel.anchorNode;
      const anchorEl = anchorNode && (anchorNode.nodeType === 1 ? anchorNode : anchorNode.parentElement);
      const sourceCardEl = CardRenderer.getCardEl(anchorEl);

      CardRenderer.showTrigger(rect, () => {
        CardRenderer.removeTrigger();
        if (sourceCardEl) {
          CardRenderer.lookupChild(text, context);
        } else {
          CardRenderer.lookup(text, context, rect.left + rect.width / 2, rect.bottom);
        }
      });
    }, 10);
  }

  function getSelectionContext(sel) {
    try {
      const range = sel.getRangeAt(0);
      const text = range.startContainer.textContent || '';
      const start = Math.max(0, range.startOffset - 60);
      const end = Math.min(text.length, range.endOffset + 60);
      return text.slice(start, end);
    } catch { return ''; }
  }

  function isSiteDisabled() {
    if (!settings.disabledSites) return false;
    return settings.disabledSites.includes(window.location.hostname);
  }

  function loadSettings() {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
          if (chrome.runtime.lastError || !response) resolve({});
          else resolve(response);
        });
      } catch { resolve({}); }
    });
  }

  function loadCache() {
    try {
      const cached = localStorage.getItem('knowflow_cache');
      if (cached) termCache = JSON.parse(cached);
    } catch {}
  }

  function saveCache() {
    try {
      const keys = Object.keys(termCache);
      if (keys.length > 500) keys.slice(0, keys.length - 500).forEach(k => delete termCache[k]);
      localStorage.setItem('knowflow_cache', JSON.stringify(termCache));
    } catch {}
  }
})();
