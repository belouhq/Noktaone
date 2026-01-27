#!/bin/bash
# Script de démarrage pour contourner les problèmes de permissions réseau macOS

# Tuer les processus existants
pkill -9 -f "next dev" 2>/dev/null

# Attendre un peu
sleep 2

# Essayer différents ports
PORTS=(3000 3001 3002 8080 8081)

for PORT in "${PORTS[@]}"; do
  echo "Trying port $PORT..."
  
  # Vérifier si le port est disponible
  if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "Port $PORT is already in use, trying next..."
    continue
  fi
  
  # Essayer de démarrer sur ce port
  PORT=$PORT npm run dev &
  SERVER_PID=$!
  
  # Attendre un peu pour voir si ça démarre
  sleep 5
  
  # Vérifier si le processus tourne toujours
  if ps -p $SERVER_PID > /dev/null 2>&1; then
    # Vérifier si le serveur répond
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
      echo "✅ Server started successfully on port $PORT!"
      echo "🌐 Open http://localhost:$PORT in your browser"
      exit 0
    fi
  fi
  
  # Si on arrive ici, ça n'a pas marché, tuer le processus
  kill $SERVER_PID 2>/dev/null
done

echo "❌ Could not start server on any port. Check network permissions in System Settings > Privacy & Security > Network"
