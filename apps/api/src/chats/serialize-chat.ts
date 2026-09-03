import { Chat } from "./chat.entity";

export function serializeChat(chat: Chat) {
  return {
    id: chat.id,
    titulo: chat.titulo,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  };
}

export function serializeChatDetalhe(chat: Chat) {
  return {
    ...serializeChat(chat),
    mensagens: (chat.mensagens ?? []).map((m) => ({
      id: m.id,
      chatId: m.chatId,
      role: m.role,
      conteudo: m.conteudo,
      fontes: m.fontes ?? [],
      escritas: m.escritas ?? [],
      createdAt: m.createdAt.toISOString(),
    })),
  };
}
