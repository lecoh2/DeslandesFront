import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { AutenticarUsuario } from "../../modules/login/components/autenticar-usuario/autenticar-usuario";

import { Observable, throwError } from "rxjs";
import { AutenticarUsuarioRequest } from "../models/usuario/autenticar-usuario.request";
import { AutenticarUsuarioResponse } from "../models/usuario/autenticar-usuario.response";
import { catchError, map } from 'rxjs/operators'; // adicione isso

import { CriarUsuarioRequest } from "../models/usuario/criar-usuario.request";
import { CriarUsuarioResponse } from "../models/usuario/criar-usuario.response";
import { ConsultarUsuarioResponse } from "../models/usuario/consultar-usuarios.response";
import { EditarUsuarioRequest } from "../models/usuario/editar-usuario-request";
import { EditarUsuarioResponse } from "../models/usuario/editar-usuario-response";

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    //atributos
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

    //método para logar

    autenticar(request: AutenticarUsuarioRequest): Observable<AutenticarUsuarioResponse> {
        return this.http
            .post<{ mensagem: String, data: AutenticarUsuarioResponse }>(
                `${this.url}/api/v1/usuarios/autenticar-usuario`, request)
            .pipe(
                map(response => response.data) // pega apenas os dados
            );
    }
    //métodos para cadastrar reclamacao
    cadastrar(request: CriarUsuarioRequest): Observable<CriarUsuarioResponse> {
        return this.http.post<CriarUsuarioResponse>
            (`${this.url}/api/usuario/cadastrar-usuario`, request)
    }
    /*consultarUsuarios(): Observable<ConsultarUsuarioResponse[]> {
        return this.http.get<ConsultarUsuarioResponse[]>
            (`${this.url}/api/usuario/consultar-usuarios`);
    }*/

      consultarUsuariosPaginado(pageNumber: number, pageSize: number, searchTerm?: string) {
  const params: any = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
  if (searchTerm) params.searchTerm = searchTerm;
  return this.http.get<any>(`${this.url}/api/usuario/consultar-usuarios-paginacao`, { params });
}
    consultarUsuarioPorId(id: string): Observable<ConsultarUsuarioResponse[]> {
        return this.http.get<ConsultarUsuarioResponse[]>
            (`${this.url}/api/usuario/consultar-usuarios-por-id/${id}`
            );
    }
    consultarPerfilUsuarioPorId(id: string): Observable<ConsultarUsuarioResponse[]> {
        return this.http.get<ConsultarUsuarioResponse[]>
            (`${this.url}/api/v1/usuarios/consultar-usuarios-por-id-perfil/${id}`
            );
    }


    editarPorId(dto: EditarUsuarioRequest): Observable<EditarUsuarioResponse> {
        return this.http.put<EditarUsuarioResponse>(
            `${this.url}/api/usuario/atualizar-usaurio${dto.idPessoa}`,
            dto
        );
    }

 desbloquearUsuarioPorId(idUsuario: string): Observable<void> {
    return this.http.put<void>(
        `${this.url}/api/usuario/desbloquear-usuario/${idUsuario}`,
        null
    );
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
    /**
       * 🔹 1) Upload do arquivo físico para o servidor
       * Retorna o caminho do arquivo salvo (fileUrl)
       */
    // 1️⃣ Upload do arquivo (retorna fileUrl)
    uploadFoto(formData: FormData) {
        return this.http.post<{ fileUrl: string }>(`${this.url}/api/fotos/upload`, formData);
    }

    cadastrarFoto(idUsuario: string, file: File) {
        const formData = new FormData();
        formData.append('IdUsuario', idUsuario);
        formData.append('Foto', file.name);
        formData.append('file', file);

        return this.http.post(`${this.url}/api/fotos/cadastrar-ou-atualizar`, formData);
    }

   

}

