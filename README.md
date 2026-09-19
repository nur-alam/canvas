# Infinite Canvas

A Figma-style infinite canvas built with React + TypeScript (Vite).

## Features

- **Pan** by dragging empty canvas space
- **Zoom** with the mouse wheel (zoom toward cursor)
- **Minimap preview** in the bottom-right corner while dragging
- Sample cards placed in world space so you can explore the canvas

## Live preview

**GitHub Pages:** https://nur-alam.github.io/canvas/

> First-time setup (one click): repo **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `gh-pages` / `/ (root)` → Save**

**CDN mirror (works immediately):** https://cdn.jsdelivr.net/gh/nur-alam/canvas@gh-pages/index.html

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
