import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  const prisma = await getDB();
  const categorias = await prisma.categoriaSemantica.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(categorias);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nome, cor } = body;

  if (!nome?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  if (!cor?.trim()) return NextResponse.json({ error: "Cor é obrigatória" }, { status: 400 });

  const prisma = await getDB();
  const categoria = await prisma.categoriaSemantica.create({
    data: { nome: nome.trim(), cor: cor.trim() },
  });

  return NextResponse.json(categoria, { status: 201 });
}
