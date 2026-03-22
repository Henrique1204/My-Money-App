# Arquitetura - Backend (API)

## Tecnologias Utilizadas

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| Runtime | Node.js | - |
| Framework | Express | 4.14.0 |
| Banco de Dados | MongoDB | - |
| ODM | Mongoose | 4.13.19 |
| REST Helper | node-restful | 0.2.5 |
| Autenticação | JWT (jsonwebtoken) | 7.3.0 |
| Criptografia | bcrypt | 5.0.0 |
| Process Manager | PM2 | 2.1.5 |
| Dev Server | Nodemon | 1.11.0 |
| Utilitários | Lodash | 4.17.4 |

## Estrutura de Pastas

```
src/
├── loader.js                # Ponto de entrada (carrega DB + server)
├── .env                     # Variáveis de ambiente (authSecret, DB URL)
├── config/                  # Configurações do servidor
│   ├── server.js            # Express + middlewares
│   ├── database.js          # Conexão MongoDB
│   ├── routes.js            # Definição de rotas
│   ├── cors.js              # Configuração CORS
│   └── auth.js              # Middleware de autenticação JWT
└── api/                     # Módulos da API
    ├── commum/
    │   └── errorHandle.js   # Tratamento de erros
    ├── billingCycle/
    │   ├── billingCycle.js       # Model (Schema Mongoose)
    │   └── billingCycleService.js # Service (rotas + lógica)
    └── user/
        ├── user.js          # Model (Schema Mongoose)
        └── authService.js   # Service (login, signup, validarToken)
```

---

## Onde ficam as regras de negócio?

| Local | Tipo de Regra |
|-------|---------------|
| `api/*/Service.js` | Lógica de negócio, validações, transformações |
| `api/*/*.js` (Models) | Validações de schema, constraints de dados |
| `config/auth.js` | Regras de autenticação e autorização |

**Principais arquivos:**

### `api/user/authService.js`
- Validação de email (regex)
- Validação de senha (mínimo 8 chars, maiúscula, número)
- Hash de senha com bcrypt
- Geração e validação de JWT
- Verificação de usuário duplicado

### `api/billingCycle/billingCycleService.js`
- CRUD de ciclos de pagamento
- Agregação para cálculo de summary (créditos/débitos)
- Paginação de resultados

### `api/billingCycle/billingCycle.js` (Model)
- Validação de campos obrigatórios
- Constraints de mês (1-12) e ano (1970-2100)
- Status de débito: PAGO, PENDENTE, AGENDADO

---

## O que não pode depender de quê?

```
┌─────────────────────────────────────────────────────────┐
│                    CONFIG (server, routes)              │
│         (orquestra, depende de services e models)       │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                     SERVICES                            │
│   (lógica de negócio, depende de models e .env)         │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                      MODELS                             │
│       (schemas, NÃO depende de services/config)         │
└─────────────────────────────────────────────────────────┘
```

**Regras de dependência:**

| Camada | Pode depender de | NÃO pode depender de |
|--------|------------------|----------------------|
| `config/*` | Services, Models, .env | - |
| `api/*Service.js` | Models, .env, commum | Config |
| `api/*/*.js` (Models) | Mongoose/restful | Services, Config |
| `commum/*` | Nada (utilitários puros) | Models, Services, Config |

---

## O que vai mudar com mais frequência?

| Frequência | Local | Motivo |
|------------|-------|--------|
| **Alta** | `api/billingCycle/*` | Novas features, campos, validações |
| **Média** | `api/user/authService.js` | Melhorias de segurança, novos fluxos |
| **Média** | `config/routes.js` | Novos endpoints |
| **Baixa** | `api/*/*.js` (Models) | Schema é estável após definido |
| **Baixa** | `config/server.js` | Infraestrutura base |
| **Baixa** | `config/auth.js` | Middleware de auth é estável |
| **Rara** | `config/database.js`, `config/cors.js` | Configuração inicial |

---

## O que preciso proteger?

### 1. Dados Sensíveis

| Item | Local | Proteção Necessária |
|------|-------|---------------------|
| `authSecret` | `.env` | NUNCA versionar, usar variáveis de ambiente |
| DB Connection String | `.env` | NUNCA versionar |
| Senhas de usuário | `user.js` model | Hash com bcrypt antes de salvar |
| Token JWT | Headers/Body | Expiração de 1 dia, validar em rotas protegidas |

### 2. Models (Domínio)

| Model | Campos Críticos | Validações |
|-------|-----------------|------------|
| `User` | password | Hash obrigatório, min 6 chars |
| `User` | email | Único, formato válido |
| `BillingCycle` | credits, debts | Valores >= 0 |
| `BillingCycle` | month, year | Ranges válidos |

**Schema BillingCycle:**
```javascript
{
  name: String (required),
  month: Number (1-12, required),
  year: Number (1970-2100, required),
  credits: [{ name: String, value: Number }],
  debts: [{ name: String, value: Number, status: enum }]
}
```

**Schema User:**
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed)
}
```

### 3. Contratos (Rotas)

**Rotas Protegidas** (`/api/*` - requerem JWT):
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/billingCycles` | Listar ciclos |
| GET | `/api/billingCycles/summary` | Resumo consolidado |
| GET | `/api/billingCycles/count` | Contagem total |
| POST | `/api/billingCycles` | Criar ciclo |
| PUT | `/api/billingCycles/:id` | Atualizar ciclo |
| DELETE | `/api/billingCycles/:id` | Remover ciclo |

**Rotas Públicas** (`/oapi/*` - sem autenticação):
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/oapi/login` | Autenticar usuário |
| POST | `/oapi/signup` | Cadastrar usuário |
| POST | `/oapi/validarToken` | Validar JWT |

### 4. Middleware de Autenticação

O arquivo `config/auth.js` protege todas as rotas `/api/*`:
- Verifica presença do token (header, body ou query)
- Valida assinatura JWT com `authSecret`
- Retorna 403 se token inválido ou ausente

---

## Fluxo de Autenticação

```
┌──────────────────────────────────────────────────────────────┐
│                         SIGNUP                               │
├──────────────────────────────────────────────────────────────┤
│  1. Validar email (regex)                                    │
│  2. Validar senha (8+ chars, maiúscula, número)              │
│  3. Verificar se email já existe                             │
│  4. Hash da senha com bcrypt                                 │
│  5. Salvar no MongoDB                                        │
│  6. Fazer login automático (retorna JWT)                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                          LOGIN                               │
├──────────────────────────────────────────────────────────────┤
│  1. Buscar usuário por email                                 │
│  2. Comparar senha com hash (bcrypt)                         │
│  3. Gerar JWT com dados do usuário (expira em 1 dia)         │
│  4. Retornar { name, email, token }                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    ROTAS PROTEGIDAS                          │
├──────────────────────────────────────────────────────────────┤
│  1. Middleware auth.js intercepta request                    │
│  2. Extrai token (Authorization header)                      │
│  3. jwt.verify() com authSecret                              │
│  4. Se válido: next() → acessa recurso                       │
│  5. Se inválido: 403 Forbidden                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Padrões Utilizados

- **Model-Service**: Separação entre schema (Model) e lógica (Service)
- **node-restful**: Geração automática de CRUD REST
- **Middleware Pattern**: Autenticação via middleware Express
- **Error Handler**: Tratamento centralizado de erros de validação
- **Aggregation Pipeline**: MongoDB aggregation para cálculos de summary

---

## Variáveis de Ambiente (.env)

```javascript
module.exports = {
    authSecret: 'seu_secret_aqui',  // Chave para assinar JWT
    db: 'mongodb://localhost/...'   // Connection string MongoDB
}
```

> **IMPORTANTE**: O arquivo `.env` contém dados sensíveis e NÃO deve ser versionado.
