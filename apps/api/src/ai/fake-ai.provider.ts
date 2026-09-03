import type { StreamLine } from "@conhecimento/contracts";
import type {
  AIProvider,
  ProviderLine,
  StreamPedido,
  SumariarColecaoPedido,
  SumariarPedido,
} from "./ai-provider";
import type { TextoContexto } from "./context-builder";
import type { EscritaProposta } from "./extrair-escritas";
import { recorteColecao, recorteSumario } from "./recorte-sumario";
import { escolherTextoPorOverlap } from "./resolver-fontes";

async function* chunks(text: string): AsyncGenerator<StreamLine> {
  for (const piece of text.match(/.{1,24}/g) ?? [text]) {
    yield { type: "token", text: piece };
  }
}

function tituloBonito(raw: string): string {
  const limpo = raw.trim().replace(/[.?!]+$/u, "");
  if (!limpo) {
    return "Novo texto";
  }
  return limpo.charAt(0).toUpperCase() + limpo.slice(1);
}

function pedidoDeCriar(pedido: string): boolean {
  return (
    /\b(crie|cria|grave|grava|escreva|escreve|anote|anota|registre|registra|adicione|adiciona)\b/i.test(
      pedido,
    ) && /\b(texto|t[oó]pico|nota)\b/i.test(pedido)
  );
}

function interpretarPedidoEscrita(
  pedido: string,
  textos: TextoContexto[],
): EscritaProposta | undefined {
  const criar = /crie um texto chamado\s+(.+?)\s+com o corpo\s+([\s\S]+)/i.exec(
    pedido,
  );
  if (criar?.[1] && criar[2] !== undefined) {
    return {
      type: "escrita_proposta",
      acao: "criar",
      titulo: criar[1].trim(),
      corpo: criar[2].trim(),
    };
  }
  const alterar = /altere o texto\s+(.+?)\s+para o corpo\s+([\s\S]+)/i.exec(
    pedido,
  );
  if (alterar?.[1] && alterar[2] !== undefined) {
    const titulo = alterar[1].trim();
    const alvo =
      textos.find((t) => t.titulo.toLowerCase() === titulo.toLowerCase()) ??
      escolherTextoPorOverlap(titulo, textos);
    if (!alvo) {
      return undefined;
    }
    return {
      type: "escrita_proposta",
      acao: "alterar",
      textoId: alvo.id,
      titulo: alvo.titulo,
      corpo: alterar[2].trim(),
    };
  }
  if (!pedidoDeCriar(pedido)) {
    return undefined;
  }
  const chamado = /chamado\s+(.+?)(?:\s+com o corpo\s+|$)/i.exec(pedido);
  const sobre = /\bsobre\s+([\s\S]+)/i.exec(pedido);
  const titulo = tituloBonito(chamado?.[1] || sobre?.[1] || pedido);
  return {
    type: "escrita_proposta",
    acao: "criar",
    titulo,
    corpo: `# ${titulo}\n\n${pedido.trim()}`,
  };
}

export class FakeAIProvider implements AIProvider {
  async *stream(input: StreamPedido): AsyncIterable<ProviderLine> {
    const proposta = interpretarPedidoEscrita(input.pedido, input.textos);
    if (proposta?.acao === "criar") {
      yield* chunks(`Vou gravar o texto **${proposta.titulo}**.`);
      yield proposta;
      yield { type: "done" };
      return;
    }
    if (proposta?.acao === "alterar") {
      yield* chunks(`Vou alterar o texto **${proposta.titulo}**.`);
      if (proposta.textoId) {
        yield {
          type: "fonte",
          textoId: proposta.textoId,
          titulo: proposta.titulo,
        };
      }
      yield proposta;
      yield { type: "done" };
      return;
    }
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
