import { PessoaResumo } from "./pessoa-resumo";

export interface PessoaSelecionada extends PessoaResumo {

  idQualificacao: string | null;
}