import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";

import { CadastrarProcessoRequest } from "../models/processo/cadastrar-processo-request";
import { CadastrarProcessoResponse } from "../models/processo/cadastar-processo-response";
import { Observable } from "rxjs";
import { ApiResponse } from "../models/respostas/api-response";
import { ProcessoAutoComplete } from "../models/processo/processo-auto-complete";
import { ObterProcessoResponse } from "../models/processo/obter-processo-response";


@Injectable({
  providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class ProcessoService {
  //atributos
  private url = environment.apiDeslandes;
  private http = inject(HttpClient);

  cadastrarProcesso(request: CadastrarProcessoRequest): Observable<ApiResponse<CadastrarProcessoResponse>> {
    const token = localStorage.getItem('token');

    return this.http.post<ApiResponse<CadastrarProcessoResponse>>(
      `${this.url}/api/v1/processo/cadastrar-processo`,
      request,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {}
      }
    );
  }
  consultarProcessoAutoComplete(termo?: string, limite: number = 50) {
    const params: any = { limite: limite.toString() };

    if (termo) {
      params.termo = termo;
    }

    return this.http.get<ProcessoAutoComplete[]>(
      `${this.url}/api/v1/processo/consultar-processo-autocomplete`,
      { params }
    );
  }
  consultarProcessoPaginado(pageNumber: number, pageSize: number, searchTerm?: string) {
    const params: any = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
    if (searchTerm) params.searchTerm = searchTerm;
    return this.http.get<any>(`${this.url}/api/v1/processo/consultar-processo-paginacao`, { params });
  }
editarProcesso(id: string, request: any): Observable<any> {
  const token = localStorage.getItem('token');

  return this.http.put<any>(
    `${this.url}/api/v1/processo/atualizar-processo/${id}`,
    request,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}
    }
  );
}
ObterProcessoPorId(id: string): Observable<ObterProcessoResponse> {
  return this.http.get<ObterProcessoResponse>(
    `${this.url}/api/v1/processo/obter-processo-por-id/${id}`

    
  );
}
}
