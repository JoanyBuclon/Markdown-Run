import * as vscode from 'vscode';
import { findCodeBlocks } from './codeBlocks';
import { getShowInEditor, isLanguageEnabled } from './config';

/**
 * Shows "Copy" and "Run" CodeLens actions above each enabled shell code block.
 * The block content is passed directly as a command argument, so the actions do
 * not depend on the editor focus.
 */
export class MarkdownRunCodeLensProvider implements vscode.CodeLensProvider {
	private readonly changeEmitter = new vscode.EventEmitter<void>();
	readonly onDidChangeCodeLenses = this.changeEmitter.event;

	/** Ask VS Code to refresh the lenses (e.g. after a settings change). */
	refresh(): void {
		this.changeEmitter.fire();
	}

	dispose(): void {
		this.changeEmitter.dispose();
	}

	provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
		if (!getShowInEditor()) {
			return [];
		}

		const lenses: vscode.CodeLens[] = [];
		for (const block of findCodeBlocks(document)) {
			if (!isLanguageEnabled(block.language)) {
				continue;
			}

			// Anchor both lenses to the opening fence line.
			const anchor = new vscode.Range(block.range.start, block.range.start);
			lenses.push(
				new vscode.CodeLens(anchor, {
					title: '$(copy) Copy',
					command: 'markdownRun.copy',
					arguments: [block.content],
				}),
				new vscode.CodeLens(anchor, {
					title: '$(play) Run',
					command: 'markdownRun.run',
					arguments: [block.content],
				}),
			);
		}
		return lenses;
	}
}
