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

type TipoAvaliacao = "LIVRE" | "FONEMICA" | "SEMANTICA";

const TIPOS: { value: TipoAvaliacao; label: string; descricao: string; duracao: string }[] = [
  {
    value: "LIVRE",
    label: "Fluência Verbal Livre",
    descricao: "Palavras livres sem restrição de categoria ou fonema",
    duracao: "2 min 30 s — 5 blocos",
  },
  {
    value: "FONEMICA",
    label: "Fluência Verbal Fonêmica",
    descricao: "Palavras iniciadas com um fonema específico (definido verbalmente pela Julie)",
    duracao: "2 min — 4 blocos",
  },
  {
    value: "SEMANTICA",
    label: "Fluência Verbal Semântica",
    descricao: "Palavras de uma categoria semântica (definida verbalmente pela Julie)",
    duracao: "2 min — 4 blocos",
  },
];

export default function NovaAvaliacaoPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);

  const [pacienteId, setPacienteId] = useState("");
  const [nomePacienteNovo, setNomePacienteNovo] = useState("");
  const [modoNovoPaciente, setModoNovoPaciente] = useState(false);
  const [tipo, setTipo] = useState<TipoAvaliacao>("SEMANTICA");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch("/api/pacientes")
      .then((r) => r.json())
      .then((pacs) => {
        setPacientes(pacs);
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        tipo,
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

  const tipoSelecionado = TIPOS.find((t) => t.value === tipo)!;

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/avaliacoes" className="inline-flex items-center gap-1.5 text-label-sm text-text-secondary hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Avaliações
        </Link>
      </div>

      <PageHeader title="Nova avaliação" subtitle="Teste de Fluência Verbal" />

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

        {/* Tipo */}
        <div className="flex flex-col gap-2">
          <span className="text-label-sm font-medium text-on-surface">Tipo de teste</span>
          <div className="flex flex-col gap-2">
            {TIPOS.map((t) => (
              <label
                key={t.value}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${tipo === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={t.value}
                  checked={tipo === t.value}
                  onChange={() => setTipo(t.value)}
                  className="mt-0.5 accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-label-sm font-semibold text-on-surface">{t.label}</div>
                  <div className="text-label-sm text-text-secondary mt-0.5">{t.descricao}</div>
                  <div className="text-label-sm text-primary font-medium mt-1">{t.duracao}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20 py-3 text-center">
          <p className="text-body-sm text-on-surface">
            <strong>{tipoSelecionado.label}</strong> — {tipoSelecionado.duracao}
          </p>
        </Card>

        {erro && <p className="text-label-sm text-error">{erro}</p>}

        <Button type="submit" disabled={enviando}>
          {enviando ? "Preparando..." : "Iniciar avaliação"}
        </Button>
      </form>
    </div>
  );
}
