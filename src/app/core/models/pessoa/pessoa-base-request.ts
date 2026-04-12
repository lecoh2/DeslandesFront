// pessoa-base.model.ts

import { EnderecoRequest } from "../endereco/endereco-request";
import { PerfilEnum } from "../enums/perfil/perfilEnum";

import { TipoContaEnum } from "../enums/tipoconta/tipocontaEnum";
import { InformacoesComplementaresRequest } from "../informacoes-complementares/informacoes-complementares-request";


export interface PessoaBase {
  idUsuario?: string;
  nome?: string;
  apelido?: string;
  telefone?: string;
  site?: string;

  email?: string;

  dataCadastro?: Date;
  dataAtualizacao?: Date;




  endereco?: EnderecoRequest;
  informacoesComplementares?: InformacoesComplementaresRequest;

  idEtiqueta?: number;

  perfil?: PerfilEnum;
  tipoConta?: TipoContaEnum; //  CORRIGIDO AQUI
  //  Grupos (N:N)

}