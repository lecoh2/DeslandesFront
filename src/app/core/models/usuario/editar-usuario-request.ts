import { GrupoNiveisRequest } from "../grupo-niveis/grupo-niveis-request";
import { GrupoSetoresRequest } from "../grupo-setores/grupo-setores-request";


export interface EditarUsuarioRequest {
    idUsuario?: string;
    login?: string;
    senha?: string;
    idPessoa?: string;
    grupoSetores?: GrupoSetoresRequest[];
    grupoNiveis?: GrupoNiveisRequest[];
    //pessoa?: ConsultarPessoaRequest[];
}