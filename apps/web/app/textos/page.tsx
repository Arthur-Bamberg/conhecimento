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
import { IconTrash } from "../icons";

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

  const quantidade = textos.data?.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Textos</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
            Grave o que importa. Título e conteúdo entram no contexto do chat; o
            sumário de cada texto e o do workspace são gerados pela IA.
          </p>
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {typeof quantidade === "number"
            ? `${quantidade} ${quantidade === 1 ? "texto" : "textos"}`
            : " "}
        </p>
      </div>

      <section className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">Sumário do workspace</h2>
        <p
          data-testid="sumario-workspace"
          className="max-w-prose text-sm leading-relaxed text-muted"
        >
          {workspace.data?.sumario ||
            "Grave textos para a IA sintetizar o conjunto."}
        </p>
      </section>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-medium">Novo texto</h2>
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
            <p role="alert" className="text-sm text-danger">
              Não foi possível criar o texto. Confira o título e tente de novo.
            </p>
          ) : null}
        </div>
      </form>

      {textos.isError ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-danger">
          <p>Não foi possível carregar os textos. Recarregue a página.</p>
          <button
            type="button"
            className="btn-ghost text-foreground"
            onClick={() => void textos.refetch()}
          >
            Tentar de novo
          </button>
        </div>
      ) : null}

      {textos.isLoading ? (
        <ul className="grid gap-3" aria-busy="true" aria-live="polite">
          <li className="sr-only">A carregar textos…</li>
          <li className="skeleton h-16" />
          <li className="skeleton h-16" />
          <li className="skeleton h-16" />
        </ul>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {(textos.data ?? []).map((texto) => (
            <li key={texto.id} className="flex">
              <Link
                aria-label={texto.titulo}
                className="min-w-0 flex-1 py-4 pr-4 transition-colors duration-200 hover:text-accent"
                href={`/textos/${texto.id}`}
              >
                <span className="block font-medium">{texto.titulo}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">
                  {texto.sumario || "Sem sumário ainda."}
                </span>
              </Link>
              <button
                type="button"
                aria-label={`Apagar ${texto.titulo}`}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center px-3 text-muted transition-colors duration-200 hover:text-danger disabled:opacity-55"
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
                <IconTrash className="size-5" />
              </button>
            </li>
          ))}
          {textos.data?.length === 0 ? (
            <li className="py-8 text-sm text-muted">
              Nenhum texto ainda. Use o formulário acima para gravar o primeiro.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
