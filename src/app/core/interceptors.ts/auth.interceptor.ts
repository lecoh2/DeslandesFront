import { HttpInterceptor, HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";
import { inject } from "@angular/core";
import { AuthHelper } from "../helpers/auth.helper";

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    //verificar se a requisição é para o endpoint da api
    if (req.url.includes(environment.apiDeslandes)) {
        //Injeçao de dependecia
        const authHelper = inject(AuthHelper);
        //captura o token do usuario na sessão
        const token = authHelper.get()?.accessToken;
        //modificar a requisi~çao para incluor o envio do token
        const cloneRequest = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloneRequest);

    }
    return next(req);
}