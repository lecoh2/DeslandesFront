
import { GrupoNiveisRequest } from "../grupo-niveis/grupo-niveis-request";
import { GrupoSetoresRequest } from "../grupo-setores/grupo-setores-request";

export interface CriarUsuarioRequest {
    nomeUsuario?: string;
    login?: string;
    email?: string;
    senha?: string;
    idPessoa?:string;
    grupoSetor?: GrupoSetoresRequest[];
    grupoNivel?: GrupoNiveisRequest[];
    //pessoa?: ConsultarPessoaRequest[];
}