///import { FotosResponse } from "../fotos/fotos-response";
//import { GrupoNiveisRequest } from "../grupo-niveis/grupo-niveis-request";
//import { GrupoSetoresRequest } from "../grupo-setores/grupo-setores-request";


export interface ConsultarUsuarioResponse {
    id: string;
    idPessoa: string;
    nomeUsuario: string;
    login?: string;
    dataCadastro?: string;
    status?:number;
    email?:string,
    endereco?:string;
    telefone?:string;
    genero?:string;
   // foto?: string;
    fileUrl?:string;
    //grupoSetores?: GrupoSetoresRequest[];
    //grupoNiveis?: GrupoNiveisRequest[];
    //fotos?: FotosResponse;
}