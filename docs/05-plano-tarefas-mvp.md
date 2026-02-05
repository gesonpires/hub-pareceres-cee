# 05 - Plano de implementação do MVP (tarefas pequenas em ordem)

> Este documento quebra o MVP em tarefas pequenas, sequenciais e executáveis.
> Fonte de verdade: documentos 01, 02, 03 e 04.

## Fase A — Preparação do projeto

1. Criar repositório base do produto (frontend + backend + banco) com README técnico mínimo.
2. Definir padrão de versionamento (ex.: `main` + `develop`) e convenção de commits.
3. Configurar variáveis de ambiente de desenvolvimento e homologação.
4. Configurar migrações de banco e script de seed inicial.

## Fase B — Estrutura de dados (MVP)

5. Criar migração da tabela `escolas` com índices (`nome_oficial`, `cnpj`, `codigo_inep`, `municipio`).
6. Criar migração da tabela `atos_autorizativos` com `data_publicacao` e campos obrigatórios.
7. Criar migração da tabela `pareceres` com `UNIQUE(numero_parecer, ano_parecer)`.
8. Criar migração da tabela `usuarios` com perfis `consulta` e `edicao`.
9. Implementar constraints de integridade (FK e NOT NULL conforme escopo).
10. Inserir dados de seed para testes de fluxo (2 escolas, 5 atos, 2 pareceres, 2 usuários).

## Fase C — Autenticação e autorização

11. Implementar login básico de usuário.
12. Implementar autorização por perfil (consulta x edição).
13. Bloquear operações de criação/edição/exclusão para perfil de consulta.
14. Criar tela simples de erro de permissão (403).

## Fase D — CRUD de Escolas

15. Criar endpoint `POST /escolas`.
16. Criar endpoint `GET /escolas` com filtros (nome, cidade, CNPJ, INEP, situação).
17. Criar endpoint `GET /escolas/:id`.
18. Criar endpoint `PUT /escolas/:id`.
19. Criar endpoint de desativação lógica da escola.
20. Criar tela de listagem de escolas com filtros.
21. Criar tela de cadastro/edição de escola com validações básicas.

## Fase E — CRUD de Atos Autorizativos

22. Criar endpoint `POST /escolas/:id/atos`.
23. Criar endpoint `GET /escolas/:id/atos` (ordenado por `data_publicacao`).
24. Criar endpoint `PUT /atos/:id`.
25. Criar endpoint `DELETE /atos/:id` (ou inativação lógica, se decidido).
26. Aplicar validação de campos obrigatórios no backend.
27. Criar tabela/lista de atos na tela de detalhe da escola.
28. Criar formulário de ato com mensagens orientativas de validação.

## Fase F — CRUD de Pareceres

29. Criar endpoint `POST /pareceres`.
30. Criar endpoint `GET /pareceres` com filtros (escola, número/ano, status, intervalo, ementa, cidade/CNPJ/INEP).
31. Criar endpoint `GET /pareceres/:id`.
32. Criar endpoint `PUT /pareceres/:id`.
33. Criar tela de listagem de pareceres com filtros do MVP.
34. Criar tela de cadastro/edição de parecer.
35. Criar tela de visualização detalhada do parecer.

## Fase G — Geração da seção “ATOS AUTORIZATIVOS”

36. Criar serviço backend para carregar atos da escola do parecer.
37. Implementar validação de completude dos atos (campos obrigatórios).
38. Implementar regra de bloqueio da geração se existir ato incompleto.
39. Implementar ordenação por `data_publicacao`.
40. Implementar template textual inicial padronizado de saída.
41. Persistir snapshot em `texto_atos_gerado` no parecer.
42. Expor endpoint para gerar/atualizar o texto do parecer.
43. Criar bloco “ATOS AUTORIZATIVOS (gerado)” na tela de edição.
44. Criar botão “Copiar para área de transferência”.
45. Exibir mensagens orientativas quando houver bloqueio.

## Fase H — Qualidade mínima e entrega

46. Escrever testes unitários de validação de ato obrigatório.
47. Escrever testes da regra de ordenação por `data_publicacao`.
48. Escrever teste de autorização por perfil (consulta não edita).
49. Escrever teste de endpoint de filtros de parecer.
50. Executar checklist manual de fluxo ponta a ponta:
    - cadastrar escola;
    - cadastrar atos;
    - cadastrar parecer;
    - gerar texto;
    - copiar/colar.
51. Ajustar mensagens de erro para linguagem de usuário final.
52. Congelar escopo do MVP e publicar versão `v1.0.0-mvp`.

## Dependências críticas (ordem obrigatória)

- Fase B depende da Fase A.
- Fases D, E e F dependem da Fase B.
- Fase C deve estar pronta antes de liberar D/E/F para usuários finais.
- Fase G depende diretamente de E e F.
- Fase H depende da conclusão de C, D, E, F e G.
