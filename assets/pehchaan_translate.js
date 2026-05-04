/**
 * Google Website Translator — major Indian languages.
 * Requires a container: <div id="google_translate_element"></div> in the DOM before callback runs.
 */
(function () {
  if (window.__pehchaanGoogleTranslateLoaded) return;
  window.__pehchaanGoogleTranslateLoaded = true;

  window.googleTranslateElementInit = function () {
    if (!window.google || !google.translate || !google.translate.TranslateElement) return;
    var el = document.getElementById("google_translate_element");
    if (!el) return;
    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "hi,as,bn,gu,kn,ml,mr,ne,or,pa,ta,te,ur",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      },
      "google_translate_element"
    );
  };

  function load() {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
