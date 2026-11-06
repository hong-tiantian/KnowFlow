# Chrome Web Store Listing Draft

Use this for the first Chrome Web Store submission. Recommended visibility: **Unlisted** until screenshots, privacy policy, and QA are ready.

## Product Details

### Title

KnowFlow - Instant Knowledge Cards

### Summary

Select any term to get an AI knowledge card with sources, related concepts, and side-by-side exploration.

### Category

Productivity

Alternative: Education

### Language

English

### Detailed Description

KnowFlow is a lightweight AI reading assistant for dense webpages, documentation, articles, and research material.

Select a word or phrase on any page, click the small KnowFlow button, and get a compact knowledge card without leaving what you are reading. Each card can include a concise explanation, deeper context, recent developments, related concepts, and source search links.

KnowFlow is designed for readers who often run into unfamiliar technical terms, product names, acronyms, research concepts, or domain-specific vocabulary.

Key features:

- Select any term or short phrase on a webpage.
- Generate an AI knowledge card with explanation and context.
- Explore related concepts side by side.
- Open source searches for further reading.
- Save cards to Obsidian as Markdown notes.
- Choose the output language.
- Disable the extension globally or on specific sites.
- Use your own DeepSeek API key, so model usage stays under your control.

Obsidian support:

KnowFlow can create Markdown notes through Obsidian URI. Saved notes include the term, explanation, related concepts as wikilinks, source searches, the original page URL, and capture time.

Privacy note:

KnowFlow sends the selected term and nearby page context to the configured AI provider to generate explanations. In the current version, users provide their own DeepSeek API key. API keys are stored using Chrome extension storage. Do not use KnowFlow on pages that contain sensitive personal, financial, medical, client, or company-confidential information unless you are comfortable sending the selected text and context to the configured provider.

Current status:

This is an early release intended for readers, students, developers, and knowledge workers who want a faster way to understand unfamiliar terms while reading online.

## URLs

### Official website

Leave blank unless you have verified a domain in Google Search Console.

### Homepage URL

Optional. Use a public page only. Good options:

- GitHub Pages project page
- Public Notion page
- Personal website project page

Do not use a private GitHub repository URL here.

### Support URL

Optional but recommended. Good options:

- Public GitHub issue page, if repo is public
- Public support form
- Public Notion support page
- Personal website support/contact page

## Mature Content

No.

## Product Support

Keep enabled if you are willing to receive user support messages. Otherwise disable for the first unlisted release.

## Image Assets Checklist

### Store Icon

Required: 128x128 PNG.

Current project file: `icons/icon128.png`

Before upload, confirm it has no alpha transparency if the dashboard rejects it.

### Screenshots

Required: at least 1 screenshot.

Accepted sizes shown in dashboard:

- 1280x800
- 640x400

Recommended screenshots:

1. A webpage with selected term and the KnowFlow trigger.
2. A generated card with explanation, related concepts, and sources.
3. Side-by-side concept exploration.
4. Save to Obsidian flow.
5. Popup settings with DeepSeek key and Obsidian vault field.

### Small Promo Tile

Required/recommended by dashboard:

- 440x280
- JPEG or 24-bit PNG without alpha

Suggested copy:

KnowFlow
AI knowledge cards for anything you read.

### Marquee Promo Tile

Optional:

- 1400x560
- JPEG or 24-bit PNG without alpha

Suggested copy:

KnowFlow
Turn unfamiliar terms into connected knowledge notes.

## Privacy Practices Notes

Expect to disclose that the extension handles:

- Website content: selected term and nearby page context.
- Authentication information: user-provided DeepSeek API key stored in Chrome storage.

Recommended statements:

- The extension does not sell user data.
- The extension does not use data for advertising.
- The extension sends selected text and nearby context only to the configured AI provider for generating knowledge cards.
- Users should avoid using the extension on sensitive pages.

You will likely need a public privacy policy URL before the final submission.

## First Submission Strategy

1. Set visibility to Unlisted.
2. Use English as the listing language.
3. Upload one clean screenshot first.
4. Leave homepage/support blank unless you have public pages ready.
5. Complete privacy disclosures carefully.
6. Add test instructions explaining that reviewers need to add their own DeepSeek API key, select text on a webpage, and click the KnowFlow trigger.
