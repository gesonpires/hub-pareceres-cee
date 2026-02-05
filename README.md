# hub-pareceres-cee (Planejamento MVP)

Este repositório documenta o planejamento inicial do sistema **hub-pareceres-cee**, com foco em reduzir retrabalho e erros na montagem da seção **ATOS AUTORIZATIVOS** dos pareceres.

## Escopo consolidado do MVP

- Cadastro de escolas.
- Cadastro de atos autorizativos por escola (com campos obrigatórios e validação).
- Cadastro de pareceres (número, ano, data, ementa, escola).
- Busca e filtros por escola, número/ano, status, intervalo de data, ementa, CNPJ, INEP e cidade.
- Geração automática da seção “ATOS AUTORIZATIVOS”:
  - ordenação por data de publicação;
  - bloqueio com mensagem orientativa quando houver inconsistências;
  - botão para copiar texto padronizado para a minuta.

## Documentação

- [01 - Perguntas essenciais do MVP (respondidas)](docs/01-mvp-perguntas-essenciais.md)
- [02 - Modelo de dados inicial](docs/02-modelo-dados-inicial.md)
- [03 - Fluxo de telas do MVP](docs/03-fluxo-telas-mvp.md)
- [04 - Estrutura de documentação sugerida](docs/04-estrutura-documentacao.md)

## Escopo de Fase 2 (referência)

Itens fora do MVP, mas previstos para evolução:

- Backup local automático no PC do usuário.
- Geração automática de DOCX “ANÁLISE” a partir de template.
