// ============================================
// NOKTA ONE - Referral Tracking Middleware
// ============================================
// Fichier: middleware.ts (à la racine du projet)
// Track automatiquement les clics sur les liens de parrainage
// ============================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const refCode = searchParams.get('ref');

  // Si pas de ref code, continuer normalement
  if (!refCode) {
    return NextResponse.next();
  }

  // Créer la réponse
  const response = NextResponse.next();

  // Stocker le ref code dans un cookie (30 jours)
  response.cookies.set('nokta_ref', refCode, {
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    path: '/',
    sameSite: 'lax',
  });

  // Tracker le clic en arrière-plan (fire and forget)
  // Note: On ne peut pas faire de fetch async dans middleware,
  // donc on le fera côté client ou via Edge Function
  
  return response;
}

// Appliquer le middleware sur toutes les pages
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons).*)',
  ],
};
