import { StatusGeralKanbanEnum } from "../enums/status-kaban/status-kaban-geralEnum";
import { GrupoEtiquetaRequest } from "../grupo-etiquetas/grupo-etiquetas";
import { GrupoTarefaResponsaveisRequest } from "../grupo-tarefa-responsavel/grupo-tarefa-responsaveis-request";

export interface CriarEventoRequest {
  titulo: string;
  endereco?: string;
  observacao?: string;

  dataInicial: string; // ISO (yyyy-MM-dd)
  dataFinal?: string;

  horaInicial?: string; // HH:mm
  horaFinal?: string;

  diaInteiro: boolean;


  statusGeralKanban: StatusGeralKanbanEnum;
  tipoRecorrencia: number;
  intervaloRecorrencia: number;

  dataFimRecorrencia?: string;
  quantidadeOcorrencias?: number;

  diasSemana?: number[];

  grupoEventoEtiquetas: GrupoEtiquetaRequest[];


  // 👥 ENVOLVIDOS
  grupoEventoResponsaveis: GrupoTarefaResponsaveisRequest[];
}