import { EnderecoResponse } from "../endereco/endereco-response";
import { ConsultarSexoResponse } from "../sexo/consutar-sexo-response";

export interface ConsultarPessoaResponse {

    idPessoa: string;
    nome: string;
    profissao?:string;
    email?:string;
    cpf?: string;
    rg?: string;
    expeditor?:string;
    telefone?: string;
    cnpj?: string;
    inscricaoEstadual?: string;
    perfil?: number;
    // Adiciona aqui:
  sexo?: ConsultarSexoResponse;
  endereco?: EnderecoResponse;
}