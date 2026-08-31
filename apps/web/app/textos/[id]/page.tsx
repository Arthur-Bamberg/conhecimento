"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { deleteTexto, getTexto, patchTexto } from "../../../lib/api";
import { MarkdownBody } from "../../../lib/markdown";

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

  if (texto.isLoading) {
    return <p className="text-sm text-muted">A carregar…</p>;
  }
  if (texto.isError) {
    return <p className="text-sm text-danger">Texto não encontrado.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Link
        href="/textos"
        className="w-fit text-sm font-medium text-accent hover:underline"
      >
        ← Textos
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
      <p className="text-sm text-muted">
        <span className="font-medium text-foreground">Sumário · IA. </span>
        {texto.data?.sumario || "Gerado automaticamente ao salvar."}
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Conteúdo</span>
          <div className="flex rounded-full border border-border bg-surface p-0.5 text-sm">
            <button
              type="button"
              className={
                !preview
                  ? "rounded-full bg-accent-soft px-3 py-1 font-medium text-accent"
                  : "rounded-full px-3 py-1 text-muted"
              }
              onClick={() => setPreview(false)}
            >
              Editar
            </button>
            <button
              type="button"
              className={
                preview
                  ? "rounded-full bg-accent-soft px-3 py-1 font-medium text-accent"
                  : "rounded-full px-3 py-1 text-muted"
              }
              onClick={() => setPreview(true)}
            >
              Preview
            </button>
          </div>
        </div>
        {preview ? (
          <MarkdownBody className="card min-h-64 max-w-none p-4">
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
          onClick={() => apagar.mutate()}
          disabled={apagar.isPending}
        >
          Apagar
        </button>
        {salvar.isSuccess ? (
          <span className="text-sm text-accent">Salvo.</span>
        ) : null}
        {salvar.isError ? (
          <span className="text-sm text-danger">Não foi possível salvar.</span>
        ) : null}
      </div>
    </form>
  );
}
