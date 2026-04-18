import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";

import { CadastrarProcessoRequest } from "../models/processo/cadastrar-processo-request";
import { CadastrarProcessoResponse } from "../models/processo/cadastar-processo-response";
import { Observable } from "rxjs";
import { ApiResponse } from "../models/respostas/api-response";
import { ProcessoAutoComplete } from "../models/processo/processo-auto-complete";
import { CadastrarTarefaRequest } from "../models/tarefa/cadastrar-tarefa.resquest";


@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class TarefaService {
    //atributos
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

  cadastrarTarefa(request: CadastrarTarefaRequest): Observable<ApiResponse<CadastrarProcessoResponse>> {
  const token = localStorage.getItem('token');

  return this.http.post<ApiResponse<CadastrarProcessoResponse>>(
    `${this.url}/api/v1/tarefa/cadastrar-tarefa`,
    request,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}
    }
  );
}
}