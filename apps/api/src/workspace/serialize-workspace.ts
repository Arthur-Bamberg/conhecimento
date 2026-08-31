import { recorteColecao } from "../ai/recorte-sumario";
import { Workspace } from "./workspace.entity";

export function serializeWorkspace(
  workspace: Workspace,
  textos: { titulo: string }[] = [],
) {
  return {
    id: workspace.id,
    nome: workspace.nome,
    sumario: workspace.sumario || recorteColecao(textos),
  };
}
