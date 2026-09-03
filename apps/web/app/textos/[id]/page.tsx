"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { deleteTexto, getTexto, patchTexto } from "../../../lib/api";
import { MarkdownBody } from "../../../lib/markdown";
import { IconArrowLeft } from "../../icons";

export default function TextoEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [preview, setPreview] = useState(false);
  const texto = useQuery({
    queryKey: ["texto", params.id],
    queryFn: () => getTexto(params.id),
  });

  useEffect(() => {
    if (texto.data) {
      setTitulo(texto.data.titulo);
      setCorpo(texto.data.corpo);
    }
  }, [texto.data]);

  const salvar = useMutation({
    mutationFn: () => patchTexto(params.id, { titulo, corpo }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["textos"] });
      await queryClient.invalidateQueries({ queryKey: ["workspace"] });
      await queryClient.invalidateQueries({ queryKey: ["texto", params.id] });
    },
  });
  const apagar = useMutation({
    mutationFn: () => deleteTexto(params.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["textos"] });
      await queryClient.invalidateQueries({ queryKey: ["workspace"] });
      router.push("/textos");
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    salvar.mutate();
  }

  function onApagar() {
    if (
      !window.confirm(
        `Apagar «${titulo || texto.data?.titulo}»? Esta ação não tem volta.`,
      )
    ) {
      return;
    }
    apagar.mutate();
  }

  if (texto.isLoading) {
    return (
      <div aria-busy="true" aria-live="polite" className="flex flex-col gap-4">
        <p className="sr-only">A carregar…</p>
        <div className="skeleton h-5 w-24" />
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }
  if (texto.isError) {
    return (
      <div className="flex flex-col gap-3">
        <Link
          href="/textos"
          className="inline-flex w-fit min-h-11 items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          <IconArrowLeft className="size-4" />
          Voltar aos textos
        </Link>
        <p role="alert" className="text-sm text-danger">
          Texto não encontrado. Volte à lista e escolha outro.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Link
        href="/textos"
        className="inline-flex w-fit min-h-11 items-center gap-1.5 text-sm font-medium text-accent hover:underline"
      >
        <IconArrowLeft className="size-4" />
        Voltar aos textos
      </Link>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Título
        <input
          aria-label="Título"
          className="field text-xl font-semibold"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
      </label>
      <p className="max-w-prose text-sm leading-relaxed text-muted">
        <span className="font-medium text-foreground">Sumário. </span>
        {texto.data?.sumario || "Gerado automaticamente ao salvar."}
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Conteúdo</span>
          <div
            className="flex gap-1 text-sm"
            role="group"
            aria-label="Modo do conteúdo"
          >
            <button
              type="button"
              aria-pressed={!preview}
              className={
                !preview
                  ? "min-h-11 px-2 font-medium text-foreground"
                  : "min-h-11 px-2 text-muted transition-colors duration-200 hover:text-foreground"
              }
              onClick={() => setPreview(false)}
            >
              Editar
            </button>
            <button
              type="button"
              aria-pressed={preview}
              className={
                preview
                  ? "min-h-11 px-2 font-medium text-foreground"
                  : "min-h-11 px-2 text-muted transition-colors duration-200 hover:text-foreground"
              }
              onClick={() => setPreview(true)}
            >
              Preview
            </button>
          </div>
        </div>
        {preview ? (
          <MarkdownBody className="min-h-64 max-w-prose border border-border px-3 py-3">
            {corpo || "*Vazio*"}
          </MarkdownBody>
        ) : (
          <textarea
            aria-label="Conteúdo"
            className="field min-h-64 font-mono text-sm"
            value={corpo}
            onChange={(e) => setCorpo(e.target.value)}
          />
        )}
        <p className="text-xs text-muted">
          Markdown. O sumário da lista é gerado pela IA ao salvar.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          className="btn-primary"
          disabled={salvar.isPending}
        >
          {salvar.isPending ? "A salvar…" : "Salvar"}
        </button>
        <button
          type="button"
          className="btn-danger"
          onClick={onApagar}
          disabled={apagar.isPending}
        >
          Apagar
        </button>
        {salvar.isSuccess ? (
          <span aria-live="polite" className="text-sm text-accent">
            Salvo.
          </span>
        ) : null}
        {salvar.isError ? (
          <span role="alert" className="text-sm text-danger">
            Não foi possível salvar. Tente de novo.
          </span>
        ) : null}
      </div>
    </form>
  );
}
