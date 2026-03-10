# 📊 Bitbucket Summary

App simples para gerar resumo de suas entregas do Bitbucket com IA.

**✅ Funciona mesmo se você loga com Google no Bitbucket!**

---

## 🚀 Setup Rápido

```bash
npm install
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🔑 Como criar API Token

**Mesmo que você faça login no Bitbucket com Google, você PODE criar API Tokens:**

1. Acesse: https://id.atlassian.com/manage-profile/security/api-tokens
2. Clique em **"Criar API Token com Escopo"**
3. Selecione apenas os escopos de READ e mais nenhum outro.
4. Clique em **"Create"**
5. **COPIE O TOKEN GERADO**
6. Use este token no campo "API Token" do app

### 📝 Seu username

Mesmo logando com Google, você tem um username no Bitbucket. Para descobrir:
- Acesse: https://bitbucket.org/account/settings/
- Seu username está no topo da página

---

## 📖 Como usar

1. **Workspace**: Nome do workspace/organização (ex: `minha-empresa`)
2. **Username**: Seu username do Bitbucket (veja acima como descobrir)
3. **API Token**: O token criado no passo anterior
4. **Mês**: Escolha o mês (formato: YYYY-MM, ex: 2025-03)
5. Clique em **"Gerar Resumo"**

O app vai:
- Buscar todos os seus PRs mergeados no mês escolhido
- Analisar os diffs
- Gerar um resumo executivo com IA
- Você pode copiar o resultado com um clique

---

## ❓ Troubleshooting

### Erro 401/403
- Verifique se o API Token está correto
- Confirme que criou o token com as permissões corretas (Repositories Read + Pull requests Read)
- Tente gerar um novo token

### Erro 404
- Verifique se o nome do workspace está correto
- Confirme que você tem acesso a esse workspace

### Nenhum PR encontrado
- Confirme que você teve PRs mergeados no mês escolhido
- Verifique se o username está correto
- Tente um mês diferente

---
