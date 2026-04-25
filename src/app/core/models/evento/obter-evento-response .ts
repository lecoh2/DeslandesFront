import { GrupoEventoEtiquetasResponse } from "../grupo-evento-etiquetas/grupo-evento-etiquetas-response";
import { GrupoEventoResponsavelResponse } from "../grupo-evento-responsavel/grupo-evento-responsavel-response";

export interface ObterEventoResponse {
  id: string;
  titulo: string;

  dataInicial: string;
  horaInicial: string;

  dataFinal?: string | null;
  horaFinal?: string | null;

  diaInteiro: boolean;

  endereco?: string | null;
  observacao?: string | null;

  modalidade: number;
  statusGeralKanban?: number | null;

  processoId?: string | null;
  casoId?: string | null;
  atendimentoId?: string | null;

  tipoVinculo?: number | null;

  grupoEventoResponsaveis?: GrupoEventoResponsavelResponse[];
  grupoEventoEtiquetas?: GrupoEventoEtiquetasResponse[];
}