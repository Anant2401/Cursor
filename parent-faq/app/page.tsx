import ParentFAQ from "@/components/ParentFAQ";
import type { FaqItem } from "@/types/faq";
import faqData from "@/data/faqs.json";

export default function Home() {
  return <ParentFAQ items={faqData as FaqItem[]} />;
}
