#!/bin/bash
# Script pour tester avec Terminal natif macOS

echo "=== Test d'accès réseau Node.js ==="
echo ""
echo "Ce script va essayer de démarrer un serveur de test."
echo "Si macOS demande une autorisation, cliquez sur 'Autoriser'."
echo ""

cd "$(dirname "$0")"

# Test simple
node test-server.js

echo ""
echo "=== Fin du test ==="
