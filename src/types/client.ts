
export interface Client {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  cep: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface ClientFormData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  endereco: string;
  telefone: string;
  email: string;
  cep: string;
  observacoes: string;
}
