# Prasidha Jagtap — personal website

Designed & developed by **Prasidha Jagtap**. © 2026 Prasidha Jagtap — all rights reserved (see [`LICENSE`](LICENSE)).

**Live site:** https://prasidhajagtap.github.io/prasidha_jagtap/

A one-page, Apple-style personal and résumé website for *Prasidha Jagtap — Technology, Product & AI Professional*.
It is plain HTML + CSS + JavaScript: no framework, no build step, no third-party scripts or fonts.
It is hosted free on GitHub Pages. A small Supabase database (free plan) stores visit counts, likes and feedback.

---

## Contents

1. [What the website does](#1-what-the-website-does)
2. [How the whole system fits together](#2-how-the-whole-system-fits-together)
3. [Files in this repository](#3-files-in-this-repository)
4. [Visit counter, likes, feedback and enquiry clicks](#4-visit-counter-likes-feedback-and-enquiry-clicks)
5. [The database (Supabase)](#5-the-database-supabase)
6. [The admin (stats) page](#6-the-admin-stats-page)
7. [Keep-awake job](#7-keep-awake-job)
8. [Security](#8-security)
9. [Search engines and sharing](#9-search-engines-and-sharing)
10. [Accessibility, speed and devices](#10-accessibility-speed-and-devices)
11. [How to make changes and publish](#11-how-to-make-changes-and-publish)
12. [Setting everything up from zero](#12-setting-everything-up-from-zero)
13. [Troubleshooting](#13-troubleshooting)
14. [Ownership marks and licence](#14-ownership-marks-and-licence)

---

## 1. What the website does

### Page sections (top to bottom)

| Section | What it shows |
|---|---|
| **Header** | Name “Prasidha”, tagline *“Turning Ideas Into Digital Products. Product delivery \| Enterprise Technology \| HR Tech \| AI”*, menu, light/dark switch. After you scroll past the main photo, a small round profile photo appears next to the name. |
| **Hero** | *Technology, Product & AI Professional*, main photo, 3D buttons (**Download résumé**, **Get in touch**) with a soft pulsing ring. |
| **About** (`#about`) | Short story and key numbers. The numbers roll up when they come into view. |
| **My story, in chapters** (`#explore`) | Accordions, all closed by default: **Experience** (`#experience`, timeline), **Problems solved** (`#work`), **Moments** (`#moments`, photo carousel), **Certifications** (`#certifications`, incl. ISO 9001 QMS, ISO/IEC 27001 ISMS and ISO/IEC 27701 PIMS internal auditor, 2024, recertified 2026). |
| **AI, put to work** (`#ai`) | Cards on a curved 3D ring (Cover-Flow style). Swipe, drag, arrow keys or dots. |
| **The toolkit** (`#skills`) | Skills in tabs (neutral selected tab; the timeline stays blue). |
| **Let’s talk** (`#contact`) | **Email me**, **LinkedIn** (opens the public profile directly), **Résumé**, and **Want a website of your own?**. The 👍/👎 feedback question appears here. |
| **Footer** | Copyright line. |

### Interactive features

- **Light / dark mode.** It follows the device setting, and the visitor's choice is remembered.
- **Menu.** On phones it closes when you tap outside it, press Esc, or pick a link.
- **Bookmarks tab.** A small bookmark button appears after the first heading. Tap or click it to see *only the sections you have already passed* and jump back to one.
- **Back-to-top button.**
- **Click cursor.** On computers, clickable items show a click-hand pointer. On touch screens it is not used.
- **Contact form** (“Email me”). It opens the visitor's own email app with the message ready to send. Nothing is stored by the site. A hidden spam-trap field blocks simple bots, and there is a “Show email / copy” fallback.
- **“Want a website of your own?”** It opens a small page with a ready-made enquiry. The visitor fills in nothing.
  - **Subject:** *Enquiry: a website like yours*
  - **Message:** *Hello Prasidha, I saw your website and I would like to build a similar website. Please get back to me to discuss the details. Kind regards,*
  - **Send enquiry** opens the visitor's email app. **Gmail** and **Outlook** web links are offered for devices with no email app.
- **Feedback (Duolingo style).** When the visitor reaches *Let’s talk*, a quiet line asks *“Enjoying the profile?”* 👍 / 👎. After a vote, a short sheet opens with a progress bar, slide animations and cheerful nudges. **One tap per question**: there is no Continue button and no dropdown.
  - 👍 flow: *What stood out most?* → *Who’s visiting today?* → *Would you like to connect?* → optional note.
  - 👎 flow: *What would make it better?* → *Where should I start?* → *Who’s visiting today?* → optional note.
  - The last, optional note step has one button: **Skip**, which changes to **Send** once something is typed. Leaving early shows a friendly *“So close!”* nudge.
  - The question is asked only once per browser. People who choose *“Yes, let’s talk”* are offered **Email me** at the end.
- **Résumé.** `assets/Prasidha-Jagtap-Resume.pdf` is the download.

---

## 2. How the whole system fits together

```
Visitor's browser
   │  loads the page from GitHub Pages (this repo, branch main)
   │
   ├─► https://prasidhajagtap.github.io/prasidha_jagtap/        (this repository)
   │      index.html · style.css · main.js · theme-init.js · site-config.js · assets/
   │
   └─► Supabase database (project vibbknwnszoescejukud)
          visitors may ONLY call 5 functions:
          record_visit · record_vote · submit_feedback · record_build · ping
          they cannot read anything

Owner (Prasidha) ──► Admin / stats page (separate repository: prasidha_resume_page_admin)
                       signs in with a one-time email link → reads the totals
                       (only the admin email is allowed by the database)

GitHub Actions (this repo) ──► pings Supabase every 3 days so the free project never pauses
```

| Part | Where it lives | Cost |
|---|---|---|
| Public website | This repository → GitHub Pages | Free |
| Admin / stats page | Separate repository `prasidha_resume_page_admin` → GitHub Pages | Free |
| Database + admin sign-in | Supabase (free plan) | Free |
| Keep-awake job | GitHub Actions in this repository | Free |

---

## 3. Files in this repository

| File / folder | What it is |
|---|---|
| `index.html` | All page content, the Content-Security-Policy, search-engine tags (title, description, Open Graph, Twitter) and JSON-LD structured data (Person). |
| `style.css` | The whole look: light/dark colour tokens, 3D depth shadows, buttons, carousels, AI ring, feedback sheet, enquiry page, phone layout, reduced-motion rules. |
| `main.js` | All behaviour: menu, header photo, bookmarks, accordions, timeline, rolling numbers, carousels, AI ring, tabs, contact form, website enquiry (+ click counting), visit counter, feedback flow, console signature. |
| `theme-init.js` | Runs first, before the page paints. It applies light/dark without a flash and blocks the page from being shown inside another site's frame (clickjacking protection). |
| `site-config.js` | Public Supabase URL and **anon (public) key**. Leave both empty to switch off the counter, feedback and enquiry counting. |
| `supabase/setup.sql` | The full database setup: tables, security rules, spam limits and functions. Safe to run again (it upgrades in place). |
| `.github/workflows/supabase-keepalive.yml` | Pings Supabase every 3 days (see [section 7](#7-keep-awake-job)). |
| `assets/` | `prasidha.webp/.jpg` (main photo), `prasidha-avatar.webp/.jpg` (header photo), `moment-*.webp/.jpg` (Moments carousel), `og-image.jpg` (1200×630 share image), `Prasidha-Jagtap-Resume.pdf`, `fonts/inter-latin.woff2` (self-hosted Inter variable font, weights 400–700). |
| `404.html` | “Page not found” page with its own strict security policy. |
| `robots.txt`, `sitemap.xml` | Tell search engines they may index the site and where the page list is. |
| `f254552c16eb76082fcafbdbac639be6.txt` | IndexNow key file. It lets the site tell Bing (and other IndexNow search engines) about updates quickly. Do not delete or rename it. |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are. |
| `LICENSE` | All rights reserved. |

**Cache version.** CSS and JS links carry `?v=NN` (currently `v=32`). Raise the number whenever `style.css`, `main.js`, `theme-init.js` or `site-config.js` changes, so browsers fetch the new copy.

---

## 4. Visit counter, likes, feedback and enquiry clicks

Every number is visible **only to the owner** on the admin page. Visitors never see any count.

### Visits and unique visitors
- **Browser ID.** Each browser makes its own random ID (`localStorage` key `pj_vid`, 32 hex characters). The database stores only a one-way hash of it. Nobody has to sign in or enter anything.
- **Page view.** Every page open counts as a view.
- **Visit.** A visit is a browser session. A new one starts in a new tab session or after 30 minutes idle (`sessionStorage pj_sid`, `localStorage pj_last`).
- **Unique visitor.** Each different browser counts once. The admin page also shows how many came back more than once.
- **Owner's own visits.** Any browser where the owner has opened the admin page is marked automatically (`localStorage pj_owner = 1`). Its views are kept separately and never inflate the numbers. The admin page has a switch to include them.
- **Not counted.** Automated browsers (`navigator.webdriver`) are skipped.

### Likes and feedback
- **Votes.** 👍 / 👎 are stored as daily totals.
- **Answers.** Feedback answers are stored as short codes from fixed lists, plus an optional note (max 300 characters, cleaned). The database throws away any unknown question or answer.

### “Want a website of your own?” clicks
- **Website interest.** The enquiry page was opened.
- **Enquiries sent.** The visitor tapped *Send enquiry*, *Gmail* or *Outlook*. It means they tapped the button, not that the email was really sent.
- Each counts at most once per page load. The owner's browsers and automated browsers are not counted.

### Spam limits (per network, enforced in the database)
| Action | Limit |
|---|---|
| Page views | 60 per 10 minutes |
| New browser IDs | 20 per day |
| 👍 / 👎 votes | 3 per day |
| Feedback forms | 3 per day |
| Enquiry opens / sends | 5 each per day |

Over a limit, the call quietly does nothing. Network addresses are **never stored**. Only a daily-changing one-way hash is kept, and it is deleted after 2 days.

---

## 5. The database (Supabase)

- **Project:** `vibbknwnszoescejukud` (`https://vibbknwnszoescejukud.supabase.co`)
- **Setup file:** [`supabase/setup.sql`](supabase/setup.sql). Before running, replace `YOUR_ADMIN_EMAIL` with the admin sign-in email. Run it in **Supabase → SQL Editor → New query → Run**. It is safe to run again and upgrades in place.

### Tables (no visitor can read or write any of them directly)
| Table | Holds |
|---|---|
| `site_daily` | One row per day (India time): `views`, `visits`, `visitors`, `new_visitors`, `likes`, `dislikes`, `own_views`, `build_opens`, `build_sends`. |
| `site_visitors` | One row per browser (hashed ID): first/last seen, views, visits, `own`. |
| `site_visitor_days` | Which browsers came on which day (for daily unique visitors). |
| `site_feedback` | Vote, answer codes (JSON), optional note, time. |
| `site_hits` | Short-lived anti-spam log (hashed network + kind + time), cleaned after 2 days. |
| `site_admins` | The admin email(s) allowed to read the numbers. |

### Functions
| Function | Who may call | Does |
|---|---|---|
| `record_visit(vid, new_visit, own)` | visitors | Counts a page open / visit / unique browser. |
| `record_vote(vote)` | visitors | Adds 👍 or 👎. |
| `submit_feedback(vote, answers, note)` | visitors | Saves cleaned feedback. |
| `record_build(step)` | visitors | Counts enquiry `open` / `send`. |
| `ping()` | visitors | Returns 1, used by the keep-awake job. |
| `site_summary()` | admin only | All-time unique, returning and own browsers. |
| `is_site_admin()` | signed-in users | Checks the email against `site_admins`. |

### Supabase settings that must stay this way
- **Authentication → Sign In / Providers:** “Allow new users to sign up” is **off**.
- **Authentication → URL Configuration:**
  - Site URL is `https://prasidhajagtap.github.io/prasidha_jagtap/`
  - Redirect URLs include `https://prasidhajagtap.github.io/prasidha_resume_page_admin/`
- **Authentication → Users:** only the admin user exists.

---

## 6. The admin (stats) page

The stats page is kept in a **separate repository**, `prasidha_resume_page_admin`, published with GitHub Pages under the same `prasidhajagtap.github.io` address. That way the owner's browsers are recognised automatically. It is for the owner's use only.

- **Sign-in.** One-time email link, with no password to guess. The button rests for 60 s between requests. Only the admin email can read data, which the database enforces. Sign-ups are disabled.
- **Tiles:**
  - Page views, Visits, Unique visitors (+ came back), Liked 👍 (+ % liked), Not liked 👎
  - Today
  - Website interest ✨, Enquiries sent ✉️ (+ % of openers who sent)
- **Charts and lists:**
  - 30-day bar chart with hover details, plus a day-by-day table
  - Feedback summary per question and the latest 50 answers (shown as plain text, so no code can run)
  - “Include my own visits” switch
- It reuses this site's `style.css`, `theme-init.js` and `site-config.js`, so the look and settings stay in one place.

See that repository's README for its own details.

---

## 7. Keep-awake job

Free Supabase projects pause after about a week with little activity. `.github/workflows/supabase-keepalive.yml` calls `ping()` at **03:17 UTC every 3 days** (and on demand: **Actions → Keep Supabase awake → Run workflow**).

- It uses the repository **secrets or variables** `SUPABASE_URL` / `SUPABASE_ANON_KEY` if they are set (**Settings → Secrets and variables → Actions → Repository**).
- If they are empty, it reads the same public values from the live `site-config.js`. So it works with no setup.
- Success shows `1` and `Supabase is awake.` in the log.

---

## 8. Security

- **Strict Content-Security-Policy** (meta tag in `index.html`): only this site's own files may load, plus calls to the Supabase API. There are no inline scripts and no third-party scripts, styles or fonts. Other rules: `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`, `frame-src 'none'`, `upgrade-insecure-requests`. `404.html` has an even stricter policy.
- **Frame protection.** `theme-init.js` stops the page from being shown inside another site (clickjacking).
- **Links.** Outside links use `rel="noopener noreferrer"`.
- **Email address** is never written in the page source. It is put together only when someone clicks, which keeps simple scraping bots away.
- **Contact form:** spam-trap field. Nothing is sent to or stored by the site.
- **Database:**
  - Visitors can only call the five counting functions.
  - Every table has row-level security, and there are no direct table rights.
  - Inputs are checked and whitelisted.
  - There are per-network limits, and network addresses are hashed daily and deleted after 2 days.
- **Keys.**
  - The Supabase **anon key** in `site-config.js` is public by design and safe to publish.
  - **Never** put the `service_role` / secret key anywhere in this repository.
- **Accounts.** Keep **two-factor authentication** on the GitHub and Supabase accounts. Account takeover is the main real risk for a static site.
- **Never public:** compensation details and any private data.

---

## 9. Search engines and sharing

- **Title:** *Prasidha Jagtap – Technology, Product & AI Professional*
- **Share preview:** description, canonical URL, Open Graph and Twitter tags, plus the 1200×630 share image `assets/og-image.jpg?v=2`.
- **Google:** JSON-LD `Person` structured data (name, job title, description, `sameAs` LinkedIn, creator, copyright holder, `dateModified`).
- **Indexing files:** `robots.txt` (allow all), `sitemap.xml`, and the IndexNow key file for Bing.
- **Refreshing search results:** after big content changes, update `dateModified` in the JSON-LD and the date in `sitemap.xml`. Then request indexing in Google Search Console.
- **Refreshing LinkedIn / WhatsApp previews:** raise the `?v=` on `og-image.jpg`, then use LinkedIn Post Inspector.

---

## 10. Accessibility, speed and devices

- **Accessibility:**
  - real buttons and links, keyboard support (Tab, Enter, Space, arrows, Esc), visible focus
  - `aria` labels on icon buttons, dialogs marked as dialogs, focus returned after closing
  - checked with axe-core; tap targets at least 24 px
  - reduced motion: animations switch off when the device asks for less motion
- **Speed:**
  - WebP images with JPG fallback, and lazy-loaded images below the fold
  - one self-hosted variable font
  - one CSS and one JS file, deferred scripts, no frameworks
- **Devices:**
  - works from small phones to wide desktops, with a 16 px side gutter and no sideways scrolling
  - light and dark modes
  - the iPhone safe area is respected in the bottom sheets

---

## 11. How to make changes and publish

1. Edit the files. Text lives in `index.html`, the look in `style.css`, behaviour in `main.js`.
2. If CSS or JS changed, raise the `?v=` number on their links in `index.html`.
3. Preview locally by running `python3 -m http.server 8000` in the repo folder, then open `http://localhost:8000/`. The counter works locally only if `site-config.js` is filled. Close the page before testing the feedback flow again, or clear `localStorage` key `pj_fb`.
4. Commit on a branch, open a pull request into `main`, then merge.
5. GitHub Pages publishes `main` in about 1–2 minutes (**Settings → Pages → Deploy from a branch → `main` / root**).
6. If a change does not appear, open **Actions → pages build and deployment → Re-run**, and hard-refresh the browser.

**Changing the database:** edit `supabase/setup.sql`, then run it (or just the new part) in Supabase SQL Editor. Never edit tables by hand in a way the file doesn't know about.

**Changing the résumé:** replace `assets/Prasidha-Jagtap-Resume.pdf` and keep the same file name.

---

## 12. Setting everything up from zero

1. **Website:** push this repository to GitHub, then **Settings → Pages → Deploy from a branch → `main` / root**.
2. **Supabase:**
   - create a free project
   - **SQL Editor:** run `supabase/setup.sql` (with your admin email filled in)
   - **Authentication → Users → Add user:** add the admin email
   - turn **off** “Allow new users to sign up”
   - **URL Configuration:** set the Site URL and add the admin page to Redirect URLs (see [section 5](#5-the-database-supabase))
3. **Connect the site:** put the project URL and the **anon/public** key into `site-config.js`.
4. **Admin page:** create the `prasidha_resume_page_admin` repository (public, because free GitHub Pages needs it), add its files, and enable Pages on `main`.
5. **Keep-awake (optional):** add `SUPABASE_URL` / `SUPABASE_ANON_KEY` as repository secrets. Without them, the job reads the live `site-config.js`.
6. Turn on **two-factor authentication** for GitHub and Supabase.

---

## 13. Troubleshooting

| Problem | Fix |
|---|---|
| Change not showing | Wait 2 minutes. Re-run *pages build and deployment*. Raise `?v=`. Hard-refresh. |
| Feedback question doesn't appear | It shows once per browser. Use a private window or clear `pj_fb`. It also needs `site-config.js` filled. |
| Counter shows nothing | Check `site-config.js`, then check that `setup.sql` was run. Automated browsers and the owner's own browsers are not counted on purpose. |
| Admin sign-in link “expired” | Links work once and for a short time. Ask for a new one and open it on the same device. |
| “Send enquiry” does nothing | The device has no email app. Use the Gmail / Outlook links below the button. |
| Supabase paused | Open the Supabase dashboard and restore it. Check that the keep-awake job runs (Actions tab). |
| Share preview shows an old image | Raise `og-image.jpg?v=`, then re-scrape with LinkedIn Post Inspector. |

---

## 14. Ownership marks and licence

These marks identify Prasidha Jagtap as the designer and developer:
- author / copyright / designer meta tags
- JSON-LD creator and copyright holder
- a `data-developer` mark and a source comment
- `/*!` header notices in CSS and JS
- a developer-console signature
- Author / Copyright metadata (EXIF) inside every image

**Licence:** all rights reserved. No reuse without written permission (see [`LICENSE`](LICENSE)).

**Third-party pieces:**
- **Inter typeface:** SIL Open Font License 1.1
- **Click-pointer and bookmark icon shapes:** adapted from Lucide (ISC License)
