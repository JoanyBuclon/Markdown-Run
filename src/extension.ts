import * as vscode from 'vscode';
import { findCodeBlockAtPosition } from './codeBlocks';
import { MarkdownRunCodeLensProvider } from './codeLensProvider';
import { copyBlock, runBlock } from './commands';
import { getDocumentLanguages, isDocumentLanguage, isLanguageEnabled } from './config';

// Called when the extension is activated (on startup or when a Markdown file is opened).
export function activate(context: vscode.ExtensionContext) {
	const codeLensProvider = new MarkdownRunCodeLensProvider();

	// The CodeLens selector is fixed at registration time, so a change to the
	// configured document languages requires re-registering the provider.
	let codeLensRegistration = registerCodeLens(codeLensProvider);

	context.subscriptions.push(
		codeLensProvider,
		{ dispose: () => codeLensRegistration.dispose() },
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration('markdownRun.documentLanguages')) {
				codeLensRegistration.dispose();
				codeLensRegistration = registerCodeLens(codeLensProvider);
			}
			if (event.affectsConfiguration('markdownRun')) {
				codeLensProvider.refresh();
			}
		}),
		vscode.commands.registerCommand('markdownRun.copy', (content?: string) => {
			const text = resolveContent(content);
			if (text !== undefined) {
				return copyBlock(text);
			}
		}),
		vscode.commands.registerCommand('markdownRun.run', (content?: string) => {
			const text = resolveContent(content);
			if (text !== undefined) {
				runBlock(text);
			}
		}),
	);
}

/**
 * Resolve the code block content for a command invocation.
 *
 * CodeLens and the Markdown preview pass the content directly. When the command
 * is invoked from the Command Palette there is no argument, so we fall back to
 * the enabled code block under the cursor.
 */
function resolveContent(content?: string): string | undefined {
	if (typeof content === 'string') {
		return content;
	}

	const editor = activeMarkdownEditor();
	if (!editor) {
		vscode.window.showWarningMessage(
			'Markdown Run: open a Markdown file and place the cursor in a code block.',
		);
		return undefined;
	}

	const block = findCodeBlockAtPosition(editor.document, editor.selection.active);
	if (!block || !isLanguageEnabled(block.language)) {
		vscode.window.showWarningMessage(
			'Markdown Run: place the cursor inside a sh, bash or powershell code block.',
		);
		return undefined;
	}

	return block.content;
}

/**
 * Find a Markdown editor to act on. Prefer the active editor, but fall back to a
 * visible one: when the terminal, preview or another panel has focus,
 * `activeTextEditor` is undefined even though the Markdown file is still open.
 */
function activeMarkdownEditor(): vscode.TextEditor | undefined {
	const active = vscode.window.activeTextEditor;
	if (active && isDocumentLanguage(active.document.languageId)) {
		return active;
	}
	return vscode.window.visibleTextEditors.find((editor) =>
		isDocumentLanguage(editor.document.languageId),
	);
}

/** Register the CodeLens provider for the configured document languages. */
function registerCodeLens(provider: vscode.CodeLensProvider): vscode.Disposable {
	const selector: vscode.DocumentSelector = getDocumentLanguages().map((language) => ({
		language,
	}));
	return vscode.languages.registerCodeLensProvider(selector, provider);
}

// Called when the extension is deactivated.
export function deactivate() {}
