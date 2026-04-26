import { GrupoAtendimentoClienteResponse } from "../grupo-atendimento-cliente/grupo-atendimento-cliente-response";
import { GrupoEtiquetaAtendimentoResponse } from "../grupo-atendimento-etiquetas/grupo-etiqueta-atendimento-response";

export interface ObterAtendimentoResponse {
  id?: string;

  assunto: string;
  registro: string;

  processoId?: string | null;
  casoId?: string | null;
  atendimentoPaiId?: string | null;
  responsavelId?: string | null;

  grupoAtendimentoCliente: GrupoAtendimentoClienteResponse[];
  grupoAtendimentoEtiqueta: GrupoEtiquetaAtendimentoResponse[];
}