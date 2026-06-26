"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mic, Pause, Play, RotateCcw, StopCircle } from "lucide-react";

interface GravadorAudioProps {
  avaliacaoId: string;
  categoria: string;
  paciente: string;
}

type Status = "idle" | "recording" | "paused" | "processing" | "error";

const DURACAO_TOTAL = 150; // 2:30 em segundos

function formatTempo(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function GravadorAudio({ avaliacaoId, categoria, paciente }: GravadorAudioProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [tempo, setTempo] = useState(DURACAO_TOTAL);
  const [erroMsg, setErroMsg] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tempoDecorridoRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const handleStop = useCallback(async (tempoDecorrido: number) => {
    setStatus("processing");
    clearTimer();

    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      await new Promise<void>((resolve) => {
        mr.onstop = () => resolve();
        mr.stop();
      });
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());

    const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type ?? "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "audio.webm");
    formData.append("duracao", String(tempoDecorrido));

    try {
      const res = await fetch(`/api/avaliacoes/${avaliacaoId}/transcrever`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErroMsg(data.error ?? "Erro na transcrição");
        setStatus("error");
        return;
      }
      router.push(`/avaliacoes/${avaliacaoId}/revisar`);
    } catch {
      setErroMsg("Erro ao enviar áudio");
      setStatus("error");
    }
  }, [avaliacaoId, router]);

  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => {
        setTempo((prev) => {
          const next = prev - 1;
          tempoDecorridoRef.current = DURACAO_TOTAL - next;
          if (next <= 0) {
            handleStop(DURACAO_TOTAL);
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [status, handleStop]);

  async function handleStart() {
    setErroMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(500);
      setStatus("recording");
    } catch {
      setErroMsg("Não foi possível acessar o microfone. Verifique as permissões.");
      setStatus("error");
    }
  }

  function handlePause() {
    mediaRecorderRef.current?.pause();
    setStatus("paused");
  }

  function handleResume() {
    mediaRecorderRef.current?.resume();
    setStatus("recording");
  }

  function handleReset() {
    clearTimer();
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    chunksRef.current = [];
    tempoDecorridoRef.current = 0;
    setStatus("idle");
    setTempo(DURACAO_TOTAL);
    setErroMsg("");
  }

  async function handleSkipTranscricao() {
    router.push(`/avaliacoes/${avaliacaoId}/revisar`);
  }

  const progress = (DURACAO_TOTAL - tempo) / DURACAO_TOTAL;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const ringColor =
    status === "recording" ? "var(--color-tertiary)"
    : status === "processing" ? "var(--color-primary)"
    : "var(--color-primary)";

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-label-md text-text-secondary">Paciente: <strong className="text-on-surface">{paciente}</strong></p>
        <p className="text-label-md text-text-secondary">Categoria: <strong className="text-on-surface">{categoria}</strong></p>
      </div>

      {/* Circular timer */}
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 148 148">
          <circle cx="74" cy="74" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="8" />
          <circle
            cx="74" cy="74" r={radius} fill="none"
            stroke={ringColor} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="text-4xl font-bold text-on-surface tabular-nums">{formatTempo(tempo)}</span>
          {status === "idle" && <span className="text-label-sm text-text-secondary">Pronto</span>}
          {status === "recording" && (
            <span className="text-label-sm text-tertiary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              Gravando
            </span>
          )}
          {status === "paused" && <span className="text-label-sm text-text-secondary">Pausado</span>}
          {status === "processing" && <span className="text-label-sm text-primary animate-pulse">Transcrevendo...</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-3">
        {status === "idle" && (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 bg-primary text-white rounded-full px-6 py-3 font-semibold hover:bg-primary-dark transition-colors"
          >
            <Mic size={18} />
            Iniciar gravação
          </button>
        )}

        {status === "recording" && (
          <>
            <button
              onClick={handlePause}
              className="flex items-center gap-2 border border-border rounded-full px-5 py-2.5 text-body-sm hover:bg-surface-low transition-colors"
            >
              <Pause size={16} /> Pausar
            </button>
            <button
              onClick={() => handleStop(tempoDecorridoRef.current)}
              className="flex items-center gap-2 bg-tertiary text-white rounded-full px-5 py-2.5 text-body-sm hover:opacity-90 transition-colors"
            >
              <StopCircle size={16} /> Encerrar teste
            </button>
          </>
        )}

        {status === "paused" && (
          <>
            <button
              onClick={handleResume}
              className="flex items-center gap-2 bg-primary text-white rounded-full px-5 py-2.5 text-body-sm hover:bg-primary-dark transition-colors"
            >
              <Play size={16} /> Continuar
            </button>
            <button
              onClick={() => handleStop(tempoDecorridoRef.current)}
              className="flex items-center gap-2 bg-tertiary text-white rounded-full px-5 py-2.5 text-body-sm hover:opacity-90 transition-colors"
            >
              <StopCircle size={16} /> Encerrar
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 border border-border rounded-full px-5 py-2.5 text-body-sm hover:bg-surface-low transition-colors"
            >
              <RotateCcw size={16} /> Reiniciar
            </button>
          </>
        )}

        {status === "error" && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 border border-border rounded-full px-5 py-2.5 text-body-sm hover:bg-surface-low transition-colors"
          >
            <RotateCcw size={16} /> Tentar novamente
          </button>
        )}
      </div>

      {status === "recording" && (
        <p className="text-body-sm text-text-secondary text-center max-w-sm">
          Peça ao paciente que diga o máximo de palavras da categoria <strong>{categoria}</strong> até o tempo encerrar.
        </p>
      )}

      {erroMsg && (
        <p className="text-label-sm text-tertiary text-center max-w-sm bg-tertiary/10 rounded px-4 py-2">{erroMsg}</p>
      )}

      {(status === "idle" || status === "error") && (
        <button
          onClick={handleSkipTranscricao}
          className="text-label-sm text-text-secondary underline hover:text-primary transition-colors py-3"
        >
          Pular transcrição automática — inserir palavras manualmente
        </button>
      )}
    </div>
  );
}
