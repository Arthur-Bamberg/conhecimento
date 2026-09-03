import { z } from "zod";

export type EscritaProposta = {
  type: "escrita_proposta";
  acao: "criar" | "alterar";
  textoId?: string;
  titulo: string;
  corpo: string;
};

const MARCA = ":::escrita";

const itemSchema = z.object({
  acao: z.enum(["criar", "alterar"]).optional(),
  textoId: z.string().uuid().optional(),
  titulo: z.string().trim().min(1),
  corpo: z.string().optional().default(""),
});

function paraProposta(raw: unknown): EscritaProposta[] {
  const parsed = z.union([itemSchema, z.array(itemSchema)]).safeParse(raw);
  if (!parsed.success) {
    return [];
  }
  const items = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
  return items.map((item) => ({
    type: "escrita_proposta" as const,
    acao: item.acao ?? (item.textoId ? "alterar" : "criar"),
    textoId: item.textoId,
    titulo: item.titulo,
    corpo: item.corpo,
  }));
}

export function extrairEscritas(resposta: string): {
  visivel: string;
  propostas: EscritaProposta[];
} {
  const re = /:::escrita\s*([\s\S]*?):::/i;
  const match = re.exec(resposta);
  if (!match) {
    return { visivel: resposta, propostas: [] };
  }
  const visivel = `${resposta.slice(0, match.index)}${resposta.slice(match.index + match[0].length)}`.replace(
    /\s+$/u,
    "",
  );
  const json = match[1]?.trim() ?? "";
  try {
    return { visivel, propostas: paraProposta(JSON.parse(json)) };
  } catch {
    return { visivel, propostas: [] };
  }
}

export function criarFiltroEscrita() {
  let pending = "";
  let modo: "texto" | "cerca" = "texto";
  let cerca = "";
  const holdLen = MARCA.length - 1;

  return {
    push(chunk: string): string {
      if (modo === "cerca") {
        cerca += chunk;
        return "";
      }
      pending += chunk;
      const idx = pending.indexOf(MARCA);
      if (idx === -1) {
        if (pending.length <= holdLen) {
          return "";
        }
        const emit = pending.slice(0, -holdLen);
        pending = pending.slice(-holdLen);
        return emit;
      }
      const emit = pending.slice(0, idx);
      cerca = pending.slice(idx);
      pending = "";
      modo = "cerca";
      return emit;
    },
    finish(): { resto: string; propostas: EscritaProposta[] } {
      if (modo === "cerca") {
        return {
          resto: pending,
          propostas: extrairEscritas(cerca).propostas,
        };
      }
      return { resto: pending, propostas: [] };
    },
  };
}
