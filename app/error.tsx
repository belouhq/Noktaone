'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Erreur</h1>
        <p className="text-gray-400 mb-8">
          Une erreur s'est produite. Veuillez réessayer.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors inline-block"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
