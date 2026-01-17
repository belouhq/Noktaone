# 🔌 Configuration MCP Supabase

Vous avez partagé cette configuration MCP :

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=tnwqigfchkjkiskgcofd"
    }
  }
}
```

## 📝 Note importante

Le serveur MCP Supabase permet d'interagir avec votre base de données Supabase directement depuis Cursor/Claude, mais **je n'ai pas accès à ces outils dans cet environnement**.

## ✅ Solution recommandée

Pour créer les tables, utilisez l'une de ces méthodes :

### Méthode 1 : SQL Editor (Recommandé)

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet (`tnwqigfchkjkiskgcofd`)
3. Allez dans **SQL Editor** (menu de gauche)
4. Créez une nouvelle query
5. Copiez-collez le contenu de `supabase/schema.sql`
6. Cliquez sur **"Run"** (ou `Cmd+Enter`)
7. Répétez avec `supabase/seed.sql`

### Méthode 2 : Via le script

```bash
npm run setup-supabase
```

Ce script vous donnera les instructions détaillées.

### Méthode 3 : Via l'API REST Supabase

Si vous voulez automatiser, vous pouvez utiliser l'API REST Supabase avec votre `SUPABASE_SERVICE_ROLE_KEY`.

## 🔍 Vérification

Après avoir créé les tables, vérifiez :

```bash
npm run test-supabase
```

Ou visitez : `http://localhost:3000/api/supabase/test`

## 📚 Documentation

- Guide complet : `SUPABASE_SETUP.md`
- Schéma SQL : `supabase/schema.sql`
- Données initiales : `supabase/seed.sql`
