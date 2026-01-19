"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, 
  Download, 
  Copy, 
  Check, 
  X,
  ExternalLink,
} from "lucide-react";
import shareService, { 
  SharePlatform, 
  PlatformOption, 
  ShareData,
  ShareResult 
} from "@/lib/skane/shareService";

/**
 * SHARE PLATFORM SELECTOR V2.1
 * 
 * Design épuré, professionnel, B2B-ready :
 * - AUCUN émoji (sauf feedback utilisateur ailleurs)
 * - TikTok inclus avec flow guidé
 * - Ton minimaliste
 */

interface SharePlatformSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData;
  onShareComplete?: (result: ShareResult) => void;
}

// Icônes SVG pour les plateformes
const PlatformIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  share: ({ size = 24, className }) => <Share2 size={size} className={className} />,
  download: ({ size = 24, className }) => <Download size={size} className={className} />,
  copy: ({ size = 24, className }) => <Copy size={size} className={className} />,
  whatsapp: ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  instagram: ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  tiktok: ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
  twitter: ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  telegram: ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
  facebook: ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  snapchat: ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
    </svg>
  ),
};

export default function SharePlatformSelector({
  isOpen,
  onClose,
  shareData,
  onShareComplete,
}: SharePlatformSelectorProps) {
  const [platforms, setPlatforms] = useState<PlatformOption[]>([]);
  const [isSharing, setIsSharing] = useState<SharePlatform | null>(null);
  const [shareSuccess, setShareSuccess] = useState<SharePlatform | null>(null);
  const [copied, setCopied] = useState(false);
  const [manualStepMessage, setManualStepMessage] = useState<string | null>(null);

  useEffect(() => {
    setPlatforms(shareService.getAvailablePlatforms());
  }, []);

  const handleShare = async (platformOption: PlatformOption) => {
    setIsSharing(platformOption.id);
    setManualStepMessage(null);
    
    try {
      const result = await shareService.share(platformOption.id, shareData);
      
      if (result.success) {
        setShareSuccess(platformOption.id);
        
        if (platformOption.id === "copy") {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
        
        // Afficher le message pour les plateformes avec étape manuelle
        if (result.requiresManualStep && platformOption.manualStepDescription) {
          setManualStepMessage(platformOption.manualStepDescription);
        }
        
        onShareComplete?.(result);
        
        // Ne pas fermer automatiquement si étape manuelle requise
        if (!result.requiresManualStep && platformOption.id !== "copy") {
          setTimeout(() => {
            onClose();
          }, 500);
        }
      }
    } catch (error) {
      console.error("Share error:", error);
    } finally {
      setIsSharing(null);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = PlatformIcons[iconName];
    if (IconComponent) {
      return <IconComponent size={22} />;
    }
    return <Share2 size={22} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] rounded-t-2xl max-h-[85vh] overflow-hidden border-t border-white/10"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <h2 className="text-base font-medium text-white">
                Partager
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 -mr-1.5 text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message d'étape manuelle (TikTok, Snapchat) */}
            <AnimatePresence>
              {manualStepMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-5 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <ExternalLink size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-white/90">{manualStepMessage}</p>
                      <p className="text-xs text-white/50 mt-1">
                        L'application va s'ouvrir automatiquement.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Platforms Grid */}
            <div className="px-5 pb-6 grid grid-cols-4 gap-3">
              {platforms.map((platform) => {
                const isLoading = isSharing === platform.id;
                const isSuccess = shareSuccess === platform.id;
                const isCopied = platform.id === "copy" && copied;

                return (
                  <motion.button
                    key={platform.id}
                    onClick={() => handleShare(platform)}
                    disabled={isLoading}
                    className="flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all"
                    style={{
                      background: isSuccess 
                        ? "rgba(16, 185, 129, 0.15)" 
                        : "transparent",
                    }}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Icon container */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center relative transition-all"
                      style={{ 
                        backgroundColor: platform.color,
                        // Pour Snapchat (jaune), utiliser du texte noir
                        color: platform.id === "snapchat" ? "#000" : "#fff",
                      }}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : isSuccess || isCopied ? (
                        <Check size={20} />
                      ) : (
                        getIcon(platform.icon)
                      )}

                      {/* Badge recommandé (petit point) */}
                      {platform.recommended && !isSuccess && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#121212]" />
                      )}
                    </div>

                    {/* Label */}
                    <span 
                      className="text-[11px] text-white/60 text-center leading-tight font-medium"
                    >
                      {isCopied ? "Copié" : platform.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Safe area padding for iOS */}
            <div className="h-6" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
