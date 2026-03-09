# Bitbucket Summary

App simples para resumir suas entregas do Bitbucket usando IA.

## Setup

1. Clone o repo
2. `npm install`
3. Crie `.env.local` com:
   ```
   ANTHROPIC_API_KEY=sua_chave_aqui
   ```
4. `npm run dev`

## Bitbucket App Password

1. Acesse: https://bitbucket.org/account/settings/app-passwords/
2. Crie um novo App Password com permissões:
   - Repositories: Read
   - Pull requests: Read
3. Use este password no app

## Deploy Vercel

1. Push para GitHub
2. Importe no Vercel
3. Adicione `ANTHROPIC_API_KEY` nas variáveis de ambiente
4. Deploy!

## Como usar

- **Workspace**: Nome do workspace do Bitbucket
- **Username**: Seu username do Bitbucket
- **App Password**: O password criado acima
- **Mês**: Escolha o mês para buscar PRs

O app busca todos os PRs mergeados do autor no mês e gera um resumo com IA.
