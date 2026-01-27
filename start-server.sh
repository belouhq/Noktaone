#!/bin/bash
# Script pour démarrer le serveur avec plusieurs tentatives de ports

cd "$(dirname "$0")"

PORTS=(3000 3001 3002 8080 8081)
PORT_FOUND=false

for PORT in "${PORTS[@]}"; do
  echo "Tentative sur le port $PORT..."
  
  # Vérifier si le port est libre
  if lsof -i :$PORT > /dev/null 2>&1; then
    echo "Port $PORT déjà utilisé, passage au suivant..."
    continue
  fi
  
  # Essayer de démarrer sur ce port
  PORT=$PORT npm run dev &
  SERVER_PID=$!
  
  # Attendre 3 secondes
  sleep 3
  
  # Vérifier si le processus tourne toujours
  if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✓ Serveur démarré sur le port $PORT"
    echo "PID: $SERVER_PID"
    PORT_FOUND=true
    break
  else
    echo "✗ Échec sur le port $PORT"
  fi
done

if [ "$PORT_FOUND" = false ]; then
  echo "❌ Impossible de démarrer le serveur sur aucun port"
  echo "Vérifiez vos permissions réseau dans Réglages Système → Confidentialité et sécurité → Réseau local"
  exit 1
fi

wait $SERVER_PID
