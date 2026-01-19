/**
 * Filtre pour supprimer les messages TensorFlow/MediaPipe de la console
 * Utilisé pour réduire le bruit dans la console de développement
 */

if (typeof window !== 'undefined') {
  // Intercepter tous les types de logs
  const originalConsoleInfo = console.info;
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;

  // Filtrer les messages TensorFlow/MediaPipe
  const filterMessages = (args: any[]): boolean => {
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');
    
    const filteredPatterns = [
      'TensorFlow Lite',
      'XNNPACK delegate',
      'Created TensorFlow',
      'vision_wasm',
      'MediaPipe',
      'Graph successfully started',
      'Sets FaceBlendshapesGraph',
      'OpenGL error checking',
      'GL version',
      'WebGL',
      'Fast Refresh',
    ];

    return !filteredPatterns.some(pattern => 
      message.includes(pattern)
    );
  };

  // Override console.info
  console.info = (...args: any[]) => {
    if (filterMessages(args)) {
      originalConsoleInfo.apply(console, args);
    }
  };

  // Override console.log
  console.log = (...args: any[]) => {
    if (filterMessages(args)) {
      originalConsoleLog.apply(console, args);
    }
  };

  // Override console.warn (pour filtrer aussi les warnings TensorFlow)
  console.warn = (...args: any[]) => {
    if (filterMessages(args)) {
      originalConsoleWarn.apply(console, args);
    }
  };

  // console.error reste inchangé (on veut voir les vraies erreurs)
}
