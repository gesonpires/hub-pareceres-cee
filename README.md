# hub-pareceres-cee

Sistema para reduzir retrabalho e erros na montagem da seção **ATOS AUTORIZATIVOS** dos pareceres do CEE-SC.

## 🎯 Escopo consolidado do MVP

- Cadastro de escolas.
- Cadastro de atos autorizativos por escola (com campos obrigatórios e validação).
- Cadastro de pareceres (número, ano, data, ementa, escola).
- Busca e filtros por escola, número/ano, status, intervalo de data, ementa, CNPJ, INEP e cidade.
- Geração automática da seção "ATOS AUTORIZATIVOS":
  - ordenação por data de publicação;
  - bloqueio com mensagem orientativa quando houver inconsistências;
  - botão para copiar texto padronizado para a minuta.

## 🛠️ Tecnologias

- **Banco de dados:** SQLite (arquivo local)
- **ORM:** Prisma
- **Backend:** (a definir)
- **Frontend:** (a definir)

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

## 🚀 Instalação e execução local

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd hub-pareceres-cee
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure a URL do banco de dados no arquivo `.env`:
```
DATABASE_URL="file:./dev.db"
```

5. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

6. (Opcional) Popule o banco com dados de exemplo:
```bash
npm run seed
```

7. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 📚 Documentação

- [01 - Perguntas essenciais do MVP](docs/01-mvp-perguntas-essenciais.md)
- [02 - Modelo de dados inicial](docs/02-modelo-dados-inicial.md)
- [03 - Fluxo de telas do MVP](docs/03-fluxo-telas-mvp.md)
- [04 - Regras de bloqueio e alerta](docs/04-regras-bloqueio-alerta.md)
- [04 - Formato de saída do texto](docs/04-formato-saida-texto-atos.md)
- [05 - Plano de implementação](docs/05-plano-tarefas-mvp.md)
- [06 - Backlog do MVP](docs/06-backlog-mvp.md)

## 🔄 Versionamento

- **Branch principal:** `main`
- **Branch de desenvolvimento:** `develop` (quando necessário)
- **Convenção de commits:** Conventional Commits (feat, fix, docs, etc.)

## 📝 Escopo de Fase 2 (referência)

Itens fora do MVP, mas previstos para evolução:

- Backup local automático no PC do usuário.
- Geração automática de DOCX "ANÁLISE" a partir de template.
- Importação de dados via CSV.
