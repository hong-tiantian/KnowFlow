# Recording the KnowFlow demo GIF

A short guide to record your own demo GIF of KnowFlow in action and add it to the README. You are on Windows 11, so this uses **ScreenToGif** — a free, open-source recorder that's ideal for this.

## 1. Install ScreenToGif

- Download it from https://www.screentogif.com (or install via `winget install ScreenToGif.ScreenToGif` in a terminal).
- It's free and portable — no account needed.

## 2. Set up the scene before recording

- Load the extension: `chrome://extensions` → Developer mode → **Load unpacked** → select this project folder.
- Open a clean, text-heavy page (a Wikipedia article or docs page works well — pick something with a term worth explaining).
- Close unrelated tabs and hide bookmarks/toolbars so the frame looks tidy.
- If you'll use DeepSeek, make sure your API key is saved in the popup first, so there's no fumbling on camera.
- Decide your language in the popup beforehand.

## 3. Record the flow

Open ScreenToGif → **Recorder**, then size the capture window over the browser content (aim for roughly **1280×800** or smaller — GitHub displays READMEs at about 800px wide, so anything larger just adds file size).

Record this sequence, slowly and deliberately:

1. Highlight a term on the page.
2. Pause on the **spark button** that appears next to the selection.
3. Click it and let the card load and appear.
4. Click a **related concept** so a second card opens beside it.
5. (Optional) Click **Save to Obsidian** to show the export.

Keep the whole thing to **6–12 seconds**. Short loops read far better than long ones.

## 4. Edit and export

In ScreenToGif's editor:

- Delete dead frames at the start and end.
- **Frame rate:** 15–20 fps is plenty for a UI demo.
- Trim to the tightest clip that still shows the flow.
- Use **File → Save as → Gif**, and turn on an optimizer/quantizer if offered.
- **Target under ~5 MB** (ideally 1–3 MB). GitHub allows up to 10 MB in a README, but smaller loads faster. If it's too big: lower the frame rate, reduce the capture size, or shorten the clip.

As an alternative, exporting to **APNG** or a small **MP4/WebM** also works and often compresses better — but GIF is the simplest to embed.

## 5. Add it to the project

1. Save the file as `docs/demo.gif` in this project.
2. In [../README.md](../README.md), uncomment the demo image line near the top so it reads:

   ```markdown
   ![KnowFlow demo](docs/demo.gif)
   ```

3. Commit and push.

## Keeping the GIF private

If you don't want the demo visible in a public repo, do **not** commit `docs/demo.gif` and leave the README line commented out. Keeping the file local (uncommitted) keeps it off GitHub without needing any config. If you'd rather it be tracked but hidden from the public, the usual way is a `.gitignore` entry — tell me and I'll add one.

## Tips for a strong portfolio demo

- Use a real, recognizable term so the card content looks genuinely useful.
- Show the **side-by-side** related-card step — that's the feature that stands out.
- Steady, unhurried cursor movement looks more polished than fast clicking.
- Record in light mode first; the card UI also adapts to dark pages if you want a second clip.
