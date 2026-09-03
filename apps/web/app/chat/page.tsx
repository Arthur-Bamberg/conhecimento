"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { Escrita, Fonte } from "@conhecimento/contracts";
import {
  createChat,
  getChat,
  listChats,
  streamMensagem,
} from "../../lib/api";
import { MarkdownBody } from "../../lib/markdown";
import { IconPlus } from "../icons";

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [chatId, setChatId] = useState<string | null>(null);
  const [pedido, setPedido] = useState("");
  const [rascunho, setRascunho] = useState("");
  const [fontes, setFontes] = useState<Fonte[]>([]);
  const [escritas, setEscritas] = useState<Escrita[]>([]);
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
    setEscritas([]);
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
    setEscritas([]);
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
        if (line.type === "escrita") {
          setEscritas((prev) => [
            ...prev,
            { acao: line.acao, textoId: line.textoId, titulo: line.titulo },
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
      await queryClient.invalidateQueries({ queryKey: ["textos"] });
      await queryClient.invalidateQueries({ queryKey: ["workspace"] });
      setRascunho("");
      setFontes([]);
      setEscritas([]);
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

  const mensagens = detalhe.data?.mensagens ?? [];
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
    <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:grid-rows-none">
      <aside
        data-testid="lista-chats"
        className="flex min-h-0 flex-col border-b border-border pb-3 lg:border-r lg:border-b-0 lg:pr-4 lg:pb-0"
      >
        <button
          type="button"
          className="btn-ghost w-full shrink-0 text-sm"
          onClick={() => novoChat.mutate()}
          disabled={novoChat.isPending || enviando}
        >
          <IconPlus className="size-4" />
          Nova conversa
        </button>
        <nav
          aria-label="Conversas"
          className="mt-2 flex min-h-0 gap-1 overflow-x-auto lg:flex-1 lg:flex-col lg:overflow-y-auto"
        >
          {chats.isPending ? (
            <p className="px-1 py-2 text-sm text-muted">A carregar…</p>
          ) : null}
          {chats.isError ? (
            <div role="alert" className="flex flex-col gap-2 px-1 py-2 text-sm text-danger">
              <p>Não foi possível carregar as conversas. Recarregue a página.</p>
              <button
                type="button"
                className="btn-ghost self-start text-foreground"
                onClick={() => void chats.refetch()}
              >
                Tentar de novo
              </button>
            </div>
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
                    ? "flex min-h-11 w-max max-w-56 shrink-0 items-center px-2 py-2 text-left text-sm font-medium text-foreground lg:w-full lg:max-w-none"
                    : "flex min-h-11 w-max max-w-56 shrink-0 items-center px-2 py-2 text-left text-sm text-muted transition-colors duration-200 hover:text-foreground lg:w-full lg:max-w-none"
                }
                onClick={() => selecionarChat(chat.id)}
              >
                <span className="truncate">{chat.titulo}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden pt-4 lg:pt-0 lg:pl-6">
        <div className="shrink-0">
          <h1 className="text-2xl font-semibold">Chat</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
            Pergunte sobre os seus textos ou peça para gravar um. A origem
            aparece como fonte.
          </p>
        </div>
        <div
          data-testid="mensagens"
          className="mt-4 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto py-2"
        >
          {vazio ? (
            <p className="max-w-prose py-8 text-sm text-muted">
              Ainda não há mensagens. O assistente responde com base nos textos
              gravados e pode criar ou alterar um quando você pedir.
            </p>
          ) : null}
          {mensagens.map((m) =>
            m.role === "user" ? (
              <MensagemUsuario key={m.id}>{m.conteudo}</MensagemUsuario>
            ) : (
              <article
                key={m.id}
                data-role="assistant"
                className="mr-auto max-w-prose"
              >
                <p className="mb-1 text-xs font-medium text-muted">Resposta</p>
                <MarkdownBody>{m.conteudo}</MarkdownBody>
                <FontesList fontes={m.fontes} />
                <EscritasList escritas={m.escritas ?? []} />
              </article>
            ),
          )}
          {userPendenteVisivel ? (
            <MensagemUsuario testId="pedido-pendente">
              {pedidoPendente ?? ""}
            </MensagemUsuario>
          ) : null}
          {enviando && !rascunho ? (
            <p
              data-testid="aguardando"
              aria-live="polite"
              className="text-sm text-muted"
            >
              Aguardando a IA…
            </p>
          ) : null}
          {rascunho ? (
            <article data-testid="rascunho" data-role="assistant" className="mr-auto max-w-prose">
              <p className="mb-1 text-xs font-medium text-muted">Resposta</p>
              <MarkdownBody>{rascunho}</MarkdownBody>
              <FontesList fontes={fontes} />
              <EscritasList escritas={escritas} />
            </article>
          ) : null}
          {erroChat ? <RelatorioErro erro={erroChat} /> : null}
        </div>
        <form
          onSubmit={onSubmit}
          className="sticky bottom-0 z-20 mt-3 flex shrink-0 items-end gap-2 border-t border-border bg-background pt-3 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
        >
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-muted">Mensagem</span>
            <textarea
              className="field min-h-12 resize-none py-2"
              placeholder="Pergunte ou peça para gravar um texto"
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
          </label>
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

function MensagemUsuario({
  children,
  testId,
}: {
  children: string;
  testId?: string;
}) {
  return (
    <article
      data-role="user"
      data-testid={testId}
      className="ml-auto flex w-fit max-w-[min(36rem,92%)] flex-col items-end"
    >
      <p className="mb-1 text-xs font-medium text-muted">Você</p>
      <p className="rounded-lg bg-accent-soft px-3 py-2 text-accent-hover whitespace-pre-wrap">
        {children}
      </p>
    </article>
  );
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
      className="max-w-prose border border-danger/35 bg-danger-soft px-3 py-3"
    >
      <p className="text-sm font-medium text-danger">
        A IA não respondeu. Copie o relatório e envie aos desenvolvedores.
      </p>
      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words bg-background px-3 py-2 font-mono text-xs text-foreground">
        {relatorio}
      </pre>
      <button type="button" className="btn-ghost mt-2 text-sm" onClick={() => void copiar()}>
        {copiado ? "Copiado" : "Copiar relatório"}
      </button>
    </article>
  );
}

function EscritasList({ escritas }: { escritas: Escrita[] }) {
  if (escritas.length === 0) {
    return null;
  }
  return (
    <p
      data-testid="escritas"
      className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-muted"
    >
      <span>Gravado:</span>
      {escritas.map((e) => (
        <Link
          key={`${e.acao}-${e.textoId}`}
          className="inline-flex min-h-8 items-center text-accent underline-offset-2 hover:underline"
          href={`/textos/${e.textoId}`}
          aria-label={
            e.acao === "criar"
              ? `Texto criado: ${e.titulo}`
              : `Texto alterado: ${e.titulo}`
          }
        >
          {e.titulo}
        </Link>
      ))}
    </p>
  );
}

function FontesList({ fontes }: { fontes: Fonte[] }) {
  if (fontes.length === 0) {
    return null;
  }
  return (
    <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-muted">
      <span>Fonte:</span>
      {fontes.map((f) => (
        <Link
          key={f.textoId}
          className="inline-flex min-h-8 items-center text-accent underline-offset-2 hover:underline"
          href={`/textos/${f.textoId}`}
        >
          {f.titulo}
        </Link>
      ))}
    </p>
  );
}
