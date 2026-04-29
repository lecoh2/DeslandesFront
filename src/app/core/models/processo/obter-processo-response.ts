import { GrupoClienteProcessoRequest } from "../grupo-cliente-processo/grupo-cliente-processo-request";
import { GrupoEnvolvidosProcessoRequest } from "../grupo-envolvidos-processo/grupo-envolvidos-processo-request";
import { GrupoEtiquetaProcessoRequest } from "../grupo-etiqueta-processo/grupo-etiqueta-processo-request";

export interface ObterProcessoResponse {
  acaoId?: string;

  //  RELACIONAMENTO CORRETO
  varaId: string;

  //  RESPONSÁVEL
  usuarioResponsavelId?: string;

  //  DADOS DO PROCESSO
  pasta?: string;
  titulo?: string;
  numeroProcesso?: string;
  linkTribunal?: string;
  objeto?: string;
  valorCausa?: number;
  distribuido?: string; // DateOnly → string (ISO: yyyy-MM-dd)
  valorCondenacao?: number;
  observacao?: string;
  instancia?: number;
  acesso?: number;

  //  RELACIONAMENTOS N:N
  grupoClienteProcesso?: GrupoClienteProcessoRequest[];
  grupoEnvolvidosProcesso?: GrupoEnvolvidosProcessoRequest[];
  grupoEtiquetasProcesso: GrupoEtiquetaProcessoRequest[];
}