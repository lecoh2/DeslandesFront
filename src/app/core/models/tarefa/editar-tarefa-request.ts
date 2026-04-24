import { PrioridadeTarefaEnum } from "../enums/prioridade/prioridade-tarefaEnum";
import { StatusGeralKanbanEnum } from "../enums/status-kaban/status-kaban-geralEnum";
import { TipoVinculoEnum } from "../enums/tipo-vinculo/tipo-vinculoEnum";
import { GrupoEtiquetaRequest } from "../grupo-etiquetas/grupo-etiquetas";
import { GrupoTarefaResponsaveisRequest } from "../grupo-tarefa-responsavel/grupo-tarefa-responsaveis-request";
import { CriarListaTarefaRequest } from "./criar-lista-tarefa-request";

export interface EditarTarefaRequest {
  descricao: string;

  dataTarefa?: Date | null;

  // 🔗 VÍNCULOS
  processoId?: string | null;
  casoId?: string | null;
  atendimentoId?: string | null;

  // ❌ removido: usuarioCriacaoId (não deve mudar)
  // ❌ removido: responsavelId (você já usa lista)

  prioridade: PrioridadeTarefaEnum;
  tipoVinculo?: TipoVinculoEnum | null;
  statusGeralKanban: StatusGeralKanbanEnum;

  // 🏷️ ETIQUETAS
  grupoTarefasEtiquetas: GrupoEtiquetaRequest[];

  // 📋 CHECKLIST
  listasTarefa: CriarListaTarefaRequest[];

  // 👥 RESPONSÁVEIS
  grupoTarefaResponsaveis: GrupoTarefaResponsaveisRequest[];
}