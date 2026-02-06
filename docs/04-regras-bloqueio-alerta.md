# 04 - Regras de bloqueio e alerta para geração do texto "ATOS AUTORIZATIVOS"

## Quando bloquear a geração do texto?

A geração do texto da seção "ATOS AUTORIZATIVOS" será **bloqueada** quando:

1. **Não houver escola vinculada ao parecer**
   - O parecer não possui `escola_id` válido

2. **Existir pelo menos um ato autorizativo incompleto**
   - Um ou mais atos da escola vinculada ao parecer possuem campos obrigatórios vazios ou inválidos

### Campos obrigatórios que devem ser validados:

Para cada ato autorizativo da escola, os seguintes campos são obrigatórios:

- `tipo_ato` (texto/enum, não pode ser vazio ou nulo)
- `numero_ato` (texto, não pode ser vazio ou nulo)
- `data_publicacao` (date, não pode ser nulo)
- `orgao_emissor` (texto, não pode ser vazio ou nulo)
- `status_vigencia` (enum: vigente, expirado, revogado, não pode ser nulo)
- `observacoes` (texto, não pode ser vazio ou nulo)

## Mensagens orientativas

### Caso 1: Parecer sem escola vinculada

**Mensagem:**
> ⚠️ **Não é possível gerar o texto "ATOS AUTORIZATIVOS"**
> 
> O parecer não possui uma escola vinculada. Por favor, selecione uma escola antes de gerar o texto.

### Caso 2: Escola sem atos autorizativos

**Mensagem:**
> ⚠️ **Não é possível gerar o texto "ATOS AUTORIZATIVOS"**
> 
> A escola selecionada não possui atos autorizativos cadastrados. Por favor, cadastre pelo menos um ato autorizativo antes de gerar o texto.

### Caso 3: Um ou mais atos incompletos

**Mensagem:**
> ⚠️ **Não é possível gerar o texto "ATOS AUTORIZATIVOS"**
> 
> Existem atos autorizativos com dados obrigatórios incompletos. Por favor, corrija os seguintes itens antes de gerar o texto:
> 
> **Atos com dados incompletos:**
> - [Tipo do Ato] Nº [Número] de [Data] — faltam: [lista de campos faltantes]
> - [Tipo do Ato] Nº [Número] de [Data] — faltam: [lista de campos faltantes]
> 
> **Campos obrigatórios:** tipo do ato, número do ato, data de publicação, órgão emissor, status de vigência, observações.

**Exemplo prático:**
> ⚠️ **Não é possível gerar o texto "ATOS AUTORIZATIVOS"**
> 
> Existem atos autorizativos com dados obrigatórios incompletos. Por favor, corrija os seguintes itens antes de gerar o texto:
> 
> **Atos com dados incompletos:**
> - Parecer Nº 123 de 15/03/2024 — faltam: observações
> - Resolução Nº 456 de 20/05/2024 — faltam: órgão emissor, observações
> 
> **Campos obrigatórios:** tipo do ato, número do ato, data de publicação, órgão emissor, status de vigência, observações.

## Comportamento na interface

### Na tela de edição do parecer

1. **Botão "Gerar/Atualizar texto"**
   - Deve estar sempre visível
   - Quando clicado, executa validação antes de gerar
   - Se houver bloqueio, exibe mensagem orientativa (conforme acima)
   - Se não houver bloqueio, gera o texto e atualiza o preview

2. **Área de preview do texto**
   - Exibe o texto gerado quando disponível
   - Se não houver texto gerado ou houver bloqueio, exibe mensagem orientativa
   - Texto gerado deve estar em formato copiável (área de texto ou similar)

3. **Botão "Copiar para área de transferência"**
   - Só fica habilitado quando há texto gerado válido
   - Quando desabilitado, pode exibir tooltip: "Gere o texto primeiro"

## Validação em tempo real (opcional para MVP)

- Durante o cadastro/edição de atos, campos obrigatórios devem ter indicação visual (asterisco, borda vermelha, etc.)
- Validação pode ocorrer ao salvar o ato, mas o bloqueio na geração do texto é verificado no momento da geração

## Casos especiais

### Ato com status "revogado" ou "expirado"

- Atos revogados ou expirados **devem** ser incluídos na geração do texto (se completos)
- Não há bloqueio por status de vigência, apenas por campos obrigatórios incompletos

### Múltiplos atos da mesma escola

- Todos os atos da escola vinculada ao parecer são considerados na validação
- Se qualquer ato estiver incompleto, a geração é bloqueada
- A mensagem deve listar todos os atos incompletos
