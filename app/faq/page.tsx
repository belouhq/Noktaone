"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";
import { SafeAreaContainer } from "@/components/ui/SafeAreaContainer";
import { useTranslation } from "@/lib/hooks/useTranslation";

/**
 * FAQ PAGE - Nokta One
 * 
 * Design : Accordéon minimaliste, fond noir, texte blanc
 * Accessible depuis : Settings > FAQ
 * Route : /faq
 * 
 * Contenu neuro-optimisé pour :
 * - Reconnaissance immédiate ("ça parle de moi")
 * - Positionnement performance-first
 * - Neutre, non médical, universel
 */

interface FAQItem {
  id: string;
  questionKey: string;
  answerKey: string;
  // Fallback EN pour le dev
  questionFallback: string;
  answerFallback: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "what-is-nokta",
    questionKey: "faq.whatIsNokta.question",
    answerKey: "faq.whatIsNokta.answer",
    questionFallback: "What is Nokta One, exactly?",
    answerFallback: "Nokta One is a body and nervous system reset technology. In seconds, it identifies when your body is \"off\" and offers a simple micro-action to return to a functional, clear, and high-performing state.\n\nIt's not meditation, therapy, or medical monitoring.\nIt's an immediate adjustment tool, usable in real life.",
  },
  {
    id: "when-useful",
    questionKey: "faq.whenUseful.question",
    answerKey: "faq.whenUseful.answer",
    questionFallback: "When is Nokta One useful?",
    answerFallback: "Nokta One is designed for moments when you think:\n\n• \"I don't feel right, but I don't know why\"\n• \"I'm tense for no clear reason\"\n• \"I can't focus\"\n• \"My body is tired, but my mind wants to keep going\"\n• \"I'm not at my best\"\n\nThese moments happen before important meetings, after mental overload, between demanding tasks, before sports or competition, at the end of the day when your body gives up, or in the morning when energy isn't there.\n\nNokta One is designed for these daily micro-imbalances, not medical situations.",
  },
  {
    id: "why-off-but-ok",
    questionKey: "faq.whyOffButOk.question",
    answerKey: "faq.whyOffButOk.answer",
    questionFallback: "Why do I sometimes feel \"fine\" but not function properly?",
    answerFallback: "Because your body and nervous system can be desynchronized.\n\nYou can:\n• Have a good heart rate but feel oppressed\n• Be mentally calm but physically agitated\n• Be motivated but unable to get started\n\nNokta One is based on the principle that body sensation precedes mental performance.",
  },
  {
    id: "different-from-others",
    questionKey: "faq.differentFromOthers.question",
    answerKey: "faq.differentFromOthers.answer",
    questionFallback: "How is Nokta One different from classic wellness apps?",
    answerFallback: "Most apps ask you to:\n• Understand what you're feeling\n• Choose a practice\n• Commit to a long time\n\nNokta One does the opposite:\n• It starts from the body signal, not your analysis\n• It reduces choice to one single action\n• It acts in less than 30 seconds\n\nLess thinking, less friction, more impact.",
  },
  {
    id: "analyze-emotions",
    questionKey: "faq.analyzeEmotions.question",
    answerKey: "faq.analyzeEmotions.answer",
    questionFallback: "Does Nokta One \"analyze\" my emotions?",
    answerFallback: "Nokta One doesn't judge you and makes no diagnosis.\n\nIt only observes neutral body indicators (posture, tension, visible micro-signals) to estimate a global functional state.\n\nThe goal isn't to tell you \"what you're feeling\", but to detect when your body isn't aligned with what you want to do.",
  },
  {
    id: "replace-professional",
    questionKey: "faq.replaceProfessional.question",
    answerKey: "faq.replaceProfessional.answer",
    questionFallback: "Does Nokta One replace a healthcare professional?",
    answerFallback: "No.\n\nNokta One is a daily regulation tool, not a medical device. It treats no pathology, makes no therapeutic promises, and never replaces medical advice.\n\nIt's designed for functional, active, demanding people who want to stay high-performing without waiting to feel bad.",
  },
  {
    id: "why-body-not-mind",
    questionKey: "faq.whyBodyNotMind.question",
    answerKey: "faq.whyBodyNotMind.answer",
    questionFallback: "Why act on the body rather than the mind?",
    answerFallback: "Because in most cases:\n• The mind follows the body\n• Clarity comes after regulation\n• Performance returns when the nervous system is stable\n\nA well-targeted physical micro-action can produce an immediate effect, where a mental approach takes more time.",
  },
  {
    id: "how-often",
    questionKey: "faq.howOften.question",
    answerKey: "faq.howOften.answer",
    questionFallback: "How often should I use Nokta One?",
    answerFallback: "Nokta One imposes no rhythm.\n\nSome use it:\n• 1-2 times a day as a quick check\n• Before a key moment\n• Only when \"something feels off\"\n\nThe goal isn't dependence, but autonomy.",
  },
  {
    id: "for-athletes-only",
    questionKey: "faq.forAthletesOnly.question",
    answerKey: "faq.forAthletesOnly.answer",
    questionFallback: "Is Nokta One only for athletes or entrepreneurs?",
    answerFallback: "No, but it's particularly useful for people seeking:\n• Clarity\n• Consistency\n• Sustainable performance\n\nThe launch targets the US market, very oriented toward performance, optimization, and efficiency, but Nokta One is designed for all cultures, all ages, and all lifestyles.",
  },
  {
    id: "dont-believe-breathing",
    questionKey: "faq.dontBelieveBreathing.question",
    answerKey: "faq.dontBelieveBreathing.answer",
    questionFallback: "Does it work even if I don't believe in \"breathing techniques\"?",
    answerFallback: "Yes, because Nokta One doesn't rely on belief.\n\nThe proposed micro-actions are:\n• Simple\n• Short\n• Based on known physiological mechanisms\n\nYou don't need to \"believe\" anything.\nYou do the action, you observe the effect.",
  },
  {
    id: "why-so-short",
    questionKey: "faq.whySoShort.question",
    answerKey: "faq.whySoShort.answer",
    questionFallback: "Why such short actions?",
    answerFallback: "Because the nervous system often responds better to:\n• Clear signals\n• Brief stimulations\n• Sharp interruptions of the previous state\n\n30 well-targeted seconds can be more effective than 10 poorly engaged minutes.",
  },
  {
    id: "data-privacy",
    questionKey: "faq.dataPrivacy.question",
    answerKey: "faq.dataPrivacy.answer",
    questionFallback: "Does Nokta One collect sensitive personal data?",
    answerFallback: "Nokta One applies a maximum data sobriety logic.\n\n• No medical exploitation\n• No data resale\n• No intrusive interpretation\n\nInformation only serves to improve the user experience.",
  },
  {
    id: "all-languages",
    questionKey: "faq.allLanguages.question",
    answerKey: "faq.allLanguages.answer",
    questionFallback: "Does Nokta One work in all languages?",
    answerFallback: "Yes.\nNokta One launches in 12 languages, with particular attention to universal sensation, not complex vocabulary.\n\nThe body speaks the same language everywhere.",
  },
  {
    id: "who-is-it-for",
    questionKey: "faq.whoIsItFor.question",
    answerKey: "faq.whoIsItFor.answer",
    questionFallback: "Who is Nokta One really for?",
    answerFallback: "For those who:\n• Want to stay functional without over-analyzing\n• Sense when something \"slips\" but don't want to dramatize\n• Seek a simple, fast, discreet tool\n• Want to perform without exhausting themselves\n\nNokta One isn't here to change you.\nIt's here to help you return to your normal state.",
  },
  {
    id: "why-now",
    questionKey: "faq.whyNow.question",
    answerKey: "faq.whyNow.answer",
    questionFallback: "Why now?",
    answerFallback: "Because the world moves fast, pressure is real, and many people function in degraded mode without realizing it.\n\nNokta One answers a modern need:\nRecalibrate quickly, without stopping to live.",
  },
];

export default function FAQPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
  };

  return (
    <SafeAreaContainer currentPage="settings">
      <main className="relative min-h-screen-safe bg-nokta-one-black">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-nokta-one-black/90 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center justify-between px-4 py-4">
            <motion.button
              onClick={() => router.back()}
              className="p-2 -ml-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={24} className="text-nokta-one-white" />
            </motion.button>
            
            <h1 className="text-lg font-semibold text-nokta-one-white">
              {getTranslation("faq.title", "FAQ")}
            </h1>
            
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Intro */}
        <div className="px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <HelpCircle size={24} className="text-nokta-one-blue" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-nokta-one-white">
                {getTranslation("faq.subtitle", "Questions fréquentes")}
              </h2>
              <p className="text-sm text-gray-400">
                {getTranslation("faq.subtitleDesc", "Tout ce que tu dois savoir sur Nokta")}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="px-4 pb-32">
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <FAQAccordionItem
                  question={getTranslation(item.questionKey, item.questionFallback)}
                  answer={getTranslation(item.answerKey, item.answerFallback)}
                  isOpen={openItems.has(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer - Contact */}
        <div className="fixed bottom-20 left-0 right-0 px-6 py-4 bg-gradient-to-t from-nokta-one-black via-nokta-one-black to-transparent">
          <p className="text-center text-sm text-gray-500">
            {getTranslation("faq.moreQuestions", "D'autres questions ?")}
            {" "}
            <button 
              onClick={() => router.push("/settings")}
              className="text-nokta-one-blue underline"
            >
              {getTranslation("faq.contactUs", "Contacte-nous")}
            </button>
          </p>
        </div>
      </main>
    </SafeAreaContainer>
  );
}

// Composant Accordéon
interface FAQAccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQAccordionItem({ question, answer, isOpen, onToggle }: FAQAccordionItemProps) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: isOpen 
          ? "rgba(59, 130, 246, 0.08)" 
          : "rgba(255, 255, 255, 0.03)",
        border: isOpen 
          ? "1px solid rgba(59, 130, 246, 0.2)" 
          : "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
        whileTap={{ scale: 0.99 }}
      >
        <span className="text-nokta-one-white font-medium pr-4 text-[15px] leading-snug">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown 
            size={20} 
            className={isOpen ? "text-nokta-one-blue" : "text-gray-400"} 
          />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">
              <div 
                className="text-gray-300 text-sm leading-relaxed whitespace-pre-line"
                style={{ lineHeight: 1.7 }}
              >
                {answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
