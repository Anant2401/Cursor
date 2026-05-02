export type FaqItem = {
  id: string;
  category: string;
  tags: string[];
  question_en: string;
  question_hi_hinglish: string;
  answer_en: string;
  answer_hi_hinglish: string;
};

export type DisplayLang = "en" | "hinglish";
