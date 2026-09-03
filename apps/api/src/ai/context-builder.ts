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

function promptDoContexto(textos: TextoContexto[], pedido: string): string {
  const blocos = textos
    .map((t) => `## ${t.titulo}\n(id: ${t.id})\n${t.corpo}`)
    .join("\n\n");
  return `Textos:\n${blocos}\n\nPedido:\n${pedido}`;
}

function truncarCorpo(
  texto: TextoContexto,
  pedido: string,
  orcamento: number,
): TextoContexto | undefined {
  const vazio = { ...texto, corpo: "" };
  const base = promptDoContexto([vazio], pedido).length;
  if (base > orcamento) {
    return undefined;
  }
  return { ...texto, corpo: texto.corpo.slice(0, orcamento - base) };
}

function caberNoOrcamento(
  textos: TextoContexto[],
  pedido: string,
  orcamento: number,
): TextoContexto[] {
  const out: TextoContexto[] = [];
  for (const texto of textos) {
    const candidato = [...out, texto];
    if (promptDoContexto(candidato, pedido).length <= orcamento) {
      out.push(texto);
      continue;
    }
    if (out.length > 0) {
      break;
    }
    const truncado = truncarCorpo(texto, pedido, orcamento);
    if (truncado) {
      out.push(truncado);
    }
    break;
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

  return {
    textos: escolhidos,
    prompt: promptDoContexto(escolhidos, input.pedido),
  };
}
