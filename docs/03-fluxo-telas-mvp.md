# 03 - Fluxo de telas do MVP

## 1. Tela inicial / Dashboard

- Atalhos para: **Escolas**, **Atos Autorizativos**, **Pareceres**.
- Busca rápida por `número/ano` do parecer.

## 2. Cadastro e consulta de Escolas

- Lista com filtros por:
  - nome;
  - cidade;
  - CNPJ;
  - código INEP;
  - situação.
- Ações: criar, editar, desativar.
- Acesso ao detalhe da escola.

## 3. Detalhe da Escola + Atos Autorizativos

- Aba “Dados da Escola”.
- Aba “Atos Autorizativos” com tabela e ações CRUD.
- Ordenação padrão por `data_publicacao`.
- Campos obrigatórios com marcação visual e validação.

## 4. Cadastro e consulta de Pareceres

- Lista com filtros por:
  - escola;
  - número/ano;
  - status;
  - intervalo de data;
  - texto livre de ementa;
  - cidade/CNPJ/INEP (via dados da escola).
- Ações: criar, editar, visualizar.

## 5. Tela de edição do Parecer

- Campos principais: número, ano, data, ementa, escola.
- Bloco “ATOS AUTORIZATIVOS (gerado)” com:
  - botão **Gerar/Atualizar texto**;
  - preview do texto formatado;
  - botão **Copiar para área de transferência**.
- Comportamento de segurança:
  - se dados obrigatórios estiverem incompletos, bloquear geração;
  - exibir mensagem orientativa de correção.

## 6. Tela de visualização do Parecer

- Exibe dados cadastrais e o texto gerado.
- Facilita conferência antes de copiar para minuta DOCX.

## Fluxo resumido do usuário

1. Cadastra/atualiza escola.
2. Cadastra/atualiza atos autorizativos da escola.
3. Cria parecer e seleciona a escola.
4. Gera automaticamente a seção “ATOS AUTORIZATIVOS”.
5. Copia e cola na minuta do parecer.
