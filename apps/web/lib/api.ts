import type {
  Chat,
  CreateMensagem,
  CreateTexto,
  PatchTexto,
  StreamLine,
  Texto,
  Workspace,
} from "@conhecimento/contracts";
import {
  chatDetalheSchema,
  chatSchema,
  textoSchema,
  workspaceSchema,
} from "@conhecimento/contracts";
import { z } from "zod";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function parseJson<T>(res: Response, schema: z.ZodType<T>): Promise<T> {
  const body: unknown = await res.json();
  if (!res.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error?: { message?: string } }).error?.message ===
        "string"
        ? (body as { error: { message: string } }).error.message
        : `HTTP ${res.status}`;
    throw new Error(message);
  }
  return schema.parse(body);
}

export async function listTextos(): Promise<Texto[]> {
  const res = await fetch(`${API}/textos`);
  return parseJson(res, z.array(textoSchema));
}

export async function getWorkspace(): Promise<Workspace> {
  const res = await fetch(`${API}/workspace`);
  return parseJson(res, workspaceSchema);
}

export async function getTexto(id: string): Promise<Texto> {
  const res = await fetch(`${API}/textos/${id}`);
  return parseJson(res, textoSchema);
}

export async function createTexto(input: CreateTexto): Promise<Texto> {
  const res = await fetch(`${API}/textos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson(res, textoSchema);
}

export async function patchTexto(
  id: string,
  input: PatchTexto,
): Promise<Texto> {
  const res = await fetch(`${API}/textos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson(res, textoSchema);
}

export async function deleteTexto(id: string): Promise<void> {
  const res = await fetch(`${API}/textos/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error("Não foi possível apagar o texto.");
  }
}

export async function listChats(): Promise<Chat[]> {
  const res = await fetch(`${API}/chats`);
  return parseJson(res, z.array(chatSchema));
}

export async function createChat(): Promise<Chat> {
  const res = await fetch(`${API}/chats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  return parseJson(res, chatSchema);
}

export async function getChat(id: string) {
  const res = await fetch(`${API}/chats/${id}`);
  return parseJson(res, chatDetalheSchema);
}

export async function* streamMensagem(
  chatId: string,
  input: CreateMensagem,
): AsyncGenerator<StreamLine> {
  const res = await fetch(`${API}/chats/${chatId}/mensagens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok || !res.body) {
    throw new Error("Falha ao enviar mensagem.");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n");
    buf = parts.pop() ?? "";
    for (const line of parts) {
      if (line.trim()) {
        yield JSON.parse(line) as StreamLine;
      }
    }
  }
  if (buf.trim()) {
    yield JSON.parse(buf) as StreamLine;
  }
}
