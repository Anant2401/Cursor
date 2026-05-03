# Parent FAQ data

## Files

- **`faqs.json`** — **Shipped canonical** FAQ list for the static Parent’s Guide (`Tools/parents-guide/`). You may edit individual entries here for small fixes, or regenerate in bulk via the merge script when source shards exist.
- **`faq-core.json`** (optional) — Base entries `faq_001` … `faq_008`; required only if you run `merge-faqs.mjs` to rebuild from shards.
- **`gemini-code-*.json`** (optional) — Batches of additional FAQs for the same merge script.

## Merge into the web tool

From the website repo root:

```bash
node FAQDB/merge-faqs.mjs
```

This rebuilds `FAQDB/faqs.json`, copies it to `parent-faq/data/faqs.json`, applies short stat/context append rules in the script, then you run `npm run build` in `parent-faq` and copy `parent-faq/out/*` to `Tools/parents-guide/` for the static site.

The Next.js app cannot import JSON from outside its folder, so **`parent-faq/data/faqs.json` must stay a copy of the merged output.**
