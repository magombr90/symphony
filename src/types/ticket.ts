
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
    codigo: string;
    equipamento: string;
    numero_serie: string | null;
    condicao: string;
    observacoes: string | null;
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
  action_type: "STATUS_CHANGE" | "USER_ASSIGNMENT";
  previous_assigned_to: string | null;
  new_assigned_to: string | null;
  previous_assigned_to_user?: {
    name: string;
  } | null;
  new_assigned_to_user?: {
    name: string;
  } | null;
};
