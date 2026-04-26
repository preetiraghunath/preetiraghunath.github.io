# CMS Integration — Progress & Notes

See `CMS_PLAN.md` for the full plan.

---

## Status

**Current phase:** Not started

---

## Phase 1 — Extract content into data files

- [ ] Create `src/_data/home.json` (bio, work tiles, current projects)
- [ ] Create `src/_data/research.json` (tags, publications, monographs, edited collections, current projects, editorial roles)
- [ ] Create `src/_data/consulting.json` (expertise, engagements)
- [ ] Refactor `src/index.njk` to loop over `home` data
- [ ] Refactor `src/research.njk` to loop over `research` data
- [ ] Refactor `src/consulting.njk` to loop over `consulting` data
- [ ] Verify local build output matches original site visually

## Phase 2 — Sveltia CMS admin UI

- [ ] Create `src/admin/index.html`
- [ ] Create `src/admin/config.yml` with all collections
- [ ] Add `src/admin/` to Eleventy passthrough in `.eleventy.js`
- [ ] Verify `/admin` loads correctly on local dev server

## Phase 3 — GitHub OAuth

- [ ] Create GitHub OAuth App (under Preeti's account)
- [ ] Deploy OAuth proxy (Cloudflare Worker)
- [ ] Set `base_url` and `repo` in `config.yml`
- [ ] Test login flow end-to-end

## Phase 4 — Verify CI/CD

- [ ] Confirm a CMS edit triggers GitHub Actions and deploys correctly

---

## Implementation Notes

_Notes will be added here as work progresses — gotchas, decisions made, things that deviated from the plan._

---

## Decisions Log

| Date | Decision | Reason |
|---|---|---|
| 2026-04-26 | Use Sveltia CMS over Tina CMS | Tina requires React for inline editing; Sveltia is native to Eleventy/git-based SSGs |
| 2026-04-26 | Store content as JSON in `src/_data/` | Matches Eleventy's native data cascade; CMS edits become simple JSON diffs in git |
