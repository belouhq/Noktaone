"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, ChevronRight, BookOpen, Scan, Clock, Zap, Brain, Target, Shield, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import dictionaryData from "@/lib/nokta-dictionary.json";
import Logo from "@/components/Logo";

/**
 * NOKTA DICTIONARY COMPONENT
 * 
 * Glossaire interactif des termes Nokta.
 * Utilise les données de nokta-dictionary.json et s'adapte à la langue actuelle.
 */

interface DictionaryEntry {
  term: string;
  phonetic: string;
  type: string;
  definition: string;
  examples: string[];
  color?: string;
  neverTranslate?: boolean;
}

// Mapping des couleurs pour chaque terme
const TERM_COLORS: Record<string, string> = {
  skane: "#10B981",
  skane_index: "#3B82F6",
  body_reset: "#8B5CF6",
  micro_action: "#F59E0B",
  signal: "#EF4444",
};

// Mapping des types pour chaque terme
const TERM_TYPES: Record<string, string> = {
  skane: "verb & noun",
  skane_index: "noun",
  body_reset: "noun",
  micro_action: "noun",
  signal: "noun",
};

interface NoktaDictionaryProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: "modal" | "inline";
}

export default function NoktaDictionary({ 
  isOpen, 
  onClose, 
  variant = "modal" 
}: NoktaDictionaryProps) {
  const { currentLanguage } = useTranslation();
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Convertir la locale i18n vers le format du dictionnaire
  const locale = useMemo(() => {
    const localeMap: Record<string, string> = {
      'fr': 'fr',
      'en': 'en',
      'es': 'es',
      'de': 'de',
      'ja': 'ja',
      'pt': 'pt',
      'it': 'it',
      'hi': 'hi',
      'id': 'id',
      'ko': 'ko',
      'zh': 'zh',
      'ar': 'ar',
    };
    return localeMap[currentLanguage] || 'en';
  }, [currentLanguage]);

  // Construire les entrées du dictionnaire depuis le JSON
  const dictionaryEntries = useMemo<DictionaryEntry[]>(() => {
    const entries: DictionaryEntry[] = [];
    const dict = dictionaryData.dictionary as any;

    for (const [key, data] of Object.entries(dict)) {
      const entry = data as any;
      const definition = entry.definitions?.[locale] || entry.definitions?.en || '';
      const examples = entry.examples?.[locale] || entry.examples?.en || [];

      entries.push({
        term: entry.term,
        phonetic: entry.phonetic,
        type: TERM_TYPES[key] || entry.type || 'noun',
        definition,
        examples: Array.isArray(examples) ? examples : [],
        color: TERM_COLORS[key],
        neverTranslate: entry.neverTranslate || false,
      });
    }

    return entries;
  }, [locale]);

  const handlePlayPronunciation = (term: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(term.toLowerCase());
      utterance.lang = locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-US';
      utterance.rate = 0.8;
      utterance.onstart = () => setPlayingAudio(term);
      utterance.onend = () => setPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fonction pour formater une phrase avec des icônes
  const formatSentenceWithIcons = (sentence: string, color: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Patterns avec leurs icônes et couleurs
    const iconPatterns = [
      { 
        regex: /468\s*(landmarks?|points?|ランドマーク|点|نقاط)/gi, 
        icon: Scan, 
        color: "#3B82F6",
        size: 16
      },
      { 
        regex: /(20|30)\s*[-–]\s*(20|30)\s*(secondes?|seconds?|segundos?|秒|초)/gi, 
        icon: Clock, 
        color: "#F59E0B",
        size: 16
      },
      { 
        regex: /(moins de|less than|menos de|unter|未満)\s*30\s*(secondes?|seconds?|segundos?|秒|초)/gi, 
        icon: Clock, 
        color: "#F59E0B",
        size: 16
      },
      { 
        regex: /(1\s*000\+|1000\+|plus de 1\s*000|más de 1\s*000|über 1\s*000|1000以上)\s*(études?|studies?|estudios?|Studien?|研究)/gi, 
        icon: Brain, 
        color: "#8B5CF6",
        size: 16
      },
      { 
        regex: /(non médical|non-medical|no médico|nicht medizinisch|非医学|非医療)/gi, 
        icon: Shield, 
        color: "#10B981",
        size: 16
      },
      { 
        regex: /(immédiat|immediate|inmediato|sofort|即座|즉각)/gi, 
        icon: Zap, 
        color: "#EF4444",
        size: 16
      },
    ];

    // Trouver tous les matches
    const matches: Array<{ start: number; end: number; icon: any; color: string; size: number; text: string }> = [];
    
    iconPatterns.forEach(({ regex, icon, color, size }) => {
      const regexCopy = new RegExp(regex.source, regex.flags);
      let match;
      while ((match = regexCopy.exec(sentence)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          icon,
          color,
          size,
          text: match[0]
        });
      }
    });

    // Trier par position
    matches.sort((a, b) => a.start - b.start);

    // Construire les éléments
    matches.forEach((match, idx) => {
      // Ajouter le texte avant le match
      if (match.start > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>{sentence.substring(lastIndex, match.start)}</span>
        );
      }

      // Ajouter l'icône et le texte du match
      const IconComponent = match.icon;
      elements.push(
        <span 
          key={`icon-${idx}`} 
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md"
          style={{
            background: `${match.color}15`,
            border: `1px solid ${match.color}30`
          }}
        >
          <IconComponent size={match.size} style={{ color: match.color }} />
          <span style={{ color: match.color }} className="font-medium">
            {match.text}
          </span>
        </span>
      );

      lastIndex = match.end;
    });

    // Ajouter le texte restant
    if (lastIndex < sentence.length) {
      elements.push(
        <span key="text-end">{sentence.substring(lastIndex)}</span>
      );
    }

    return elements.length > 0 ? elements : [<span key="default">{sentence}</span>];
  };

  // Fonction pour formater les définitions avec icônes et espacement
  const formatDefinition = (definition: string, color: string) => {
    // Détecter les éléments clés et les remplacer par des versions formatées
    const parts: React.ReactNode[] = [];
    let remainingText = definition;
    
    // Diviser le texte en phrases pour un meilleur espacement
    const sentences = remainingText.split(/(?<=[.!?])\s+/).filter(s => s.trim());
    
    return (
      <div className="space-y-3">
        {sentences.map((sentence, idx) => {
          // Si c'est une phrase numérotée (1), (2), (3), la formater spécialement
          const numberedMatch = sentence.match(/^\((\d+)\)\s*(.+)/);
          if (numberedMatch) {
            const [, number, content] = numberedMatch;
            return (
              <div key={idx} className="flex items-start gap-3">
                <div 
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${color}40, ${color}20)`,
                    color: color,
                    border: `1px solid ${color}60`
                  }}
                >
                  {number}
                </div>
                <p className="text-white/80 text-sm leading-relaxed flex-1">
                  {formatSentenceWithIcons(content, color)}
                </p>
              </div>
            );
          }
          
          return (
            <p key={idx} className="text-white/80 text-sm leading-relaxed">
              {formatSentenceWithIcons(sentence, color)}
            </p>
          );
        })}
      </div>
    );
  };

  const content = (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header - seulement en mode modal */}
      {variant === "modal" && (
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)",
                border: "1px solid rgba(16, 185, 129, 0.3)"
              }}
            >
              <BookOpen size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nokta Dictionary</h2>
              <p className="text-white/40 text-sm">The language of body reset</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>
      )}

      {/* Dictionary entries - scrollable */}
      <div className={`flex-1 overflow-y-auto ${variant === "inline" ? "p-6 pt-4" : "p-6"} space-y-4`}>
        {dictionaryEntries.map((entry, index) => (
          <motion.div
            key={entry.term}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              onClick={() => setExpandedTerm(
                expandedTerm === entry.term ? null : entry.term
              )}
              className="w-full text-left cursor-pointer"
            >
              <div 
                className="p-4 rounded-2xl transition-all"
                style={{
                  background: expandedTerm === entry.term 
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${expandedTerm === entry.term 
                    ? entry.color + "40" 
                    : "rgba(255, 255, 255, 0.08)"}`,
                }}
              >
                {/* Term header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 
                        className="text-lg font-bold"
                        style={{ color: entry.color || "#FFFFFF" }}
                      >
                        {entry.term}
                      </h3>
                      {entry.neverTranslate && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/50">
                          Never translate
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-sm font-mono">
                        {entry.phonetic}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPronunciation(entry.term);
                        }}
                        className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <Volume2 
                          size={12} 
                          className={playingAudio === entry.term 
                            ? "text-emerald-400" 
                            : "text-white/40"
                          } 
                        />
                      </button>
                      <span className="text-white/30 text-xs italic">
                        {entry.type}
                      </span>
                    </div>
                  </div>
                  <ChevronRight 
                    size={20} 
                    className={`text-white/30 transition-transform ${
                      expandedTerm === entry.term ? "rotate-90" : ""
                    }`}
                  />
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {expandedTerm === entry.term && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-white/10">
                        <div className="mb-6">
                          {formatDefinition(entry.definition, entry.color || "#FFFFFF")}
                        </div>
                        
                        {entry.examples.length > 0 && (
                          <div className="space-y-3 mt-6 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles size={14} className="text-white/40" />
                              <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">
                                Examples
                              </p>
                            </div>
                            <div className="space-y-2">
                              {entry.examples.map((example, i) => (
                                <div 
                                  key={i}
                                  className="flex items-start gap-2 pl-3 border-l-2 py-1"
                                  style={{ borderColor: entry.color + "40" }}
                                >
                                  <span 
                                    className="text-xs mt-0.5"
                                    style={{ color: entry.color + "80" }}
                                  >
                                    "
                                  </span>
                                  <p 
                                    className="text-white/70 text-sm italic flex-1"
                                  >
                                    {example.replace(/^"|"$/g, '')}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer fixe en bas - toujours visible */}
      <div className="flex-shrink-0 p-6 pt-4 border-t border-white/10 bg-zinc-900">
        <p className="text-white/30 text-xs text-center">
          Nokta creates new words for new experiences.
          <br />
          <span className="text-white/20">No diagnosis. Just action.</span>
        </p>
      </div>
    </div>
  );

  if (variant === "inline") {
    return content;
  }

  // Modal variant
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Content */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-zinc-900 rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{ maxHeight: "85vh" }}
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook pour accéder au dictionnaire depuis n'importe où
 */
export function useNoktaDictionary() {
  const [isOpen, setIsOpen] = useState(false);
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
    Dictionary: () => (
      <NoktaDictionary isOpen={isOpen} onClose={() => setIsOpen(false)} />
    ),
  };
}

/**
 * Tooltip contextuel pour les termes Nokta
 */
interface TermTooltipProps {
  term: keyof typeof TERM_DEFINITIONS;
  children: React.ReactNode;
  showOnce?: boolean;
}

const TERM_DEFINITIONS: Record<string, string> = {
  skane: "A 30-second body reset",
  "skane index": "Your activation score (0-100)",
  "micro-action": "Guided exercise selected by AI",
  signal: "Body reading detected by AI",
  reset: "Return to balance",
};

export function TermTooltip({ term, children, showOnce = false }: TermTooltipProps) {
  const [hasShown, setHasShown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const storageKey = `nokta_tooltip_${term}`;
  
  const shouldShow = () => {
    if (!showOnce) return true;
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(storageKey);
  };

  const handleFirstShow = () => {
    if (showOnce && !hasShown) {
      localStorage.setItem(storageKey, "true");
      setHasShown(true);
    }
    setIsVisible(true);
  };

  const definition = TERM_DEFINITIONS[term.toLowerCase()];
  if (!definition) return <>{children}</>;

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={handleFirstShow}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={handleFirstShow}
    >
      {children}
      <AnimatePresence>
        {isVisible && shouldShow() && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-zinc-800 text-white text-xs whitespace-nowrap z-50"
          >
            {definition}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
