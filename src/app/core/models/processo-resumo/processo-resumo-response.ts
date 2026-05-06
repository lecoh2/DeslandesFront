import { GrupoClienteProcessoResponse } from "../grupo-cliente-processo/grupo-cliente-processo-response";
import { GrupoEnvolvidosProcessoResponse } from "../grupo-envolvidos-processo/grupo-envolvidos-processo-response";

export interface ProcessoResumoResponse {
  id: string;
  pasta: string;
  numeroProcesso: string;
  titulo: string;

  grupoClientesProcesso: GrupoClienteProcessoResponse[];
  grupoEnvolvidosProcesso: GrupoEnvolvidosProcessoResponse[];

  dataCadastro: string;
}