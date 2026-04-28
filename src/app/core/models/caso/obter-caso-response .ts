import { AcessoEnum } from "../enums/acesso/acesoEnum";
import { GrupoCasoClienteResponse } from "../grupo-caso-cliente/grupo-caso-cliente-response ";
import { GrupoCasoEnvolvidosResponse } from "../grupo-caso-envolvidos/grupo-caso-envolvidos-response";
import { GrupoEtiquetaCasoResponse } from "../grupo-etiqueta-caso/grupo-etiqueta-caso-response";

export interface ObterCasoResponse {
  id: string;

  pasta: string;
  titulo: string;
  descricao: string;
  observacao?: string;

  acesso: AcessoEnum; // enum vindo como int no backend

  dataCadastro?: string;

  // =========================
  // 👤 RESPONSÁVEL
  // =========================
  responsavelId?: string;
  responsavelNome?: string;

  // =========================
  // 👤 USUÁRIO CADASTRO
  // =========================
  usuarioCadastroId?: string;
  usuarioCadastroNome?: string;

  // =========================
  // 👥 CLIENTES
  // =========================
  grupoCasoClientes: GrupoCasoClienteResponse[];

  // =========================
  // 👤 ENVOLVIDOS
  // =========================
  grupoCasoEnvolvidos: GrupoCasoEnvolvidosResponse[];

  // =========================
  // 🏷️ ETIQUETAS
  // =========================
  grupoEtiquetaCaso: GrupoEtiquetaCasoResponse[];
}

// =========================
// CLIENTES
