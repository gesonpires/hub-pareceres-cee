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
