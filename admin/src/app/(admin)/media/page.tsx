"use client";
import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/api/client';
import { UploadCloud, Image as ImageIcon, Trash2, Copy, CheckCircle2, RefreshCw } from 'lucide-react';

interface Media {
  id: string;
  url: string;
  publicId: string;
  filename: string;
  createdAt: string;
}

export default function MediaManager() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [editingFilename, setEditingFilename] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('media');
      setMediaList(data);
    } catch (err) {
      console.error("Failed to fetch media", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const toProxyUrl = (url: string) => {
    if (!url) return '';
    return url.replace(/^https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload/, '/media');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Get Signature from our Worker
      const { signature, timestamp, cloudName, apiKey } = await apiClient.getCloudinarySignature('blog');
      
      // 2. Upload to Cloudinary directly from Browser
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      // Save images in 'blog' folder prefix
      formData.append('folder', 'blog');

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const uploadData = await uploadRes.json();
      if (uploadData.error) throw new Error(uploadData.error.message);

      // 3. Save reference to our database via Worker
      await apiClient.post('media', {
        url: uploadData.secure_url,
        publicId: uploadData.public_id,
        filename: file.name,
        createdAt: new Date().toISOString()
      });

      fetchMedia();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. See console for details.");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = (url: string, id: string) => {
    const proxyUrl = toProxyUrl(url);
    // Copy relative or full host proxy url
    const fullUrl = window.location.origin + proxyUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this image from the database? (Note: It will remain in Cloudinary unless deleted there)")) {
      await apiClient.delete('media', id);
      fetchMedia();
    }
  };

  const handleSaveFilename = async (media: Media) => {
    if (!editingFilename.trim() || editingFilename === media.filename) {
      setEditingMediaId(null);
      return;
    }
    try {
      await apiClient.put('media', media.id, {
        ...media,
        filename: editingFilename.trim()
      });
      setEditingMediaId(null);
      fetchMedia();
    } catch (err) {
      alert("Failed to update filename");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1A39] font-display">Media Manager</h1>
          <p className="text-[#1D1A39]/60 font-medium">Upload files to Cloudinary and organize under 'blog' folder.</p>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              if (!confirm("Are you sure you want to delete all local database media references and re-fetch them from Cloudinary? This will clean up stales.")) return;
              try {
                setUploading(true);
                const res = await fetch('/api/cloudinary-sync');
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                
                // Delete all current media records to start fresh
                const currentDocs = await apiClient.get('media');
                for (const doc of currentDocs) {
                  await apiClient.delete('media', doc.id);
                }
                
                let added = 0;
                for (const img of data.resources) {
                  await apiClient.post('media', {
                    url: img.secure_url,
                    publicId: img.public_id,
                    filename: img.public_id.split('/').pop() || 'image',
                    createdAt: img.created_at || new Date().toISOString()
                  });
                  added++;
                }
                alert(`Successfully synced and re-imported ${added} images from Cloudinary!`);
                fetchMedia();
              } catch (err: any) {
                alert(`Sync failed: ${err.message}`);
              } finally {
                setUploading(false);
              }
            }}
            disabled={uploading}
            className="bg-[#F59F59] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#F59F59]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${uploading ? 'animate-spin' : ''}`} /> Sync Old Media
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[#1D1A39] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1D1A39]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <UploadCloud className="w-5 h-5" /> {uploading ? 'Processing...' : 'Upload Media'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {loading && mediaList.length === 0 ? <p>Loading media...</p> : null}
        
        {mediaList.map(media => (
          <div key={media.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[#1D1A39]/10 flex flex-col group relative overflow-hidden justify-between h-56">
            <div className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center relative">
              {media.url ? (
                <img src={toProxyUrl(media.url)} alt={media.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={() => copyToClipboard(media.url, media.id)}
                  className="bg-white p-2 rounded-full text-[#1D1A39] hover:bg-[#F59F59] transition-colors"
                  title="Copy URL"
                >
                  {copiedId === media.id ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => handleDelete(media.id)}
                  className="bg-white p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete Reference"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Inline Rename Editor */}
            <div className="mt-3 flex items-center w-full">
              {editingMediaId === media.id ? (
                <input
                  type="text"
                  value={editingFilename}
                  onChange={(e) => setEditingFilename(e.target.value)}
                  onBlur={() => handleSaveFilename(media)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveFilename(media);
                    if (e.key === 'Escape') setEditingMediaId(null);
                  }}
                  autoFocus
                  className="text-xs font-bold text-[#1D1A39] bg-[#fafafa] border border-peach/50 rounded px-1.5 py-0.5 w-full focus:outline-none focus:border-[#F59F59]"
                />
              ) : (
                <p 
                  onClick={() => { setEditingMediaId(media.id); setEditingFilename(media.filename); }}
                  className="text-xs font-bold text-[#1D1A39] truncate hover:text-[#F59F59] cursor-pointer flex-grow select-all" 
                  title="Click to rename"
                >
                  {media.filename}
                </p>
              )}
            </div>
          </div>
        ))}

        {!loading && mediaList.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center">
            <UploadCloud className="w-12 h-12 text-gray-300 mb-4" />
            <p className="font-bold mb-2">No media found</p>
            <p className="text-sm">Click "Upload Media" to add images.</p>
          </div>
        )}
      </div>
    </div>
  );
}
