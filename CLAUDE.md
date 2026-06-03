# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site for the MemoryAisle iOS app, served at memoryaisle.app. Pure HTML/CSS/JS — no build step, no package.json, no tests. Edit a file, commit, push.

iOS app identifiers (referenced from this repo):
- App Store ID: `6761938171`
- Bundle ID: `com.sltrdigital.MemoryAisle2`
- Apple Team ID: `C6RNG52SMC`

## Hosting and URL rewriting

Deployed to **Vercel** (primary, `vercel.json`) with **Cloudflare Workers** also configured (`wrangler.toml`, `[assets] directory = "./"`).

`vercel.json` enables `cleanUrls: true` and rewrites `/foo` → `/foo.html` for everything except `/.well-known/*`. **Always link to clean URLs** (`/privacy`, not `/privacy.html`) — the rewrite handles it. The `.well-known` exclusion is critical: the apple-app-site-association file must be served with no `.html` suffix and `Content-Type: application/json` (set in `vercel.json` headers).

To preview locally: any static server pointed at the repo root (`python3 -m http.server`, `npx serve`, etc.). There's no dev script — Vercel/CF do the routing in production.

## Visual treatments coexist — match the page you're editing

Pages don't share one stylesheet and there's no shared template. **Copy the structure of the page you're editing (or its nearest sibling); don't mix patterns.** Two distinct looks are in play.

**Gold-on-dark (the current aesthetic):** dark `#1a1a1c` background, gold `#f5d97a` / cream `#fff8d8` accents, serif headings. Three wirings of the same look:
- `index.html`, `support.html` — self-contained: inline `<style>` + a `<canvas class="bg-fireflies">` driven by an **inline** `<script>`. No external CSS/JS.
- `delete-account.html`, `help.html`, `pricing.html` — the **legacy** wiring: `css/styles.css` (CSS variables + base styles at the top, `--bg-deep: #1a1a1c`) + `js/main.js` (mobile menu, FAQ accordion, billing toggle, IntersectionObserver reveal animations, waitlist form). No fireflies.
- `blog/glp1-protein-target.html`, `blog/glp1-dose-cycle.html` — hybrid: `css/styles.css` + the shared **`js/fireflies.js`** (gold firefly canvas, cursor parallax) + a per-post inline `<style>`.

**Dark-purple "document" look:** `privacy.html`, `terms.html`, `security.html`, `blog/glp1-muscle-loss.html`. Inline `<style>`, near-black `#0A0914` background, purple `#A78BFA` accent, Playfair Display headings (Google Fonts), no fireflies.

Notes:
- **Fireflies have two implementations**, both targeting `<canvas class="bg-fireflies">` and honoring `prefers-reduced-motion`: the inline script in `index.html`/`support.html`, and the shared `js/fireflies.js` used by the two newest blog posts. `js/main.js` does **not** render fireflies.
- `css/styles.css` and `js/main.js` are loaded **only** by the three legacy pages — don't pull them into any other page.
- The three blog posts aren't uniform: `glp1-muscle-loss` uses the document look; `glp1-protein-target` and `glp1-dose-cycle` use the gold-on-dark hybrid. Match whichever post you're extending.

## Adding a new public page — checklist

1. Create `<slug>.html` at repo root (or under `blog/`). Vercel will serve it at `/<slug>`.
2. Copy the GA + Meta Pixel snippets into `<head>` (GA ID `G-XNN0M5TWT7`, Pixel ID `2366192593898845`). They are duplicated in every page; there is no shared template.
3. Add the URL to `sitemap.xml`.
4. Add an `exclude` rule for the path in `.well-known/apple-app-site-association` under `applinks.details[0].components` **before** the catch-all `{ "/": "*" }`. Without this, the iOS app will intercept the URL via Universal Links instead of letting the browser load the page. Existing public paths (`/privacy`, `/terms`, `/help`, `/pricing`, etc.) are all explicitly excluded for this reason.

## App Store CTAs use campaign tracking — preserve it

Every "Download on the App Store" link follows this format:

```
https://apps.apple.com/app/apple-store/id6761938171?pt=128439453&ct=web-<placement>&mt=8
```

`pt=128439453` is the provider token. **`ct=` is the campaign tag and must be unique per placement** so we can attribute installs in App Store Connect. Existing tags in use: `web-hero`, `web-bottom`, `web-blog`. When adding a new CTA, pick a new descriptive `ct=` (e.g. `web-pricing`, `web-faq`) — don't reuse an existing one. When editing existing CTAs, preserve the `ct=` value already there.

## Auth callback bridge (`/auth/callback`)

`auth/callback/index.html` is a thin redirect page that converts Supabase-style email confirmation links (with `type=recovery|signup|email` in the URL hash or query) into a `memoryaisle://auth/callback?...` deep link, then auto-opens it. It also surfaces a manual "Open MemoryAisle" button if the redirect doesn't fire. If you change this file, test all three `type` values — they each render a different icon/title/message.

## Things to leave alone unless explicitly asked

- Security headers in `vercel.json` (`X-Frame-Options: DENY`, etc.).
- The `applinks.components` ordering — exclusions must precede the `*` catch-all.
- The dual hosting config (`vercel.json` + `wrangler.toml`) — both are intentional.
