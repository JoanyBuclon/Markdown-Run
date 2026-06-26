# Markdown Run

Extension VS Code qui ajoute deux actions sur les blocs de code shell d'un fichier Markdown : **copier** le contenu en un clic, et **exécuter** le contenu dans le terminal intégré de VS Code.

Les actions apparaissent sur les blocs de code marqués `sh`, `bash` ou `powershell`, à la fois dans **l'éditeur** (via CodeLens) et dans **l'aperçu Markdown** (boutons dans le rendu).

## Fonctionnalités

- 📋 **Copier** — copie le contenu brut du bloc dans le presse-papiers.
- ▶️ **Exécuter** — envoie le contenu du bloc dans le terminal intégré et l'exécute.
- Détection automatique des blocs ` ```sh `, ` ```bash ` et ` ```powershell `.
- Deux points d'accès :
  - **CodeLens** : liens cliquables juste au-dessus de chaque bloc, dans le fichier en édition.
  - **Aperçu Markdown** : boutons injectés dans le rendu de l'aperçu.

## Démo

> _(captures / GIF à ajouter une fois l'extension fonctionnelle)_

## Installation

### Depuis le code source (développement)

```bash
git clone <url-du-repo>
cd "Markdown Run"
npm install
```

Puis dans VS Code : ouvrir le dossier et appuyer sur `F5` pour lancer une fenêtre _Extension Development Host_ avec l'extension chargée.

### Depuis un paquet `.vsix`

```bash
npm run package        # génère un fichier markdown-run-x.y.z.vsix
code --install-extension markdown-run-*.vsix
```

## Utilisation

1. Ouvrir un fichier `.md` contenant un bloc de code shell :

   ```sh
   echo "Bonjour depuis Markdown Run"
   ```

2. **Dans l'éditeur** : cliquer sur `▶ Exécuter` ou `📋 Copier` affiché au-dessus du bloc.
3. **Dans l'aperçu** (`Ctrl+Shift+V`) : cliquer sur les boutons affichés sur le bloc rendu.

## Configuration

| Réglage | Type | Défaut | Description |
| --- | --- | --- | --- |
| `markdownRun.autoExecute` | `boolean` | `true` | Si activé, « Exécuter » lance la commande automatiquement (envoi + `Entrée`). Si désactivé, le texte est seulement inséré dans le terminal, sans l'exécuter — l'utilisateur valide manuellement. |
| `markdownRun.languages` | `string[]` | `["sh", "bash", "powershell"]` | Langages de blocs sur lesquels afficher les actions. |
| `markdownRun.reuseTerminal` | `boolean` | `true` | Réutilise un terminal dédié « Markdown Run » au lieu d'en créer un nouveau à chaque exécution. |
| `markdownRun.showInEditor` | `boolean` | `true` | Affiche les CodeLens dans l'éditeur. |
| `markdownRun.showInPreview` | `boolean` | `true` | Affiche les boutons dans l'aperçu Markdown. |

> ⚠️ **Sécurité** : avec `autoExecute` activé (défaut), un bloc de code est exécuté tel quel dès le clic, sans confirmation. Vérifie toujours le contenu d'un bloc provenant d'une source non fiable. Désactive `markdownRun.autoExecute` pour relire avant d'exécuter.

## Architecture technique

| Domaine | Choix |
| --- | --- |
| Langage | TypeScript |
| Scaffolding | `yo code` (générateur officiel `generator-code`) |
| Bundler | esbuild |
| API « copier » | `vscode.env.clipboard.writeText` |
| API « exécuter » | `vscode.window.createTerminal` + `terminal.sendText` |
| Actions éditeur | `vscode.languages.registerCodeLensProvider` |
| Actions aperçu | contribution `markdown.markdownItPlugins` (injection des boutons) + `markdown.previewScripts` (gestion des clics → `postMessage`) |
| Tests | `@vscode/test-cli` + `@vscode/test-electron` |
| Lint | ESLint |

### Flux

```
Fichier .md
   │
   ├── Éditeur ──> CodeLensProvider ──┐
   │                                  ├──> commande markdownRun.copy ──> clipboard
   └── Aperçu ──> markdown-it plugin  │
                  + previewScript ────┴──> commande markdownRun.run  ──> terminal.sendText
```

Les deux points d'accès partagent les mêmes commandes `markdownRun.copy` et `markdownRun.run`.

## Structure du projet (prévue)

```
.
├── package.json            # manifeste de l'extension (contributes, commandes, config)
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

## Développement

```bash
npm install          # installe les dépendances
npm run watch        # compilation incrémentale
# F5 dans VS Code    # lance l'Extension Development Host
npm run lint         # ESLint
npm test             # tests
npm run package      # génère le .vsix (via @vscode/vsce)
```

## Compatibilité

- VS Code `^1.90.0` (à ajuster selon les API utilisées).
- Multiplateforme : Windows (PowerShell), macOS / Linux (sh/bash).

## Licence

MIT _(à confirmer)_
