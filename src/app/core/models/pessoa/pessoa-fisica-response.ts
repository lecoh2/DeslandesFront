// pessoa-fisica-response.ts

import { GrupoPessoaCliente } from "../grupo-pessoa/grupo-pessoa-cliente";
import { PessoaBase } from "./pessoa-base-request";


export interface PessoaFisicaResponse extends PessoaBase {
  // Campos específicos de Pessoa Física
success: boolean;
  message: string;
  data: {
    nome?:string;
    rg?: string;
    cpf?: string;
    tituloEleitor?: string;
    carteiraTrabalho?: string;
    pisPasep?: string;
    cnh?: string;
    passaporte?: string;
    certidaoReservista?: string;

  }
}