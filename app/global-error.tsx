'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body>
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold mb-4">Erreur critique</h1>
            <p className="text-gray-400 mb-8">
              Une erreur critique s'est produite. Veuillez recharger la page.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Recharger
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
