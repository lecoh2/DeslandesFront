import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { ConsultarSexoResponse } from "../models/sexo/consutar-sexo-response";
import { Observable } from "rxjs";
import { ConsultarVaraResponse } from "../models/vara/consultar-vara-response";
import { ConsultarAcaoResponse } from "../models/acao/consultar-acao-response";
import { KanbanColuna } from "../models/kanban/kanban-coluna";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class KanbanService {
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

    consultar(): Observable<KanbanColuna[]> {
        return this.http.get<KanbanColuna[]>
            (`${this.url}/api/v1/kanban/consultar-kanban`);
    }
    obterDetalhes(id: string, tipo: string) {
        return this.http.get<any>(
            `${this.url}/api/v1/atividade/${id}/detalhes/${tipo}`
        );
    }
}