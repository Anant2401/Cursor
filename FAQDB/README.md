# Parent FAQ data

## Files

- **`faq-core.json`** — Base entries `faq_001` … `faq_008` (edited here when you change the “core” parent worries).
- **`gemini-code-*.json`** — Batches of additional FAQs (same schema as core).
- **`faqs.json`** — **Generated.** Full merged list (`faq-core` + all `gemini-code-*`), sorted by id. Do not hand-edit for bulk updates; run the merge script instead.

## Merge into the web tool

From the website repo root:

```bash
node FAQDB/merge-faqs.mjs
```

This rebuilds `FAQDB/faqs.json`, copies it to `parent-faq/data/faqs.json`, applies short stat/context append rules in the script, then you run `npm run build` in `parent-faq` and copy `parent-faq/out/*` to `Tools/parents-guide/` for the static site.

The Next.js app cannot import JSON from outside its folder, so **`parent-faq/data/faqs.json` must stay a copy of the merged output.**
