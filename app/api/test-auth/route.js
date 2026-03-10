export async function POST(req) {
  try {
    const { email, apiToken } = await req.json();
    
    // Basic Auth usando email:token
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    
    // Testar autenticação buscando dados do próprio usuário
    const userRes = await fetch(
      `https://api.bitbucket.org/2.0/user`,
      { 
        headers: { 
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        } 
      }
    );
    
    if (!userRes.ok) {
      const errorText = await userRes.text();
      return Response.json({ 
        success: false,
        error: `Credenciais inválidas (${userRes.status})`,
        details: errorText
      });
    }
    
    const userData = await userRes.json();
    
    // Testar acesso a workspaces
    const workspacesRes = await fetch(
      `https://api.bitbucket.org/2.0/workspaces`,
      { 
        headers: { 
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        } 
      }
    );
    
    const workspacesData = await workspacesRes.json();
    
    return Response.json({ 
      success: true,
      user: {
        username: userData.username,
        display_name: userData.display_name,
        email: userData.email || email,
        uuid: userData.uuid
      },
      workspaces: workspacesData.values?.map(w => w.slug) || []
    });
    
  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}
