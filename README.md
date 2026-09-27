# Prasidha Jagtap — personal website

A one-page, Apple-style résumé site. Plain HTML + CSS + a little JS, no build step.

- `index.html` — the content (fill in every `[bracket]` and `TODO`)
- `style.css` — the look (white & black, auto dark mode, phone friendly)
- `main.js` — scroll fade-in, footer year, hides the résumé button until the PDF exists
- `assets/prasidha.webp` — profile photo
- `assets/Prasidha-Jagtap-Resume.pdf` — add your résumé here to show the "Download résumé" button

## Put it online for free (Cloudflare Pages)

1. Merge this branch into `main`.
2. Sign up / log in at https://dash.cloudflare.com (free plan).
3. Go to **Workers & Pages → Create application → Pages → Import an existing Git repository**.
4. Connect GitHub, allow access to `prasidhajagtap/projectP001`, pick it, click **Begin setup**.
5. Settings:
   - Project name: `prasidha` (this becomes `prasidha.pages.dev`; if taken, try `prasidhajagtap`)
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`
6. Click **Save and Deploy**. After about a minute the site is live at `https://<project-name>.pages.dev`.

Every push to `main` updates the site automatically.
