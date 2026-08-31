"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  createTexto,
  deleteTexto,
  getWorkspace,
  listTextos,
} from "../../lib/api";

export default function TextosPage() {
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const textos = useQuery({ queryKey: ["textos"], queryFn: listTextos });
  const workspace = useQuery({
    queryKey: ["workspace"],
    queryFn: getWorkspace,
  });
  const criar = useMutation({
    mutationFn: createTexto,
    onSuccess: async () => {
      setTitulo("");
      setConteudo("");
      await queryClient.invalidateQueries({ queryKey: ["textos"] });
      await queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
  });
  const apagar = useMutation({
    mutationFn: deleteTexto,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["textos"] });
      await queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    criar.mutate({ titulo, corpo: conteudo });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Textos</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Grave o que importa. Título e conteúdo entram no contexto do chat; o
            sumário de cada texto e o do workspace são gerados pela IA.
          </p>
        </div>
        <p className="text-sm text-muted">
          {textos.data
            ? `${textos.data.length} ${textos.data.length === 1 ? "texto" : "textos"}`
            : " "}
        </p>
      </div>

      <section className="card flex flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold">Sumário do workspace</h2>
          <span className="text-xs text-muted">IA</span>
        </div>
        <p
          data-testid="sumario-workspace"
          className="text-sm leading-relaxed text-muted"
        >
          {workspace.data?.sumario ||
            "Grave textos para a IA sintetizar o conjunto."}
        </p>
      </section>

      <form onSubmit={onSubmit} className="card flex flex-col gap-4 p-5">
        <div>
          <h2 className="text-sm font-semibold">Novo texto</h2>
          <p className="mt-0.5 text-xs text-muted">
            Conteúdo em markdown. O sumário não se edita.
          </p>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Título
          <input
            aria-label="Título do novo texto"
            className="field font-normal"
            placeholder="Ex.: Coisas para comprar para a casa"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Conteúdo
          <textarea
            aria-label="Conteúdo do novo texto"
            className="field min-h-36 resize-y font-mono text-sm font-normal"
            placeholder="Listas, notas, links — em markdown"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="btn-primary"
            disabled={criar.isPending}
          >
            {criar.isPending ? "A criar…" : "Criar"}
          </button>
          {criar.isError ? (
            <p className="text-sm text-danger">Não foi possível criar o texto.</p>
          ) : null}
        </div>
      </form>

      {textos.isError ? (
        <p className="text-sm text-danger">Não foi possível carregar os textos.</p>
      ) : null}

      {textos.isLoading ? (
        <p className="text-sm text-muted">A carregar textos…</p>
      ) : (
        <ul className="grid gap-3">
          {(textos.data ?? []).map((texto) => (
            <li key={texto.id} className="card flex overflow-hidden">
              <Link
                aria-label={texto.titulo}
                className="min-w-0 flex-1 px-5 py-4 transition-colors hover:bg-accent-soft/40"
                href={`/textos/${texto.id}`}
              >
                <span className="block font-medium tracking-tight">
                  {texto.titulo}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">
                  {texto.sumario || "Sem sumário ainda."}
                </span>
              </Link>
              <button
                type="button"
                aria-label={`Apagar ${texto.titulo}`}
                className="flex shrink-0 items-center justify-center border-l border-border px-4 text-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-55"
                disabled={apagar.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      `Apagar «${texto.titulo}»? Esta ação não tem volta.`,
                    )
                  ) {
                    apagar.mutate(texto.id);
                  }
                }}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
          {textos.data?.length === 0 ? (
            <li className="card px-5 py-10 text-center text-sm text-muted">
              Nenhum texto ainda. Use o formulário acima para gravar o primeiro.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="size-5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}
