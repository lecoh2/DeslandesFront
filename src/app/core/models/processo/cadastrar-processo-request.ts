import { GrupoClienteRequest } from "../grupo-clientes/grupo-cliente-request ";
import { GrupoEnvolvidosRequest } from "../grupo-envolvidos/grupo-envolvidos-request";
import { GrupoEtiquetaRequest } from "../grupo-etiquetas/grupo-etiquetas";

export interface CadastrarProcessoRequest {
  acaoId?: string;
  varaId: string;
  usuarioResponsavelId?: string;

  pasta?: string;
  titulo?: string;
  numeroProcesso?: string;
  linkTribunal?: string;
  objeto?: string;
  valorCausa?: number;
  distribuido?: string;
  valorCondenacao?: number;
  observacao?: string;
  instancia?: number;
  acesso?: number;

  grupoCliente?: GrupoClienteRequest[];
  grupoEnvolvidos?: GrupoEnvolvidosRequest[];
  grupoEtiquetas?: GrupoEtiquetaRequest[];
}


