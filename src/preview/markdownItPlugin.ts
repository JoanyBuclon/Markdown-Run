import type MarkdownIt from 'markdown-it';
import { getShowInPreview, isLanguageEnabled } from '../config';

/**
 * Extend the Markdown preview's markdown-it instance to add a Copy button on
 * enabled code blocks.
 *
 * Copy is handled entirely client-side by the preview script (clipboard API).
 * There is no Run button in the preview: the built-in Markdown preview ignores
 * `command:` links for security, and a preview script cannot message the
 * extension host directly, so Run is offered only via the editor CodeLens.
 */
export function extendMarkdownItForPreview(md: MarkdownIt): MarkdownIt {
	const renderDefault =
		md.renderer.rules.fence ??
		((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

	md.renderer.rules.fence = (tokens, idx, options, env, self) => {
		const rendered = renderDefault(tokens, idx, options, env, self);
		if (!getShowInPreview()) {
			return rendered;
		}

		const token = tokens[idx];
		const language = token.info.trim().split(/\s+/u)[0].toLowerCase();
		if (!isLanguageEnabled(language)) {
			return rendered;
		}

		// Drop the trailing newline markdown-it keeps on fence content.
		const code = token.content.replace(/\n$/u, '');
		const codeAttribute = md.utils.escapeHtml(code);

		const toolbar =
			'<div class="markdown-run-toolbar">' +
			`<button type="button" class="markdown-run-copy" data-code="${codeAttribute}" title="Copy">Copy</button>` +
			'</div>';

		return `<div class="markdown-run-block">${toolbar}${rendered}</div>`;
	};

	return md;
}
