# 01 - Decisões técnicas do MVP

## T1.1 — Execução inicial: local vs multiusuário

**Decisão:** execução inicial será **local** (single-user).

**Justificativa:**
- MVP focado em reduzir retrabalho e erros na montagem da seção "ATOS AUTORIZATIVOS"
- Necessidade inicial de validação com usuários-chave em ambiente controlado
- Facilita iteração rápida e ajustes baseados em feedback
- Migração para ambiente multiusuário pode ser considerada em fase posterior conforme necessidade

**Registrado em:** 2024 (data a ser preenchida conforme contexto do projeto)

---

## T1.2 — Persistência do MVP

**Decisão:** persistência local usando **SQLite** (arquivo local).

**Justificativa:**
- Alinhado com decisão de execução local do MVP (T1.1)
- Simplicidade máxima: zero configuração de servidor de banco de dados
- Arquivo único facilita backup e portabilidade
- Suficiente para volume de dados do MVP
- Migração para Postgres pode ser feita posteriormente se necessário para ambiente multiusuário

**Registrado em:** 2024 (data a ser preenchida conforme contexto do projeto)

---

## T5.1 — Origem inicial dos dados

**Decisão:** os dados serão **digitados manualmente** no início do MVP.

**Justificativa:**
- Foco do MVP é na geração automática do texto "ATOS AUTORIZATIVOS", não na importação
- Cadastro manual permite validação e refinamento das telas e fluxos
- Facilita identificação de problemas de usabilidade e ajustes necessários
- Importação por CSV pode ser considerada em fase posterior (Fase 2 do produto) se houver necessidade

**Observação:** A funcionalidade de importação por CSV não está no escopo do MVP e será deixada para Fase 2 do produto, conforme indicado no backlog.

**Registrado em:** 2024 (data a ser preenchida conforme contexto do projeto)
