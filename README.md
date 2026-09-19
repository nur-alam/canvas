# Infinite Canvas

A Figma-style infinite canvas built with React + TypeScript (Vite).

## Features

- **Pan** by dragging empty canvas space
- **Zoom** with the mouse wheel (zoom toward cursor)
- **Minimap preview** in the bottom-right corner while dragging
- Sample cards placed in world space so you can explore the canvas

## GitHub Pages

Site files are published on the `gh-pages` branch.

**URL:** https://nur-alam.github.io/canvas/

**Enable once (required):** open
[Settings → Pages](https://github.com/nur-alam/canvas/settings/pages)
→ **Source: Deploy from a branch** → Branch **`gh-pages`** / **`/ (root)`** → **Save**

After that, the URL above will serve the app.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

Pushes to `main` also rebuild and publish the `gh-pages` branch via GitHub Actions.
