// Test simple pour vérifier si Node.js peut écouter sur un port
const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Serveur de test fonctionne !\n');
});

server.listen(PORT, 'localhost', () => {
  console.log(`✓ Serveur de test démarré sur http://localhost:${PORT}`);
  console.log('Si vous voyez ce message, Node.js peut écouter sur un port.');
});

server.on('error', (err) => {
  if (err.code === 'EPERM') {
    console.error('❌ ERREUR EPERM: macOS bloque l\'accès réseau');
    console.error('→ Allez dans Réglages Système → Confidentialité et sécurité → Réseau local');
    console.error('→ Autorisez Terminal/Cursor/Node.js');
  } else {
    console.error('❌ Erreur:', err.message);
  }
  process.exit(1);
});
