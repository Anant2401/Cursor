/** Closing cards aligned with static tools (College Finder parity). */
export default function ToolClosingCards() {
  return (
    <>
      <div className="relative mt-10 overflow-hidden rounded-[22px] border-none bg-white px-[18px] pb-5 pt-[22px] shadow-[0_10px_36px_rgba(8,80,65,.1)] before:pointer-events-none before:absolute before:left-0 before:right-0 before:top-0 before:z-[1] before:h-1 before:rounded-t-[22px] before:bg-gradient-to-r before:from-[#1D9E75] before:to-[#EF9F27]">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#085041]">
          Still have questions?
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-[#64748B]">
          Did not find what you were looking for? Go to the Contact Us card on the home page and
          send your query.
        </p>
        <a
          href="/index.html#contact"
          className="mt-2.5 flex w-full items-center justify-center rounded-2xl border-none bg-gradient-to-b from-[#f0b04a] to-[#EF9F27] px-[18px] py-[15px] text-center text-[15px] font-bold text-[#085041] no-underline shadow-[0_4px_14px_rgba(239,159,39,.35)] transition hover:-translate-y-0.5"
        >
          Still have questions? Reach out to us
        </a>
      </div>

      <div className="mt-3 rounded-[14px] border border-[#C4C0F5] bg-[#F8F7FF] px-5 py-4">
        <h4 className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#4B46A0]">
          Important — please read
        </h4>
        <p className="mt-2 text-[12px] leading-relaxed text-[#64748B]">
          Answers here are for family discussion and awareness — not professional counselling or
          guarantees about marks, admissions, or jobs. Situations change; always verify important
          decisions with teachers, counsellors, and official sources.
        </p>
      </div>
    </>
  );
}
