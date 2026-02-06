# 04 - Formato exato de saída do texto "ATOS AUTORIZATIVOS"

## Formato de saída

### Estrutura

O texto gerado será um **parágrafo contínuo**, onde cada ato é separado por ponto e vírgula (`;`), exceto o último que termina com ponto final (`.`).

### Ordem

Os atos são ordenados por **data de publicação** (crescente), do mais antigo para o mais recente.

### Campos que entram no texto

Para cada ato autorizativo, o texto inclui:

1. **Tipo do ato** (ex: "Parecer", "Resoluçao", "Portaria")
2. **Número do ato** (formato: "Nº[numero]")
3. **Data de publicação** (formato: "de DD/MM/AAAA")
4. **Dois pontos** (`:`)
5. **Observações** (campo `observacoes`)

### Template de formatação

```
[Tipo do Ato] Nº[numero_ato] de [data_publicacao]: [observacoes];
```

**Nota:** O último ato termina com ponto final (`.`) em vez de ponto e vírgula (`;`).

## Exemplo: Antes e Depois

### ANTES (dados no banco)

**Escola:** Hermann Blumenau Complexo Educacional

**Atos autorizativos:**

| Tipo    | Número | Data Publicação | Órgão Emissor | Status Vigência | Observações |
|---------|--------|-----------------|---------------|-----------------|-------------|
| Parecer | 279    | 19/08/2014      | CEE-SC        | vigente         | pelo Credenciamento da Instituição Hermann Blumenau Complexo Educacional, do Município de Blumenau, mantido por Hermann Blumenau Instituto de Educação Ltda.-ME, pertencente à rede privada de ensino, localizada à Rua Alameda Duque de Caxias, nº 20, Bairro Centro, no Município de Blumenau – SC e pela Autorização para o funcionamento do Curso Técnico de Nível Médio em Saúde Bucal, Eixo Tecnológico de Ambiente e Saúde |
| Parecer | 150    | 10/05/2015      | CEE-SC        | vigente         | pela Autorização para o funcionamento do Curso Técnico de Nível Médio em Enfermagem |
| Resolução | 45   | 15/03/2016      | CEE-SC        | vigente         | sobre alteração de denominação da instituição |

### DEPOIS (texto gerado)

```
Parecer Nº279 de 19/08/2014: pelo Credenciamento da Instituição Hermann Blumenau Complexo Educacional, do Município de Blumenau, mantido por Hermann Blumenau Instituto de Educação Ltda.-ME, pertencente à rede privada de ensino, localizada à Rua Alameda Duque de Caxias, nº 20, Bairro Centro, no Município de Blumenau – SC e pela Autorização para o funcionamento do Curso Técnico de Nível Médio em Saúde Bucal, Eixo Tecnológico de Ambiente e Saúde; Parecer Nº150 de 10/05/2015: pela Autorização para o funcionamento do Curso Técnico de Nível Médio em Enfermagem; Resolução Nº45 de 15/03/2016: sobre alteração de denominação da instituição.
```

## Regras de ordenação e agrupamento

### Ordenação

Os atos são ordenados **apenas por data de publicação** (crescente), do mais antigo para o mais recente.

### Agrupamento

**Não há agrupamento por tipo de ato.** Todos os atos são apresentados em uma única sequência ordenada por data, independentemente do tipo (Parecer, Resolução, Portaria, etc.).

### Critério de desempate

Se houver múltiplos atos com a mesma data de publicação, a ordem entre eles é determinada por:

1. **Número do ato** (crescente) — atos com números menores aparecem primeiro
2. Se ainda houver empate, ordem alfabética do tipo do ato

**Exemplo de desempate:**
- Resolução Nº45 de 15/03/2016
- Parecer Nº100 de 15/03/2016
- Portaria Nº50 de 15/03/2016

**Ordem no texto:** Resolução Nº45, Portaria Nº50, Parecer Nº100 (ordem numérica)

## Regras de formatação

### Espaçamento

- **Um espaço** após o dois pontos (`:`) antes das observações
- **Um espaço** após o ponto e vírgula (`;`) antes do próximo ato
- **Sem quebra de linha** entre os atos (texto contínuo)

### Capitalização

- Tipo do ato: primeira letra maiúscula, resto conforme cadastrado (ex: "Parecer", "Resoluçao", "Portaria")
- Número: sempre após "Nº" sem espaço (ex: "Nº279")
- Data: formato DD/MM/AAAA
- Observações: mantém exatamente como cadastrado (preserva maiúsculas/minúsculas originais)

### Pontuação

- Cada ato termina com ponto e vírgula (`;`), exceto o último que termina com ponto final (`.`)
- Não há vírgula entre número e data
- Não há vírgula entre data e dois pontos

## Casos especiais

### Apenas um ato

Se houver apenas um ato, o texto termina com ponto final (`.`), sem ponto e vírgula:

```
Parecer Nº279 de 19/08/2014: pelo Credenciamento da Instituição Hermann Blumenau Complexo Educacional, do Município de Blumenau, mantido por Hermann Blumenau Instituto de Educação Ltda.-ME, pertencente à rede privada de ensino, localizada à Rua Alameda Duque de Caxias, nº 20, Bairro Centro, no Município de Blumenau – SC e pela Autorização para o funcionamento do Curso Técnico de Nível Médio em Saúde Bucal, Eixo Tecnológico de Ambiente e Saúde.
```

### Atos com mesma data

Se houver múltiplos atos com a mesma data de publicação, a ordem entre eles é por número do ato (crescente):

**Exemplo:**
- Parecer Nº100 de 15/03/2016
- Resolução Nº45 de 15/03/2016

**Ordem no texto:** Resolução Nº45 vem antes de Parecer Nº100 (ordem numérica)

### Atos revogados ou expirados

Atos com status "revogado" ou "expirado" são incluídos normalmente no texto, desde que tenham todos os campos obrigatórios preenchidos. Não há indicação especial de status no texto gerado.

## Observações importantes

1. O texto gerado é um **snapshot** no momento da geração e é salvo no campo `texto_atos_gerado` do parecer
2. Se novos atos forem cadastrados após a geração, é necessário gerar novamente para incluí-los
3. O texto é gerado apenas com os atos da escola vinculada ao parecer
4. Campos opcionais como `ementa_resumo`, `inicio_vigencia`, `fim_vigencia` não entram no texto gerado
