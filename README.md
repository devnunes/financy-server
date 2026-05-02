# Financy Server

API GraphQL do projeto Financy, desenvolvida como parte do **trabalho final de pós-graduação na Faculdade de Tecnologia Rocketseat**.

## Objetivo

Fornecer autenticação e gerenciamento de dados financeiros por usuário, garantindo isolamento dos dados entre contas.

## Stack

- Node.js + TypeScript
- Fastify
- Apollo Server + TypeGraphQL
- Prisma ORM
- SQLite
- Vitest
- Biome

## Funcionalidades implementadas

### Autenticação

- `signUp`
- `signIn`
- `signOut`
- Sessão via cookie HTTP
- Middleware de autenticação para rotas privadas

### Usuário

- `me`
- `getUser`
- `updateUser`

### Transações

- `createTransaction`
- `getTransactions`
- `updateTransaction`
- `deleteTransaction`

### Categorias

A camada de categoria já existe em `resolver`, `service`, `model`, `dto` e testes.

> No estado atual, `CategoryResolver` ainda não está registrado em `src/resolvers/index.ts`, portanto as operações de categoria não aparecem no schema GraphQL publicado.

## Estrutura resumida

- `src/resolvers`: operações GraphQL
- `src/services`: regras de negócio
- `src/models`: modelos GraphQL
- `src/prisma`: schema e acesso ao banco
- `src/middlewares`: autenticação
- `src/test`: setup e factories para testes

## Configuração

Variáveis validadas em `src/env.ts`:

- `PORT`
- `NODE_ENV`
- `DATABASE_URL` (SQLite, formato `file:`)
- `JWT_SECRET`
- `WEB_URL` (opcional)

## Como rodar

```bash
pnpm install
pnpm dev
```

API disponível em `http://localhost:3333/graphql`.

## Scripts úteis

```bash
pnpm dev            # ambiente de desenvolvimento
pnpm dev:migrate    # criar/aplicar migrations (dev)
pnpm dev:generate   # gerar cliente Prisma
pnpm dev:studio     # abrir Prisma Studio
pnpm test           # testes
pnpm test:watch     # testes em modo watch
pnpm test:coverage  # cobertura
```

## Testes

Existem testes unitários e de integração local para:

- resolvers
- services
- middleware de autenticação
- cenários de erro e autorização
