"use client";

import { useEffect } from "react";

/**
 * Next static export can turn next/script external URLs into preload-only links.
 * Appending the real script after mount keeps Google Translate working on /Tools/parents-guide/.
 */
export default function TranslateBootstrap() {
  useEffect(() => {
    const src = "/assets/pehchaan_translate.js";
    if (document.querySelector('script[data-pehchaan-translate="1"]')) return;
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.pehchaanTranslate = "1";
    document.body.appendChild(s);
  }, []);
  return null;
}
