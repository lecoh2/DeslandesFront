import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ConsultarSetoresResponse } from "../models/setores/consultar-setores-response";
import { ConsultarNiveisResponse } from "../models/nivel/consultar-niveis-response";


@Injectable({
  providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class NivelService {
  //atributos
  private url = environment.apiDeslandes;
  private http = inject(HttpClient);

  //métodos para cadastrar reclamacao

 buscarPorNomeNivel(nome: string): Observable<ConsultarNiveisResponse[]> {
    return this.http.get<ConsultarNiveisResponse[]>
      (`${this.url}/api/v1/nivel/consultar-nivel-por-nome/${encodeURIComponent(nome)}`);
  }
     ConsultarNivel(): Observable<ConsultarNiveisResponse[]> {
    return this.http.get<ConsultarNiveisResponse[]>
      (`${this.url}/api/nivel/consultar-nivel`);
  }
     removerUsuarioNivel(idUsuario: string, idNivel: string): Observable<any> {
        return this.http.delete(`${this.url}/api/nivel/remover-grupo-nivel/${idUsuario}/${idNivel}`);
    }

    adicionarUsuarioNivel(idUsuario: string, idNivel: string): Observable<any> {
        return this.http.post(
            `${this.url}/api/nivel/adicionar-grupo-nivel/${idUsuario}/${idNivel}`,
            null // sem corpo pois só usa params na URL
        );
    }
}