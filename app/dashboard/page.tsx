'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ totalItems: 0 });

  useEffect(() => {
    fetch('/api/marketplace/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        body: JSON.stringify({ vectorData, fileName: file.name })
      });

      const result = await res.json();

      if (res.ok) {
        setMessage('Success: ' + result.slug);
        e.target.value = '';
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    }

    setUploading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>VEXURA DASHBOARD</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.5rem' }}>Total Items</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalItems}</div>
          </div>
          <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.5rem' }}>Status</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f0' }}>ONLINE</div>
          </div>
          <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.5rem' }}>Storage</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>REDIS</div>
          </div>
        </div>

        <div style={{ background: '#111', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Upload Vector JSON</h2>
          
          <input 
            type="file" 
            accept=".json"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ 
              display: 'block',
              padding: '1rem',
              border: '2px dashed #333',
              borderRadius: '8px',
              width: '100%',
              marginBottom: '1rem',
              cursor: 'pointer'
            }}
          />

          {message && (
            <div style={{ padding: '1rem', background: '#222', borderRadius: '8px', marginTop: '1rem' }}>
              {message}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          
            href="/api/marketplace/list"
            target="_blank"
            style={{ 
              background: '#111', 
              padding: '1.5rem', 
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#fff'
            }}
          >
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>View All Items</h3>
            <p style={{ fontSize: '0.875rem', color: '#888' }}>Browse marketplace</p>
          </a>
          
          
            href="/api/marketplace/stats"
            target="_blank"
            style={{ 
              background: '#111', 
              padding: '1.5rem', 
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#fff'
            }}
          >
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>API Stats</h3>
            <p style={{ fontSize: '0.875rem', color: '#888' }}>View statistics</p>
          </a>
        </div>
      </div>
    </div>
  );
}
