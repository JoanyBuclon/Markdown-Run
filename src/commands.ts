import * as vscode from 'vscode';
import { getAutoExecute } from './config';

/** Copy the given code block content to the clipboard. */
export async function copyBlock(content: string): Promise<void> {
	await vscode.env.clipboard.writeText(content);
	vscode.window.setStatusBarMessage('Markdown Run: copied to clipboard', 2000);
}

/**
 * Run the given code block content in the integrated terminal.
 *
 * Reuses the active terminal when there is one, otherwise opens a new terminal
 * with the user's default profile. When `autoExecute` is enabled the command is
 * executed (sent with a trailing newline); otherwise it is only inserted.
 */
export function runBlock(content: string): void {
	const terminal = vscode.window.activeTerminal ?? vscode.window.createTerminal();
	terminal.show();
	terminal.sendText(content, getAutoExecute());
}
