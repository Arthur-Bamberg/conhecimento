import { Inject, Injectable } from "@nestjs/common";
import { AI_PROVIDER, type AIProvider } from "../ai/ai-provider";
import {
  cortarSumario,
  MAX_COLECAO,
  recorteColecao,
  recorteSumario,
} from "../ai/recorte-sumario";

@Injectable()
export class SumarioService {
  constructor(@Inject(AI_PROVIDER) private readonly provider: AIProvider) {}

  async gerar(titulo: string, corpo: string): Promise<string> {
    try {
      const gerado = cortarSumario(await this.provider.sumariar({ titulo, corpo }));
      if (gerado) {
        return gerado;
      }
    } catch {
      // fallback local: o save do Texto não depende do provider
    }
    return recorteSumario(titulo, corpo);
  }

  async gerarColecao(
    textos: { titulo: string; corpo: string; sumario: string }[],
  ): Promise<string> {
    if (textos.length === 0) {
      return "";
    }
    const pedido = {
      textos: textos.map((texto) => ({
        titulo: texto.titulo,
        recorte: texto.sumario || recorteSumario(texto.titulo, texto.corpo),
      })),
    };
    try {
      const gerado = cortarSumario(
        await this.provider.sumariarColecao(pedido),
        MAX_COLECAO,
      );
      if (gerado) {
        return gerado;
      }
    } catch {
      // fallback local: o save do workspace não depende do provider
    }
    return recorteColecao(pedido.textos);
  }
}
