# Change Log

All notable changes to the "Markdown Run" extension are documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## [0.1.0] - 2026-06-26

### Added

- **Copy** and **Run** actions on `sh`, `bash` and `powershell` code blocks in the Markdown editor, via CodeLens above each block.
- **Copy** button on code blocks in the Markdown preview (client-side clipboard).
- Settings: `markdownRun.documentLanguages`, `markdownRun.languages`, `markdownRun.autoExecute`, `markdownRun.showInEditor`, `markdownRun.showInPreview`.
- Empty `markdownRun.languages` enables the actions on every code block.
- Works on both `markdown` and `mdc` (Nuxt Content) document modes by default.
