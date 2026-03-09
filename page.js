'use client';
import { useState } from 'react';

export default function Home() {
  const [workspace, setWorkspace] = useState('');
  const [username, setUsername] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setSummary('');
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace, username, appPassword, month })
      });
      const data = await res.json();
      setSummary(data.summary || data.error);
    } catch (e) {
      setSummary('Erro: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'system-ui', padding: 20 }}>
      <h1>📊 Resumo Bitbucket</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder="Workspace" value={workspace} onChange={e => setWorkspace(e.target.value)} style={inputStyle} />
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="App Password" value={appPassword} onChange={e => setAppPassword(e.target.value)} style={inputStyle} />
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={inputStyle} />
        <button onClick={generate} disabled={loading} style={buttonStyle}>
          {loading ? 'Gerando...' : 'Gerar Resumo'}
        </button>
      </div>
      {summary && (
        <div style={{ marginTop: 20, padding: 15, background: '#f5f5f5', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
          {summary}
        </div>
      )}
    </div>
  );
}

const inputStyle = { padding: 10, borderRadius: 6, border: '1px solid #ddd', fontSize: 14 };
const buttonStyle = { padding: 12, background: '#0052cc', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 };
