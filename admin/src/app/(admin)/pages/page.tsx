"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/api/client';
import { 
  Plus, Edit2, Trash2, X, Save, Loader2, FileText, 
  Check, Lock, Settings, ArrowUpRight, Globe 
} from 'lucide-react';

export default function PageManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);

  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('pages');
      setPages(data);
    } catch (err) {
      console.error("Failed to load page data", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_]+/g, '-')   // Replace spaces/underscores with hyphens
      .replace(/-+/g, '-');      // Remove duplicate hyphens
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      setSlug(generateSlug(val));
    }
  };

  const handleEdit = (page: any) => {
    setTitle(page.title || '');
    setSlug(page.slug || '');
    setContent(page.content || '');
    setPublished(page.published || false);
    setEditingId(page.id);
    setIsFormOpen(true);
    setPreviewMode('edit');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this custom page?')) {
      try {
        await apiClient.delete('pages', id);
        fetchPages();
      } catch (err) {
        alert('Failed to delete page');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return alert('Slug is required');

    setSaving(true);
    const pagePayload = {
      title,
      slug,
      content,
      published,
      createdAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await apiClient.put('pages', editingId, pagePayload);
      } else {
        await apiClient.post('pages', pagePayload);
      }
      setIsFormOpen(false);
      resetForm();
      fetchPages();
    } catch (err) {
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setContent('');
    setPublished(false);
    setEditingId(null);
  };

  if (loading && pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#F59F59]" />
      </div>
    );
  }

  const systemPages = [
    {
      id: 'sys-home',
      title: 'Homepage',
      slug: '',
      isSystem: true,
      published: true,
      route: '/',
      managerPath: '/',
      managerLabel: 'Homepage Editor',
      pageData: null
    },
    {
      id: 'sys-blogs',
      title: 'Blog Feed',
      slug: 'blogs',
      isSystem: true,
      published: true,
      route: '/blogs',
      managerPath: '/blogs',
      managerLabel: 'Blog Manager',
      pageData: null
    }
  ];

  // Identify special CMS slugs: 404, error, creator-guide
  const specialSlugs = ['404', 'error', 'creator-guide'];

  const allPagesToRender = [
    ...systemPages,
    ...pages.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      // Mark reserved/special slugs differently but still editable
      isSystem: false,
      isSpecial: specialSlugs.includes(p.slug),
      published: p.published,
      route: `/p/${p.slug}`,
      managerPath: '',
      managerLabel: '',
      pageData: p
    }))
  ];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      {!isFormOpen && (
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#1D1A39] font-display flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#F59F59]" /> Page Manager
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Create and manage custom website pages (e.g. Terms, Privacy).</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="bg-[#1D1A39] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#1D1A39]/90 transition-colors flex items-center gap-2 text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Custom Page
          </button>
        </div>
      )}

      {/* FORM MODE */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-[#1D1A39]">{editingId ? 'Edit Custom Page' : 'Create Custom Page'}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Define your page slug, title, and markdown content.</p>
            </div>
            <button onClick={() => setIsFormOpen(false)} className="p-2 border rounded-xl hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#1D1A39]/60 tracking-wider mb-2">Page Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => handleTitleChange(e.target.value)} 
                  required
                  placeholder="e.g. Terms of Service"
                  className="w-full bg-white border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59F59]/20 focus:border-[#F59F59]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#1D1A39]/60 tracking-wider mb-2">URL Slug</label>
                <div className="flex rounded-xl overflow-hidden border focus-within:ring-2 focus-within:ring-[#F59F59]/20 focus-within:border-[#F59F59]">
                  <span className="bg-gray-50 text-gray-400 text-sm px-3 py-3 border-r select-none">/p/</span>
                  <input 
                    type="text" 
                    value={slug} 
                    onChange={(e) => setSlug(generateSlug(e.target.value))} 
                    required
                    placeholder="terms-of-service"
                    className="w-full bg-white p-3 text-sm focus:outline-none flex-grow"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 border-b pb-2">
              <button 
                type="button" 
                onClick={() => setPreviewMode('edit')}
                className={`pb-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors ${previewMode === 'edit' ? 'border-[#F59F59] text-[#1D1A39]' : 'border-transparent text-gray-400 hover:text-[#1D1A39]'}`}
              >
                Write Content
              </button>
              <button 
                type="button" 
                onClick={() => setPreviewMode('preview')}
                className={`pb-2 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors ${previewMode === 'preview' ? 'border-[#F59F59] text-[#1D1A39]' : 'border-transparent text-gray-400 hover:text-[#1D1A39]'}`}
              >
                Markdown Preview
              </button>
            </div>

            {previewMode === 'edit' ? (
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#1D1A39]/60 tracking-wider mb-2">Markdown Content</label>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  required
                  rows={15}
                  placeholder="# Write your page content using markdown...&#10;&#10;Use headings, bullet points, bold text, etc."
                  className="w-full bg-white border rounded-xl p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#F59F59]/20 focus:border-[#F59F59]"
                />
              </div>
            ) : (
              <div className="border rounded-xl p-6 min-h-[300px] max-w-none bg-gray-50 overflow-y-auto">
                {content ? (
                  <div className="text-sm text-gray-800">
                    <CustomMarkdown content={content} />
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">Nothing to preview yet.</p>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={published} 
                  onChange={(e) => setPublished(e.target.checked)} 
                  className="w-4 h-4 rounded text-[#F59F59] focus:ring-[#F59F59]"
                />
                <span className="text-sm font-bold text-[#1D1A39]">Publish this page live</span>
              </label>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 border rounded-xl text-gray-600 font-bold hover:bg-gray-50 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-[#1D1A39] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#1D1A39]/90 disabled:opacity-50 text-sm transition-all shadow-sm flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'Update & Save' : 'Publish Page'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* LIST TABLE MODE */}
      {!isFormOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-extrabold uppercase text-[#1D1A39]/60 tracking-wider border-b border-gray-100">
                  <th className="p-4 sm:p-6">Page Name</th>
                  <th className="p-4 sm:p-6">Page Type</th>
                  <th className="p-4 sm:p-6">Live URL Route</th>
                  <th className="p-4 sm:p-6">Status</th>
                  <th className="p-4 sm:p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {allPagesToRender.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 sm:p-6 font-bold text-[#1D1A39] flex items-center gap-2">
                      {p.isSystem ? (
                        <Globe className="w-4 h-4 text-gray-400" />
                      ) : (p as any).isSpecial ? (
                        <Settings className="w-4 h-4 text-teal-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-[#F59F59]" />
                      )}
                      {p.title}
                      {(p as any).isSpecial && (
                        <span className="ml-1 text-[10px] bg-teal-50 text-teal-600 border border-teal-200 px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                          System-Editable
                        </span>
                      )}
                    </td>
                    <td className="p-4 sm:p-6">
                      {p.isSystem ? (
                        <span className="inline-flex items-center gap-1 bg-[#1D1A39]/5 text-[#1D1A39] px-2.5 py-1 rounded-full text-xs font-extrabold">
                          <Lock className="w-3 h-3 text-[#1D1A39]/60" /> System Page
                        </span>
                      ) : (p as any).isSpecial ? (
                        <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full text-xs font-extrabold">
                          <Settings className="w-3 h-3" /> Special CMS Page
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-[#F59F59] px-2.5 py-1 rounded-full text-xs font-extrabold">
                          Custom Page
                        </span>
                      )}
                    </td>
                    <td className="p-4 sm:p-6 font-mono text-xs">
                      <a 
                        href={p.isSystem ? `http://localhost:3000${p.route}` : `http://localhost:3000/p/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-505 hover:text-[#F59F59] hover:underline inline-flex items-center gap-1 font-semibold transition-colors"
                      >
                        {p.isSystem ? p.route || '/' : `/p/${p.slug}`}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                      </a>
                    </td>
                    <td className="p-4 sm:p-6">
                      {p.isSystem ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-extrabold">
                          <Check className="w-3.5 h-3.5" /> Always Live
                        </span>
                      ) : p.published ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-extrabold">
                          <Check className="w-3.5 h-3.5" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 px-2.5 py-1 rounded-full text-xs font-bold">
                          Draft Mode
                        </span>
                      )}
                    </td>
                    <td className="p-4 sm:p-6 text-right">
                      <div className="flex justify-end gap-2">
                        {p.isSystem ? (
                          <Link 
                            href={p.managerPath!} 
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-[#F59F59]/10 border border-gray-200 text-[#1D1A39] font-bold rounded-xl text-xs transition-all shadow-sm"
                            title={`Go to ${p.managerLabel}`}
                          >
                            <Settings className="w-3.5 h-3.5 text-[#1D1A39]/70" />
                            {p.managerLabel}
                          </Link>
                        ) : (
                          <>
                            <button 
                              type="button"
                              onClick={() => handleEdit(p.pageData)}
                              className="p-2 border rounded-xl hover:bg-gray-150 text-[#1D1A39] transition-colors bg-white shadow-sm"
                              title="Edit Custom Page"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDelete(p.id)}
                              className="p-2 border border-red-150 rounded-xl hover:bg-red-50 text-red-700 transition-colors bg-white shadow-sm"
                              title="Delete Page"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomMarkdown({ content }: { content: string }) {
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
    safeText = safeText.replace(/`([^`]+)`/g, '<code class="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded font-mono text-xs text-red-600 font-bold">$1</code>');

    // Bold: **text**
    safeText = safeText.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-extrabold text-[#1D1A39]">$1</strong>');
    safeText = safeText.replace(/__([^_]+)__/g, '<strong class="font-extrabold text-[#1D1A39]">$1</strong>');

    // Italic: *text* or _text_
    safeText = safeText.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-600 font-medium">$1</em>');
    safeText = safeText.replace(/_([^_]+)_/g, '<em class="italic text-gray-600 font-medium">$1</em>');

    // Links: [text](url) — V2 FIX: sanitize dangerous protocols
    safeText = safeText.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_: string, text: string, url: string) => {
        const trimmedUrl = url.trim();
        const isSafe = /^(https?:\/\/|mailto:|\/|#)/.test(trimmedUrl);
        const safeUrl = isSafe ? trimmedUrl : '#';
        return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-[#F59F59] hover:text-[#1D1A39] underline transition-colors font-bold">${text}</a>`;
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
    const listComponent = currentList.type === 'ul' ? (
      <ul key={`list-${key}`} className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
        {listItems}
      </ul>
    ) : (
      <ol key={`list-${key}`} className="list-decimal pl-6 mb-6 text-gray-700 space-y-1">
        {listItems}
      </ol>
    );
    currentList = null;
    return listComponent;
  };

  let elementKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${elementKey++}`} className="bg-[#1D1A39] border border-gray-200 rounded-xl p-4 overflow-x-auto font-mono text-xs text-white/90 mb-6 shadow-inner">
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

    // Handle headers
    if (line.startsWith('# ')) {
      if (currentList) elements.push(flushList(elementKey++));
      elements.push(
        <h1 key={`h1-${elementKey++}`} className="text-2xl font-bold text-[#1D1A39] mt-6 mb-3 border-b pb-1 font-display">
          {parseInline(line.slice(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      if (currentList) elements.push(flushList(elementKey++));
      elements.push(
        <h2 key={`h2-${elementKey++}`} className="text-xl font-bold text-[#1D1A39] mt-5 mb-2 font-display">
          {parseInline(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      if (currentList) elements.push(flushList(elementKey++));
      elements.push(
        <h3 key={`h3-${elementKey++}`} className="text-lg font-bold text-[#1D1A39] mt-4 mb-2 font-display">
          {parseInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    // Handle blockquotes
    if (line.startsWith('> ')) {
      if (currentList) elements.push(flushList(elementKey++));
      elements.push(
        <blockquote key={`bq-${elementKey++}`} className="border-l-4 border-[#F59F59] bg-[#1D1A39]/5 pl-4 py-2 pr-2 rounded-r-lg italic text-gray-600 my-4 text-sm">
          {parseInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Handle horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      if (currentList) elements.push(flushList(elementKey++));
      elements.push(<hr key={`hr-${elementKey++}`} className="border-gray-200 my-6" />);
      continue;
    }

    // Handle lists
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
    if (ulMatch) {
      const content = ulMatch[2];
      if (currentList && currentList.type === 'ul') {
        currentList.items.push(content);
      } else {
        if (currentList) elements.push(flushList(elementKey++));
        currentList = { type: 'ul', items: [content] };
      }
      continue;
    }

    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
    if (olMatch) {
      const content = olMatch[2];
      if (currentList && currentList.type === 'ol') {
        currentList.items.push(content);
      } else {
        if (currentList) elements.push(flushList(elementKey++));
        currentList = { type: 'ol', items: [content] };
      }
      continue;
    }

    // Handle blank lines
    if (line.trim() === '') {
      if (currentList) {
        elements.push(flushList(elementKey++));
      }
      continue;
    }

    // Standard paragraph line
    if (currentList) {
      elements.push(flushList(elementKey++));
    }
    elements.push(
      <p key={`p-${elementKey++}`} className="mb-3 leading-relaxed text-gray-700 font-medium">
        {parseInline(line)}
      </p>
    );
  }

  if (currentList) {
    elements.push(flushList(elementKey++));
  }

  return <div className="markdown-body space-y-2">{elements}</div>;
}
