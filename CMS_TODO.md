# CMS Integration — Progress & Notes

See `CMS_PLAN.md` for the full plan.

---

## Status

**Current phase:** Phase 2 — Sveltia CMS admin UI

---

## Phase 1 — Extract content into data files ✓

- [x] Create `src/_data/home.json` (bio, work tiles, current projects)
- [x] Create `src/_data/research.json` (tags, publications, monographs, edited collections, current projects, editorial roles)
- [x] Create `src/_data/consulting.json` (expertise, engagements)
- [x] Refactor `src/index.njk` to loop over `home` data
- [x] Refactor `src/research.njk` to loop over `research` data
- [x] Refactor `src/consulting.njk` to loop over `consulting` data
- [x] Verify local build output matches original site visually

## Phase 2 — Sveltia CMS admin UI ✓

- [x] Create `src/admin/index.html`
- [x] Create `src/admin/config.yml` with all collections
- [x] Add `src/admin/` to Eleventy passthrough in `.eleventy.js`
- [ ] Verify `/admin` loads correctly on local dev server (requires OAuth — test after Phase 3)

## Phase 3 — GitHub OAuth ✓

- [x] Create GitHub OAuth App (under Preeti's account, callback URL pointing to Netlify function)
- [x] Deploy `sveltia-cms-auth` to Netlify (https://adorable-chaja-049ad2.netlify.app)
- [x] Set `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` as Netlify env vars
- [x] Set `base_url` in `config.yml` to the Netlify OAuth proxy URL
- [ ] Test login flow end-to-end at preetiraghunath.com/admin after deploy

## Phase 4 — Verify CI/CD

- [ ] Confirm a CMS edit triggers GitHub Actions and deploys correctly

---

## Implementation Notes

**Phase 2 (2026-04-26):** `src/admin` is excluded from Eleventy template processing via `eleventyConfig.ignores.add("src/admin/**")` and copied raw via `addPassthroughCopy`. Without the ignore, Eleventy would also try to process `admin/index.html` as a Nunjucks template (since `html` is in templateFormats), which would conflict with the passthrough copy. The `config.yml` has a placeholder `base_url` that must be replaced with the Netlify OAuth proxy URL in Phase 3.

**Phase 1 (2026-04-26):** Rich text fields (bio paragraphs, publication citations) use a custom `md` Nunjucks filter backed by `markdown-it`. Stored as inline Markdown strings in JSON; rendered with `{{ value | md | safe }}`. Bio is split into an array of paragraph strings so each renders as a separate `<p>`. Plain text fields (titles, meta, descriptions) use default Nunjucks auto-escaping — no filter needed. Added `markdown-it` as a direct devDependency (was previously only a transitive dep via Eleventy).

---

## Decisions Log

| Date | Decision | Reason |
|---|---|---|
| 2026-04-26 | Use Sveltia CMS over Tina CMS | Tina requires React for inline editing; Sveltia is native to Eleventy/git-based SSGs |
| 2026-04-26 | Store content as JSON in `src/_data/` | Matches Eleventy's native data cascade; CMS edits become simple JSON diffs in git |
| 2026-04-26 | Use Netlify for OAuth proxy (not Cloudflare) | Preeti already has a Netlify account |
