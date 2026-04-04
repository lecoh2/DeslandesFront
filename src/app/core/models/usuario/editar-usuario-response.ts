export interface EditarUsuarioResponse {
    mensagem: string;
    dados: {
        login?: string;
        senha?: string;
    }
}