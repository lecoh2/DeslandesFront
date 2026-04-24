import { PrioridadeTarefaEnum } from "../enums/prioridade/prioridade-tarefaEnum";
import { StatusGeralKanbanEnum } from "../enums/status-kaban/status-kaban-geralEnum";
import { TipoVinculoEnum } from "../enums/tipo-vinculo/tipo-vinculoEnum";
import { GrupoEtiquetaRequest } from "../grupo-etiquetas/grupo-etiquetas";

import { GrupoTarefaResponsavelResponse } from "../grupo-tarefa-responsavel/grupo-tarefa-responsavel-response";
import { ListaTarefasResponse } from "./lista-tarefas-response";

export interface ObterTarefaResponse {

  id: string;
  descricao: string;
  dataTarefa?: string;
  statusGeralKanban: StatusGeralKanbanEnum;
  prioridade: PrioridadeTarefaEnum;

  tipoVinculo?: TipoVinculoEnum | null;
  processoId?: string | null;
  casoId?: string | null;
  atendimentoId?: string | null;
processoPasta?: string;
casoPasta?: string;
atendimentoAssunto?: string;
  listasTarefa: ListaTarefasResponse[];
  grupoTarefaResponsaveis: GrupoTarefaResponsavelResponse[];
  grupoTarefasEtiquetas: GrupoEtiquetaRequest[];
}