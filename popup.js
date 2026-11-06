// Provider presets for the "use your own API key" option. Each is an
// OpenAI-compatible chat-completions endpoint; the user supplies the key.
const PRESETS = {
  gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-2.5-flash',
    keyUrl: 'https://aistudio.google.com/apikey',
    note: 'Free tier available — get a key in about a minute.'
  },
  openrouter: {
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'deepseek/deepseek-chat-v3.1:free',
    keyUrl: 'https://openrouter.ai/keys',
    note: 'Many free models (their names end in :free).'
  },
  groq: {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    keyUrl: 'https://console.groq.com/keys',
    note: 'Fast and free to start.'
  },
  deepseek: {
    endpoint: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    keyUrl: 'https://platform.deepseek.com',
    note: 'Low cost, requires account credit.'
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    keyUrl: 'https://platform.openai.com/api-keys',
    note: 'Paid usage.'
  },
  custom: {
    endpoint: '',
    model: '',
    keyUrl: '',
    note: 'Any OpenAI-compatible chat-completions endpoint.'
  }
};

const FREE_HINT = 'No key needed. Uses the open-source GPT-OSS 20B model. Rate-limited (about 1 request every 45s) and slower — good for occasional lookups.';
const BYOK_HINT = 'Bring your own key for faster, unlimited lookups. Your selected text is sent to the provider you pick below.';

document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const siteToggle = document.getElementById('siteToggle');
  const siteHost = document.getElementById('siteHost');
  const providerSelect = document.getElementById('providerSelect');
  const providerHint = document.getElementById('providerHint');
  const apiKeyField = document.getElementById('apiKeyField');
  const presetSelect = document.getElementById('presetSelect');
  const presetHint = document.getElementById('presetHint');
  const apiModelInput = document.getElementById('apiModelInput');
  const endpointField = document.getElementById('endpointField');
  const apiEndpointInput = document.getElementById('apiEndpointInput');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const languageSelect = document.getElementById('languageSelect');
  const obsidianVaultInput = document.getElementById('obsidianVaultInput');
  const helpLink = document.getElementById('helpLink');
  const saveBtn = document.getElementById('saveBtn');
  const statusMsg = document.getElementById('statusMsg');

  let currentHost = '';
  let disabledSites = [];

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      siteHost.textContent = 'Unavailable on this page';
      siteToggle.disabled = true;
      return;
    }
    try {
      const url = tabs[0] && tabs[0].url;
      if (url) {
        currentHost = new URL(url).hostname;
        siteHost.textContent = currentHost || 'Unavailable on this page';
      }
      refreshSiteToggle();
    } catch {
      siteHost.textContent = 'Unavailable on this page';
      siteToggle.disabled = true;
    }
  });

  chrome.storage.sync.get('settings', (result) => {
    const s = result.settings || {};
    enableToggle.checked = s.enabled !== false;
    providerSelect.value = (s.provider === 'byok') ? 'byok' : 'free';
    languageSelect.value = s.language || 'en';
    obsidianVaultInput.value = s.obsidianVault || '';
    disabledSites = Array.isArray(s.disabledSites) ? s.disabledSites : [];

    const preset = PRESETS[s.apiPreset] ? s.apiPreset : 'gemini';
    presetSelect.value = preset;
    // Keep saved values if present, otherwise fall back to the preset defaults.
    apiModelInput.value = s.apiModel || PRESETS[preset].model;
    apiEndpointInput.value = s.apiEndpoint || PRESETS[preset].endpoint;

    updateProviderUI();
    updatePresetUI(false);
    refreshSiteToggle();
  });

  // The API key is stored locally (not synced) so the secret never leaves this device.
  chrome.storage.local.get('apiKey', (result) => {
    apiKeyInput.value = result.apiKey || '';
  });

  function refreshSiteToggle() {
    if (!currentHost) return;
    siteToggle.checked = !disabledSites.includes(currentHost);
  }

  function updateProviderUI() {
    const byok = providerSelect.value === 'byok';
    apiKeyField.classList.toggle('show', byok);
    providerHint.textContent = byok ? BYOK_HINT : FREE_HINT;
  }

  // applyDefaults=true overwrites the model/endpoint fields with the preset's
  // defaults (used when the user actively switches provider).
  function updatePresetUI(applyDefaults) {
    const preset = presetSelect.value;
    const cfg = PRESETS[preset] || PRESETS.custom;
    endpointField.style.display = (preset === 'custom') ? 'block' : 'none';

    if (applyDefaults) {
      apiModelInput.value = cfg.model;
      apiEndpointInput.value = cfg.endpoint;
    }

    if (cfg.keyUrl) {
      presetHint.innerHTML = cfg.note + ' <a href="' + cfg.keyUrl + '" target="_blank" rel="noopener">Get a key →</a>';
    } else {
      presetHint.textContent = cfg.note;
    }
  }

  providerSelect.addEventListener('change', updateProviderUI);
  presetSelect.addEventListener('change', () => updatePresetUI(true));

  helpLink.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('help.html') });
  });

  saveBtn.addEventListener('click', () => {
    if (currentHost) {
      const idx = disabledSites.indexOf(currentHost);
      if (siteToggle.checked && idx !== -1) disabledSites.splice(idx, 1);
      if (!siteToggle.checked && idx === -1) disabledSites.push(currentHost);
    }

    const provider = providerSelect.value === 'byok' ? 'byok' : 'free';
    const preset = presetSelect.value;
    const apiModel = apiModelInput.value.trim();
    const apiEndpoint = (preset === 'custom')
      ? apiEndpointInput.value.trim()
      : PRESETS[preset].endpoint;

    const settings = {
      enabled: enableToggle.checked,
      provider,
      apiPreset: preset,
      apiEndpoint,
      apiModel,
      language: languageSelect.value,
      obsidianVault: obsidianVaultInput.value.trim(),
      disabledSites,
      cacheEnabled: true
    };
    const apiKey = apiKeyInput.value.replace(/[^\x21-\x7E]/g, '');

    if (provider === 'byok' && (!apiKey || !apiEndpoint || !apiModel)) {
      showStatus('Add a key, model, and endpoint — or it uses the free model', 'error');
    }

    // Settings sync across devices; the API key stays in local storage only.
    Promise.all([
      new Promise((res) => chrome.storage.sync.set({ settings }, res)),
      new Promise((res) => chrome.storage.local.set({ apiKey }, res))
    ]).then(() => {
      if (!(provider === 'byok' && (!apiKey || !apiEndpoint || !apiModel))) {
        showStatus('Saved', 'success');
      }
    });
  });

  function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = 'status show ' + type;
    setTimeout(() => { statusMsg.className = 'status ' + type; }, 2200);
  }
});
