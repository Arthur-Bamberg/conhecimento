import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const createTextoSchema = z.object({
  titulo: z.string().trim().min(1),
  corpo: z.string().optional().default(""),
});

export const patchTextoSchema = z.object({
  titulo: z.string().trim().min(1).optional(),
  corpo: z.string().optional(),
});

export const textoSchema = z.object({
  id: uuidSchema,
  workspaceId: uuidSchema,
  titulo: z.string(),
  corpo: z.string(),
  sumario: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const workspaceSchema = z.object({
  id: uuidSchema,
  nome: z.string(),
  sumario: z.string(),
});

export const createChatSchema = z.object({
  titulo: z.string().trim().min(1).optional(),
});

export const fonteSchema = z.object({
  textoId: uuidSchema,
  titulo: z.string(),
});

export const mensagemSchema = z.object({
  id: uuidSchema,
  chatId: uuidSchema,
  role: z.enum(["user", "assistant"]),
  conteudo: z.string(),
  fontes: z.array(fonteSchema),
  createdAt: z.string(),
});

export const chatSchema = z.object({
  id: uuidSchema,
  titulo: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const chatDetalheSchema = chatSchema.extend({
  mensagens: z.array(mensagemSchema),
});

export const createMensagemSchema = z.object({
  conteudo: z.string().trim().min(1),
  textoIds: z.array(uuidSchema).optional(),
});

export const streamLineSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("token"), text: z.string() }),
  z.object({
    type: z.literal("fonte"),
    textoId: uuidSchema,
    titulo: z.string(),
  }),
  z.object({ type: z.literal("done") }),
  z.object({
    type: z.literal("error"),
    code: z.string(),
    message: z.string(),
  }),
]);

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type CreateTexto = z.infer<typeof createTextoSchema>;
export type PatchTexto = z.infer<typeof patchTextoSchema>;
export type Texto = z.infer<typeof textoSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
export type CreateMensagem = z.infer<typeof createMensagemSchema>;
export type StreamLine = z.infer<typeof streamLineSchema>;
export type Chat = z.infer<typeof chatSchema>;
export type Mensagem = z.infer<typeof mensagemSchema>;
export type Fonte = z.infer<typeof fonteSchema>;
