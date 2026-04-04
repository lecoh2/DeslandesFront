import { GrupoNiveisRequest } from "../grupo-niveis/grupo-niveis-request";
import { GrupoSetoresRequest } from "../grupo-setores/grupo-setores-request";
import { ConsultarPessoaRequest } from "../pessoa/consultar-pessoa-request";
import { PessoaSimplesRequest } from "../pessoa/Pessoa-simples-request";

export interface CriarUsuarioRequest {
    login?: string;
    senha?: string;
    idPessoa?:string;
    grupoSetores?: GrupoSetoresRequest[];
    grupoNiveis?: GrupoNiveisRequest[];
    //pessoa?: ConsultarPessoaRequest[];
}