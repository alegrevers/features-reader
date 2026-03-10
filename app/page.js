'use client';
import { useState } from 'react';

export default function Home() {
  const [workspace, setWorkspace] = useState('');
  const [repository, setRepository] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [aiProvider, setAiProvider] = useState('anthropic');
  const [aiApiKey, setAiApiKey] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const testAuth = async () => {
    if (!email || !apiToken) {
      setSummary('⚠️ Preencha email e API token!');
      return;
    }

    setTesting(true);
    setSummary('🔍 Testando credenciais do Bitbucket...');

    try {
      const res = await fetch('/api/test-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, apiToken })
      });

      const data = await res.json();

      if (data.success) {
        setSummary(`✅ Credenciais válidas!\n\nUsuário: ${data.user.display_name} (@${data.user.username})\nEmail: ${data.user.email}\n\nWorkspaces disponíveis:\n${data.workspaces.map(w => `• ${w}`).join('\n')}`);
      } else {
        setSummary(`❌ Erro: ${data.error}\n\n${data.details || ''}`);
      }
    } catch (e) {
      setSummary(`❌ Erro: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  const generate = async () => {
    if (!workspace || !repository || !email || !username || !apiToken || !aiApiKey) {
      setSummary('⚠️ Preencha todos os campos obrigatórios!');
      return;
    }

    setLoading(true);
    setSummary('🔍 Buscando seus PRs...');
    
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workspace, 
          repository,
          email, 
          username, 
          apiToken, 
          aiProvider,
          aiApiKey,
          month 
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        setSummary(`❌ Erro ${res.status}: ${data.error}`);
        return;
      }
      
      const data = await res.json();
      setSummary(data.summary || 'Sem resposta');
    } catch (e) {
      setSummary(`❌ Erro: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Resumo de Entregas - Bitbucket</h1>
      
      <div style={styles.alert}>
        <strong>ℹ️ Como obter as credenciais:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20, fontSize: 13 }}>
          <li><strong>API Token:</strong> <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" style={{ color: '#0052cc' }}>Criar aqui</a> um `API Token com Escopos`. Recomendo atribuir todos os escopos de READ e nenhum outro.</li>
          <li><strong>Email:</strong> O email da sua conta Bitbucket</li>
          <li><strong>Username:</strong> Encontre em <a href="https://bitbucket.org/account/settings/" target="_blank" style={{ color: '#0052cc' }}>Configurações</a></li>
          <li><strong>Workspace:</strong> Nome do workspace/organização</li>
          <li><strong>Repositório:</strong> Nome exato do repositório</li>
        </ul>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔐 Credenciais Bitbucket</h3>
        <div style={styles.form}>
          <input 
            placeholder="Email (ex: seu@email.com)" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={styles.input}
            type="email"
          />
          <input 
            type="password" 
            placeholder="API Token do Bitbucket" 
            value={apiToken} 
            onChange={e => setApiToken(e.target.value)} 
            style={styles.input}
          />
          <input 
            placeholder="Username (ex: usu-ario)" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            style={styles.input}
          />
          
          <button 
            onClick={testAuth} 
            disabled={testing || loading} 
            style={testing ? {...styles.testButton, opacity: 0.6} : styles.testButton}
          >
            {testing ? '🔍 Testando...' : '🔐 Testar Credenciais'}
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📦 Repositório</h3>
        <div style={styles.form}>
          <input 
            placeholder="Workspace (ex: minha-empresa)" 
            value={workspace} 
            onChange={e => setWorkspace(e.target.value)} 
            style={styles.input}
          />
          <input 
            placeholder="Repositório (ex: repo-sitorio)" 
            value={repository} 
            onChange={e => setRepository(e.target.value)} 
            style={styles.input}
          />
          <input 
            type="month" 
            value={month} 
            onChange={e => setMonth(e.target.value)} 
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🤖 Provedor de IA</h3>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 500 }}>Fica tranquilo(a), o repo é público e não salvo sua API Key em nenhum lugar.</h4>
        <h6 style={{ margin: '0 0 16px 0', fontSize: 9, color: '#555' }}>Ou será que salvo?...</h6>
        <div style={styles.form}>
          <select 
            value={aiProvider} 
            onChange={e => setAiProvider(e.target.value)}
            style={styles.input}
          >
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI (GPT)</option>
          </select>
          <input 
            type="password" 
            placeholder={aiProvider === 'anthropic' ? 'Anthropic API Key (sk-ant-...)' : 'OpenAI API Key (sk-...)'} 
            value={aiApiKey} 
            onChange={e => setAiApiKey(e.target.value)} 
            style={styles.input}
          />
        </div>
      </div>

      <button 
        onClick={generate} 
        disabled={loading || testing} 
        style={loading ? {...styles.button, opacity: 0.6} : styles.button}
      >
        {loading ? '⏳ Gerando resumo...' : '🚀 Gerar Resumo'}
      </button>
      
      {summary && (
        <div style={styles.result}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <strong>Resultado:</strong>
            <button 
              onClick={() => navigator.clipboard.writeText(summary)}
              style={styles.copyBtn}
            >
              📋 Copiar
            </button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', lineHeight: 1.6 }}>
            {summary}
          </pre>
        </div>
      )}
      
      <div style={{ textAlign: 'center', padding: 20, fontSize: 12, color: '#777' }}>
        Desenvolvido por <a href="https://github.com/alegrevers/features-reader" target="_blank" style={{ color: '#0052cc' }}>alegrevers</a> 🚀
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 700,
    margin: '40px auto',
    padding: 20,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
  },
  alert: {
    background: '#e3f2fd',
    border: '1px solid #2196f3',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 24,
    padding: 20,
    background: '#f8f9fa',
    borderRadius: 8,
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: 18,
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    padding: 12,
    fontSize: 14,
    border: '1px solid #ddd',
    borderRadius: 6,
  },
  button: {
    padding: 14,
    fontSize: 15,
    fontWeight: 600,
    color: 'white',
    background: '#0052cc',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    width: '100%',
  },
  testButton: {
    padding: 12,
    fontSize: 14,
    fontWeight: 600,
    color: 'white',
    background: '#6c757d',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  result: {
    marginTop: 24,
    padding: 20,
    background: '#f5f5f5',
    borderRadius: 8,
    fontSize: 14,
  },
  copyBtn: {
    padding: '6px 12px',
    fontSize: 13,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 4,
    cursor: 'pointer',
  }
};
