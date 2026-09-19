# Infinite Canvas

A Figma-style infinite canvas built with React + TypeScript (Vite).

## Features

- **Pan** by dragging empty canvas space
- **Zoom** with the mouse wheel (zoom toward cursor)
- **Minimap preview** in the bottom-right corner while dragging
- Sample cards placed in world space so you can explore the canvas

## Preview (GitHub Pages)

https://nur-alam.github.io/canvas/

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal.

## Deploy

Pushes to `main` build and deploy via GitHub Actions (`.github/workflows/deploy-pages.yml`).

If Pages is not enabled yet: **Settings → Pages → Source → GitHub Actions**.
