import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";

import { CadastrarProcessoRequest } from "../models/processo/cadastrar-processo-request";
import { CadastrarProcessoResponse } from "../models/processo/cadastar-processo-response";
import { Observable } from "rxjs";
import { ApiResponse } from "../models/respostas/api-response";
import { ProcessoAutoComplete } from "../models/processo/processo-auto-complete";
import { CadastrarTarefaRequest } from "../models/tarefa/cadastrar-tarefa.resquest";
import { ListaTarefasResponse } from "../models/tarefa/lista-tarefas-response";
import { CadastrarTareResponse } from "../models/tarefa/cadastrar-tarefa-response";
import { ObterTarefaResponse } from "../models/tarefa/obter-tarefa-response";


@Injectable({
  providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class TarefaService {
  //atributos
  private url = environment.apiDeslandes;
  private http = inject(HttpClient);

  cadastrarTarefa(request: CadastrarTarefaRequest): Observable<ApiResponse<CadastrarTareResponse>> {
    const token = localStorage.getItem('token');

    return this.http.post<ApiResponse<CadastrarTareResponse>>(
      `${this.url}/api/v1/tarefa/cadastrar-tarefa`,
      request,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {}
      }
    );
  }
  consultarListaTarefaAutoComplete(termo?: string) {
    const params: any = {};

    if (termo) {
      params.termo = termo;
    }

    return this.http.get<ListaTarefasResponse[]>(
      `${this.url}/api/v1/tarefa/consultar-lista-tarefa-autocomplete`,
      { params }
    );
  }
ObterTarefaPorId(id: string): Observable<ObterTarefaResponse> {
  return this.http.get<ObterTarefaResponse>(
    `${this.url}/api/v1/tarefa/obter-tarefa-por-id/${id}`

    
  );
}
editarTarefa(id: string, request: any): Observable<any> {
  const token = localStorage.getItem('token');

  return this.http.put<any>(
    `${this.url}/api/v1/tarefa/atualizar-tarefa/${id}`,
    request,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}
    }
  );
}

}