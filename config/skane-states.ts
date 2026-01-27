// Configuration des états SKANE avec messages et styles

import { SkaneState } from '@/types/skane-detection';

export const skaneStateConfig: Record<SkaneState, {
  message: string;
  submessage?: string;
  borderColor: string;
  glowColor?: string;
  icon?: 'none' | 'warning' | 'check' | 'loading';
}> = {
  loading: {
    message: "Préparation du Skane...",
    borderColor: 'border-white/20',
    icon: 'loading'
  },
  no_face: {
    message: "Placez votre visage dans le cadre",
    borderColor: 'border-white/30',
    icon: 'none'
  },
  too_far: {
    message: "Rapprochez-vous",
    submessage: "Votre visage doit remplir le cadre",
    borderColor: 'border-orange-500/70',
    icon: 'warning'
  },
  too_close: {
    message: "Éloignez-vous légèrement",
    submessage: "Votre visage est trop proche",
    borderColor: 'border-orange-500/70',
    icon: 'warning'
  },
  not_centered: {
    message: "Centrez votre visage",
    borderColor: 'border-orange-500/70',
    icon: 'warning'
  },
  too_dark: {
    message: "Trouvez plus de lumière",
    submessage: "L'éclairage est insuffisant",
    borderColor: 'border-yellow-500/70',
    icon: 'warning'
  },
  face_tilted: {
    message: "Redressez votre tête",
    submessage: "Regardez droit vers la caméra",
    borderColor: 'border-orange-500/70',
    icon: 'warning'
  },
  eyes_closed: {
    message: "Gardez les yeux ouverts",
    borderColor: 'border-orange-500/70',
    icon: 'warning'
  },
  ready: {
    message: "Parfait",
    submessage: "Restez immobile",
    borderColor: 'border-green-500',
    glowColor: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
    icon: 'check'
  },
  scanning: {
    message: "Skane en cours...",
    submessage: "Ne bougez pas",
    borderColor: 'border-cyan-500',
    glowColor: 'shadow-[0_0_30px_rgba(6,182,212,0.4)]',
    icon: 'loading'
  }
};
