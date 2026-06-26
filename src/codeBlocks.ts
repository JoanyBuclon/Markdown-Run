import * as vscode from 'vscode';

/** A fenced code block found in a Markdown document. */
export interface CodeBlock {
	/** Language id from the fence info string, lowercased (e.g. "bash"). Empty when omitted. */
	language: string;
	/** Raw text content of the block, excluding the fence lines. */
	content: string;
	/** Full range of the block, from the opening fence line to the closing fence line. */
	range: vscode.Range;
}

/** Matches an opening fence: optional indent, ``` or ~~~ (3+), then an optional info string. */
const OPEN_FENCE = /^(\s*)(`{3,}|~{3,})\s*(\S*)/;
/** Matches a closing fence: optional indent, ``` or ~~~ (3+), nothing else but whitespace. */
const CLOSE_FENCE = /^\s*(`{3,}|~{3,})\s*$/;

/**
 * Parse a Markdown document and return every fenced code block.
 *
 * Handles both ``` and ~~~ fences. The closing fence must use the same fence
 * character and be at least as long as the opening one. Block content is
 * returned verbatim, minus the indentation of the opening fence.
 */
export function findCodeBlocks(document: vscode.TextDocument): CodeBlock[] {
	const blocks: CodeBlock[] = [];
	const lineCount = document.lineCount;
	let i = 0;

	while (i < lineCount) {
		const open = OPEN_FENCE.exec(document.lineAt(i).text);
		if (!open) {
			i++;
			continue;
		}

		const indent = open[1].length;
		const fenceChar = open[2][0];
		const fenceLen = open[2].length;
		const language = open[3].toLowerCase();

		// Find the matching closing fence.
		let closeLine = -1;
		for (let j = i + 1; j < lineCount; j++) {
			const close = CLOSE_FENCE.exec(document.lineAt(j).text);
			if (close && close[1][0] === fenceChar && close[1].length >= fenceLen) {
				closeLine = j;
				break;
			}
		}

		if (closeLine === -1) {
			// Unterminated fence: stop scanning, the rest is inside the block.
			break;
		}

		const contentLines: string[] = [];
		for (let k = i + 1; k < closeLine; k++) {
			contentLines.push(stripIndent(document.lineAt(k).text, indent));
		}

		blocks.push({
			language,
			content: contentLines.join('\n'),
			range: new vscode.Range(i, 0, closeLine, document.lineAt(closeLine).text.length),
		});

		i = closeLine + 1;
	}

	return blocks;
}

/** Return the code block containing the given position, if any. */
export function findCodeBlockAtPosition(
	document: vscode.TextDocument,
	position: vscode.Position,
): CodeBlock | undefined {
	return findCodeBlocks(document).find((block) => block.range.contains(position));
}

/** Remove up to `count` leading spaces/tabs from a line. */
function stripIndent(text: string, count: number): string {
	let removed = 0;
	while (removed < count && (text[removed] === ' ' || text[removed] === '\t')) {
		removed++;
	}
	return text.slice(removed);
}
