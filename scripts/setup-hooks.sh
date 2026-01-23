#!/bin/bash
#
# setup-hooks.sh
# Installe les hooks Git pour Nokta One
#
# Usage: ./scripts/setup-hooks.sh

HOOKS_DIR=".git/hooks"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔧 Setting up Git hooks..."

# Vérifier qu'on est dans un repo Git
if [ ! -d ".git" ]; then
  echo "❌ Not a Git repository. Run this from the project root."
  exit 1
fi

# Créer le dossier hooks si nécessaire
mkdir -p "$HOOKS_DIR"

# Copier le pre-commit hook
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/sh
#
# pre-commit hook - Auto-translate before commit
#

echo "🌍 Running auto-translate..."

npm run auto-translate --silent

if [ $? -ne 0 ]; then
  echo "❌ Translation failed. Commit aborted."
  exit 1
fi

# Stage updated translation files
git add lib/i18n/locales/*.json 2>/dev/null

echo "✅ Translations OK"
EOF

# Rendre exécutable
chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Git hooks installed!"
echo ""
echo "The pre-commit hook will now:"
echo "  - Run auto-translate before each commit"
echo "  - Auto-stage updated translation files"
echo ""
