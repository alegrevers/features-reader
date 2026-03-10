import Anthropic from '@anthropic-ai/sdk';

export async function POST(req) {
  try {
    const { workspace, repository, email, username, apiToken, aiProvider, aiApiKey, month } = await req.json();
    
    // Basic Auth usando email:token
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    const headers = { 
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    };
    
    console.log('🚀 Buscando PRs do repositório:', `${workspace}/${repository}`);
    
    // Buscar PRs do repositório específico
    const prsRes = await fetch(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${repository}/pullrequests?q=author.username="${username}" AND updated_on>=${month}-01 AND state="MERGED"&pagelen=50`,
      { headers }
    );
    
    if (!prsRes.ok) {
      const errorText = await prsRes.text();
      console.log('❌ Erro ao buscar PRs:', errorText);
      
      if (prsRes.status === 401 || prsRes.status === 403) {
        return Response.json({ 
          error: 'Credenciais inválidas ou sem permissão para acessar este repositório.' 
        }, { status: 401 });
      }
      if (prsRes.status === 404) {
        return Response.json({ 
          error: `Repositório "${workspace}/${repository}" não encontrado. Verifique workspace e nome do repositório.` 
        }, { status: 404 });
      }
      return Response.json({ 
        error: `Erro ao acessar Bitbucket (${prsRes.status}): ${errorText}` 
      }, { status: prsRes.status });
    }
    
    const prsData = await prsRes.json();
    let allPRs = [];
    
    console.log('📊 PRs encontrados:', prsData.values?.length || 0);
    
    // Processar cada PR
    for (const pr of (prsData.values || []).slice(0, 20)) {
      try {
        const diffRes = await fetch(pr.links.diff.href, { headers });
        const diff = await diffRes.text();
        
        allPRs.push({
          title: pr.title,
          date: pr.updated_on.split('T')[0],
          description: pr.description || '',
          diff: diff.slice(0, 5000), // Limitar para não estourar token limit
        });
      } catch (e) {
        console.error('Erro ao buscar diff:', e);
      }
    }

    if (allPRs.length === 0) {
      return Response.json({ 
        summary: `❌ Nenhum PR mergeado encontrado para "${username}" em ${month} no repositório "${repository}".\n\nVerifique:\n• Username está correto\n• Você teve PRs mergeados neste mês neste repositório` 
      });
    }

    console.log('✅ Total de PRs processados:', allPRs.length);

    // Gerar resumo com IA
    const prompt = `Você é um assistente que resume entregas de desenvolvimento. Analise os PRs abaixo e crie um resumo executivo das entregas de ${username} no mês ${month} no repositório ${repository}.

FORMATO ESPERADO:
1. Agrupe os PRs por data (do mais recente para o mais antigo)
2. Para cada PR, descreva claramente e de forma técnica o que foi implementado/corrigido
3. No final, faça um resumo geral destacando:
   - Principais entregas
   - Impacto no projeto

PRs:

${allPRs.map(pr => `
📌 ${pr.date} - ${pr.title}
${pr.description ? `Descrição: ${pr.description}` : ''}

Mudanças principais:
${pr.diff}
`).join('\n---\n')}

Gere o resumo em português, bem formatado e objetivo. Use emojis para deixar mais visual.`;

    let summaryText = '';

    if (aiProvider === 'anthropic') {
      const anthropic = new Anthropic({ apiKey: aiApiKey });
      
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }]
      });
      
      summaryText = message.content[0].text;
      
    } else if (aiProvider === 'openai') {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000
        })
      });
      
      if (!openaiRes.ok) {
        const error = await openaiRes.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }
      
      const openaiData = await openaiRes.json();
      summaryText = openaiData.choices[0].message.content;
    }

    return Response.json({ summary: summaryText });
    
  } catch (error) {
    console.error('❌ Erro interno:', error);
    return Response.json({ 
      error: `Erro: ${error.message}` 
    }, { status: 500 });
  }
}
