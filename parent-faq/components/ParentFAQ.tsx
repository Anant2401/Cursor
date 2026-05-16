"use client";

import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import type { DisplayLang, FaqItem } from "@/types/faq";
import PehchaanToolChrome from "@/components/PehchaanToolChrome";
import ToolClosingCards from "@/components/ToolClosingCards";

const CONTACT_HREF = "https://pehchaancareers.in/#contact";

function getCategoriesInOrder(items: FaqItem[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const it of items) {
    if (!seen.has(it.category)) {
      seen.add(it.category);
      out.push(it.category);
    }
  }
  return out;
}

function groupByCategory(items: FaqItem[]): Map<string, FaqItem[]> {
  const map = new Map<string, FaqItem[]>();
  for (const it of items) {
    const list = map.get(it.category) ?? [];
    list.push(it);
    map.set(it.category, list);
  }
  return map;
}

export default function ParentFAQ({ items }: { items: FaqItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [lang, setLang] = useState<DisplayLang>("en");
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = useMemo(() => getCategoriesInOrder(items), [items]);

  const baseItems = useMemo(() => {
    if (category === "All") return items;
    return items.filter((i) => i.category === category);
  }, [items, category]);

  const fuse = useMemo(
    () =>
      new Fuse(baseItems, {
        keys: [
          { name: "tags", weight: 0.5 },
          { name: "question_hi_hinglish", weight: 0.3 },
          { name: "question_en", weight: 0.2 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
        minMatchCharLength: 1,
        includeScore: true,
      }),
    [baseItems]
  );

  const searchActive = query.trim().length > 0;

  const displayItems: FaqItem[] = useMemo(() => {
    if (!searchActive) return baseItems;
    return fuse.search(query.trim()).map((r) => r.item);
  }, [searchActive, baseItems, fuse, query]);

  const grouped = useMemo(() => {
    if (searchActive) return null;
    return groupByCategory(displayItems);
  }, [searchActive, displayItems]);

  const noResults = searchActive && displayItems.length === 0;

  const qText = (item: FaqItem) =>
    lang === "hinglish" ? item.question_hi_hinglish : item.question_en;
  const aText = (item: FaqItem) =>
    lang === "hinglish" ? item.answer_hi_hinglish : item.answer_en;

  const toggleOpen = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const stats = [
    { value: String(items.length), label: "Topics" },
    { value: String(categories.length), label: "Categories" },
    { value: "100%", label: "Free" },
  ];

  return (
    <PehchaanToolChrome
      heroTag="Parent's Guide"
      heroTitle={
        <>
          Clear answers on careers, marks &{" "}
          <span className="text-[#EF9F27]">peace of mind</span>
        </>
      }
      heroLead="Built for parents in Tier 2 and Tier 3 cities — search your worry in English or Hinglish, browse by topic, and open honest answers without jargon."
      stats={stats}
    >
      {/* Language toggle */}
      <div className="mb-6 flex justify-end">
        <div className="flex items-center gap-2 rounded-full border border-[#D1E8DF] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
              lang === "en"
                ? "bg-[#085041] text-[#EF9F27]"
                : "text-[#64748B] hover:text-[#085041]"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("hinglish")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
              lang === "hinglish"
                ? "bg-[#085041] text-[#EF9F27]"
                : "text-[#64748B] hover:text-[#085041]"
            }`}
          >
            Hinglish (हिंदी)
          </button>
        </div>
      </div>

      <label className="block">
        <span className="sr-only">Search questions</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search your worry (e.g., marks, govt jobs, arts scope)...'
          className="min-h-[52px] w-full rounded-xl border-2 border-[#D1E8DF] bg-white px-4 py-3.5 text-base text-[#1A1A2E] shadow-sm outline-none ring-[#1D9E75]/20 transition placeholder:text-[#94a3b8] focus:border-[#1D9E75] focus:ring-4"
          autoComplete="off"
          enterKeyHint="search"
        />
      </label>

      <div className="mt-4 -mx-1 overflow-x-auto pb-2">
        <div className="flex min-w-0 gap-2 px-1">
          {["All", ...categories].map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setOpenId(null);
                }}
                className={`min-h-[44px] shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition sm:min-h-0 ${
                  active
                    ? "border-[#085041] bg-[#085041] text-[#EF9F27] shadow-md"
                    : "border-[#D1E8DF] bg-white text-[#085041] hover:border-[#1D9E75]/50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {noResults && (
          <div className="rounded-xl border border-[#F5C878] bg-[#FAEEDA] px-4 py-6 text-center shadow-sm">
            <p className="text-[15px] font-semibold text-[#5A3200]">
              We couldn&apos;t find an answer to that. Ask our founder directly!
            </p>
            <a
              href={CONTACT_HREF}
              className="mt-3 inline-block font-bold text-[#085041] underline decoration-2 underline-offset-2 hover:text-[#1D9E75]"
            >
              Contact us — Reach Out
            </a>
          </div>
        )}

        {!noResults && searchActive && (
          <ul className="space-y-3">
            {displayItems.map((item) => (
              <FaqCard
                key={item.id}
                item={item}
                qText={qText(item)}
                aText={aText(item)}
                expanded={openId === item.id}
                onToggle={() => toggleOpen(item.id)}
              />
            ))}
          </ul>
        )}

        {!noResults && !searchActive && grouped && (
          <>
            {categories
              .filter((c) => category === "All" || c === category)
              .map((cat) => {
                const list = grouped.get(cat);
                if (!list?.length) return null;
                return (
                  <section key={cat}>
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#085041]">
                      {cat}
                    </h2>
                    <ul className="space-y-3">
                      {list.map((item) => (
                        <FaqCard
                          key={item.id}
                          item={item}
                          qText={qText(item)}
                          aText={aText(item)}
                          expanded={openId === item.id}
                          onToggle={() => toggleOpen(item.id)}
                        />
                      ))}
                    </ul>
                  </section>
                );
              })}
          </>
        )}
      </div>

      <ToolClosingCards />
    </PehchaanToolChrome>
  );
}

function FaqCard({
  item,
  expanded,
  onToggle,
  qText,
  aText,
}: {
  item: FaqItem;
  expanded: boolean;
  onToggle: () => void;
  qText: string;
  aText: string;
}) {
  return (
    <li>
      <div
        className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${
          expanded ? "border-[#1D9E75]/40 ring-2 ring-[#1D9E75]/15" : "border-[#D1E8DF]"
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex min-h-[56px] w-full items-start gap-3 px-4 py-4 text-left"
          aria-expanded={expanded}
        >
          <span
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              expanded ? "bg-[#1D9E75] text-white" : "bg-[#E1F5EE] text-[#085041]"
            }`}
            aria-hidden
          >
            {expanded ? "−" : "+"}
          </span>
          <span className="text-[15px] font-semibold leading-snug text-[#1A1A2E]">{qText}</span>
        </button>
        {expanded && (
          <div className="border-t border-[#E1F5EE] bg-[#F8FAFC] px-4 py-4">
            <p className="text-sm leading-relaxed text-[#475569]">{aText}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-[#E1F5EE] px-2 py-0.5 text-[11px] font-medium text-[#085041]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
