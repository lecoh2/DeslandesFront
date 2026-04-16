export interface ProcessoAutoComplete {
  id: string;              // Guid → string (obrigatório)
  pasta?: string | null;   // string? → opcional
  numeroProcesso: string;  // obrigatório
  titulo?: string | null;  // opcional
}