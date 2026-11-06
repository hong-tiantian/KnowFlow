# KnowFlow Design Notes

## Product Idea

KnowFlow is a lightweight reading assistant for technical articles, documentation, papers, and dense web pages. The user selects an unfamiliar term and opens a compact AI-generated knowledge card without leaving the page.

The product goal is not to replace search. It is meant to reduce context switching while reading.

## Interaction Model

1. The user selects a word or short phrase.
2. A small spark trigger appears near the selection.
3. Clicking the trigger opens a knowledge card.
4. The card includes:
   - One-sentence explanation
   - Short detail paragraph
   - Recent development when relevant
   - Related concepts
   - Source search links
   - Save to Obsidian action
5. Clicking a related concept opens another card beside the current card.

## Visual Direction

- Mostly black and white.
- Quiet, compact UI that feels like a reading tool, not a marketing page.
- Pink-purple accent for interactive states and emphasis.
- Rounded corners are restrained.
- Cards should be readable on both light and dark pages.

## Architecture

```text
KnowFlow/
  manifest.json
  background.js
  content.js
  content.css
  popup.html
  popup.js
  help.html
  utils/
    cardRenderer.js
  icons/
```

## Key Components

- `content.js`: Watches text selection, handles site settings, cache, and card lookup triggers.
- `utils/cardRenderer.js`: Renders triggers, cards, related concept cards, close buttons, loading state, and source links.
- `background.js`: Owns settings lookup and calls the model provider.
- `popup.html` / `popup.js`: Extension settings UI.
- `help.html`: Lightweight user guide.

## Obsidian Flow

The first integration uses Obsidian URI instead of a dedicated Obsidian plugin. This keeps the feature low-friction:

1. User clicks `Save to Obsidian` on a card.
2. The extension generates Markdown from the card data.
3. The extension opens `obsidian://new` with note name, content, and optional vault.
4. Obsidian handles note creation.

This is enough for a portfolio-level workflow. A future Obsidian plugin could add richer behavior such as automatic folder routing, note deduplication, backlink cleanup, and graph views.

## Model Provider

The current private-use setup calls DeepSeek directly from the extension using the user's own API key. A future hosted proxy can be added by setting `FREE_PROXY_URL` in `background.js`, but that requires a privacy and abuse-control review before public release.

## Privacy Notes

KnowFlow sends the selected term and nearby page context to the configured model provider. This is useful for better explanations, but it means the extension should not be used on sensitive pages unless the user is comfortable sending that text to the provider.

## Publishing Notes

For portfolio use, a private GitHub repository plus screenshots or a demo video is enough. Chrome Web Store publication should wait until the project has:

- A privacy policy.
- Store screenshots and listing copy.
- Clear data disclosure.
- A final decision on the hosted model option.
- QA across common websites and dark/light modes.
