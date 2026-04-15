import { SimplesNacional } from "../enums/sismples-nacional/simples-nacional";
import { PessoaBase } from "./pessoa-base-request";

export interface PessoaJuridicaResponse {

    nome?: string;
    cnpj: string;
    inscricaoEstadual?: string;
    inscricaoMunicipal?: string;
    simplesNacional?: SimplesNacional;
  }
