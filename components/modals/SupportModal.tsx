'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  username?: string;
  userId?: string;
}

const CATEGORIES = [
  { id: 'bug', emoji: '🐛' },
  { id: 'account', emoji: '👤' },
  { id: 'billing', emoji: '💳' },
  { id: 'feature', emoji: '💡' },
  { id: 'other', emoji: '❓' },
];

type ModalState = 'form' | 'sending' | 'success' | 'error';

export function SupportModal({ isOpen, onClose, userEmail = '', username = '', userId = '' }: SupportModalProps) {
  const { t } = useTranslation();
  
  const [state, setState] = useState<ModalState>('form');
  const [ticketId, setTicketId] = useState('');
  
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(userEmail);
  
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Mettre à jour l'email quand userEmail change
  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!category) newErrors.category = true;
    if (!subject.trim()) newErrors.subject = true;
    if (!message.trim()) newErrors.message = true;
    if (!email.trim() || !email.includes('@')) newErrors.email = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setState('sending');

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: t(`support.categories.${category}` as any),
          subject,
          message,
          email,
          userId,
          username,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTicketId(data.ticketId);
        setState('success');
      } else {
        setState('error');
      }
    } catch (error) {
      console.error('Support error:', error);
      setState('error');
    }
  };

  const handleClose = () => {
    // Reset form
    setState('form');
    setCategory('');
    setSubject('');
    setMessage('');
    setErrors({});
    setTicketId('');
    setShowCategoryDropdown(false);
    onClose();
  };

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    if (showCategoryDropdown) {
      const handleClickOutside = () => {
        setShowCategoryDropdown(false);
      };
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showCategoryDropdown]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-zinc-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-nokta-one-white">
              {t('support.createTicket')}
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-nokta-one-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            
            {/* FORMULAIRE */}
            {state === 'form' && (
              <div className="space-y-5">
                
                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('support.category')} *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCategoryDropdown(!showCategoryDropdown);
                      }}
                      className={`w-full p-4 bg-white/5 rounded-xl text-left flex items-center justify-between transition-colors ${
                        errors.category ? 'border border-red-500' : 'border border-transparent hover:bg-white/10'
                      }`}
                    >
                      <span className={category ? 'text-nokta-one-white' : 'text-gray-500'}>
                        {category ? t(`support.categories.${category}` as any) : t('support.selectCategory')}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showCategoryDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 rounded-xl border border-white/10 overflow-hidden z-10 shadow-xl">
                        {CATEGORIES.map(({ id, emoji }) => (
                          <button
                            key={id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategory(id);
                              setShowCategoryDropdown(false);
                              setErrors({ ...errors, category: false });
                            }}
                            className="w-full p-4 text-left hover:bg-white/10 text-nokta-one-white flex items-center gap-2"
                          >
                            <span>{emoji}</span>
                            <span>{t(`support.categories.${id}` as any)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('support.email')} *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({ ...errors, email: false });
                    }}
                    placeholder={t('support.emailPlaceholder')}
                    className={`w-full p-4 bg-white/5 rounded-xl text-nokta-one-white placeholder-gray-500 outline-none transition-colors ${
                      errors.email ? 'border border-red-500' : 'border border-transparent focus:border-nokta-one-blue'
                    }`}
                  />
                </div>

                {/* Sujet */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('support.subject')} *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setErrors({ ...errors, subject: false });
                    }}
                    placeholder={t('support.subjectPlaceholder')}
                    className={`w-full p-4 bg-white/5 rounded-xl text-nokta-one-white placeholder-gray-500 outline-none transition-colors ${
                      errors.subject ? 'border border-red-500' : 'border border-transparent focus:border-nokta-one-blue'
                    }`}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('support.message')} *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setErrors({ ...errors, message: false });
                    }}
                    placeholder={t('support.messagePlaceholder')}
                    rows={5}
                    className={`w-full p-4 bg-white/5 rounded-xl text-nokta-one-white placeholder-gray-500 outline-none resize-none transition-colors ${
                      errors.message ? 'border border-red-500' : 'border border-transparent focus:border-nokta-one-blue'
                    }`}
                  />
                </div>

              </div>
            )}

            {/* ENVOI EN COURS */}
            {state === 'sending' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-nokta-one-blue border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400">{t('support.sending')}</p>
              </div>
            )}

            {/* SUCCÈS */}
            {state === 'success' && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-nokta-one-white mb-2">
                  {t('support.success')}
                </h3>
                <p className="text-gray-400 mb-6">
                  {t('support.successMessage')}
                </p>
                <div className="bg-white/5 rounded-xl p-4 w-full">
                  <p className="text-sm text-gray-400 mb-1">{t('support.ticketId')}</p>
                  <p className="text-lg font-mono text-nokta-one-blue">{ticketId}</p>
                </div>
              </div>
            )}

            {/* ERREUR */}
            {state === 'error' && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-nokta-one-white mb-2">
                  {t('support.error')}
                </h3>
                <p className="text-gray-400 mb-4">
                  {t('support.errorMessage')}
                </p>
                <a 
                  href="mailto:support@noktaone.com" 
                  className="text-nokta-one-blue underline"
                >
                  support@noktaone.com
                </a>
              </div>
            )}

          </div>

          {/* Footer */}
          {state === 'form' && (
            <div className="p-6 border-t border-white/10">
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-nokta-one-blue hover:bg-blue-600 text-nokta-one-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-5 h-5" />
                {t('support.send')}
              </button>
            </div>
          )}

          {(state === 'success' || state === 'error') && (
            <div className="p-6 border-t border-white/10">
              <button
                onClick={handleClose}
                className="w-full py-4 bg-white/10 hover:bg-white/20 text-nokta-one-white rounded-xl font-medium transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
