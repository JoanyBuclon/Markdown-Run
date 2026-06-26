# Markdown Run

Extension VS Code qui ajoute deux actions sur les blocs de code shell d'un fichier Markdown : **copier** le contenu en un clic, et **exécuter** le contenu dans le terminal intégré de VS Code.

Les actions apparaissent sur les blocs de code marqués `sh`, `bash` ou `powershell`, à la fois dans **l'éditeur** (via CodeLens) et dans **l'aperçu Markdown** (boutons dans le rendu).

## Features

- 📋 **Copier**: copie le contenu brut du bloc dans le presse-papiers (`vscode.env.clipboard`).
- ▶️ **Exécuter**: envoie le contenu du bloc dans le terminal intégré et l'exécute (`terminal.sendText`).
- Détection automatique des blocs ` ```sh `, ` ```bash ` et ` ```powershell `.
- Deux points d'accès, partageant les mêmes commandes :
  - **CodeLens** : liens cliquables juste au-dessus de chaque bloc, dans le fichier en édition.
  - **Aperçu Markdown** : boutons injectés dans le rendu de l'aperçu.

## Requirements

- **VS Code** `^1.96.0` (défini dans `engines.vscode`).
- **Node.js** ≥ 20 et **pnpm** pour le développement.
- Aucune dépendance d'exécution externe : l'extension n'utilise que les API natives de VS Code.

## Extension Settings

L'extension contribue aux réglages suivants (via `contributes.configuration`) :

| Réglage                     | Type       | Défaut                         | Description                                                                                                                                                  |
| --------------------------- | ---------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `markdownRun.documentLanguages` | `string[]` | `["markdown"]`             | Modes de langage des documents sur lesquels les actions s'appliquent. Ajoute d'autres ids (ex. `"mdx"`) pour les activer ailleurs.                          |
| `markdownRun.autoExecute`   | `boolean`  | `true`                         | Si activé, « Exécuter » lance la commande automatiquement (envoi + `Entrée`). Si désactivé, le texte est seulement inséré dans le terminal, sans l'exécuter. |
| `markdownRun.languages`     | `string[]` | `["sh", "bash", "powershell"]` | Langages de blocs sur lesquels afficher les actions. Laisser vide pour les afficher sur **tous** les blocs de code.                                          |
| `markdownRun.showInEditor`  | `boolean`  | `true`                         | Affiche les CodeLens dans l'éditeur.                                                                                                                         |
| `markdownRun.showInPreview` | `boolean`  | `true`                         | Affiche les boutons dans l'aperçu Markdown.                                                                                                                  |

> ⚠️ **Sécurité** : avec `autoExecute` activé (défaut), un bloc est exécuté tel quel dès le clic, sans confirmation. Vérifie toujours le contenu d'un bloc provenant d'une source non fiable. Désactive `markdownRun.autoExecute` pour relire avant d'exécuter.

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
| Actions aperçu          | contribution `markdown.markdownItPlugins` (injection des boutons) + `markdown.previewScripts` (clics → `postMessage`) |
| Tests                   | `@vscode/test-cli` + `@vscode/test-electron`                                                                          |
| Lint                    | ESLint                                                                                                                |

### Flux

```
Fichier .md
   │
   ├── Éditeur ──> CodeLensProvider ──┐
   │                                  ├──> commande markdownRun.copy ──> clipboard
   └── Aperçu ──> markdown-it plugin  │
                  + previewScript ────┴──> commande markdownRun.run  ──> terminal.sendText
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

### Structure du projet (prévue)

```
.
├── package.json            # manifeste (contributes, commandes, config)
├── tsconfig.json
├── esbuild.js              # script de bundling
├── src/
│   ├── extension.ts        # point d'entrée : activate() / deactivate()
│   ├── codeBlocks.ts       # parsing des blocs de code shell du document
│   ├── codeLensProvider.ts # CodeLens dans l'éditeur
│   ├── commands.ts         # implémentation de copy / run
│   └── preview/
│       ├── markdownItPlugin.ts  # injection des boutons dans le rendu
│       └── previewScript.ts     # script côté webview de l'aperçu
└── README.md
```

## Known Issues

- Aucune pour l'instant (extension en cours de développement initial).

## Release Notes

### 0.0.1

- Mise en place du projet (scaffold, choix techniques, documentation).

## Following extension guidelines

Ce projet suit les bonnes pratiques officielles :

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## For more information

- [VS Code Extension API](https://code.visualstudio.com/api)
- [CodeLens Provider](https://code.visualstudio.com/api/references/vscode-api#CodeLensProvider)
- [Markdown extension API](https://code.visualstudio.com/api/extension-guides/markdown-extension)
