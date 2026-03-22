# My Money App

Monorepo utilizando Turborepo para gerenciar aplicações frontend (React) e backend (Node.js).

## Estrutura do Projeto

```
my-money-app/
├── apps/
│   ├── web/          # Frontend React (submodule)
│   └── api/          # Backend Node.js (submodule)
├── packages/
│   └── shared/       # Código compartilhado (types, constants)
├── turbo.json        # Configuração do Turborepo
├── biome.json        # Configuração do Biome (linter/formatter)
├── tsconfig.json     # TypeScript base config
└── package.json      # Workspace root
```

## Pré-requisitos

- Node.js >= 20
- npm >= 10

## Instalação

```bash
# Clonar o repositório com submodules
git clone --recurse-submodules <url-do-repo>

# Ou, se já clonou sem submodules
git submodule update --init --recursive

# Instalar dependências
npm install
```

## Adicionando os Submodules

```bash
# Adicionar o frontend
git submodule add <url-do-repo-frontend> apps/web

# Adicionar o backend
git submodule add <url-do-repo-backend> apps/api
```

## Scripts Disponíveis

```bash
# Executar todos os apps em modo desenvolvimento
npm run dev

# Build de todos os apps
npm run build

# Executar linting em todos os apps
npm run lint

# Formatar código com Biome
npm run format

# Verificar e corrigir problemas com Biome
npm run check

# Limpar builds e node_modules
npm run clean
```

## Usando o Pacote Shared

Nos projetos `web` e `api`, adicione a dependência:

```json
{
  "dependencies": {
    "@my-money-app/shared": "*"
  }
}
```

E importe:

```typescript
import { User, ApiResponse, HTTP_STATUS } from '@my-money-app/shared';
```

## Trabalhando com Submodules

```bash
# Atualizar submodules para última versão
git submodule update --remote

# Entrar em um submodule e trabalhar
cd apps/web
git checkout main
git pull

# Commitar mudança de referência do submodule
cd ../..
git add apps/web
git commit -m "chore: update web submodule"
```

## Tecnologias

- **Turborepo** - Build system para monorepos
- **Biome** - Linter e formatter
- **TypeScript** - Tipagem estática
