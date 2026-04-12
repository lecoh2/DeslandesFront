import { SimplesNacional } from "../enums/sismples-nacional/simples-nacional";
import { PessoaBase } from "./pessoa-base-request";

export interface PessoaJuridicaResponse extends PessoaBase {
  success: boolean;
  mensagem: string;
  datas: {
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;

  // Relacionamento com enum
  simplesNacional?: SimplesNacional;

  }
}