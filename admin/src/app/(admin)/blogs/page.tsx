"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Eye, Save, Loader2, ArrowLeft, FileText, Check, UploadCloud } from 'lucide-react';

export default function BlogManager() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);

  const [mediaList, setMediaList] = useState<any[]>([]);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [activeMediaTarget, setActiveMediaTarget] = useState<'cover' | 'content'>('cover');

  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);

  const fetchBlogsAndMedia = async () => {
    setLoading(true);
    try {
      const blogData = await apiClient.get('blogs');
      setBlogs(blogData);
      
      const mediaData = await apiClient.get('media');
      setMediaList(mediaData);
    } catch (err) {
      console.error("Failed to load blog / media data", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogsAndMedia();
  }, []);

  // Helper to convert res.cloudinary.com URL to Next.js proxy route /media/...
  const toProxyUrl = (url: string) => {
    if (!url) return '';
    return url.replace(/^https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload/, '/media');
  };

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

  const handleEdit = (blog: any) => {
    setTitle(blog.title || '');
    setSlug(blog.slug || '');
    setExcerpt(blog.excerpt || '');
    setContent(blog.content || '');
    setCoverImage(blog.coverImage || '');
    setPublished(blog.published || false);
    setEditingId(blog.id);
    setIsFormOpen(true);
    setPreviewMode('edit');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      try {
        await apiClient.delete('blogs', id);
        fetchBlogsAndMedia();
      } catch (err) {
        alert('Failed to delete blog post');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return alert('Slug is required');

    setSaving(true);
    const blogPayload = {
      title,
      slug,
      excerpt,
      content,
      coverImage: toProxyUrl(coverImage), // Ensure stored image references Next.js proxy path
      published,
      createdAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await apiClient.put('blogs', editingId, blogPayload);
      } else {
        await apiClient.post('blogs', blogPayload);
      }
      setIsFormOpen(false);
      resetForm();
      fetchBlogsAndMedia();
    } catch (err) {
      alert('Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCoverImage('');
    setPublished(false);
    setEditingId(null);
  };

  const insertMediaIntoContent = (url: string) => {
    const proxyUrl = toProxyUrl(url);
    const markdownImage = `\n![Image](${proxyUrl})\n`;
    setContent(prev => prev + markdownImage);
    setShowMediaSelector(false);
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#F59F59]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      {!isFormOpen && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1D1A39] font-display">Blog Manager</h1>
            <p className="text-[#1D1A39]/60 font-medium">Draft, edit, and publish case study articles.</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="bg-[#1D1A39] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#1D1A39]/90 transition-colors"
          >
            <Plus className="w-5 h-5" /> Write Post
          </button>
        </div>
      )}

      {/* BLOG FORM SECTION */}
      {isFormOpen ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#1D1A39]/10">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-700">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-[#1D1A39]">{editingId ? 'Edit Blog Post' : 'Create Blog Post'}</h2>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Preview Toggle */}
              <div className="flex bg-[#fafafa] border rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode('edit')}
                  className={`px-4 py-1.5 rounded-md font-bold text-sm transition-colors ${previewMode === 'edit' ? 'bg-[#1D1A39] text-white' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('preview')}
                  className={`px-4 py-1.5 rounded-md font-bold text-sm transition-colors ${previewMode === 'preview' ? 'bg-[#1D1A39] text-white' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Preview
                </button>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#1D1A39] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#1D1A39]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Publish
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {previewMode === 'edit' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Writing Panel */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-[#1D1A39] mb-2">Blog Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Title of forensic case study"
                      className="w-full px-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] font-medium text-[#1D1A39]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1D1A39] mb-2">Slug URL (Editable)</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(generateSlug(e.target.value))}
                      placeholder="e.g. dynamic-case-analysis"
                      className="w-full px-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] font-mono text-[#1D1A39]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1D1A39] mb-2">Excerpt</label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Short 2-sentence summary of the post..."
                      className="w-full px-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] font-medium text-[#1D1A39] h-20"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-[#1D1A39]">Body Content (Markdown)</label>
                      <button
                        type="button"
                        onClick={() => { setActiveMediaTarget('content'); setShowMediaSelector(true); }}
                        className="text-xs font-bold text-[#F59F59] hover:underline flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Insert Proxy Media
                      </button>
                    </div>
                    <textarea
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your article content using markdown tags..."
                      className="w-full px-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] font-mono text-[#1D1A39] h-96"
                    />
                  </div>
                </div>

                {/* Meta Side-panel */}
                <div className="space-y-6">
                  <div className="bg-[#fafafa] p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-[#1D1A39] mb-4">Post Publishing</h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-sm text-[#1D1A39]">Status: {published ? 'Published' : 'Draft'}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={published}
                          onChange={(e) => setPublished(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-[#fafafa] p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-[#1D1A39] mb-4">Cover Image</h3>
                    <div className="space-y-4">
                      {coverImage ? (
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-100 border">
                          <img src={coverImage.startsWith('/media') ? coverImage : toProxyUrl(coverImage)} alt="Cover preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setCoverImage('')}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1.5 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => { setActiveMediaTarget('cover'); setShowMediaSelector(true); }}
                          className="w-full aspect-video border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100/50 transition-colors"
                        >
                          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500 font-bold">Select Cover Media</span>
                        </div>
                      )}
                      
                      <input
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="Or paste media path directly..."
                        className="w-full px-3 py-2 bg-white border border-[#1D1A39]/10 rounded-lg focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Preview Mode */
              <div className="max-w-3xl mx-auto space-y-6">
                {coverImage && (
                  <div className="w-full aspect-video rounded-3xl overflow-hidden">
                    <img src={coverImage.startsWith('/media') ? coverImage : toProxyUrl(coverImage)} alt={title} className="w-full h-full object-cover" />
                  </div>
                )}
                <h1 className="text-4xl font-bold text-[#1D1A39] font-display">{title || 'Untitled Post'}</h1>
                {excerpt && <p className="text-xl font-medium text-gray-500 leading-relaxed italic">"{excerpt}"</p>}
                <div className="border-t pt-6 text-[#1D1A39]/80 font-medium leading-relaxed space-y-4">
                  {content ? (
                    <div className="prose max-w-none whitespace-pre-wrap font-sans text-base">
                      {content}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No content written yet.</p>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* Media Manager Selector Drawer */}
          {showMediaSelector && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#1D1A39] font-display">Select Proxy Media</h3>
                    <p className="text-xs text-gray-500 font-medium">Choose an existing image or upload a new one directly into the 'blog' folder.</p>
                  </div>
                  <button onClick={() => setShowMediaSelector(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Direct Inline Uploader */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                  <div className="flex items-center gap-2 text-gray-500">
                    <UploadCloud className="w-5 h-5 text-[#F59F59]" />
                    <span className="text-xs font-bold">Upload directly to Cloudinary:</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setSaving(true);
                        // Get Signature from Worker
                        const { signature, timestamp, cloudName, apiKey } = await apiClient.getCloudinarySignature('blog');
                        
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('api_key', apiKey);
                        formData.append('timestamp', timestamp.toString());
                        formData.append('signature', signature);
                        formData.append('folder', 'blog');
                        
                        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                          method: 'POST',
                          body: formData,
                        });
                        const uploadData = await uploadRes.json();
                        if (uploadData.error) throw new Error(uploadData.error.message);
                        
                        // Save in Firebase
                        await apiClient.post('media', {
                          url: uploadData.secure_url,
                          publicId: uploadData.public_id,
                          filename: file.name,
                          createdAt: new Date().toISOString()
                        });
                        
                        const proxyUrl = toProxyUrl(uploadData.secure_url);
                        if (activeMediaTarget === 'cover') {
                          setCoverImage(proxyUrl);
                        } else {
                          insertMediaIntoContent(uploadData.secure_url);
                        }
                        setShowMediaSelector(false);
                        fetchBlogsAndMedia();
                      } catch (err: any) {
                        alert("Inline upload failed: " + err.message);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="text-xs text-gray-500 font-bold w-full sm:w-auto"
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 overflow-y-auto flex-grow p-1">
                  {mediaList.map((m: any) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        if (activeMediaTarget === 'cover') {
                          setCoverImage(toProxyUrl(m.url));
                          setShowMediaSelector(false);
                        } else {
                          insertMediaIntoContent(m.url);
                        }
                      }}
                      className="cursor-pointer border border-gray-200 rounded-xl overflow-hidden aspect-video bg-gray-50 flex items-center justify-center hover:ring-2 hover:ring-[#F59F59] transition-all"
                    >
                      <img src={toProxyUrl(m.url)} alt={m.filename} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {mediaList.length === 0 && (
                    <p className="col-span-full py-16 text-center text-gray-400">No media uploads found. Upload images above or in Media Manager.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* BLOG LIST VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="h-44 bg-gray-100 relative">
                {blog.coverImage ? (
                  <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#E8BCB9] to-[#F59F59] flex items-center justify-center">
                    <FileText className="w-12 h-12 text-[#1D1A39]/30" />
                  </div>
                )}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow ${blog.published ? 'bg-green-500' : 'bg-yellow-500'}`}>
                  {blog.published ? 'Published' : 'Draft'}
                </div>
              </div>
              
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#1D1A39] line-clamp-2 leading-tight mb-2">{blog.title}</h3>
                  <p className="text-gray-500 text-xs font-mono mb-4">{blog.slug}</p>
                  <p className="text-gray-600 text-sm font-medium line-clamp-2 leading-relaxed mb-6">{blog.excerpt || 'No description provided.'}</p>
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-[#1D1A39] font-bold py-2 rounded-xl text-sm transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {blogs.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white rounded-[2rem] border border-dashed flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="font-bold text-lg text-[#1D1A39] mb-1">No articles found</h3>
              <p className="text-gray-500 text-sm font-medium">Click "Write Post" to publish your first forensic study.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
