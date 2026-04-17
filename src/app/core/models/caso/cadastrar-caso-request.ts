import { AcessoEnum } from "../enums/acesso/acesoEnum";
import { GrupoCasoClienteRequest } from "../grupo-caso-cliente/grupo-casao-cliente-request";
import { GrupoCasoEnvolvidosRequest } from "../grupo-caso-envolvidos/grupo-caso-envolvidos";
import { GrupoEtiquetaCasoRequest } from "../grupo-etiqueta-caso/grupo-etiqueta-caso-request";

export interface CriarCasoRequest {
  pasta: string;
  titulo: string;
  descricao: string;
  observacao?: string | null;
  responsavelId?: string | null;
  acesso: AcessoEnum;

  grupoCasoClientes: GrupoCasoClienteRequest[];
  grupoCasoEnvolvidos: GrupoCasoEnvolvidosRequest[];
  grupoEtiquetaCasos: GrupoEtiquetaCasoRequest[];
}