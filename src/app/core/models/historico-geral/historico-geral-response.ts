import { TipoEntidadeEnum } from "../enums/tipo-entidade/tipo-entidadeEnum";

export interface HistoricoGeralResponse {
    id: string;

    entidade: TipoEntidadeEnum;
    entidadeId: string;

    usuarioId?: string;

    dataAlteracao: string;
    observacao?: string;

    dadosAntes: string;
    dadosDepois: string;
}