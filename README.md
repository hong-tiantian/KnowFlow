# KnowFlow — Instant Knowledge Cards

KnowFlow is a Chrome extension (Manifest V3) that turns any term you highlight on a webpage into a compact, AI-generated knowledge card. Select a word, click the spark button, and read an explanation, related concepts, and source links right where you are — no new tab, no lost place in the article.

It is built as a reading companion for dense material: documentation, papers, technical blogs, and anything with vocabulary you don't recognize yet. The point is to cut down on context switching, not to replace search.

<!-- Record a short GIF of the select → spark → card flow and drop it here. See docs/DEMO.md for a step-by-step guide. -->
<!-- ![KnowFlow demo](docs/demo.gif) -->

## Features

- Highlight any word or short phrase and open a knowledge card over the page.
- Each card can include a one-line explanation, a short detail paragraph, a recent development, related concepts, and source search links.
- Click a related concept to open a follow-up card beside the current one, up to four side by side.
- Works out of the box with a keyless free model (open-source GPT-OSS 20B); add your own API key for faster, unlimited results.
- Save any card to Obsidian as a Markdown note, with wikilinks, sources, and the original page URL.
- Pick the card's output language (English, Chinese, Japanese, Korean, Spanish, French, German, Russian).
- Turn the extension off globally or on a per-site basis.
- Caches recent lookups locally so repeated terms don't re-hit the API.

## Tech stack

- Chrome Extension Manifest V3
- Content script for selection handling and in-page card rendering
- Background service worker for model requests and settings
- Vanilla JavaScript, HTML, and CSS — no framework, no build step
- Keyless free model (GPT-OSS 20B via Pollinations), plus any OpenAI-compatible provider with your own key (Gemini, OpenRouter, Groq, DeepSeek, OpenAI, or custom)

## How it works

```text
knowflow/
  manifest.json          Extension manifest (MV3)
  background.js          Service worker: settings + model requests
  content.js             Selection handling, caching, site rules
  utils/cardRenderer.js  Card UI: triggers, cards, Obsidian export
  content.css            Card and trigger styles (light/dark aware)
  popup.html / popup.js  Settings UI
  help.html              In-extension user guide
  icons/                 Extension icons
```

- **content.js** listens for text selection, checks per-site settings and the local cache, and asks the background worker for a card.
- **background.js** builds a structured JSON prompt, calls the model provider, and returns parsed card data.
- **cardRenderer.js** draws the trigger button and cards, handles side-by-side layout, and builds the Obsidian note.

The model is asked to return strict JSON (name, explanation, detail, recent development, related concepts, source queries), which keeps rendering predictable and avoids parsing freeform text.

## Installation (local)

1. Go to `chrome://extensions` in Chrome.
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select this project folder.
4. KnowFlow works immediately with the free model. For faster, unlimited lookups, open the popup, choose **Use your own API key**, pick a provider, and paste your key.
5. Optional: set your Obsidian vault name in the popup if you want saved notes to land in a specific vault.

## Usage

1. Select a term on any page.
2. Click the spark button that appears next to the selection.
3. Read the card. Click a related concept to branch into another card.
4. Click **Save to Obsidian** to turn the card into a Markdown note.
5. Use the popup to change provider, language, Obsidian vault, and per-site availability.

## Privacy & security

- **Your API key stays on your device.** It's held in `chrome.storage.local` (never synced across devices) and sent only to the provider endpoint you selected.
- **No telemetry.** KnowFlow has no analytics, no backend of its own, and sends nothing to any server other than the model provider you chose.
- KnowFlow sends the selected term and a small amount of surrounding page text to the model provider so it can generate the explanation. With the free model, that text goes to a third-party hosted service (Pollinations); with your own key, it goes only to the provider you chose.
- Avoid using KnowFlow on pages with sensitive personal, financial, medical, client, or company-confidential content unless you are comfortable sending the selected text to the provider.

## Status

This is an early, working release kept as a portfolio project. It runs well locally; it is not yet published to the Chrome Web Store. Before a public release it would need a hosted privacy policy, store screenshots and listing copy, a review of host permissions, and QA across common sites in both light and dark modes. See [STORE_LISTING.md](STORE_LISTING.md) for the submission draft and [DESIGN.md](DESIGN.md) for design notes.

## License

Released under the [MIT License](LICENSE).
