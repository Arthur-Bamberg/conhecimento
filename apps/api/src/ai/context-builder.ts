export type TextoContexto = {
  id: string;
  titulo: string;
  corpo: string;
};

const ORCAMENTO_PADRAO = 8000;

function tokensDe(pedido: string): string[] {
  return pedido
    .toLowerCase()
    .split(/\s+/u)
    .map((t) => t.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((t) => t.length >= 3);
}

function contemLexical(texto: TextoContexto, tokens: string[]): boolean {
  const hay = `${texto.titulo} ${texto.corpo}`.toLowerCase();
  return tokens.every((token) => hay.includes(token));
}

function caberNoOrcamento(
  textos: TextoContexto[],
  pedido: string,
  orcamento: number,
): TextoContexto[] {
  const out: TextoContexto[] = [];
  let usado = pedido.length;
  for (const texto of textos) {
    const custo = texto.titulo.length + texto.corpo.length + 16;
    if (out.length > 0 && usado + custo > orcamento) {
      break;
    }
    out.push(texto);
    usado += custo;
  }
  return out;
}

export function montarContexto(input: {
  pedido: string;
  textos: TextoContexto[];
  textoIds?: string[];
  orcamento?: number;
}): { textos: TextoContexto[]; prompt: string } {
  const orcamento = input.orcamento ?? ORCAMENTO_PADRAO;
  let escolhidos: TextoContexto[];

  if (input.textoIds && input.textoIds.length > 0) {
    const set = new Set(input.textoIds);
    escolhidos = input.textos.filter((t) => set.has(t.id));
  } else {
    const tokens = tokensDe(input.pedido);
    const lexical =
      tokens.length === 0
        ? []
        : input.textos.filter((t) => contemLexical(t, tokens));
    escolhidos = lexical.length > 0 ? lexical : [...input.textos];
  }

  escolhidos = caberNoOrcamento(escolhidos, input.pedido, orcamento);

  const blocos = escolhidos
    .map((t) => `## ${t.titulo}\n${t.corpo}`)
    .join("\n\n");
  const prompt = `Textos:\n${blocos}\n\nPedido:\n${input.pedido}`;

  return { textos: escolhidos, prompt };
}
