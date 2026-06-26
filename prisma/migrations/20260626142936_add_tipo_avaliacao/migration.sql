-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Avaliacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pacienteId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'SEMANTICA',
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
    CONSTRAINT "Avaliacao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaSemantica" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Avaliacao" ("categoriaId", "createdAt", "dataAplicacao", "duracaoSegundos", "id", "pacienteId", "revisaoCompleta", "totalIntrusoes", "totalNeologismos", "totalPalavras", "totalRepeticoes", "totalValidas", "transcricaoRaw", "updatedAt") SELECT "categoriaId", "createdAt", "dataAplicacao", "duracaoSegundos", "id", "pacienteId", "revisaoCompleta", "totalIntrusoes", "totalNeologismos", "totalPalavras", "totalRepeticoes", "totalValidas", "transcricaoRaw", "updatedAt" FROM "Avaliacao";
DROP TABLE "Avaliacao";
ALTER TABLE "new_Avaliacao" RENAME TO "Avaliacao";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
