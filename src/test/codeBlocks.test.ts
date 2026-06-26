import * as assert from 'assert';
import * as vscode from 'vscode';
import { findCodeBlockAtPosition, findCodeBlocks } from '../codeBlocks';

function openMarkdown(content: string): Thenable<vscode.TextDocument> {
	return vscode.workspace.openTextDocument({ language: 'markdown', content });
}

suite('findCodeBlocks', () => {
	test('finds a single fenced block with its language and content', async () => {
		const document = await openMarkdown('# Title\n\n```bash\nls -la\n```\n');
		const blocks = findCodeBlocks(document);
		assert.strictEqual(blocks.length, 1);
		assert.strictEqual(blocks[0].language, 'bash');
		assert.strictEqual(blocks[0].content, 'ls -la');
	});

	test('finds multiple blocks and lowercases the language', async () => {
		const document = await openMarkdown('```SH\na\n```\n\n```PowerShell\nb\n```\n');
		const blocks = findCodeBlocks(document);
		assert.strictEqual(blocks.length, 2);
		assert.deepStrictEqual(
			blocks.map((block) => block.language),
			['sh', 'powershell'],
		);
	});

	test('supports tilde fences', async () => {
		const document = await openMarkdown('~~~bash\necho hi\n~~~\n');
		const blocks = findCodeBlocks(document);
		assert.strictEqual(blocks.length, 1);
		assert.strictEqual(blocks[0].content, 'echo hi');
	});

	test('keeps only the first token of the info string as language', async () => {
		const document = await openMarkdown('```bash {.line-numbers}\nx\n```\n');
		const blocks = findCodeBlocks(document);
		assert.strictEqual(blocks[0].language, 'bash');
	});

	test('returns an empty language for a fence without info string', async () => {
		const document = await openMarkdown('```\nplain\n```\n');
		const blocks = findCodeBlocks(document);
		assert.strictEqual(blocks.length, 1);
		assert.strictEqual(blocks[0].language, '');
	});

	test('strips the opening fence indentation from content', async () => {
		const document = await openMarkdown('- item\n\n  ```bash\n  ls\n  ```\n');
		const blocks = findCodeBlocks(document);
		assert.strictEqual(blocks.length, 1);
		assert.strictEqual(blocks[0].content, 'ls');
	});

	test('preserves blank lines inside a block', async () => {
		const document = await openMarkdown('```bash\na\n\nb\n```\n');
		const blocks = findCodeBlocks(document);
		assert.strictEqual(blocks[0].content, 'a\n\nb');
	});

	test('ignores an unterminated fence', async () => {
		const document = await openMarkdown('```bash\nls\nno closing fence\n');
		const blocks = findCodeBlocks(document);
		assert.strictEqual(blocks.length, 0);
	});

	test('requires the closing fence to be at least as long as the opening', async () => {
		const document = await openMarkdown('````bash\n```\nstill inside\n````\n');
		const blocks = findCodeBlocks(document);
		assert.strictEqual(blocks.length, 1);
		assert.strictEqual(blocks[0].content, '```\nstill inside');
	});
});

suite('findCodeBlockAtPosition', () => {
	test('returns the block containing the position', async () => {
		const document = await openMarkdown('intro\n\n```bash\nls\n```\n');
		const block = findCodeBlockAtPosition(document, new vscode.Position(3, 0));
		assert.ok(block);
		assert.strictEqual(block.language, 'bash');
	});

	test('returns undefined outside any block', async () => {
		const document = await openMarkdown('intro\n\n```bash\nls\n```\n');
		const block = findCodeBlockAtPosition(document, new vscode.Position(0, 0));
		assert.strictEqual(block, undefined);
	});
});
