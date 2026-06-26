// Runs inside the Markdown preview webview. Handles the client-side "Copy"
// action; "Run" is a command: link handled by VS Code itself.
(function () {
	'use strict';

	if (window.__markdownRunInitialized) {
		return;
	}
	window.__markdownRunInitialized = true;

	function showFeedback(button, message) {
		var original = button.textContent;
		button.textContent = message;
		button.classList.add('markdown-run-copied');
		setTimeout(function () {
			button.textContent = original;
			button.classList.remove('markdown-run-copied');
		}, 1200);
	}

	function fallbackCopy(text) {
		var textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.select();
		try {
			document.execCommand('copy');
		} catch (error) {
			// Ignore: nothing else we can do from the webview.
		}
		document.body.removeChild(textarea);
	}

	document.addEventListener('click', function (event) {
		var button = event.target.closest('.markdown-run-copy');
		if (!button) {
			return;
		}

		var code = button.getAttribute('data-code') || '';
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(code).then(
				function () {
					showFeedback(button, 'Copied!');
				},
				function () {
					fallbackCopy(code);
					showFeedback(button, 'Copied!');
				},
			);
		} else {
			fallbackCopy(code);
			showFeedback(button, 'Copied!');
		}
	});
})();
