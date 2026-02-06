-- CreateTable
CREATE TABLE "escolas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome_oficial" TEXT NOT NULL,
    "codigo_inep" TEXT,
    "cnpj" TEXT,
    "municipio" TEXT,
    "rede_ensino" TEXT,
    "situacao" TEXT NOT NULL DEFAULT 'ativa',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "atos_autorizativos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "escola_id" TEXT NOT NULL,
    "tipo_ato" TEXT NOT NULL,
    "numero_ato" TEXT NOT NULL,
    "ano_ato" INTEGER,
    "data_publicacao" DATETIME NOT NULL,
    "orgao_emissor" TEXT NOT NULL,
    "ementa_resumo" TEXT,
    "inicio_vigencia" DATETIME,
    "fim_vigencia" DATETIME,
    "status_vigencia" TEXT NOT NULL,
    "observacoes" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "atos_autorizativos_escola_id_fkey" FOREIGN KEY ("escola_id") REFERENCES "escolas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pareceres" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "escola_id" TEXT NOT NULL,
    "numero_parecer" INTEGER NOT NULL,
    "ano_parecer" INTEGER NOT NULL,
    "data_parecer" DATETIME NOT NULL,
    "ementa" TEXT NOT NULL,
    "texto_atos_gerado" TEXT,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pareceres_escola_id_fkey" FOREIGN KEY ("escola_id") REFERENCES "escolas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "perfil" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "escolas_codigo_inep_key" ON "escolas"("codigo_inep");

-- CreateIndex
CREATE INDEX "escolas_nome_oficial_idx" ON "escolas"("nome_oficial");

-- CreateIndex
CREATE INDEX "escolas_cnpj_idx" ON "escolas"("cnpj");

-- CreateIndex
CREATE INDEX "escolas_codigo_inep_idx" ON "escolas"("codigo_inep");

-- CreateIndex
CREATE INDEX "escolas_municipio_idx" ON "escolas"("municipio");

-- CreateIndex
CREATE INDEX "atos_autorizativos_escola_id_data_publicacao_idx" ON "atos_autorizativos"("escola_id", "data_publicacao");

-- CreateIndex
CREATE INDEX "pareceres_escola_id_ano_parecer_numero_parecer_idx" ON "pareceres"("escola_id", "ano_parecer", "numero_parecer");

-- CreateIndex
CREATE INDEX "pareceres_status_data_parecer_idx" ON "pareceres"("status", "data_parecer");

-- CreateIndex
CREATE UNIQUE INDEX "pareceres_numero_parecer_ano_parecer_key" ON "pareceres"("numero_parecer", "ano_parecer");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
