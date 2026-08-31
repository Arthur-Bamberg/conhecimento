import { Texto } from "./texto.entity";
import { recorteSumario } from "../ai/recorte-sumario";

export function serializeTexto(texto: Texto) {
  return {
    id: texto.id,
    workspaceId: texto.workspaceId,
    titulo: texto.titulo,
    corpo: texto.corpo,
    sumario: texto.sumario || recorteSumario(texto.titulo, texto.corpo),
    createdAt: texto.createdAt.toISOString(),
    updatedAt: texto.updatedAt.toISOString(),
  };
}
