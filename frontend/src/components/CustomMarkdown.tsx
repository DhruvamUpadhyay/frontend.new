import React from 'react';

/**
 * CustomMarkdown renderer for Forensics By Priyanshi pages.
 * Supports: H1-H3 headers, bold, italic, inline code, links,
 * blockquotes, horizontal rules, ordered/unordered lists, and code blocks.
 * All styling follows the navy/amber/peach brand color system.
 */
export function CustomMarkdown({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const parseInline = (text: string) => {
    let safeText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Inline code: `code`
    safeText = safeText.replace(
      /`([^`]+)`/g,
      '<code class="bg-[#1D1A39]/80 border border-white/10 px-1.5 py-0.5 rounded font-mono text-xs text-[#f59f59]">$1</code>'
    );

    // Bold: **text** or __text__
    safeText = safeText.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-extrabold text-white">$1</strong>');
    safeText = safeText.replace(/__([^_]+)__/g, '<strong class="font-extrabold text-white">$1</strong>');

    // Italic: *text* or _text_
    safeText = safeText.replace(/\*([^*]+)\*/g, '<em class="italic text-[#e8bcb9]">$1</em>');
    safeText = safeText.replace(/_([^_]+)_/g, '<em class="italic text-[#e8bcb9]">$1</em>');

    // Images: ![alt](url)
    safeText = safeText.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (_: string, alt: string, url: string) => {
        const trimmedUrl = url.trim();
        const isSafe = /^(https?:\/\/|\/)/.test(trimmedUrl);
        const safeUrl = isSafe ? trimmedUrl : '';
        if (!safeUrl) return '';
        const escapedAlt = alt.replace(/"/g, '&quot;');
        return `<span class="my-10 w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-black/20 flex justify-center"><img src="${safeUrl}" alt="${escapedAlt}" class="w-full h-auto object-cover max-h-[500px]" loading="lazy" /></span>`;
      }
    );

    // Links: [text](url) — V2 FIX: sanitize javascript: and other dangerous protocols
    safeText = safeText.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_: string, text: string, url: string) => {
        const trimmedUrl = url.trim();
        const isSafe = /^(https?:\/\/|mailto:|\/|#)/.test(trimmedUrl);
        const safeUrl = isSafe ? trimmedUrl : '#';
        return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-[#f59f59] hover:text-[#e8bcb9] underline transition-colors font-bold">${text}</a>`;
      }
    );

    return <span dangerouslySetInnerHTML={{ __html: safeText }} />;
  };

  const flushList = (key: number) => {
    if (!currentList) return null;
    const listItems = currentList.items.map((item, idx) => (
      <li key={idx} className="mb-2 leading-relaxed">
        {parseInline(item)}
      </li>
    ));
    const listComponent =
      currentList.type === 'ul' ? (
        <ul key={`list-${key}`} className="list-disc pl-6 mb-6 text-white/80 space-y-1">
          {listItems}
        </ul>
      ) : (
        <ol key={`list-${key}`} className="list-decimal pl-6 mb-6 text-white/80 space-y-1">
          {listItems}
        </ol>
      );
    currentList = null;
    return listComponent;
  };

  let elementKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${elementKey++}`}
            className="bg-[#1D1A39] border border-white/10 rounded-2xl p-4 overflow-x-auto font-mono text-sm text-[#e8bcb9] mb-6 shadow-inner"
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        inCodeBlock = false;
        codeLines = [];
      } else {
        if (currentList) elements.push(flushList(elementKey++));
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // H1
    if (line.startsWith('# ')) {
      if (currentList) elements.push(flushList(elementKey++));
      elements.push(
        <h1
          key={`h1-${elementKey++}`}
          className="text-3xl md:text-4xl font-bold font-display text-white mt-8 mb-4 border-b border-white/10 pb-2"
        >
          {parseInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    // H2
    if (line.startsWith('## ')) {
      if (currentList) elements.push(flushList(elementKey++));
      const rawText = line.slice(3);
      const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      elements.push(
        <h2
          key={`h2-${elementKey++}`}
          id={id}
          className="text-2xl md:text-3xl font-bold font-display text-white mt-10 mb-4 scroll-mt-24"
        >
          {parseInline(rawText)}
        </h2>
      );
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      if (currentList) elements.push(flushList(elementKey++));
      const rawText = line.slice(4);
      const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      elements.push(
        <h3
          key={`h3-${elementKey++}`}
          id={id}
          className="text-xl md:text-2xl font-bold font-display text-white mt-6 mb-3 scroll-mt-24"
        >
          {parseInline(rawText)}
        </h3>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      if (currentList) elements.push(flushList(elementKey++));
      elements.push(
        <blockquote
          key={`bq-${elementKey++}`}
          className="border-l-4 border-[#f59f59] bg-[#1D1A39]/20 pl-4 py-3 pr-2 rounded-r-xl italic text-white/80 my-6"
        >
          {parseInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      if (currentList) elements.push(flushList(elementKey++));
      elements.push(<hr key={`hr-${elementKey++}`} className="border-white/10 my-8" />);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
    if (ulMatch) {
      const listContent = ulMatch[2];
      if (currentList && currentList.type === 'ul') {
        currentList.items.push(listContent);
      } else {
        if (currentList) elements.push(flushList(elementKey++));
        currentList = { type: 'ul', items: [listContent] };
      }
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
    if (olMatch) {
      const listContent = olMatch[2];
      if (currentList && currentList.type === 'ol') {
        currentList.items.push(listContent);
      } else {
        if (currentList) elements.push(flushList(elementKey++));
        currentList = { type: 'ol', items: [listContent] };
      }
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      if (currentList) elements.push(flushList(elementKey++));
      continue;
    }

    // Standard paragraph
    if (currentList) elements.push(flushList(elementKey++));
    elements.push(
      <p key={`p-${elementKey++}`} className="mb-4 leading-relaxed text-white/80 font-medium">
        {parseInline(line)}
      </p>
    );
  }

  if (currentList) elements.push(flushList(elementKey++));

  return <div className="markdown-body space-y-1">{elements}</div>;
}
