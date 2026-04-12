import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { PessoaFisicaRequest } from "../models/pessoa/pessoas-fisica-request";
import { PessoaJuridicaRequest } from "../models/pessoa/pessoa-juridica-request";
import { PessoaFisicaResponse } from "../models/pessoa/pessoa-fisica-response";
import { PessoaJuridicaResponse } from "../models/pessoa/pessoa-jurisica-response";


//import { ConsultarPessoaResponse } from "../models/pessoa/consultar-pessoa-response";
//import { CadastrarPessoaFisicaRequest } from "../models/pessoa/cadastrar-pessoa-fisica-request";
/*
import { CadastrarPessoaFisicaResponse } from "../models/pessoa/cadastrar-pessoa-fisica-response";
import { CadastrarPessoaJuridicaRequest } from "../models/pessoa/cadastrar-pessoa-juridica-request";
import { CadastrarPessoaJuridicaResponse } from "../models/pessoa/cadastrar-pessoa-juridica-response";
import { EditarPessoaFisicaRequest } from "../models/pessoa/editar-pessoa-fisica-request";
import { EditarPessoaJuridicaResponse } from "../models/pessoa/editar-pessoa-juridica.response";
import { EditarPessoaJuridicaRequest } from "../models/pessoa/editar-pessoa-juridica-request";
import { EditarPessoaFisicaResponse } from "../models/pessoa/editar-pessoa-fisica-response";
import { PagedResult } from "../models/paginacao/paged-result";
import { DataTablesResponse } from "../models/paginacao/data-tables-response";
*/

@Injectable({
  providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class PessoaService {
  //atributos
  private url = environment.apiDeslandes;
  private http = inject(HttpClient);

  //metodo para cadastrar a triagem
 // buscarPorNome(nome: string): Observable<ConsultarPessoaResponse[]> {
   // return this.http.get<ConsultarPessoaResponse[]>
  //    (`${this.url}/api/pessoa/consultar-pessoas-fisica/${encodeURIComponent(nome)}`);
  //}
  //  buscarPorNomePj(nome: string): Observable<ConsultarPessoaResponse[]> {
 //   return this.http.get<ConsultarPessoaResponse[]>
    //  (`${this.url}/api/pessoa/consultar-pessoas-juridica/${encodeURIComponent(nome)}`);
 // }
 /// buscarPorNomePessoaJuridica(nome: string): Observable<ConsultarPessoaResponse[]> {
   /// return this.http.get<ConsultarPessoaResponse[]>
 ///     (`${this.url}/api/pessoa/consultar-pessoas-juridica/${encodeURIComponent(nome)}`);
 // }


cadastrarPessoaFisica(request: PessoaFisicaRequest): Observable<PessoaFisicaResponse> {
  const token = localStorage.getItem('token'); // ou de onde você armazena
  return this.http.post<PessoaFisicaResponse>(
    `${this.url}/api/v1/pessoa-fisica/cadastrar-pessoa-fisica`,
    request,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}

  cadastrarPessoaJuridica(request: PessoaJuridicaRequest): Observable<PessoaJuridicaResponse> {
    return this.http.post<PessoaJuridicaResponse>
      (`${this.url}/api/v1/pessoa-juridica/cadastrar-pessoa-juridica`, request);
  }
  /*
  consultarPessoasFisica(): Observable<ConsultarPessoaResponse[]> {
    return this.http.get<ConsultarPessoaResponse[]>
      (`${this.url}/api/pessoa/consultar-pessoas-todas-fisica`);
  }
  consultarPessoasJuridica(): Observable<ConsultarPessoaResponse[]> {
    return this.http.get<ConsultarPessoaResponse[]>
      (`${this.url}/api/pessoa/consultar-pessoas-todas-juridica`);
  }
  consultarPessoaFisicaPorId(id: string): Observable<ConsultarPessoaResponse> {
    return this.http.get<ConsultarPessoaResponse>(
      `${this.url}/api/pessoa/consultar-pessoas-fisica-por-id/${id}`
    );
  }
  consultarPessoaJuridicaPorId(id: string): Observable<ConsultarPessoaResponse> {
    return this.http.get<ConsultarPessoaResponse>(
      `${this.url}/api/pessoa/consultar-pessoas-juridica-por-id/${id}`
    );
  }

  //método para atualizar pessoa na API
  editarPessoaFisica(dto: EditarPessoaFisicaRequest): Observable<EditarPessoaFisicaResponse> {
    return this.http.put<EditarPessoaFisicaResponse>(
      `${this.url}/api/pessoa/atualizar-pessoa-fisica/${dto.idPessoa}`,
      dto
    );
  }
  //método para atualizar pessoa na API
  editarPessoaJuridica(dto: EditarPessoaJuridicaRequest): Observable<EditarPessoaJuridicaResponse> {
    return this.http.put<EditarPessoaJuridicaResponse>(
      `${this.url}/api/pessoa/atualizar-pessoa-juridica/${dto.idPessoa}`,
      dto
    );
  }

  //método para consultar o historico da da pesso fisica
  consultarHistoricoPessoaFisica(id: string): Observable<ConsultarPessoaResponse> {
    return this.http.get<ConsultarPessoaResponse>(
      `${this.url}/api/pessoa/consultar-historico-pessoa-fisica/${id}`
    );
  }
  consultarHistoricoPessoaJuridica(id: string): Observable<ConsultarPessoaResponse> {
    return this.http.get<ConsultarPessoaResponse>(
      `${this.url}/api/pessoa/consultar-historico-pessoa-juridica/${id}`
    );
  }
consultarPessoasFisicaComPaginacao(
  pageNumber: number,
  pageSize: number,
  search: string
): Observable<DataTablesResponse<ConsultarPessoaResponse>> {
  const params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString())
    .set('searchValue', search);

  return this.http.get<DataTablesResponse<ConsultarPessoaResponse>>(
    `${this.url}/api/pessoa/consultar-pessoas-todas-fisica-com-paginacao`,
    { params }
  );
}


  consultarPessoaFisicaPaginado(pageNumber: number, pageSize: number, searchTerm?: string) {
  const params: any = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
  if (searchTerm) params.searchTerm = searchTerm;
  return this.http.get<any>(`${this.url}/api/pessoa/consultar-pessoas-fisica-paginacao`, { params });
}
  consultarPessoaJuridicaPaginado(pageNumber: number, pageSize: number, searchTerm?: string) {
  const params: any = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
  if (searchTerm) params.searchTerm = searchTerm;
  return this.http.get<any>(`${this.url}/api/pessoa/consultar-pessoas-juridica-paginacao`, { params });
}

consultarPessoasJuridicaComPaginacao(
  pageNumber: number,
  pageSize: number,
  search: string
): Observable<DataTablesResponse<ConsultarPessoaResponse>> {
  const params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString())
    .set('searchValue', search);

  return this.http.get<DataTablesResponse<ConsultarPessoaResponse>>(
    `${this.url}/api/pessoa/consultar-pessoas-todas-juridica-com-paginacao`,
    { params }
  );
}*/


}