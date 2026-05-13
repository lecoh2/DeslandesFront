//import { GrupoNiveisRequest } from "../grupo-niveis/grupo-niveis-request";
//import { GrupoSetoresRequest } from "../grupo-setores/grupo-setores-request";

import { GrupoNiveisRequest } from "../grupo-niveis/grupo-niveis-request";
import { GrupoSetoresRequest } from "../grupo-setores/grupo-setores-request";


export interface EditarUsuarioRequest {
    id?: string;
    login?: string;
    senha?: string;
    nomeUsuario?: string;
    email?: string;
   
   grupoSetores?: GrupoSetoresRequest[];
   grupoNiveis?: GrupoNiveisRequest[];
   // pessoa?: ConsultarPessoaRequest[];
}