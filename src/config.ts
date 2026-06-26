import * as vscode from 'vscode';

const SECTION = 'markdownRun';
const DEFAULT_LANGUAGES = ['sh', 'bash', 'powershell'];
const DEFAULT_DOCUMENT_LANGUAGES = ['markdown'];

function config(): vscode.WorkspaceConfiguration {
	return vscode.workspace.getConfiguration(SECTION);
}

/** Editor language modes the extension acts on (e.g. "markdown"). */
export function getDocumentLanguages(): string[] {
	return config().get<string[]>('documentLanguages', DEFAULT_DOCUMENT_LANGUAGES);
}

/** Whether the given document language mode is one the extension acts on. */
export function isDocumentLanguage(languageId: string): boolean {
	return getDocumentLanguages().includes(languageId);
}

/** Languages on which the actions are shown, lowercased. */
export function getLanguages(): string[] {
	return config()
		.get<string[]>('languages', DEFAULT_LANGUAGES)
		.map((language) => language.toLowerCase());
}

/** Whether the given code block language is enabled for the actions. */
export function isLanguageEnabled(language: string): boolean {
	const languages = getLanguages();
	// An empty list disables filtering: the actions apply to every code block.
	return languages.length === 0 || languages.includes(language.toLowerCase());
}

/** Whether "Run" executes automatically (sends the text followed by Enter). */
export function getAutoExecute(): boolean {
	return config().get<boolean>('autoExecute', true);
}

/** Whether CodeLens actions are shown in the editor. */
export function getShowInEditor(): boolean {
	return config().get<boolean>('showInEditor', true);
}

/** Whether action buttons are shown in the Markdown preview. */
export function getShowInPreview(): boolean {
	return config().get<boolean>('showInPreview', true);
}
