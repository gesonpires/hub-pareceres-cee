# 09 - Guia de Testes Manuais em Ambiente de Homologação

## Objetivo
Este documento fornece um guia passo a passo para executar testes manuais completos do MVP em ambiente de homologação.

## Pré-requisitos

### Ambiente
- Servidor de homologação configurado e rodando
- Banco de dados inicializado com migrações aplicadas
- Dados de seed carregados (ou dados de teste)

### Credenciais de Teste
- **Perfil Edição:** `edicao@cee.sc.gov.br` / `senha123`
- **Perfil Consulta:** `consulta@cee.sc.gov.br` / `senha123`

### Navegador
- Chrome, Firefox ou Edge (versão recente)
- Console do desenvolvedor aberto (F12) para verificar erros

---

## Checklist de Testes

### Parte 1: Autenticação e Permissões

#### Teste 1.1: Login com Perfil Edição
1. Acessar URL de homologação
2. Ser redirecionado para `/login.html`
3. Inserir credenciais: `edicao@cee.sc.gov.br` / `senha123`
4. Clicar em "Entrar"
5. **Resultado esperado:** Redirecionamento para `/dashboard.html`
6. **Verificar:** Nome do usuário aparece no header
7. **Verificar:** Botões de criação aparecem (ex: "+ Nova Escola", "+ Novo Parecer")

#### Teste 1.2: Login com Perfil Consulta
1. Fazer logout (botão "Sair")
2. Fazer login com: `consulta@cee.sc.gov.br` / `senha123`
3. **Resultado esperado:** Redirecionamento para `/dashboard.html`
4. **Verificar:** Botões de criação NÃO aparecem
5. **Verificar:** Botões de edição/exclusão NÃO aparecem nas listagens

#### Teste 1.3: Tentativa de Acesso Não Autorizado
1. Com perfil `consulta`, tentar acessar diretamente `/escola-form.html`
2. Tentar criar escola via API (usar Postman ou console do navegador)
3. **Resultado esperado:** Erro 403 ou redirecionamento para página 403

---

### Parte 2: Dashboard

#### Teste 2.1: Visualização do Dashboard
1. Fazer login com perfil `edicao`
2. Verificar elementos do dashboard:
   - Título "Hub Pareceres CEE"
   - Busca rápida por número/ano do parecer
   - Cards de navegação (Escolas, Pareceres, Atos)
   - Seção de estatísticas
3. **Verificar:** Estatísticas são carregadas corretamente

#### Teste 2.2: Busca Rápida
1. No dashboard, inserir "100/2024" no campo de busca rápida
2. Clicar em "Buscar"
3. **Resultado esperado:** Redirecionamento para `/pareceres.html` com filtros aplicados
4. **Verificar:** Pareceres filtrados aparecem na listagem

---

### Parte 3: CRUD de Escolas

#### Teste 3.1: Criar Escola
1. Acessar `/escolas.html`
2. Clicar em "+ Nova Escola"
3. Preencher formulário:
   - Nome oficial: "Escola Teste Homologação"
   - Código INEP: "42099999"
   - CNPJ: "99.999.999/0001-99"
   - Município: "Florianópolis"
   - Rede de ensino: "Privada"
4. Clicar em "Salvar"
5. **Resultado esperado:** Escola criada e redirecionamento para listagem
6. **Verificar:** Escola aparece na listagem

#### Teste 3.2: Filtrar Escolas
1. Na listagem de escolas, testar cada filtro:
   - Nome: "Teste"
   - Cidade: "Florianópolis"
   - CNPJ: "99999"
   - INEP: "42099999"
   - Situação: "Ativa"
2. **Verificar:** Resultados são filtrados corretamente
3. Limpar filtros e verificar que todas as escolas aparecem

#### Teste 3.3: Editar Escola
1. Clicar em "Editar" em uma escola existente
2. Alterar nome da escola
3. Salvar
4. **Verificar:** Alterações foram salvas
5. **Verificar:** Escola atualizada aparece na listagem

#### Teste 3.4: Desativar Escola
1. Clicar em "Desativar" em uma escola ativa
2. Confirmar ação
3. **Verificar:** Escola aparece como "inativa" na listagem
4. **Verificar:** Botão "Desativar" não aparece mais

---

### Parte 4: CRUD de Atos Autorizativos

#### Teste 4.1: Criar Ato Autorizativo
1. Acessar detalhes de uma escola
2. Clicar em "+ Novo Ato Autorizativo"
3. Preencher formulário:
   - Tipo do ato: "Parecer"
   - Número do ato: "100"
   - Ano do ato: "2024"
   - Data de publicação: "15/01/2024"
   - Órgão emissor: "CEE-SC"
   - Status de vigência: "vigente"
   - Observações: "Pelo credenciamento da instituição"
4. Salvar
5. **Resultado esperado:** Ato criado e aparece na lista
6. **Verificar:** Ordenação por data de publicação (crescente)

#### Teste 4.2: Validação de Campos Obrigatórios
1. Tentar criar ato sem preencher "Observações"
2. Clicar em "Salvar"
3. **Resultado esperado:** Mensagem de erro específica
4. **Verificar:** Campo "Observações" destacado em vermelho
5. Preencher campo e salvar novamente
6. **Resultado esperado:** Ato criado com sucesso

#### Teste 4.3: Criar Múltiplos Atos
1. Criar 3 atos com datas diferentes:
   - Ato 1: Parecer Nº100 de 15/01/2024
   - Ato 2: Resolução Nº50 de 10/02/2024
   - Ato 3: Portaria Nº200 de 20/03/2024
2. **Verificar:** Atos aparecem ordenados por data crescente
3. **Verificar:** Formato correto na listagem

#### Teste 4.4: Editar e Excluir Ato
1. Clicar em "Editar" em um ato
2. Alterar observações
3. Salvar
4. **Verificar:** Alterações salvas
5. Clicar em "Excluir" em outro ato
6. Confirmar exclusão
7. **Verificar:** Ato removido da lista

---

### Parte 5: CRUD de Pareceres

#### Teste 5.1: Criar Parecer
1. Acessar `/pareceres.html`
2. Clicar em "+ Novo Parecer"
3. Preencher formulário:
   - Escola: Selecionar escola criada anteriormente
   - Número do parecer: "1"
   - Ano do parecer: "2024"
   - Data do parecer: Data atual
   - Ementa: "Sobre autorização de funcionamento"
   - Status: "rascunho"
4. Salvar
5. **Resultado esperado:** Parecer criado e redirecionamento para visualização
6. **Verificar:** Parecer aparece na listagem

#### Teste 5.2: Filtrar Pareceres
1. Testar cada filtro:
   - Escola: Nome da escola
   - Número: "1"
   - Ano: "2024"
   - Status: "rascunho"
   - Data início/fim: Intervalo de datas
   - Ementa: "autorização"
   - Cidade: "Florianópolis"
   - CNPJ: Parte do CNPJ
   - INEP: Código INEP
2. **Verificar:** Resultados filtrados corretamente
3. Limpar filtros

---

### Parte 6: Geração de Texto "ATOS AUTORIZATIVOS"

#### Teste 6.1: Gerar Texto com Atos Completos
1. Editar parecer criado anteriormente
2. Verificar seção "ATOS AUTORIZATIVOS (gerado)"
3. Clicar em "Gerar/Atualizar texto"
4. **Resultado esperado:** Texto gerado aparece no preview
5. **Verificar formato:**
   - Formato: `[Tipo] Nº[numero] de [data]: [observacoes];`
   - Ordenação por data crescente
   - Último ato termina com ponto final
   - Outros atos terminam com ponto e vírgula
6. Clicar em "Copiar para área de transferência"
7. Colar em editor de texto (Notepad, Word, etc.)
8. **Verificar:** Texto copiado corretamente

#### Teste 6.2: Bloqueio com Atos Incompletos
1. Criar novo ato sem preencher campo obrigatório (ex: observações)
2. Tentar gerar texto do parecer novamente
3. **Resultado esperado:** Mensagem de bloqueio detalhada
4. **Verificar:** Mensagem lista atos incompletos
5. **Verificar:** Mensagem lista campos faltantes
6. Completar ato incompleto
7. Gerar texto novamente
8. **Resultado esperado:** Texto gerado com sucesso

#### Teste 6.3: Bloqueio sem Escola Vinculada
1. Criar parecer sem selecionar escola
2. Tentar gerar texto
3. **Resultado esperado:** Mensagem de erro indicando falta de escola

---

### Parte 7: Visualização e Navegação

#### Teste 7.1: Visualizar Parecer
1. Na listagem de pareceres, clicar em "Ver"
2. **Verificar:** Todos os dados exibidos:
   - Número e ano do parecer
   - Escola vinculada
   - Data do parecer
   - Status
   - Ementa
   - Texto gerado de atos autorizativos
3. **Verificar:** Botão "Copiar" funciona

#### Teste 7.2: Navegação entre Telas
1. Testar navegação:
   - Dashboard → Escolas
   - Escolas → Detalhes da Escola
   - Detalhes → Novo Ato
   - Dashboard → Pareceres
   - Pareceres → Ver Parecer
   - Pareceres → Editar Parecer
2. **Verificar:** Todas as navegações funcionam corretamente
3. **Verificar:** Botão "Voltar" funciona

---

## Checklist de Validação Final

### Funcionalidades Críticas
- [ ] Login funciona com ambos os perfis
- [ ] Controle de acesso funciona (perfil consulta não pode criar/editar)
- [ ] CRUD completo de escolas funciona
- [ ] CRUD completo de atos funciona
- [ ] CRUD completo de pareceres funciona
- [ ] Geração de texto funciona corretamente
- [ ] Validações de campos obrigatórios funcionam
- [ ] Bloqueio de geração com atos incompletos funciona
- [ ] Filtros funcionam corretamente
- [ ] Ordenação por data funciona

### Interface e UX
- [ ] Botões aparecem/ocultam conforme perfil
- [ ] Mensagens de erro são claras e orientativas
- [ ] Navegação é intuitiva
- [ ] Formulários são fáceis de preencher
- [ ] Feedback visual adequado (loading, sucesso, erro)

### Performance
- [ ] Páginas carregam em tempo razoável (< 2 segundos)
- [ ] Filtros respondem rapidamente
- [ ] Geração de texto é instantânea

---

## Problemas Encontrados

### Seção para Documentar Problemas

**Data:** _______________  
**Testador:** _______________  
**Ambiente:** Homologação

| # | Descrição | Severidade | Status | Observações |
|---|-----------|------------|--------|-------------|
|   |           |            |        |             |

**Severidade:**
- **Crítica:** Impede uso da funcionalidade
- **Alta:** Funcionalidade parcialmente comprometida
- **Média:** Problema menor, mas afeta UX
- **Baixa:** Melhoria sugerida

---

## Conclusão

**Data de conclusão:** _______________  
**Testador:** _______________  

**Status geral:** [ ] Aprovado [ ] Reprovado [ ] Aprovado com ressalvas

**Observações finais:**

_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
