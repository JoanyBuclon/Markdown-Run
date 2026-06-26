# Markdown Run

Extension VS Code qui ajoute deux actions sur les blocs de code shell d'un fichier Markdown : **copier** le contenu en un clic, et **exécuter** le contenu dans le terminal intégré de VS Code.

Les actions apparaissent sur les blocs de code marqués `sh`, `bash` ou `powershell`, dans **l'éditeur** (via CodeLens) et, pour la copie, dans **l'aperçu Markdown**.

## Features

- 📋 **Copier**: copie le contenu brut du bloc dans le presse-papiers (`vscode.env.clipboard`). Disponible dans l'éditeur **et** dans l'aperçu.
- ▶️ **Exécuter**: envoie le contenu du bloc dans le terminal intégré et l'exécute (`terminal.sendText`). Disponible dans l'éditeur.
- Détection automatique des blocs ` ```sh `, ` ```bash ` et ` ```powershell `.
- Deux points d'accès :
  - **CodeLens** (éditeur) : liens **Copy** / **Run** au-dessus de chaque bloc, dans le fichier en édition.
  - **Aperçu Markdown** : bouton **Copy** au survol du bloc rendu. (Pas de **Run** dans l'aperçu — voir [Known Issues](#known-issues).)

## Requirements

- **VS Code** `^1.96.0` (défini dans `engines.vscode`).
- **Node.js** ≥ 20 et **pnpm** pour le développement.
- Aucune dépendance d'exécution externe : l'extension n'utilise que les API natives de VS Code.

## Installation

L'extension se distribue via les **GitHub Releases** (pas le Marketplace).

1. Télécharge le dernier `markdown-run-<version>.vsix` depuis la page [Releases](https://github.com/JoanyBuclon/Markdown-Run/releases).
2. Installe-le, au choix :
   - **En ligne de commande** :
     ```bash
     code --install-extension markdown-run-<version>.vsix
     ```
   - **Depuis VS Code** : vue *Extensions* → menu `···` → **Install from VSIX…** → sélectionne le fichier.

Pour mettre à jour, installe simplement le `.vsix` d'une version plus récente (ajoute `--force` en ligne de commande pour réinstaller par-dessus).

## Extension Settings

L'extension contribue aux réglages suivants (via `contributes.configuration`) :

| Réglage                         | Type       | Défaut                         | Description                                                                                                                                                  |
| ------------------------------- | ---------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `markdownRun.documentLanguages` | `string[]` | `["markdown", "mdc"]`          | Modes de langage des documents sur lesquels les actions s'appliquent (markdown + MDC/Nuxt Content). Ajoute d'autres ids (ex. `"mdx"`) pour les activer ailleurs. |
| `markdownRun.autoExecute`       | `boolean`  | `true`                         | Si activé, « Exécuter » lance la commande automatiquement (envoi + `Entrée`). Si désactivé, le texte est seulement inséré dans le terminal, sans l'exécuter. |
| `markdownRun.languages`         | `string[]` | `["sh", "bash", "powershell"]` | Langages de blocs sur lesquels afficher les actions. Laisser vide pour les afficher sur **tous** les blocs de code.                                          |
| `markdownRun.showInEditor`      | `boolean`  | `true`                         | Affiche les CodeLens dans l'éditeur.                                                                                                                         |
| `markdownRun.showInPreview`     | `boolean`  | `true`                         | Affiche le bouton Copy dans l'aperçu Markdown.                                                                                                              |

⚠️ **Sécurité** : avec `autoExecute` activé (défaut), un bloc est exécuté tel quel dès le clic, sans confirmation. Vérifie toujours le contenu d'un bloc provenant d'une source non fiable. Désactive `markdownRun.autoExecute` pour relire avant d'exécuter.

## Architecture technique

| Domaine                 | Choix                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Langage                 | TypeScript                                                                                                            |
| Scaffolding             | `yo code` (générateur officiel `generator-code`)                                                                      |
| Bundler                 | esbuild                                                                                                               |
| Gestionnaire de paquets | pnpm                                                                                                                  |
| API « copier »          | `vscode.env.clipboard.writeText`                                                                                      |
| API « exécuter »        | `vscode.window.createTerminal` + `terminal.sendText`                                                                  |
| Actions éditeur         | `vscode.languages.registerCodeLensProvider`                                                                           |
| Action aperçu (Copy)    | `markdown.markdownItPlugins` (injection du bouton) + `markdown.previewScripts` (copie côté client via `navigator.clipboard`) + `markdown.previewStyles` |
| Tests                   | `@vscode/test-cli` + `@vscode/test-electron`                                                                          |
| Lint                    | ESLint                                                                                                                |

### Flux

```
Fichier .md
   │
   ├── Éditeur ──> CodeLensProvider ──> commandes markdownRun.copy / markdownRun.run
   │                                       │                    │
   │                                  clipboard          terminal.sendText
   │
   └── Aperçu ──> markdown-it plugin (bouton Copy) ──> previewScript ──> navigator.clipboard
```

## Développement

```bash
pnpm install         # installe les dépendances
pnpm run watch       # compilation incrémentale (esbuild + tsc)
# F5 dans VS Code    # lance l'Extension Development Host
pnpm run lint        # ESLint
pnpm test            # tests (vscode-test)
pnpm run package     # build de production
```

Pour générer un paquet installable :

```bash
pnpm dlx @vscode/vsce package          # génère markdown-run-x.y.z.vsix
code --install-extension markdown-run-*.vsix
```

### Structure du projet

```
.
├── package.json            # manifeste (contributes, commandes, config)
├── tsconfig.json
├── esbuild.js              # script de bundling
├── media/                  # assets chargés tels quels dans la webview de l'aperçu
│   ├── preview.js          # script côté aperçu : bouton Copy (clipboard)
│   └── preview.css         # style de la barre d'actions de l'aperçu
├── src/
│   ├── extension.ts        # point d'entrée : activate() / deactivate() + API extendMarkdownIt
│   ├── config.ts           # lecture des réglages markdownRun.*
│   ├── codeBlocks.ts       # parsing des blocs de code du document
│   ├── codeLensProvider.ts # CodeLens Copy / Run dans l'éditeur
│   ├── commands.ts         # implémentation de copy / run
│   └── preview/
│       └── markdownItPlugin.ts  # injection du bouton Copy dans le rendu de l'aperçu
└── README.md
```

## Known Issues

- **Pas de bouton « Run » dans l'aperçu Markdown.** L'aperçu intégré ignore les liens `command:` (sécurité), et un script d'aperçu ne peut pas communiquer avec l'extension. L'exécution n'est donc proposée que via le CodeLens de l'éditeur. La copie, elle, fonctionne dans l'aperçu (côté client).

## Release Notes

### 0.1.0 — 2026-06-26

Première version fonctionnelle.

- Actions **Copy** et **Run** sur les blocs `sh` / `bash` / `powershell` dans l'éditeur (CodeLens au-dessus de chaque bloc).
- Bouton **Copy** sur les blocs de code dans l'aperçu Markdown (copie côté client).
- 5 réglages : `documentLanguages`, `languages`, `autoExecute`, `showInEditor`, `showInPreview`.
- `languages` vide = actions sur **tous** les blocs ; fonctionne sur les modes `markdown` **et** `mdc` (Nuxt Content) par défaut.
- Icône de l'extension.

## Following extension guidelines

Ce projet suit les bonnes pratiques officielles :

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## For more information

- [VS Code Extension API](https://code.visualstudio.com/api)
- [CodeLens Provider](https://code.visualstudio.com/api/references/vscode-api#CodeLensProvider)
- [Markdown extension API](https://code.visualstudio.com/api/extension-guides/markdown-extension)
