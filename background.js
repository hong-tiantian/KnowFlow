// ===== Provider config =====
// Free model: a keyless, OpenAI-compatible hosted endpoint serving the
// open-source GPT-OSS 20B model. No key required, but rate-limited
// (about 1 request every 45 seconds per IP) and slower than a paid key.
const FREE_API_URL = 'https://text.pollinations.ai/openai';
const FREE_MODEL = 'openai-fast'; // GPT-OSS 20B
const FREE_MODEL_LABEL = 'GPT-OSS 20B';
// Free model is always available (no key required), so this is true.
const FREE_AVAILABLE = true;

const DEFAULT_SETTINGS = {
  enabled: true,
  // 'free'  -> keyless GPT-OSS 20B (default)
  // 'byok'  -> bring your own key (any OpenAI-compatible endpoint)
  provider: 'free',
  apiPreset: 'gemini',
  apiEndpoint: '',
  apiModel: '',
  language: 'en',
  obsidianVault: '',
  cacheEnabled: true,
  disabledSites: []
};

const LANG_NAMES = {
  en: 'English',
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ru: 'Russian'
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('settings', (result) => {
    if (!result.settings) chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'QUERY_TERM') {
    handleTermQuery(message.term, message.context)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
  if (message.type === 'GET_SETTINGS') {
    getSettings().then(sendResponse);
    return true;
  }
  if (message.type === 'GET_CONFIG') {
    sendResponse({ freeAvailable: FREE_AVAILABLE });
    return false;
  }
});

function buildPrompt(term, context, langName) {
  return `You are a precise knowledge assistant for readers.

The user selected this term while reading:
"${term}"

Nearby context:
"${context || ''}"

Return only valid JSON. Do not wrap it in Markdown. Use this schema:
{
  "name": "Official or common name of the term",
  "explain": "One clear sentence, under 35 words",
  "detail": "2-3 concise sentences with the core meaning, origin, and why it matters",
  "recent": "If the term has a recent important development, start with a specific date such as 'In March 2026, ...'. If not relevant, return an empty string.",
  "related": [
    {"term": "Related concept", "relation": "How it relates to the selected term, under 16 words"}
  ],
  "sources": [
    {"title": "Authoritative source name", "query": "Best search query for finding that source"}
  ]
}

Requirements:
1. Be accurate, concrete, and easy to understand.
2. Return exactly 3 related concepts when possible.
3. Return 2-3 source entries. Prefer original papers, official documentation, standards, company announcements, or reliable references.
4. Do not invent URLs. The extension will turn source queries into search links.
5. Write all user-facing fields in ${langName}. Keep the term itself in its standard spelling.
6. Return JSON only.`;
}

async function handleTermQuery(term, context) {
  const settings = await getSettings();
  const langName = LANG_NAMES[settings.language] || 'English';
  const prompt = buildPrompt(term, context, langName);
  const apiKey = sanitizeKey(settings.apiKey);

  // Resolve provider. 'byok' (bring your own key) needs a key, an endpoint and a
  // model; if any is missing we fall back to the keyless free model so the
  // extension always works out of the box.
  const endpoint = (settings.apiEndpoint || '').trim();
  const model = (settings.apiModel || '').trim();
  let provider = settings.provider || 'free';
  if (provider === 'byok' && (!apiKey || !endpoint || !model)) provider = 'free';

  const messages = [
    { role: 'system', content: 'You return only valid JSON for compact knowledge cards.' },
    { role: 'user', content: prompt }
  ];

  let url, headers, body;
  if (provider === 'byok') {
    // The user's key is sent only to the OpenAI-compatible endpoint they chose.
    url = endpoint;
    headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
    body = { model, messages, temperature: 0.3, max_tokens: 800 };
  } else {
    url = FREE_API_URL;
    headers = { 'Content-Type': 'application/json' };
    body = { model: FREE_MODEL, messages, temperature: 0.3, max_tokens: 800 };
  }

  let response;
  try {
    response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  } catch (err) {
    if (provider === 'free') {
      throw new Error('The free model is unavailable right now. It is rate-limited (about 1 request every 45 seconds). Wait a moment, or add your own API key in settings for fast, reliable results.');
    }
    throw err;
  }

  if (!response.ok) {
    const errText = await response.text();
    if (provider === 'free') {
      if (response.status === 402 || response.status === 429) {
        throw new Error('Free model limit reached (about 1 request every 45 seconds). Wait ~45s and try again, or add your own API key in settings for unlimited use.');
      }
      throw new Error(`The free model failed (${response.status}). Add your own API key in settings for reliable results.`);
    }
    throw new Error(`Request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from model.');

  // Free/open models sometimes wrap the JSON in code fences or extra prose.
  // Strip fences, then keep only the outermost { ... } object before parsing.
  let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    cleaned = cleaned.slice(first, last + 1);
  }

  try {
    return { data: JSON.parse(cleaned) };
  } catch (parseErr) {
    console.error('KnowFlow: failed to parse model response', content);
    throw new Error('Could not read the model response. Raw start: ' + content.slice(0, 140));
  }
}

function sanitizeKey(key) {
  return (key || '').replace(/[^\x21-\x7E]/g, '');
}

// Settings live in storage.sync (synced across the user's devices), but the
// API key is kept in storage.local so the secret never leaves this device.
async function getSettings() {
  const [sync, local] = await Promise.all([
    new Promise((resolve) => chrome.storage.sync.get('settings', (r) => resolve(r.settings || {}))),
    new Promise((resolve) => chrome.storage.local.get('apiKey', (r) => resolve(r.apiKey || '')))
  ]);
  return { ...DEFAULT_SETTINGS, ...sync, apiKey: local };
}
