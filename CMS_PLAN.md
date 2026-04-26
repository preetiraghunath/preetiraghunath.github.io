# CMS Integration Plan — Sveltia CMS + Eleventy

**Date:** 2026-04-26
**Goal:** Enable Preeti to edit site content (publications, consulting entries, bio) through a web UI without touching code.

---

## Why Sveltia CMS (not Tina CMS)

Tina CMS is designed for React-based frameworks. Its main selling point — inline visual editing — requires rendering React components and does not work with Nunjucks templates. On an Eleventy site, Tina would be used in its weakest mode (form-based editing only) while adding significant React-centric complexity.

Sveltia CMS is purpose-built for git-based static sites like Eleventy:
- Native Eleventy support
- Modern, polished editing UI
- GitHub OAuth authentication (free, works with GitHub Pages)
- No backend server required
- Free and open source
- Drop-in replacement for Decap/Netlify CMS

---

## Prerequisite: Content Extraction

All content is currently hardcoded inside `.njk` templates. No CMS can edit raw HTML/Nunjucks. Before Sveltia can manage content, everything must be extracted into structured data files. This is a prerequisite regardless of CMS choice.

---

## Phase 1 — Extract content into data files

Move all hardcoded content from `.njk` templates into `src/_data/`:

### Files to create

| File | Content |
|---|---|
| `src/_data/home.json` | Bio text, work tiles, current projects |
| `src/_data/research.json` | Research area tags, publications (all types), monographs, edited collections, current projects, editorial roles |
| `src/_data/consulting.json` | Expertise descriptions, past engagements |

`src/_data/site.json` already exists and covers global metadata — keep as-is.

### Template changes

Refactor each `.njk` page to loop over the data files instead of hardcoding HTML blocks:

- `src/index.njk` — loop over `home.workTiles`, `home.currentProjects`
- `src/research.njk` — loop over `research.tags`, `research.publications`, `research.monographs`, etc.
- `src/consulting.njk` — loop over `consulting.engagements`

---

## Phase 2 — Add Sveltia CMS admin UI

Add two files to `src/admin/`:

### `src/admin/index.html`

Loads the Sveltia CMS bundle from CDN. No build step needed.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Content Manager</title>
</head>
<body>
  <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
</body>
</html>
```

### `src/admin/config.yml`

Declares collections (one per content type) that map to the JSON data files from Phase 1. Each collection defines the form fields editors see in the UI: text fields, rich text, date pickers, repeating list items for publications, etc.

Collections to define:
- `home` — bio, work tiles (list), current projects (list)
- `research` — research tags (list), publications (list with type/citation fields), monographs (list), edited collections (list), editorial roles (list)
- `consulting` — expertise (list), engagements (list with name/description fields)

### Eleventy passthrough

Add `src/admin/` to Eleventy's passthrough copy in `.eleventy.js` so the admin files are copied to `_site/admin/`.

---

## Phase 3 — GitHub OAuth

Sveltia uses GitHub as the auth provider and commits CMS changes back to the repo. GitHub Pages cannot run server-side code, so OAuth needs a small proxy.

**Options:**
1. **Sveltia's managed auth** (if available on the free plan) — no setup required
2. **Cloudflare Worker** — Sveltia provides a ready-made Worker script; deploy once, set two env vars (GitHub OAuth app credentials)
3. **Netlify Function** — alternative if already using Netlify

Steps:
1. Create a GitHub OAuth App under Preeti's GitHub account (callback URL points to the proxy)
2. Deploy the OAuth proxy (Cloudflare Worker recommended — free tier is sufficient)
3. Set `base_url` in `config.yml` to the proxy URL

---

## Phase 4 — CI/CD (no changes needed)

The existing GitHub Actions workflow (`deploy.yml`) already:
- Triggers on push to `main`
- Runs `npm ci` + `eleventy`
- Deploys `_site/` to GitHub Pages

CMS edits commit to `main` → Actions triggers → site rebuilds automatically. No workflow changes needed.

---

## Effort Estimate

| Phase | Estimate |
|---|---|
| Phase 1: Extract content + refactor templates | ~3–4 hours |
| Phase 2: Admin UI + config.yml | ~1 hour |
| Phase 3: GitHub OAuth setup | ~30 minutes |
| Phase 4: CI/CD | 0 (already done) |
| **Total** | **~1 day** |

---

## Post-Integration Flow

1. Preeti visits `preetiraghunath.com/admin`
2. Logs in with GitHub
3. Edits content through forms (no code)
4. Hits Save → Sveltia commits the JSON change to `main`
5. GitHub Actions rebuilds and deploys the site automatically
