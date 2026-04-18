import { PrioridadeTarefaEnum } from "../enums/prioridade/prioridade-tarefaEnum";
import { StatusGeralKanbanEnum } from "../enums/status-kaban/status-kaban-geralEnum";
import { TipoVinculoEnum } from "../enums/tipo-vinculo/tipo-vinculoEnum";
import { GrupoEtiquetaRequest } from "../grupo-etiquetas/grupo-etiquetas";
import { GrupoTarefaResponsaveisRequest } from "../grupo-tarefa-responsavel/grupo-tarefa-responsaveis-request";
import { CriarListaTarefaRequest } from "./criar-lista-tarefa-request";

export interface CadastrarTarefaRequest {
  descricao: string;

  dataTarefa?: Date | null;

  // 🔗 VÍNCULOS
  processoId?: string | null;
  casoId?: string | null;
  atendimentoId?: string | null;
usuarioCriacaoId?: string | null;
  responsavelId?: string | null;

  prioridade: PrioridadeTarefaEnum;

  // 🔥 NOVOS CAMPOS
  tipoVinculo?: TipoVinculoEnum | null;
  statusGeralKanban: StatusGeralKanbanEnum;

  // 🏷️ ETIQUETAS
  grupoTarefasEtiquetas: GrupoEtiquetaRequest[];

  // 📋 CHECKLIST
  listasTarefa: CriarListaTarefaRequest[];

  // 👥 ENVOLVIDOS
  grupoTarefaResponsaveis: GrupoTarefaResponsaveisRequest[];
}