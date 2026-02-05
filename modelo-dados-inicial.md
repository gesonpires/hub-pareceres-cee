# 01 - Perguntas essenciais para fechar escopo do MVP

> Status: **respondidas e consolidadas** com base no retorno da área usuária.

## 1) Fonte de verdade dos dados de atos autorizativos

**Decisão:** os dados passarão a ser mantidos no novo sistema, que se torna a fonte de verdade.

**Contexto funcional:** os atos autorizativos são pareceres emanados oficialmente pelo CEE-SC.

## 2) Perfis e permissões

**Decisão:** haverá múltiplos perfis, no mínimo:

- perfil de **consulta**;
- perfil de **edição** (cadastrar/editar/excluir escolas, atos e pareceres).

## 3) Padrão textual da seção “ATOS AUTORIZATIVOS”

**Decisão de MVP:** adotar geração automática com padrão inicial e registrar que o template oficial final ainda será refinado.

**Observação:** padronização fina de pontuação, caixa alta/baixa, prefixos e sufixos legais ficará como ajuste de regra em iteração seguinte.

**Exemplo real informado:**

> Parecer Nº279 de 19/08/2014: pelo Credenciamento da Instituição Hermann Blumenau Complexo Educacional, do Município de Blumenau, mantido por Hermann Blumenau Instituto de Educação Ltda.-ME, pertencente à rede privada de ensino, localizada à Rua Alameda Duque de Caxias, nº 20, Bairro Centro, no Município de Blumenau – SC e pela Autorização para o funcionamento do Curso Técnico de Nível Médio em Saúde Bucal, Eixo Tecnológico de Ambiente e Saúde.

## 4) Campos obrigatórios no cadastro de ato autorizativo

**Decisão:** obrigatórios no MVP:

- tipo do ato;
- número do ato;
- data do ato;
- órgão emissor;
- vigência/status de vigência;
- observações (campo disponível para complementaridade de texto legal).

**Exemplo real informado:**

> Parecer Nº279 de 19/08/2014: pelo Credenciamento da Instituição Hermann Blumenau Complexo Educacional, do Município de Blumenau, mantido por Hermann Blumenau Instituto de Educação Ltda.-ME, pertencente à rede privada de ensino, localizada à Rua Alameda Duque de Caxias, nº 20, Bairro Centro, no Município de Blumenau – SC e pela Autorização para o funcionamento do Curso Técnico de Nível Médio em Saúde Bucal, Eixo Tecnológico de Ambiente e Saúde.

## 5) Ordenação automática dos atos no texto final

**Decisão:** ordenação por **data de publicação**.

## 6) Identificação única de escola

**Decisão:** adotar identificador único e suportar atributos auxiliares para desambiguação de homônimos/renomeações:

- código INEP;
- CNPJ.

## 7) Filtros de busca indispensáveis no MVP

**Decisão:** incluir no MVP os filtros:

- escola;
- número/ano do parecer;
- status;
- intervalo de data;
- texto livre na ementa;
- CNPJ;
- código INEP;
- cidade.

## 8) Validação de consistência antes da geração do texto

**Decisão:** o sistema deve:

- **bloquear** a geração quando houver dados obrigatórios incompletos;
- exibir **mensagem orientativa** indicando o que falta corrigir.
