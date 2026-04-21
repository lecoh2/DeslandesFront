import { StatusGeralKanbanEnum } from "../enums/status-kaban/status-kaban-geralEnum";
import { TipoVinculoEnum } from "../enums/tipo-vinculo/tipo-vinculoEnum";
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

processoId?: string | null;
  casoId?: string | null;
  atendimentoId?: string | null;
    tipoVinculo?: TipoVinculoEnum | null;
  statusGeralKanban: StatusGeralKanbanEnum;
  tipoRecorrencia: number;
  intervaloRecorrencia: number;
  modalidade: number;
  dataFimRecorrencia?: string;
  quantidadeOcorrencias?: number;

  diasSemana?: number[];

  grupoEventoEtiquetas: GrupoEtiquetaRequest[];


  // 👥 ENVOLVIDOS
  grupoEventoResponsaveis: GrupoTarefaResponsaveisRequest[];
}