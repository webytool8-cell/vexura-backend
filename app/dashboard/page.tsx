'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ totalItems: 0 });

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
      setMessage('Please upload a JSON file');
      return;
    }

    setUploading(true);
    setMessage('Uploading...');

    try {
      const content = await file.text();
      const vectorData = JSON.parse(content);

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
        setMessage('Uploaded successfully! Slug: ' + result.slug);
        fetchStats();
        e.target.value = '';
      } else {
        setMessage('Upload failed: ' + result.error);
      }
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">VEXURA DASHBOARD</h1>
          <a href="/" className="text-sm text-gray-400 hover:text-white">
            Back to Site
          </a>
        </header>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">Total Items</div>
            <div className="text-3xl font-bold">{stats.totalItems}</div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">Status</div>
            <div className="text-3xl font-bold text-green-500">ONLINE</div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">Storage</div>
            <div className="text-3xl font-bold">REDIS</div>
          </div>
        </div>

        <div className="bg-gray-900 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Upload Vector JSON</h2>
          
          <div className="mb-6">
            <label 
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-500"
            >
              <div className="flex flex-col items-center">
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">JSON files only</p>
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

          {message && (
            <div className="p-4 rounded-lg bg-gray-800 text-white mb-4">
              {message}
            </div>
          )}

          <details className="mt-6">
            <summary className="text-sm text-gray-400 cursor-pointer">
              Expected JSON Format
            </summary>
            <pre className="mt-4 p-4 bg-black rounded-lg text-xs text-gray-400 overflow-x-auto">
{`{
  "name": "Rocket Icon",
  "width": 400,
  "height": 400,
  "elements": []
}`}
            </pre>
          </details>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8">
          
            href="/api/marketplace/list"
            target="_blank"
            className="bg-gray-900 p-6 rounded-lg hover:bg-gray-800"
          >
            <h3 className="font-bold mb-2">View All Items</h3>
            <p className="text-sm text-gray-400">Browse marketplace items</p>
          </a>
          
          
            href="/api/marketplace/stats"
            target="_blank"
            className="bg-gray-900 p-6 rounded-lg hover:bg-gray-800"
          >
            <h3 className="font-bold mb-2">API Stats</h3>
            <p className="text-sm text-gray-400">View statistics</p>
          </a>
        </div>
      </div>
    </div>
  );
}
