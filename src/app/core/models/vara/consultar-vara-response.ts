export interface ConsultarVaraResponse {
  id: string;

  nomeVara: string;   // Ex: "2ª Vara Cível"
  numero: number;     // Ex: 2
  tipo: string;       // Ex: "Cível", "Criminal"

  foroId: string;
}