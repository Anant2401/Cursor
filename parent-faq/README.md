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
npm run start
```

Deploy as a standalone Next app (e.g. Vercel) or adapt `next.config` for static export if you need plain HTML on the same host as the Pehchaan static site.
