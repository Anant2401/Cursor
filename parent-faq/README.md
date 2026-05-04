# Parent's Guide (FAQ)

Interactive FAQ for parents — React / Next.js 16, Tailwind CSS v4, [Fuse.js](https://fusejs.io/) fuzzy search.

## Run locally

```bash
cd parent-faq
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (use another port if 3000 is busy).

## FAQ data

Canonical JSON lives in **`../FAQDB/faqs.json`**. The app imports **`data/faqs.json`** (a copy inside this folder), because Next.js cannot import files outside the app root. After editing `FAQDB/faqs.json`, copy it:

```bash
copy ..\FAQDB\faqs.json .\data\faqs.json
```

(On macOS/Linux: `cp ../FAQDB/faqs.json ./data/faqs.json`.)

## Production build

```bash
npm run build
```

Output is written to **`out/`**. For the main Pehchaan static site, copy that folder into the repo’s **`../Tools/parents-guide/`** (overwrite) so URLs match `basePath: /Tools/parents-guide`. The homepage links to `Tools/parents-guide/index.html`.

Google Translate is wired via **`TranslateBootstrap`** (loads **`/assets/pehchaan_translate.js`** from the site root — same host as the main site).

## Repo-wide docs

The repository root **`README.md`** describes all tools, `DB/` JSON, scripts, and local `serve` setup. **`../sitemap.xml`** lists the homepage, every tool URL (including Financing Reality), Parent’s Guide, and PDF brochures.
