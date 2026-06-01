import TurndownService from 'turndown';

/**
 * @param {string} html
 * @returns {string}
 */
export function convertHtmlToMarkdown(html) {
  const cleaned = preprocessHtml(html);

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  turndownService.addRule('ignoreStyleScript', {
    filter: ['style', 'script'],
    replacement: () => '',
  });

  turndownService.addRule('lineBreak', {
    filter: 'br',
    replacement: () => '\n',
  });

  return turndownService.turndown(cleaned);
}

/**
 * @param {string} html
 * @returns {string}
 */
function preprocessHtml(html) {
  let result = html;

  result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  result = result.replace(
    /<img\b[^>]*(?:\bwidth\s*=\s*["']?1["']?[^>]*\bheight\s*=\s*["']?1["']?|\bheight\s*=\s*["']?1["']?[^>]*\bwidth\s*=\s*["']?1["']?)[^>]*>/gi,
    '',
  );
  result = result.replace(
    /<img\b[^>]*\bstyle\s*=\s*["'][^"']*\b1px\b[^"']*["'][^>]*>/gi,
    '',
  );

  const emptyTagPattern = /<(div|p|span)(\s[^>]*)?>\s*<\/\1>/gi;
  let previous;
  do {
    previous = result;
    result = result.replace(emptyTagPattern, '');
  } while (result !== previous);

  return result;
}
