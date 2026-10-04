# Prasidha Jagtap — personal website

Designed & developed by **Prasidha Jagtap**. © 2026 Prasidha Jagtap — all rights reserved (see `LICENSE`).

**Live:** https://prasidhajagtap.github.io/prasidha_jagtap/

A one-page, Apple-style personal site. Plain HTML + CSS + JavaScript, no build step, no third-party code.

## Files

| File | What it is |
|---|---|
| `index.html` | All content, search-engine tags and structured data |
| `style.css` | The look — light/dark, depth, carousels, phone layout |
| `main.js` | Menu, chapters, carousels, tabs, bookmarks, rolling numbers, contact form, visit counter, feedback |
| `theme-init.js` | Runs first: light/dark choice and frame (clickjacking) protection |
| `site-config.js` | Public Supabase URL + anon key (empty = counter and feedback off) |
| `supabase/setup.sql` | Database tables, security rules and spam limits for visits, votes and feedback |
| `.github/workflows/supabase-keepalive.yml` | Pings Supabase every 3 days so the free project never pauses |
| `assets/` | Photos (WebP + JPG), share image, résumé PDF, self-hosted Inter font |
| `404.html`, `robots.txt`, `sitemap.xml`, `.nojekyll` | Not-found page and search-engine files |

## Publishing

Every merge to `main` publishes through GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root).
If a change doesn't appear after ~2 minutes, open **Actions → pages build and deployment → Re-run**.
Bump the `?v=` number on the CSS/JS links when those files change so browsers fetch the new version.

## Security

- Strict Content-Security-Policy on every page: only this site's own files may load (plus the Supabase counter API). No inline scripts, no third-party scripts or fonts.
- Frame protection, `noopener noreferrer` on outside links, obfuscated email, spam-trap field on the contact form.
- Visit counter and feedback: visitors can only *add* a count, a vote or a short answer set through database functions; they can't read or change anything. Only the admin email can read totals. Per-network limits stop flooding; network addresses are stored only as a daily-changing one-way hash for 2 days.
- The stats page lives in a separate repository. Admin sign-in is a one-time email link (no password to guess); new sign-ups are disabled in Supabase.
- Keep **two-factor authentication** on the GitHub and Supabase accounts — account takeover is the main real risk for a static site.
- Never put the Supabase `service_role` / secret key anywhere in this repository.

## Ownership marks

Author/copyright meta tags, structured-data creator, file header notices, a developer-console signature and Author/Copyright metadata inside every image identify Prasidha Jagtap as the designer and developer.
