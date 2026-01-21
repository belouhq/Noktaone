/**
 * Filtre pour supprimer les messages de bruit de la console
 * Utilisé pour réduire le bruit dans la console de développement
 * 
 * Filtre :
 * - Messages TensorFlow/MediaPipe
 * - Messages Chrome Extension
 * - Messages Next.js/React DevTools
 * - Messages de scroll automatique
 */

if (typeof window !== 'undefined') {
  // Intercepter tous les types de logs
  const originalConsoleInfo = console.info;
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  // Filtrer les messages de bruit
  const filterMessages = (args: any[]): boolean => {
    const message = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg?.toString) return arg.toString();
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');
    
    // Patterns à filtrer
    const filteredPatterns = [
      // TensorFlow/MediaPipe
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
      'gl_context',
      'face_landmarker_graph',
      
      // Chrome Extension
      'chrome-extension://',
      'Denying load of chrome-extension',
      'Resources must be listed in the web_accessible_resources',
      
      // Next.js/React DevTools
      'Fast Refresh',
      'Download the React DevTools',
      'Skipping auto-scroll behavior',
      'shouldSkipElement',
      'InnerScrollAndFocusHandler',
      'layout-router',
      
      // React internals (trop verbeux)
      'commitLayoutEffectOnFiber',
      'recursivelyTraverseLayoutEffects',
      'commitPassiveMountOnFiber',
      'flushPassiveEffects',
      'performWorkUntilDeadline',
      'schedulePerformWorkUntilDeadline',
      'requestHostCallback',
      'unstable_scheduleCallback',
      'workLoop',
      'flushWork',
      'inpage.js',
      'postMessage',
      'PendingScript',
      'loadUpdateChunk',
      'hot-reloader-client',
      'onUnsuspend',
    ];

    // Vérifier si le message contient un pattern filtré
    const shouldFilter = filteredPatterns.some(pattern => 
      message.includes(pattern)
    );

    // Vérifier aussi les stack traces pour les messages de scroll
    if (!shouldFilter && args.some(arg => 
      typeof arg === 'string' && (
        arg.includes('shouldSkipElement') ||
        arg.includes('InnerScrollAndFocusHandler') ||
        arg.includes('layout-router.js')
      )
    )) {
      return false;
    }

    return !shouldFilter;
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

  // Override console.warn (pour filtrer aussi les warnings de bruit)
  console.warn = (...args: any[]) => {
    if (filterMessages(args)) {
      originalConsoleWarn.apply(console, args);
    }
  };

  // Override console.error (filtrer seulement les erreurs de bruit, garder les vraies erreurs)
  console.error = (...args: any[]) => {
    // Filtrer uniquement les erreurs de Chrome Extension et les warnings déguisés en erreurs
    const isNoiseError = args.some(arg => 
      typeof arg === 'string' && (
        arg.includes('chrome-extension://') ||
        arg.includes('Denying load of chrome-extension') ||
        arg.includes('Skipping auto-scroll behavior')
      )
    );
    
    if (!isNoiseError) {
      originalConsoleError.apply(console, args);
    }
  };
}
