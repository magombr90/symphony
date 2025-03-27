
export type SystemUser = {
  id: string;
  name: string;
  active: boolean;
  role: string;
  email: string;
};

export type Ticket = {
  id: string;
  codigo: string;
  status: string;
  description: string;
  client_id: string;
  scheduled_for: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  client: {
    razao_social: string;
  };
  assigned_to: string | null;
  assigned_user?: {
    name: string | null;
  } | null;
  faturado: boolean;
  faturado_at: string | null;
  equipamentos?: Array<{
    id?: string;
    codigo: string;
    equipamento: string;
    numero_serie: string | null;
    condicao: string;
    observacoes: string | null;
    status?: "RETIRADO" | "ENTREGUE";
    entregue_at?: string | null;
  }>;
};

export type TicketHistory = {
  id: string;
  ticket_id: string;
  status: string;
  reason: string | null;
  created_at: string;
  created_by: string;
  created_by_user: {
    name: string;
  };
  action_type: "STATUS_CHANGE" | "USER_ASSIGNMENT" | "EQUIPMENT_STATUS" | "PROGRESS_NOTE";
  previous_assigned_to: string | null;
  new_assigned_to: string | null;
  previous_assigned_to_user?: {
    name: string;
  } | null;
  new_assigned_to_user?: {
    name: string;
  } | null;
  equipment_id?: string;
  equipment_codigo?: string;
  equipment_status?: "RETIRADO" | "ENTREGUE";
};

export type Client = {
  id: string;
  razao_social: string;
  cnpj: string;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cep: string | null;
  observacoes: string | null;
};
