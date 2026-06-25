-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "dataNascimento" DATETIME,
    "responsavel" TEXT,
    "contato" TEXT,
    "dataInicioAcomp" DATETIME,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Atendimento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pacienteId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "horario" TEXT,
    "resumo" TEXT,
    "atividades" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Atendimento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pacienteId" TEXT NOT NULL,
    "atendimentoId" TEXT,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tarefa_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tarefa_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "Atendimento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanoSessao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pacienteId" TEXT NOT NULL,
    "plano" TEXT NOT NULL,
    "atendimentoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlanoSessao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlanoSessao_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "Atendimento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CategoriaSemantica" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pacienteId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "dataAplicacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duracaoSegundos" INTEGER,
    "totalPalavras" INTEGER NOT NULL DEFAULT 0,
    "totalValidas" INTEGER NOT NULL DEFAULT 0,
    "totalRepeticoes" INTEGER NOT NULL DEFAULT 0,
    "totalIntrusoes" INTEGER NOT NULL DEFAULT 0,
    "totalNeologismos" INTEGER NOT NULL DEFAULT 0,
    "transcricaoRaw" TEXT,
    "revisaoCompleta" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Avaliacao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Avaliacao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaSemantica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Palavra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "avaliacaoId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "timestamp" REAL NOT NULL,
    "bloco" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'VALIDA',
    CONSTRAINT "Palavra_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "Avaliacao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanoSessao_atendimentoId_key" ON "PlanoSessao"("atendimentoId");
