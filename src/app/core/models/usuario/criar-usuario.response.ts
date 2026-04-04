export interface CriarUsuarioResponse {
    mensagem: string;
    dados: {
        login?: string;
        senha?: string;
    }
}