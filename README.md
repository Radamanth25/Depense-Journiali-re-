# 💰 Suivi des Dépenses Quotidiennes

Application PWA (Progressive Web App) pour suivre facilement vos dépenses quotidiennes.

## 🚀 Fonctionnalités

- ✅ **Ajout de dépenses** - Enregistrez rapidement vos dépenses
- 💾 **Stockage local** - Vos données sont sauvegardées localement (localStorage)
- 📱 **Responsive** - Fonctionne sur tous les appareils (mobile, tablette, desktop)
- 🌐 **Mode offline** - Fonctionne sans connexion internet (PWA)
- 🎨 **Design moderne** - Interface inspirée de Material Design 3
- ♿ **Accessibilité** - Conforme aux normes WCAG
- 🌙 **Mode sombre** - Support automatique du mode sombre du système
- 📊 **Historique** - Consultez toutes vos dépenses

## 📦 Installation

### Option 1 : Utilisation locale
1. Clonez ou téléchargez le repository
2. Ouvrez `index.html` dans votre navigateur
3. L'application se charge immédiatement

### Option 2 : PWA installable
1. Ouvrez l'application dans votre navigateur
2. Cliquez sur l'icône "Installer" (à côté de la barre d'adresse)
3. L'app s'installe sur votre écran d'accueil

## 🛠️ Structure du projet

```
├── index.html       # Page principale
├── app.js          # Logique de l'application (robuste et modulaire)
├── style.css       # Styles (design system cohérent)
├── manifest.json   # Configuration PWA
├── sw.js          # Service Worker (mode offline)
├── README.md      # Documentation
└── .gitignore     # Fichiers à ignorer
```

## 🔧 Architecture

### app.js - Objet App centralisé
- **Initialisation** - Configuration et chargement au démarrage
- **Gestion de l'état** - Stockage centralisé des dépenses
- **Validation robuste** - Vérification des données
- **Gestion d'erreurs** - Try/catch complets
- **Notifications** - Feedback utilisateur

### style.css - Système de design cohérent
- **Variables CSS** - Couleurs, espacement, typographie centralisés
- **Responsive** - Mobile-first avec breakpoints
- **Accessibilité** - Focus visible, contraste adequate
- **Mode sombre** - Support automatique
- **Performance** - Animations optimisées

### sw.js - Service Worker fiable
- **Caching stratégique** - Cache first, network fallback
- **Offline support** - Fonctionne sans internet
- **Gestion des mises à jour** - Cache versionné

## 📋 Améliorations apportées

✨ **Robustesse**
- Validation complète des données
- Gestion d'erreurs à tous les niveaux
- Vérification des éléments DOM

✨ **Cohérence**
- Architecture modulaire avec objet App
- Variables CSS centralisées
- Conventions de codage uniformes

✨ **Performance**
- Code optimisé et nettoyé
- Service Worker efficace
- Animations fluides

✨ **Accessibilité**
- Attributs ARIA
- Navigation clavier complète
- Support des lecteurs d'écran

✨ **Maintenabilité**
- Code bien commenté
- Structure claire
- Documentation complète

## 🎯 Utilisation

1. **Ajouter une dépense**
   - Entrez une description
   - Entrez le montant
   - Cliquez "Ajouter" ou appuyez sur Entrée

2. **Supprimer une dépense**
   - Cliquez sur le bouton "×" à côté de la dépense
   - Confirmez la suppression

3. **Consulter le total**
   - Le total des dépenses s'affiche en temps réel

## 🌐 Navigateurs supportés

- ✅ Chrome/Chromium 70+
- ✅ Firefox 68+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Opera 57+

## 🔒 Sécurité

- Échappement HTML pour éviter les injections XSS
- Validation des données côté client
- Pas de transmission de données à un serveur

## 💾 Stockage des données

Les données sont stockées localement dans `localStorage` sous la clé `myExpenses`. 

**Important** : Les données ne sont jamais envoyées à un serveur externe.

## 🚀 Déploiement

### Sur GitHub Pages
1. Poussez le code sur une branche `main` ou `master`
2. Allez dans Settings → Pages
3. Sélectionnez votre branche par défaut
4. L'app est accessible via `username.github.io/repo-name`

### Sur Netlify
1. Connectez votre repository GitHub
2. Laissez les paramètres par défaut
3. Déclenchez le déploiement

## 🐛 Signaler un bug

Si vous trouvez un bug, créez une issue sur GitHub avec :
- Description du problème
- Étapes pour reproduire
- Résultat attendu/obtenu
- Navigateur et appareil utilisés

## 🤝 Contribution

Les contributions sont bienvenues ! Consultez notre guide de contribution.

## 📄 Licence

MIT License - Libre d'utilisation et de modification

---

**Dernière mise à jour** : Mai 2026

Développé avec ❤️ pour une meilleure gestion financière
