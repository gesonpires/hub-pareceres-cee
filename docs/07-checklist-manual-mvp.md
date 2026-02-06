# 07 - Checklist Manual de Fluxo Ponta a Ponta - MVP

## Objetivo
Validar que todas as funcionalidades principais do MVP estão funcionando corretamente através de testes manuais.

## Pré-requisitos
- Servidor rodando (`npm run dev`)
- Banco de dados inicializado (`npx prisma migrate dev`)
- Dados de seed carregados (`npx prisma db seed`)

## Checklist de Fluxo Completo

### 1. Autenticação
- [ ] Acessar `/login.html`
- [ ] Fazer login com usuário de perfil `edicao` (ex: `editor@example.com` / `senha123`)
- [ ] Verificar redirecionamento para `/escolas.html`
- [ ] Fazer logout e login com usuário de perfil `consulta` (ex: `consulta@example.com` / `senha123`)
- [ ] Verificar que botões de criação/edição não aparecem para perfil consulta

### 2. Cadastro de Escola
- [ ] Acessar `/escolas.html`
- [ ] Clicar em "+ Nova Escola"
- [ ] Preencher formulário com dados válidos:
  - Nome oficial: "Escola Teste MVP"
  - Código INEP: "42012345"
  - CNPJ: "12.345.678/0001-90"
  - Município: "Florianópolis"
  - Rede de ensino: "Privada"
- [ ] Salvar escola
- [ ] Verificar que escola aparece na listagem
- [ ] Clicar em "Ver Detalhes" da escola criada

### 3. Cadastro de Atos Autorizativos
- [ ] Na tela de detalhes da escola, clicar em "+ Novo Ato Autorizativo"
- [ ] Preencher formulário com dados válidos:
  - Tipo do ato: "Parecer"
  - Número do ato: "100"
  - Ano do ato: "2024"
  - Data de publicação: "15/01/2024"
  - Órgão emissor: "CEE-SC"
  - Status de vigência: "vigente"
  - Observações: "Pelo credenciamento da instituição"
- [ ] Salvar ato
- [ ] Verificar que ato aparece na lista de atos da escola
- [ ] Cadastrar mais 2 atos com datas diferentes:
  - Ato 2: Parecer Nº200 de 20/02/2024
  - Ato 3: Resolução Nº50 de 10/03/2024
- [ ] Verificar ordenação por data de publicação (crescente)

### 4. Validação de Campos Obrigatórios
- [ ] Tentar criar ato sem preencher campo obrigatório (ex: observações)
- [ ] Verificar mensagem de erro específica indicando campo faltante
- [ ] Preencher campo faltante e salvar com sucesso

### 5. Cadastro de Parecer
- [ ] Acessar `/pareceres.html`
- [ ] Clicar em "+ Novo Parecer"
- [ ] Preencher formulário:
  - Escola: Selecionar escola criada anteriormente
  - Número do parecer: "1"
  - Ano do parecer: "2024"
  - Data do parecer: Data atual
  - Ementa: "Sobre autorização de funcionamento"
  - Status: "rascunho"
- [ ] Salvar parecer
- [ ] Verificar que parecer aparece na listagem

### 6. Geração de Texto "ATOS AUTORIZATIVOS"
- [ ] Na tela de edição do parecer, verificar seção "ATOS AUTORIZATIVOS (gerado)"
- [ ] Clicar em "Gerar/Atualizar texto"
- [ ] Verificar que texto é gerado corretamente:
  - Formato: `[Tipo] Nº[numero] de [data]: [observacoes];`
  - Ordenação por data crescente
  - Último ato termina com ponto final
  - Outros atos terminam com ponto e vírgula
- [ ] Verificar que texto aparece no preview
- [ ] Clicar em "Copiar para área de transferência"
- [ ] Colar em editor de texto e verificar formatação

### 7. Bloqueio de Geração com Atos Incompletos
- [ ] Criar novo ato autorizativo sem preencher campo obrigatório (ex: observações)
- [ ] Tentar gerar texto do parecer novamente
- [ ] Verificar mensagem de bloqueio detalhada:
  - Indica quais atos estão incompletos
  - Lista campos faltantes
- [ ] Completar ato incompleto
- [ ] Gerar texto novamente e verificar sucesso

### 8. Filtros de Pareceres
- [ ] Na listagem de pareceres, testar filtros:
  - [ ] Filtrar por escola (nome)
  - [ ] Filtrar por número do parecer
  - [ ] Filtrar por ano
  - [ ] Filtrar por status (rascunho/finalizado)
  - [ ] Filtrar por intervalo de data
  - [ ] Filtrar por texto na ementa
  - [ ] Filtrar por cidade
  - [ ] Filtrar por CNPJ
  - [ ] Filtrar por código INEP
- [ ] Verificar que resultados são filtrados corretamente
- [ ] Limpar filtros e verificar que todos os pareceres aparecem

### 9. Edição e Exclusão
- [ ] Editar parecer existente
- [ ] Alterar dados e salvar
- [ ] Verificar que alterações foram salvas
- [ ] Editar ato autorizativo
- [ ] Alterar dados e salvar
- [ ] Excluir ato autorizativo
- [ ] Verificar que ato foi removido da lista

### 10. Visualização de Parecer
- [ ] Acessar parecer na listagem
- [ ] Clicar em "Ver"
- [ ] Verificar que todos os dados são exibidos corretamente:
  - Número e ano do parecer
  - Escola vinculada
  - Data do parecer
  - Status
  - Ementa
  - Texto gerado de atos autorizativos
- [ ] Verificar botão de copiar texto

### 11. Autorização por Perfil
- [ ] Fazer logout
- [ ] Fazer login com perfil `consulta`
- [ ] Tentar criar novo parecer → deve ser bloqueado (403)
- [ ] Tentar editar parecer existente → deve ser bloqueado (403)
- [ ] Tentar excluir ato → deve ser bloqueado (403)
- [ ] Verificar que visualização funciona normalmente

## Resultado Esperado
Todos os itens do checklist devem ser marcados como concluídos, indicando que o MVP está funcionando corretamente.

## Observações
- Se algum item falhar, documentar o problema encontrado
- Verificar logs do servidor para erros
- Verificar console do navegador para erros JavaScript
