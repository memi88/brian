"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Check, Pencil } from "lucide-react";

type Palavra = {
  id: string;
  texto: string;
  bloco: number;
  timestamp: number;
};

interface RevisorPalavrasProps {
  avaliacaoId: string;
  palavrasIniciais: Palavra[];
  numBlocos: number;
  hasAudio?: boolean;
}

function getBlocos(numBlocos: number) {
  const labels = [
    { label: "Bloco 1", intervalo: "0 – 30s" },
    { label: "Bloco 2", intervalo: "30 – 60s" },
    { label: "Bloco 3", intervalo: "60 – 90s" },
    { label: "Bloco 4", intervalo: "90 – 120s" },
    { label: "Bloco 5", intervalo: "120 – 150s" },
  ];
  return labels.slice(0, numBlocos).map((l, i) => ({ ...l, index: i }));
}

export function RevisorPalavras({ avaliacaoId, palavrasIniciais, numBlocos, hasAudio }: RevisorPalavrasProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [palavras, setPalavras] = useState<Palavra[]>(palavrasIniciais);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTexto, setEditTexto] = useState("");
  const [editBloco, setEditBloco] = useState(0);
  const [addingBloco, setAddingBloco] = useState<number | null>(null);
  const [novaTexto, setNovaTexto] = useState("");
  const [saving, setSaving] = useState(false);

  const BLOCOS = getBlocos(numBlocos);

  function startEdit(p: Palavra) {
    setEditingId(p.id);
    setEditTexto(p.texto);
    setEditBloco(p.bloco);
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    await fetch(`/api/avaliacoes/${avaliacaoId}/palavras/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: editTexto, bloco: editBloco }),
    });
    setPalavras((prev) =>
      prev.map((p) =>
        p.id === editingId ? { ...p, texto: editTexto.trim().toLowerCase(), bloco: editBloco } : p
      )
    );
    setEditingId(null);
    setSaving(false);
  }

  async function deletePalavra(id: string) {
    await fetch(`/api/avaliacoes/${avaliacaoId}/palavras/${id}`, { method: "DELETE" });
    setPalavras((prev) => prev.filter((p) => p.id !== id));
  }

  async function addPalavra(bloco: number) {
    if (!novaTexto.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/avaliacoes/${avaliacaoId}/palavras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: novaTexto, bloco, tipo: "VALIDA" }),
    });
    const nova = await res.json();
    setPalavras((prev) => [...prev, nova as Palavra]);
    setNovaTexto("");
    setAddingBloco(null);
    setSaving(false);
  }

  async function finalizarRevisao() {
    await fetch(`/api/avaliacoes/${avaliacaoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        revisaoCompleta: true,
        totalPalavras: palavras.length,
        totalValidas: palavras.length,
        totalRepeticoes: 0,
        totalIntrusoes: 0,
        totalNeologismos: 0,
      }),
    });
    startTransition(() => router.push(`/avaliacoes/${avaliacaoId}`));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Player de áudio */}
      {hasAudio && (
        <div className="border border-border rounded-lg p-4 bg-surface-low">
          <p className="text-label-sm text-text-secondary mb-2">Gravação da sessão</p>
          <audio
            controls
            src={`/api/avaliacoes/${avaliacaoId}/audio`}
            className="w-full h-10"
          />
        </div>
      )}

      {/* Totais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-low border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold tabular-nums text-on-surface">{palavras.length}</div>
          <div className="text-label-sm text-text-secondary mt-0.5">Total</div>
        </div>
        {BLOCOS.map((b) => {
          const count = palavras.filter((p) => p.bloco === b.index).length;
          return (
            <div key={b.index} className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold tabular-nums text-primary-dark">{count}</div>
              <div className="text-label-sm text-text-secondary mt-0.5">{b.label}</div>
            </div>
          );
        })}
      </div>

      {/* Blocos de palavras */}
      {BLOCOS.map((b) => {
        const blocoWords = palavras
          .filter((p) => p.bloco === b.index)
          .sort((a, z) => a.timestamp - z.timestamp);

        return (
          <div key={b.index} className="border border-border rounded-lg overflow-hidden">
            <div className="bg-surface-low px-4 py-2.5 flex items-center justify-between border-b border-border">
              <div>
                <span className="text-label-md font-semibold text-on-surface">{b.label}</span>
                <span className="text-label-sm text-text-secondary ml-2">{b.intervalo}</span>
              </div>
              <span className="text-label-sm text-primary font-semibold">
                {blocoWords.length} palavra{blocoWords.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="p-4 flex flex-wrap gap-2 min-h-[60px]">
              {blocoWords.map((p) =>
                editingId === p.id ? (
                  <div key={p.id} className="flex flex-col gap-1.5 border border-primary/30 rounded-lg p-2 bg-primary/5 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2">
                      <input
                        className="border border-border rounded px-2 py-1 text-body-sm bg-surface-low w-28 focus:outline-none focus:border-primary"
                        value={editTexto}
                        onChange={(e) => setEditTexto(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                      />
                      <select
                        aria-label="Bloco"
                        className="border border-border rounded px-2 py-1 text-label-sm bg-surface-low focus:outline-none focus:border-primary"
                        value={editBloco}
                        onChange={(e) => setEditBloco(Number(e.target.value))}
                      >
                        {BLOCOS.map((bl) => (
                          <option key={bl.index} value={bl.index}>{bl.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="flex items-center gap-1 text-label-sm bg-primary text-white rounded px-2 py-0.5 hover:bg-primary-dark"
                      >
                        <Check size={12} /> Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-label-sm text-text-secondary hover:text-on-surface px-2 py-0.5"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={p.id}
                    className="group flex items-center gap-1.5 rounded-full border px-3 py-1 text-body-sm font-medium bg-primary/15 text-primary-dark border-primary/30"
                  >
                    <span>{p.texto}</span>
                    <button
                      onClick={() => startEdit(p)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-0.5 text-current/60 hover:text-current"
                      aria-label="Editar palavra"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => deletePalavra(p.id)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-current/60 hover:text-current"
                      aria-label="Remover palavra"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )
              )}

              {addingBloco === b.index ? (
                <div className="flex gap-2 items-center w-full mt-1">
                  <input
                    className="border border-border rounded px-2 py-1 text-body-sm bg-surface-low w-28 focus:outline-none focus:border-primary"
                    placeholder="palavra"
                    value={novaTexto}
                    onChange={(e) => setNovaTexto(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") addPalavra(b.index); if (e.key === "Escape") setAddingBloco(null); }}
                  />
                  <button
                    onClick={() => addPalavra(b.index)}
                    disabled={saving || !novaTexto.trim()}
                    className="flex items-center gap-1 text-label-sm bg-primary text-white rounded px-2 py-1 hover:bg-primary-dark disabled:opacity-50"
                  >
                    <Check size={12} /> Adicionar
                  </button>
                  <button onClick={() => setAddingBloco(null)} className="text-label-sm text-text-secondary hover:text-on-surface">
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingBloco(b.index)}
                  className="flex items-center gap-1 text-label-sm text-text-secondary border border-dashed border-border rounded-full px-2.5 py-1 hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus size={12} /> Adicionar palavra
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-3 items-start">
        <button
          onClick={finalizarRevisao}
          disabled={isPending}
          className="flex items-center gap-2 bg-primary text-white rounded-full px-6 py-3 font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          <Check size={18} />
          {isPending ? "Salvando..." : "Finalizar revisão"}
        </button>
        <p className="text-body-sm text-text-secondary self-center">
          As palavras restantes serão salvas como resultado final.
        </p>
      </div>
    </div>
  );
}
