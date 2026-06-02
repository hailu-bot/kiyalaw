export function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks (```...```) — must run before inline code
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) => {
    const escaped = code
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre style="background:#f4f4f4;padding:12px;border-radius:4px;font-size:10px;overflow-x:auto;margin:8px 0;"><code>${escaped.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:1px 4px;border-radius:3px;font-size:0.9em;">$1</code>');

  // Bold + italic ***text***
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#D4AF37;text-decoration:underline;">$1</a>');

  // Headings
  html = html.replace(/^###### (.+)$/gm, '<h6 style="font-size:10px;font-weight:700;margin:8px 0 4px;">$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5 style="font-size:11px;font-weight:700;margin:8px 0 4px;">$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4 style="font-size:12px;font-weight:700;margin:8px 0 4px;">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;margin:12px 0 6px;">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:16px;font-weight:700;margin:12px 0 6px;">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:20px;font-weight:700;margin:16px 0 8px;">$1</h1>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li style="margin-left:20px;list-style-type:disc;">$1</li>');
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li style="margin-left:20px;list-style-type:decimal;">$1</li>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g, '<ul style="margin:4px 0;padding:0;">$1</ul>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #ccc;margin:16px 0;" />');

  // Paragraphs: wrap remaining text blocks
  const blocks = html.split(/\n\s*\n/);
  html = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<') && trimmed.endsWith('>') && trimmed.includes('</')) {
      return trimmed;
    }
    return `<p style="margin:4px 0;line-height:1.6;">${trimmed.replace(/\n/g, '<br />')}</p>`;
  }).join('\n');

  return html;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}
