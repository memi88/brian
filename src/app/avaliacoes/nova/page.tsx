"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";

type Paciente = { id: string; nome: string };
type Categoria = { id: string; nome: string; cor: string };

export default function NovaAvaliacaoPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const [pacienteId, setPacienteId] = useState("");
  const [nomePacienteNovo, setNomePacienteNovo] = useState("");
  const [modoNovoPaciente, setModoNovoPaciente] = useState(false);
  const [categoriaId, setCategoriaId] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/pacientes").then((r) => r.json()),
      fetch("/api/categorias").then((r) => r.json()),
    ]).then(([pacs, cats]) => {
      setPacientes(pacs);
      setCategorias(cats);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoriaId) { setErro("Selecione uma categoria"); return; }
    if (!modoNovoPaciente && !pacienteId) { setErro("Selecione um paciente"); return; }
    if (modoNovoPaciente && !nomePacienteNovo.trim()) { setErro("Informe o nome do paciente"); return; }

    setErro("");
    setEnviando(true);
    const res = await fetch("/api/avaliacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pacienteId: modoNovoPaciente ? undefined : pacienteId,
        nomePacienteNovo: modoNovoPaciente ? nomePacienteNovo : undefined,
        categoriaId,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setErro(data.error ?? "Erro ao criar avaliação"); setEnviando(false); return; }
    router.push(`/avaliacoes/${data.id}/gravar`);
  }

  if (loading) {
    return (
      <div className="max-w-lg">
        <PageHeader title="Nova avaliação" />
        <p className="text-body-sm text-text-secondary">Carregando...</p>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="max-w-lg">
        <div className="mb-6">
          <Link href="/avaliacoes" className="inline-flex items-center gap-1.5 text-label-sm text-text-secondary hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Avaliações
          </Link>
        </div>
        <PageHeader title="Nova avaliação" />
        <Card className="text-center py-10">
          <p className="text-body-sm text-on-surface mb-2">Cadastre ao menos uma categoria semântica antes de iniciar uma avaliação.</p>
          <Link href="/avaliacoes/categorias">
            <Button size="sm">Cadastrar categorias</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/avaliacoes" className="inline-flex items-center gap-1.5 text-label-sm text-text-secondary hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Avaliações
        </Link>
      </div>

      <PageHeader title="Nova avaliação" subtitle="Teste de Fluência Verbal Semântica" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Paciente */}
        <div>
          <div className="flex gap-3 mb-2">
            <button
              type="button"
              onClick={() => { setModoNovoPaciente(false); setNomePacienteNovo(""); }}
              className={`text-label-sm px-3 py-1 rounded-full border transition-colors ${!modoNovoPaciente ? "bg-primary text-white border-primary" : "border-border text-text-secondary hover:border-primary"}`}
            >
              Paciente existente
            </button>
            <button
              type="button"
              onClick={() => { setModoNovoPaciente(true); setPacienteId(""); }}
              className={`text-label-sm px-3 py-1 rounded-full border transition-colors ${modoNovoPaciente ? "bg-primary text-white border-primary" : "border-border text-text-secondary hover:border-primary"}`}
            >
              Novo paciente
            </button>
          </div>

          {modoNovoPaciente ? (
            <Input
              label="Nome do paciente"
              value={nomePacienteNovo}
              onChange={(e) => setNomePacienteNovo(e.target.value)}
              placeholder="Nome completo"
              autoFocus
            />
          ) : (
            <Select
              label="Selecione o paciente"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </Select>
          )}
        </div>

        {/* Categoria */}
        <Select
          label="Categoria semântica"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
        >
          <option value="">Selecione a categoria...</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </Select>

        {categoriaId && (
          <Card className="bg-primary/5 border-primary/20 text-center py-3">
            <p className="text-body-sm text-on-surface">
              O paciente deverá dizer o máximo de palavras da categoria <strong>{categorias.find((c) => c.id === categoriaId)?.nome}</strong> em <strong>2 minutos e 30 segundos</strong>.
            </p>
          </Card>
        )}

        {erro && <p className="text-label-sm text-tertiary">{erro}</p>}

        <Button type="submit" disabled={enviando}>
          {enviando ? "Preparando..." : "Iniciar avaliação"}
        </Button>
      </form>
    </div>
  );
}
