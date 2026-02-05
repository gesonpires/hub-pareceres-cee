Backlog do MVP (ordem recomendada)
Fase 0 — Preparação mínima (base do projeto)

T0.1 — Definir “fonte de verdade”

Confirmar que os arquivos em docs/ são a referência do MVP.

Done: decisões do MVP não ficam em conversa solta; ficam nos docs (ou ADR).

T0.2 — Criar arquivo de backlog

Criar docs/05-backlog-mvp.md com este checklist.

Done: backlog versionado.

Fase 1 — Decisões técnicas mínimas (sem travar em stack)

T1.1 — Decidir execução inicial: local vs multiusuário

Mesmo que “ainda não definitivo”, decidir o modo inicial.

Done: uma linha registrada em docs/01... ou decisions/0001....

T1.2 — Definir persistência do MVP

Escolher: SQLite (local) ou Postgres (se multiusuário).

Done: decisão registrada.

Observação: essas duas tarefas são decisões, não código. Sem elas, o restante perde direção.

Fase 2 — Modelo de dados (MVP)

T2.1 — Especificar entidades e campos finais

Escola

Parecer

Ato Autorizativo (o núcleo)

(Usuário/perfil, se seu MVP já incluiu isso)

Done: docs/02-modelo... revisado/confirmado.

T2.2 — Definir regras de unicidade/índices

Ex: Escola por CNPJ/INEP, Parecer por número+ano, Ato por tipo+número+ano+escola etc.

Done: tabela “Chaves/Índices” no doc.

Fase 3 — Fluxo de telas e requisitos de validação

T3.1 — Congelar o fluxo do MVP

Confirmar telas mínimas:

Lista/cadastro de escolas

Detalhe da escola (atos + pareceres)

Cadastro de ato

Cadastro de parecer

Busca/filtros

Gerar texto “ATOS AUTORIZATIVOS”

Done: docs/03-fluxo... fechado.

T3.2 — Especificar comportamento de bloqueio/alerta

Quando bloquear geração do texto?

Que mensagem orientativa aparece?

Done: regras escritas em docs/04-regras... (ou equivalente).

Fase 4 — Geração do texto (coração do MVP)

T4.1 — Definir formato exato de saída

Ex: lista numerada? bullets? parágrafo padrão?

Ordem: por data de publicação? por número?

Quais campos entram no texto?

Done: um exemplo “antes/depois” em docs/04....

T4.2 — Regras de ordenação e agrupamento

Ex: agrupar por tipo (Parecer/Resolução/Portaria), depois ordenar.

Done: regra fechada no doc.

Fase 5 — Importação (somente se estiver no seu MVP)

T5.1 — Definir origem inicial

Vai digitar manualmente no começo? Importar de planilha? (CSV)

Done: decisão registrada.

T5.2 — (Opcional) Importação simples por CSV

Modelo de CSV para escolas/atos/pareceres

Done: docs/import-model.csv + instruções

Se importação não estiver no MVP, deixe isso para Fase 2 do produto.
