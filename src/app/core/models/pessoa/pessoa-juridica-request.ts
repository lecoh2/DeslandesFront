// pessoa-juridica-request.ts
import { ContaBancariaRequest } from "../conta-bancaria/conta-bancaria-request";
import { SimplesNacional } from "../enums/sismples-nacional/simples-nacional";
import { GrupoPessoasEtiquetasRequest } from "../grupo-etiquetas/grupo-pessoas-etiquetas-request";
import { PessoaBase } from "./pessoa-base-request";


export interface PessoaJuridicaRequest extends PessoaBase {
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  atividadeEconomica?: string;
  // Relacionamento com enum
    grupoPessoasEtiquetas?: GrupoPessoasEtiquetasRequest[];
  simplesNacional?: SimplesNacional;
  contaBancaria?: ContaBancariaRequest;

}