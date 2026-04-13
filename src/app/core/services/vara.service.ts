import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { ConsultarSexoResponse } from "../models/sexo/consutar-sexo-response";
import { Observable } from "rxjs";
import { ConsultarVaraResponse } from "../models/vara/consultar-vara-response";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class VaraService {
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

    consultar(): Observable<ConsultarVaraResponse[]> {
        return this.http.get<ConsultarVaraResponse[]>
            (`${this.url}/api/v1/vara/consultar-vara`);
    }
}