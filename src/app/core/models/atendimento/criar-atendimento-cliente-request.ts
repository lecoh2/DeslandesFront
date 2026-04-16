import { GrupoAtendimentoClienteRequest } from "../grupo-atendimento-cliente/grupo-atendimento-cliente-request";
import { GrupoEtiquetaAtendimentoRequest } from "../grupo-etiqueta-atendimento/grupo-atendimento-etiqueta-request";

export interface CriarAtendimentoClienteRequest {
  assunto: string;
  registro: string;

  // 🔥 VÍNCULOS (opcionais)
  processoId?: string;
  casoId?: string;
  atendimentoPaiId?: string;
  responsavelId?: string;

  // 🔥 RELACIONAMENTOS N:N
  grupoAtendimentoEtiquetas: GrupoEtiquetaAtendimentoRequest[];
  grupoAtendimentoCliente: GrupoAtendimentoClienteRequest[];
}