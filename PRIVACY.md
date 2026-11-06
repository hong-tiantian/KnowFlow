# Privacy Policy — KnowFlow

**Effective date:** November 7, 2026

KnowFlow ("the extension") is a Chrome extension that turns a word or phrase you select on a webpage into an AI-generated knowledge card. This policy explains what data the extension handles and how.

## Summary

KnowFlow has **no backend server of its own**, performs **no analytics or tracking**, and **does not sell or share your data**. The only data that leaves your browser is the text you select (plus a little surrounding context), which is sent to the AI model provider you choose, solely to generate the card you requested.

## What data is handled

**1. Selected text and nearby context**
When you click the KnowFlow button on a selection, the extension sends the selected term and a small amount of surrounding page text to the AI model provider you have chosen, so it can generate an explanation. This text is sent only when you actively trigger a lookup.

**2. Your API key (optional)**
If you choose to use your own AI provider, your API key is stored **locally on your device** using Chrome's `storage.local`. It is **never synced** to other devices and is **never sent anywhere except** as the authorization header to the provider endpoint you selected.

**3. Settings**
Your preferences (enabled state, chosen model/provider, output language, Obsidian vault name, and per-site on/off list) are stored using Chrome's `storage.sync` so they follow your Chrome profile. These do not contain your API key.

**4. Local cache**
To reduce repeated requests, recent lookups are cached locally in your browser. This cache never leaves your device and can be cleared at any time.

## Third-party AI providers

KnowFlow sends your selected text to whichever provider you use:

- **Free model (default):** the open-source GPT-OSS 20B model, served by Pollinations (`text.pollinations.ai`), which requires no key.
- **Your own key (optional):** a provider you select — for example Google Gemini, OpenRouter, Groq, DeepSeek, OpenAI, or any custom OpenAI-compatible endpoint you enter.

Your selected text is subject to the privacy policy of whichever provider you use. KnowFlow has no control over how those providers handle data, so please review their policies.

## What KnowFlow does NOT do

- It does not collect or transmit your browsing history.
- It does not run analytics, advertising, or tracking.
- It does not send data to the developer or to any server operated by KnowFlow.
- It does not read page content except the text you deliberately select.

## Your choices

- Turn KnowFlow off globally, or disable it on specific sites, from the popup.
- Use the keyless free model, or your own provider.
- Avoid using KnowFlow on pages containing sensitive personal, financial, medical, or confidential information, since selected text from those pages would be sent to the provider.

## Changes to this policy

If this policy changes, the updated version will be posted at this same location with a new effective date.

## Contact

For questions about this policy, contact: tiantianhong23@gmail.com
