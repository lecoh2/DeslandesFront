// comentario.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CriarComentarioRequest } from '../models/comentario/criar-comentario-request';

import { ApiResponse } from '../models/respostas/api-response';
import { CriarComentarioResponse } from '../models/comentario/criar-comentario-response';



@Injectable({
    providedIn: 'root'
})
export class ComentarioService {

    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

  criarComentario(request: CriarComentarioRequest): Observable<ApiResponse<CriarComentarioResponse>> {

  const token = localStorage.getItem('token');

  return this.http.post<ApiResponse<CriarComentarioResponse>>(
    `${this.url}/api/v1/comentarios/cadastar-comentario`,
    request,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}
    }
  );
}
obterComentario(params: any): Observable<CriarComentarioResponse[]> {

  return this.http.get<CriarComentarioResponse[]>(
    `${this.url}/api/v1/comentarios/consultar-comentarios`,
    { params }
  );
}
}
