import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ConsultarSetoresResponse } from "../models/setores/consultar-setores-response";

@Injectable({
  providedIn: 'root'
})
export class SetorService {
  private http = inject(HttpClient);
  private url = environment.apiDeslandes;

  buscarPorNomeSetor(nome: string): Observable<ConsultarSetoresResponse[]> {
    return this.http.get<ConsultarSetoresResponse[]>(
      `${this.url}/api/v1/setor/consultar-setores-por-nome/${encodeURIComponent(nome)}`
    );
  }

  consultarSetores(): Observable<ConsultarSetoresResponse[]> {
    return this.http.get<ConsultarSetoresResponse[]>(
      `${this.url}/api/setores/consultar-setores`
    );
  }

removerUsuarioSetor(idUsuario: string, idSetor: string): Observable<{ mensagem: string }> {
  return this.http.delete<{ mensagem: string }>(
    `${this.url}/api/setores/remover-grupo-setor/${idUsuario}/${idSetor}`
  );
}

adicionarUsuarioSetor(idUsuario: string, idSetor: string): Observable<{ mensagem: string }> {
  return this.http.post<{ mensagem: string }>(
    `${this.url}/api/setores/adicionar-grupo-setor/${idUsuario}/${idSetor}`,
    null
  );
}

}
