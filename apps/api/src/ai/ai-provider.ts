import type { StreamLine } from "@conhecimento/contracts";
import type { TextoContexto } from "./context-builder";

export type TurnoHistorico = {
  role: "user" | "assistant";
  conteudo: string;
};

export type StreamPedido = {
  pedido: string;
  textos: TextoContexto[];
  historico?: TurnoHistorico[];
};

export type SumariarPedido = {
  titulo: string;
  corpo: string;
};

export type SumariarColecaoPedido = {
  textos: { titulo: string; recorte: string }[];
};

export interface AIProvider {
  stream(input: StreamPedido): AsyncIterable<StreamLine>;
  sumariar(input: SumariarPedido): Promise<string>;
  sumariarColecao(input: SumariarColecaoPedido): Promise<string>;
}

export const AI_PROVIDER = Symbol("AI_PROVIDER");
