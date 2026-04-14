// pessoa-resumo.model.ts
export interface PessoaResumo {
  id: string;
  nome: string;
  documento: string;
  tipo: 'Fisica' | 'Juridica';
}