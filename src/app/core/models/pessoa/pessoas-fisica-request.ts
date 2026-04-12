// pessoa-fisica.model.ts
import { ContaBancariaRequest } from "../conta-bancaria/conta-bancaria-request";
import { EnderecoRequest } from "../endereco/endereco-request";
import { GrupoPessoasEtiquetasRequest } from "../grupo-etiquetas/grupo-pessoas-etiquetas-request";
import { InformacoesComplementaresRequest } from "../informacoes-complementares/informacoes-complementares-request";
import { PessoaBase } from "./pessoa-base-request";


export interface PessoaFisicaRequest extends PessoaBase {
  rg?: string;
  cpf?: string;
  tituloEleitor?: string;
  carteiraTrabalho?: string;
  pisPasep?: string;
  cnh?: string;
  passaporte?: string;
  certidaoReservista?: string;

  endereco?: EnderecoRequest;
  informacoesComplementares?: InformacoesComplementaresRequest;
    // ✅ ADICIONE ISSO
  grupoPessoasEtiquetas?: GrupoPessoasEtiquetasRequest[];
   contaBancaria?: ContaBancariaRequest;
}