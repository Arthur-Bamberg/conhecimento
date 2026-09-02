"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { Fonte, Mensagem } from "@conhecimento/contracts";
import {
  createChat,
  getChat,
  listChats,
  streamMensagem,
} from "../../lib/api";
import { MarkdownBody } from "../../lib/markdown";

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [chatId, setChatId] = useState<string | null>(null);
  const [pedido, setPedido] = useState("");
  const [rascunho, setRascunho] = useState("");
  const [fontes, setFontes] = useState<Fonte[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [pedidoPendente, setPedidoPendente] = useState<string | null>(null);
  const [erroChat, setErroChat] = useState<ErroRelatorio | null>(null);

  const chats = useQuery({ queryKey: ["chats"], queryFn: listChats });

  useEffect(() => {
    if (!chats.data || chatId) {
      return;
    }
    if (chats.data[0]) {
      setChatId(chats.data[0].id);
      return;
    }
    void createChat().then(async (chat) => {
      setChatId(chat.id);
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
    });
  }, [chats.data, chatId, queryClient]);

  function limparRascunho() {
    setRascunho("");
    setFontes([]);
    setPedidoPendente(null);
    setErroChat(null);
    setPedido("");
  }

  const novoChat = useMutation({
    mutationFn: () => createChat(),
    onSuccess: async (chat) => {
      setChatId(chat.id);
      limparRascunho();
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  function selecionarChat(id: string) {
    if (id === chatId || enviando) {
      return;
    }
    setChatId(id);
    limparRascunho();
  }

  const detalhe = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => getChat(chatId!),
    enabled: Boolean(chatId),
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!chatId || !pedido.trim() || enviando) {
      return;
    }
    const conteudo = pedido.trim();
    setPedido("");
    setRascunho("");
    setFontes([]);
    setPedidoPendente(conteudo);
    setErroChat(null);
    setEnviando(true);
    try {
      for await (const line of streamMensagem(chatId, { conteudo })) {
        if (line.type === "token") {
          setRascunho((prev) => prev + line.text);
        }
        if (line.type === "fonte") {
          setFontes((prev) => [
            ...prev,
            { textoId: line.textoId, titulo: line.titulo },
          ]);
        }
        if (line.type === "error") {
          setErroChat({
            code: line.code,
            message: line.message,
            quando: new Date().toISOString(),
          });
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
      setRascunho("");
      setFontes([]);
      setPedidoPendente(null);
    } catch (err) {
      setErroChat({
        code: "CHAT_CLIENT_FAILED",
        message: err instanceof Error ? err.message : "Falha ao enviar mensagem.",
        quando: new Date().toISOString(),
      });
    } finally {
      setEnviando(false);
    }
  }

  const mensagens: Mensagem[] = detalhe.data?.mensagens ?? [];
  const userPendenteVisivel =
    Boolean(pedidoPendente) &&
    !mensagens.some(
      (m) => m.role === "user" && m.conteudo === pedidoPendente,
    );
  const vazio =
    !enviando &&
    mensagens.length === 0 &&
    !rascunho &&
    !pedidoPendente &&
    !erroChat;

  return (
    <div className="flex min-h-[70vh] flex-col gap-4 lg:flex-row lg:items-stretch">
      <aside
        data-testid="lista-chats"
        className="card flex max-h-48 w-full shrink-0 flex-col overflow-hidden p-2 lg:max-h-none lg:w-60"
      >
        <button
          type="button"
          className="btn-ghost w-full shrink-0 text-sm"
          onClick={() => novoChat.mutate()}
          disabled={novoChat.isPending || enviando}
        >
          Nova conversa
        </button>
        <p className="mt-3 px-2 text-xs font-medium tracking-wide text-muted uppercase">
          Conversas
        </p>
        <nav
          aria-label="Conversas"
          className="mt-1 min-h-0 flex-1 overflow-y-auto"
        >
          {chats.isPending ? (
            <p className="px-2 py-2 text-sm text-muted">A carregar…</p>
          ) : null}
          {chats.isError ? (
            <p className="px-2 py-2 text-sm text-danger">
              Não foi possível carregar as conversas.
            </p>
          ) : null}
          {(chats.data ?? []).map((chat) => {
            const ativo = chat.id === chatId;
            return (
              <button
                key={chat.id}
                type="button"
                aria-current={ativo ? "true" : undefined}
                title={chat.titulo}
                disabled={enviando}
                className={
                  ativo
                    ? "flex w-full rounded-xl bg-accent-soft px-3 py-2 text-left text-sm font-medium text-accent"
                    : "flex w-full rounded-xl px-3 py-2 text-left text-sm text-foreground hover:bg-surface"
                }
                onClick={() => selecionarChat(chat.id)}
              >
                <span className="truncate">{chat.titulo}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Chat</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Pergunte sobre os seus textos. A origem aparece como fonte.
          </p>
        </div>
        <div
          data-testid="mensagens"
          className="card flex flex-1 flex-col gap-3 overflow-y-auto p-4"
        >
        {vazio ? (
          <p className="m-auto max-w-sm py-10 text-center text-sm text-muted">
            Ainda não há mensagens. O assistente responde com base nos textos
            gravados.
          </p>
        ) : null}
        {mensagens.map((m) => (
          <article
            key={m.id}
            data-role={m.role}
            className={
              m.role === "user"
                ? "max-w-[85%] self-end rounded-2xl bg-accent px-3.5 py-2.5 text-accent-fg"
                : "max-w-[85%] self-start rounded-2xl bg-surface px-3.5 py-2.5"
            }
          >
            {m.role === "assistant" ? (
              <MarkdownBody>{m.conteudo}</MarkdownBody>
            ) : (
              <p className="whitespace-pre-wrap">{m.conteudo}</p>
            )}
            <FontesList fontes={m.fontes} inverted={m.role === "user"} />
          </article>
        ))}
        {userPendenteVisivel ? (
          <article
            data-role="user"
            data-testid="pedido-pendente"
            className="max-w-[85%] self-end rounded-2xl bg-accent px-3.5 py-2.5 text-accent-fg"
          >
            <p className="whitespace-pre-wrap">{pedidoPendente}</p>
          </article>
        ) : null}
        {enviando && !rascunho ? (
          <article
            data-testid="aguardando"
            aria-live="polite"
            className="max-w-[85%] self-start rounded-2xl bg-surface px-3.5 py-2.5 text-sm text-muted"
          >
            Aguardando a IA…
          </article>
        ) : null}
        {rascunho ? (
          <article
            data-testid="rascunho"
            className="max-w-[85%] self-start rounded-2xl bg-surface px-3.5 py-2.5"
          >
            <MarkdownBody>{rascunho}</MarkdownBody>
            <FontesList fontes={fontes} />
          </article>
        ) : null}
        {erroChat ? <RelatorioErro erro={erroChat} /> : null}
      </div>
      <form onSubmit={onSubmit} className="card flex items-end gap-2 p-2">
        <textarea
          aria-label="Mensagem"
          className="min-h-12 flex-1 resize-none rounded-xl bg-transparent px-3 py-2 outline-none"
          placeholder="Pergunte sobre os seus textos"
          rows={2}
          value={pedido}
          onChange={(e) => setPedido(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          className="btn-primary self-end"
          disabled={enviando || !chatId}
        >
          {enviando ? "Enviando…" : "Enviar"}
        </button>
      </form>
      </div>
    </div>
  );
}

type ErroRelatorio = {
  code: string;
  message: string;
  quando: string;
};

function textoRelatorio(erro: ErroRelatorio): string {
  return [
    "conhecimento — falha no chat",
    `código: ${erro.code}`,
    `quando: ${erro.quando}`,
    `mensagem: ${erro.message}`,
  ].join("\n");
}

function RelatorioErro({ erro }: { erro: ErroRelatorio }) {
  const [copiado, setCopiado] = useState(false);
  const relatorio = textoRelatorio(erro);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(relatorio);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <article
      data-testid="erro-ia"
      role="alert"
      className="max-w-full self-stretch rounded-2xl border border-danger/35 bg-danger-soft px-3.5 py-3"
    >
      <p className="text-sm font-medium text-danger">
        A IA não respondeu. Copie o relatório e envie aos desenvolvedores.
      </p>
      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-surface px-3 py-2 font-mono text-xs text-foreground">
        {relatorio}
      </pre>
      <button type="button" className="btn-ghost mt-2 text-sm" onClick={() => void copiar()}>
        {copiado ? "Copiado" : "Copiar relatório"}
      </button>
    </article>
  );
}

function FontesList({
  fontes,
  inverted = false,
}: {
  fontes: Fonte[];
  inverted?: boolean;
}) {
  if (fontes.length === 0) {
    return null;
  }
  return (
    <p className={`mt-2 flex flex-wrap gap-1.5 text-xs ${inverted ? "text-accent-fg/80" : "text-muted"}`}>
      <span className="self-center">Fonte:</span>
      {fontes.map((f) => (
        <Link
          key={f.textoId}
          className={
            inverted
              ? "rounded-full bg-accent-fg/15 px-2 py-0.5 underline-offset-2 hover:underline"
              : "rounded-full bg-accent-soft px-2 py-0.5 text-accent hover:underline"
          }
          href={`/textos/${f.textoId}`}
        >
          {f.titulo}
        </Link>
      ))}
    </p>
  );
}
