import Anthropic from '@anthropic-ai/sdk';

export async function POST(req) {
  const { workspace, username, appPassword, month } = await req.json();
  const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');
  
  try {
    // Buscar PRs do autor no workspace
    const prsRes = await fetch(
      `https://api.bitbucket.org/2.0/repositories/${workspace}?q=author.username="${username}"&pagelen=100`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const repos = await prsRes.json();
    
    let allPRs = [];
    
    // Para cada repositório, buscar PRs do mês
    for (const repo of repos.values || []) {
      const repoSlug = repo.slug;
      const prsRepoRes = await fetch(
        `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/pullrequests?q=author.username="${username}" AND updated_on>=${month}-01&state=MERGED&pagelen=50`,
        { headers: { Authorization: `Basic ${auth}` } }
      );
      const prsData = await prsRepoRes.json();
      
      for (const pr of prsData.values || []) {
        // Buscar diff do PR
        const diffRes = await fetch(pr.links.diff.href, { headers: { Authorization: `Basic ${auth}` } });
        const diff = await diffRes.text();
        
        allPRs.push({
          title: pr.title,
          repo: repoSlug,
          date: pr.updated_on.split('T')[0],
          diff: diff.slice(0, 3000) // Limitar tamanho
        });
      }
    }

    if (allPRs.length === 0) {
      return Response.json({ summary: 'Nenhum PR encontrado neste mês.' });
    }

    // Usar Claude para resumir
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Resuma as entregas deste desenvolvedor no mês ${month}. Para cada PR, extraia a tarefa/feature, o que foi feito, e organize por data. Seja objetivo e técnico.

PRs:
${allPRs.map(pr => `
📌 ${pr.title} (${pr.repo}) - ${pr.date}
Diff: ${pr.diff}
`).join('\n---\n')}`
      }]
    });

    return Response.json({ 
      summary: message.content[0].text 
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
