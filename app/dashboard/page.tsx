'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ totalItems: 0 });

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/marketplace/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setMessage('❌ Please upload a JSON file');
      return;
    }

    setUploading(true);
    setMessage('📤 Uploading...');

    try {
      // Read file content
      const content = await file.text();
      const vectorData = JSON.parse(content);

      // Upload to API
      const res = await fetch('/api/marketplace/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vectorData,
          fileName: file.name
        })
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(`✅ Uploaded successfully! Slug: ${result.slug}`);
        fetchStats(); // Refresh stats
        
        // Clear file input
        e.target.value = '';
      } else {
        setMessage(`❌ Upload failed: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#111] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#ccff00]">VEXURA DASHBOARD</h1>
          <a 
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            ← Back to Site
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111] border border-zinc-800 rounded-lg p-6">
            <div className="text-sm text-zinc-400 mb-2">Total Items</div>
            <div className="text-3xl font-bold text-[#ccff00]">{stats.totalItems}</div>
          </div>
          
          <div className="bg-[#111] border border-zinc-800 rounded-lg p-6">
            <div className="text-sm text-zinc-400 mb-2">Status</div>
            <div className="text-3xl font-bold text-green-500">ONLINE</div>
          </div>
          
          <div className="bg-[#111] border border-zinc-800 rounded-lg p-6">
            <div className="text-sm text-zinc-400 mb-2">Storage</div>
            <div className="text-3xl font-bold text-white">REDIS</div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-[#111] border border-zinc-800 rounded-lg p-8">
          <h2 className="text-xl font-bold mb-6">Upload Vector JSON</h2>
          
          <div className="mb-6">
            <label 
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-[#ccff00] transition bg-[#0a0a0a]"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-12 h-12 mb-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-zinc-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-zinc-500">JSON files only</p>
              </div>
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                accept=".json"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              message.startsWith('✅') 
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : message.startsWith('📤')
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}

          {/* Expected JSON Format */}
          <details className="mt-6">
            <summary className="text-sm text-zinc-400 cursor-pointer hover:text-white">
              Expected JSON Format
            </summary>
            <pre className="mt-4 p-4 bg-black rounded-lg text-xs text-zinc-400 overflow-x-auto">
{`{
  "name": "Rocket Icon",
  "width": 400,
  "height": 400,
  "elements": [
    {
      "type": "circle",
      "cx": 200,
      "cy": 200,
      "r": 50,
      "fill": "#ccff00"
    }
  ]
}`}
            </pre>
          </details>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          
            href="/api/marketplace/list"
            targ
