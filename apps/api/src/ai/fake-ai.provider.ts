import type { StreamLine } from "@conhecimento/contracts";
import type {
  AIProvider,
  StreamPedido,
  SumariarColecaoPedido,
  SumariarPedido,
} from "./ai-provider";
import { recorteColecao, recorteSumario } from "./recorte-sumario";
import { escolherTextoPorOverlap } from "./resolver-fontes";

async function* chunks(text: string): AsyncGenerator<StreamLine> {
  for (const piece of text.match(/.{1,24}/g) ?? [text]) {
    yield { type: "token", text: piece };
  }
}

export class FakeAIProvider implements AIProvider {
  async *stream(input: StreamPedido): AsyncIterable<StreamLine> {
    const texto = escolherTextoPorOverlap(input.pedido, input.textos);
    if (!texto) {
      yield* chunks("Não encontrei textos no contexto.");
      yield { type: "done" };
      return;
    }
    const trecho = (texto.corpo.trim() || texto.titulo).slice(0, 200);
    const resposta = [
      `Com base no texto **${texto.titulo}**, isto é o que está gravado.`,
      "",
      trecho,
    ].join("\n");
    yield* chunks(resposta);
    yield { type: "fonte", textoId: texto.id, titulo: texto.titulo };
    yield { type: "done" };
  }

  async sumariar(input: SumariarPedido): Promise<string> {
    return recorteSumario(input.titulo, input.corpo);
  }

  async sumariarColecao(input: SumariarColecaoPedido): Promise<string> {
    return recorteColecao(input.textos);
  }
}
