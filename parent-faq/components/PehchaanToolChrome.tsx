import type { ReactNode } from "react";

/** Root-relative home link — correct from /Tools/parents-guide/ (../ would resolve to /Tools/index.html). */
export const PEHCHAAN_HOME_RELATIVE = "/index.html";

function LogoSvg() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="h-6 w-6">
      <path d="M8 22 A12 12 0 0 1 32 22 Z" fill="#EF9F27" />
      <line x1="20" y1="8" x2="20" y2="4" stroke="#EF9F27" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="27.5" y1="10" x2="30" y2="6.5" stroke="#EF9F27" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="12.5" y1="10" x2="10" y2="6.5" stroke="#EF9F27" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="32.5" y1="17" x2="36.5" y2="15" stroke="#EF9F27" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="7.5" y1="17" x2="3.5" y2="15" stroke="#EF9F27" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M6 36 L20 24 L34 36"
        stroke="#1D9E75"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 36 L20 26 L38 36"
        stroke="#1D9E75"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".45"
      />
    </svg>
  );
}

type Stat = { value: string; label: string };

export default function PehchaanToolChrome({
  heroTag,
  heroTitle,
  heroLead,
  stats,
  children,
}: {
  heroTag: string;
  heroTitle: ReactNode;
  heroLead: string;
  stats: Stat[];
  children: ReactNode;
}) {
  return (
    <div className="relative z-[1] mx-auto max-w-[700px] px-4 pb-16 pt-5">
      {/* Top bar — matches static HTML tools */}
      <div className="flex items-center gap-3 pb-[22px] pt-[14px]">
        <a
          href={PEHCHAAN_HOME_RELATIVE}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(29,158,117,.14)] text-lg font-bold leading-none text-[#085041] no-underline transition hover:bg-[rgba(29,158,117,.22)]"
          aria-label="Back to Pehchaan Careers home"
        >
          ←
        </a>
        <a
          href={PEHCHAAN_HOME_RELATIVE}
          className="flex min-w-0 flex-1 items-center gap-3 no-underline text-inherit hover:opacity-95"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#085041]">
            <LogoSvg />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-bold text-[#085041]">Pehchaan Careers</span>
            <span className="block text-[11px] text-[#64748B]">Your identity. Your path.</span>
          </span>
        </a>
      </div>

      <div className="translate-strip no-print mb-1 flex flex-wrap items-center justify-end gap-2.5 border-b border-[#D1E8DF] bg-[#f8fafc] px-3.5 py-2 text-[11px] text-[#64748B]">
        <span>Translate this page</span>
        <div id="google_translate_element" />
      </div>

      {/* Hero — teal card like other tools */}
      <div className="relative mb-4 overflow-hidden rounded-[22px] bg-[#085041] px-7 pb-8 pt-8 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-12 -top-12 h-[180px] w-[180px] rounded-full bg-white/[0.05]" />
        <div className="pointer-events-none absolute bottom-[-30px] right-[30px] h-[110px] w-[110px] rounded-full bg-[rgba(239,159,39,.12)]" />
        <div className="relative">
          <span className="mb-4 inline-block rounded-full border border-[rgba(239,159,39,.4)] bg-[rgba(239,159,39,.2)] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#EF9F27]">
            {heroTag}
          </span>
          <h1 className="text-[26px] font-bold leading-snug sm:text-[26px]">{heroTitle}</h1>
          <p className="mt-2.5 text-[13px] leading-relaxed opacity-[0.85]">{heroLead}</p>
          <div className="mt-[22px] grid grid-cols-3 gap-2.5">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/12 bg-white/10 px-2 py-3.5 text-center"
              >
                <div className="text-[22px] font-bold text-[#EF9F27]">{s.value}</div>
                <div className="mt-0.5 text-[11px] opacity-75">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {children}

      {/* Brand footer — matches HTML tools */}
      <div className="mt-14 border-t border-[#E1F5EE] pt-5 text-center">
        <div className="text-[13px] font-semibold text-[#1D9E75]">Aapki pehchaan, aapki raah.</div>
        <p className="mt-2 text-[11px] leading-relaxed text-[#64748B]">
          This tool is brought to you by <strong className="font-bold text-[#085041]">Pehchaan Careers</strong>
          <br />
          hello.pehchaan@gmail.com &nbsp;·&nbsp; buddy@pehchaancareers.in &nbsp;·&nbsp; pehchaancareers.in
        </p>
      </div>
    </div>
  );
}
