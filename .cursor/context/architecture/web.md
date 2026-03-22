# Arquitetura - Frontend (Web)

## Tecnologias Utilizadas

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| Framework | React | 17.0.1 |
| Bundler | Create React App | 4.0.1 |
| Estado Global | Redux Toolkit | 1.5.0 |
| Roteamento | React Router DOM | 6.0.0-beta |
| Estilos | CSS Modules | - |
| Ícones | Font Awesome | 4.7.0 |
| Testes | Jest + React Testing Library | - |

## Estrutura de Pastas

```
src/
├── main/                    # Ponto de entrada e configuração principal
│   ├── App.js               # Componente raiz
│   └── Rotas.js             # Definição de rotas
├── store/                   # Gerenciamento de estado (Redux)
│   ├── configureStore.js    # Configuração da store
│   ├── auth.js              # Slice de autenticação
│   ├── billingCyclesList.js # Slice de ciclos de pagamento
│   ├── form.js              # Slice de formulários
│   ├── summary.js           # Slice de resumo/dashboard
│   ├── tabs.js              # Slice de navegação por tabs
│   └── ui.js                # Slice de UI (feedbacks, loading)
├── Componente/              # Componentes React
│   ├── Auth/                # Tela de login/cadastro
│   ├── BillingCycles/       # CRUD de ciclos de pagamento
│   ├── Dashboard/           # Dashboard com resumo financeiro
│   ├── Header/              # Cabeçalho
│   ├── SideBar/             # Menu lateral
│   ├── Footer/              # Rodapé
│   └── Util/                # Componentes reutilizáveis
├── Hooks/                   # Custom hooks
│   ├── useFetch.js          # Hook para requisições HTTP
│   ├── useForm.js           # Hook para formulários
│   └── useMedia.js          # Hook para media queries
└── api.js                   # Configuração de endpoints da API
```

---

## Onde ficam as regras de negócio?

As regras de negócio estão distribuídas em:

| Local | Tipo de Regra |
|-------|---------------|
| `store/*.js` (Redux slices) | Lógica de estado, validações de fluxo, transformações de dados |
| `Hooks/useForm.js` | Validações de formulário |
| `api.js` | Contratos de comunicação com backend |
| `Componente/*/` | Lógica de apresentação e interação |

**Principais arquivos:**
- `store/auth.js` - Lógica de autenticação, validação de token, login/logout
- `store/billingCyclesList.js` - CRUD de ciclos de pagamento
- `store/summary.js` - Cálculo e exibição do resumo financeiro

---

## O que não pode depender de quê?

```
┌─────────────────────────────────────────────────────────┐
│                      COMPONENTES                        │
│  (podem depender de store, hooks, api, outros comp.)    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    STORE (Redux)                        │
│     (pode depender de api.js, NÃO de componentes)       │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                      API.JS                             │
│     (apenas configurações, NÃO depende de nada)         │
└─────────────────────────────────────────────────────────┘
```

**Regras de dependência:**

| Camada | Pode depender de | NÃO pode depender de |
|--------|------------------|----------------------|
| `Componente/*` | Store, Hooks, api.js, outros componentes | - |
| `store/*` | api.js | Componentes |
| `Hooks/*` | api.js | Store, Componentes |
| `api.js` | Nada (camada base) | Store, Componentes, Hooks |

---

## O que vai mudar com mais frequência?

| Frequência | Local | Motivo |
|------------|-------|--------|
| **Alta** | `Componente/BillingCycles/*` | Features de CRUD, UI/UX |
| **Alta** | `Componente/Dashboard/*` | Novas visualizações, cards |
| **Média** | `store/*.js` | Novas features, ajustes de estado |
| **Média** | `Componente/Util/*` | Componentes reutilizáveis |
| **Baixa** | `api.js` | Novos endpoints (muda junto com backend) |
| **Baixa** | `main/App.js`, `main/Rotas.js` | Estrutura base estável |
| **Baixa** | `Hooks/*` | Hooks genéricos e estáveis |

---

## O que preciso proteger?

### 1. Dados Sensíveis
| Item | Local | Proteção Necessária |
|------|-------|---------------------|
| Token JWT | `localStorage` via `store/auth.js` | Não expor em logs, limpar no logout |
| Dados do usuário | `store/auth.js` (state.user) | Não persistir senha |
| Credenciais de login | Formulário de Auth | Não logar em console |

### 2. Contratos (API)
| Arquivo | Descrição | Cuidados |
|---------|-----------|----------|
| `api.js` | Definição de todos os endpoints | Manter sincronizado com backend |

**Endpoints protegidos (requerem token):**
- `GET /api/billingCycles` - Listar ciclos
- `GET /api/billingCycles/summary` - Resumo financeiro
- `POST /api/billingCycles` - Criar ciclo
- `PUT /api/billingCycles/:id` - Atualizar ciclo
- `DELETE /api/billingCycles/:id` - Remover ciclo

**Endpoints públicos:**
- `POST /oapi/login` - Login
- `POST /oapi/signup` - Cadastro
- `POST /oapi/validarToken` - Validar token

### 3. Estado Global (Redux)
| Slice | Dados Críticos |
|-------|----------------|
| `auth` | user, token, validToken |
| `billingCyclesList` | lista de ciclos (dados financeiros) |
| `summary` | credit, debt (valores consolidados) |

### 4. Rotas Protegidas
O componente `App.js` protege todas as rotas verificando `user && validToken` antes de renderizar o conteúdo autenticado.

---

## Fluxo de Autenticação

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login   │───▶│  API     │───▶│  Token   │───▶│  Store   │
│  Form    │    │  /login  │    │  JWT     │    │  auth.js │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │ localStorage │
                               └──────────────┘
```

---

## Padrões Utilizados

- **Container/Presentational**: Componentes separados por responsabilidade
- **CSS Modules**: Estilos escopados por componente
- **Redux Toolkit Slices**: Estado modular com actions e reducers
- **Custom Hooks**: Lógica reutilizável extraída em hooks
