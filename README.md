# Prasidha Jagtap — personal website

A one-page, Apple-style personal site. Plain HTML + CSS + a little JavaScript, no build step.

**Live (draft):** https://prasidhajagtap.github.io/projectP001/

## Files

| File | What it is |
|---|---|
| `index.html` | All the content, SEO tags and structured data |
| `style.css` | The look — light by default, dark mode via the toggle, phone layout |
| `main.js` | Theme toggle, phone menu, scroll fade-in, contact form, résumé button check |
| `assets/` | Photos (WebP + JPG fallback) and the social share image `og-image.jpg` |
| `404.html` | "Page not found" page |
| `robots.txt`, `sitemap.xml` | For search engines |
| `.nojekyll` | Tells GitHub Pages to serve files as they are |

To show the **Download résumé** button, add `assets/Prasidha-Jagtap-Resume.pdf`. The button appears by itself once the file exists.

## Put it online — GitHub Pages (free)

1. Merge the work into `main`.
2. On GitHub: **Settings → Pages → Build and deployment**.
3. Source: **Deploy from a branch** → Branch: `main` → Folder: `/ (root)` → **Save**.
4. After 1–2 minutes it is live at https://prasidhajagtap.github.io/projectP001/

## Moving to another address later (e.g. Cloudflare Pages)

Replace `https://prasidhajagtap.github.io/projectP001/` with the new address in:
`index.html`, `robots.txt`, `sitemap.xml` and `404.html`.

Cloudflare Pages steps: **Workers & Pages → Create application → Pages → Import an existing Git repository** →
pick this repo → Framework preset **None**, build command **empty**, output directory **/** → **Save and Deploy**.

## Get found on Google

1. Add the site in **Google Search Console** (URL-prefix property) and submit `sitemap.xml`.
2. Do the same in **Bing Webmaster Tools**.
3. Link the site from your LinkedIn (Contact info + Featured) and GitHub profile.
