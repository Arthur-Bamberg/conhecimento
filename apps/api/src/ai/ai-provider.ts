import type { StreamLine } from "@conhecimento/contracts";
import type { TextoContexto } from "./context-builder";
import type { EscritaProposta } from "./extrair-escritas";

export type TurnoHistorico = {
  role: "user" | "assistant";
  conteudo: string;
};

export type ProviderLine = StreamLine | EscritaProposta;

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
  stream(input: StreamPedido): AsyncIterable<ProviderLine>;
  sumariar(input: SumariarPedido): Promise<string>;
  sumariarColecao(input: SumariarColecaoPedido): Promise<string>;
}

export const AI_PROVIDER = Symbol("AI_PROVIDER");
