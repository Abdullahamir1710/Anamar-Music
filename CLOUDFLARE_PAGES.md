# Deploying Anamar Music to Cloudflare Pages

This project is built and optimized to run seamlessly on **Cloudflare Pages** with all features fully functional.

## Cloudflare Pages Setup Instructions

1. **Connect Repository**
   - In Cloudflare Dashboard, go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
   - Select your repository.

2. **Build Settings**
   - **Framework preset**: `Vite` (or `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js Version**: `18` or `20` (add environment variable `NODE_VERSION=20` if prompted)

3. **Features Supported on Cloudflare Pages**
   - ✅ **Single Page Application (SPA) Routing**: Handled via `public/_redirects` (`/*  /index.html  200`).
   - ✅ **Edge API & Audio Streaming**: Cloudflare Pages Functions located in `/functions/api/` (`audio-proxy`, `search`, `lyrics`, `stream`, `identify`) run automatically on Cloudflare's global edge network.
   - ✅ **High-Fidelity Audio Playback**: Direct audio stream fallback ensures audio plays smoothly whether deployed with Functions or static hosting.
   - ✅ **Synchronized Lyrics**: Studio lyric engine with millisecond precision and LRCLIB edge integration.
   - ✅ **Anamar Brain & AI Discovery**: Client-side adaptive machine learning engine tailored to user acoustic preferences.
   - ✅ **CD Turntable & Ambient Mode**: Iridescent holographic rotating disc with fixed player controls and smooth auto-scrolling lyrics.
   - ✅ **PWA & Offline Mode**: Installable Progressive Web App with offline caching.
