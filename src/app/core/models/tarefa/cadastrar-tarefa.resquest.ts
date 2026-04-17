export interface CadastrarTarefaRequest {
  descricao: string;

  dataTarefa?: Date | null;

  // 🔗 VÍNCULOS
  processoId?: string | null;
  casoId?: string | null;
  atendimentoId?: string | null;

  responsavelId?: string | null;

  prioridade: PrioridadeTarefa;

  // 🔥 NOVOS CAMPOS
  tipoVinculo?: TipoVinculo | null;
  statusGeralKanban: StatusGeralKanban;

  // 🏷️ ETIQUETAS
  etiquetas: GrupoEtiquetaRequest[];

  // 📋 CHECKLIST
  listasTarefa: CriarListaTarefaRequest[];

  // 👥 ENVOLVIDOS
  grupoTarefaResponsaveis: GrupoTarefaResponsaveisRequest[];
}