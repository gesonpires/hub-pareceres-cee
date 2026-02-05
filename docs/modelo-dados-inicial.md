# 02 - Modelo de dados inicial (MVP)

## Tabela: `escolas`

- `id` (PK, UUID ou inteiro)
- `nome_oficial` (texto, obrigatório)
- `codigo_inep` (texto, opcional, **único**)
- `cnpj` (texto, opcional, indexado)
- `municipio` (texto, opcional, indexado)
- `rede_ensino` (enum/texto: estadual, municipal, privada etc.)
- `situacao` (enum: ativa, inativa)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Tabela: `atos_autorizativos`

- `id` (PK)
- `escola_id` (FK -> escolas.id, obrigatório)
- `tipo_ato` (texto/enum, **obrigatório**)
- `numero_ato` (texto, **obrigatório**)
- `ano_ato` (inteiro, opcional)
- `data_publicacao` (date, **obrigatório**)  
  > usada na ordenação da seção “ATOS AUTORIZATIVOS”
- `orgao_emissor` (texto, **obrigatório**)
- `ementa_resumo` (texto, opcional)
- `inicio_vigencia` (date, opcional)
- `fim_vigencia` (date, opcional)
- `status_vigencia` (enum: vigente, expirado, revogado, **obrigatório**)
- `observacoes` (texto, **obrigatório no formulário**, pode ser curto)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Tabela: `pareceres`

- `id` (PK)
- `escola_id` (FK -> escolas.id, obrigatório)
- `numero_parecer` (inteiro, obrigatório)
- `ano_parecer` (inteiro, obrigatório)
- `data_parecer` (date, obrigatório)
- `ementa` (texto, obrigatório)
- `texto_atos_gerado` (texto, opcional, snapshot para auditoria)
- `status` (enum: rascunho, finalizado)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Tabela: `usuarios` (mínimo para perfis do MVP)

- `id` (PK)
- `nome` (texto, obrigatório)
- `email` (texto, obrigatório, único)
- `perfil` (enum: consulta, edicao)
- `ativo` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Índices e regras recomendadas

- `UNIQUE (numero_parecer, ano_parecer)` em `pareceres`.
- Índice em `pareceres(escola_id, ano_parecer, numero_parecer)`.
- Índice em `pareceres(status, data_parecer)` para filtros de listagem.
- Índice em `atos_autorizativos(escola_id, data_publicacao)`.
- Índice em `escolas(nome_oficial)`, `escolas(cnpj)`, `escolas(codigo_inep)`, `escolas(municipio)`.
- Integridade: não permitir `parecer` sem `escola_id` válido.

## Regras de geração da seção “ATOS AUTORIZATIVOS” (MVP)

1. Buscar atos da escola vinculada ao parecer.
2. Validar campos obrigatórios do ato (tipo, número, data_publicacao, órgão emissor, status_vigencia, observações).
3. Bloquear geração se existir ato incompleto e exibir mensagem orientativa.
4. Ordenar por `data_publicacao` (crescente).
5. Renderizar texto padronizado para copiar/colar na minuta.
6. Salvar snapshot em `texto_atos_gerado` para rastreabilidade do que foi usado no parecer.
