
-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabelas
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    cep VARCHAR(8),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE,
    status VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    client_id UUID REFERENCES clients(id),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    faturado BOOLEAN DEFAULT FALSE,
    faturado_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS equipamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE,
    equipamento VARCHAR(255) NOT NULL,
    numero_serie VARCHAR(255),
    condicao VARCHAR(50) NOT NULL,
    observacoes TEXT,
    client_id UUID REFERENCES clients(id),
    ticket_id UUID REFERENCES tickets(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id),
    status VARCHAR(50),
    reason TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    action_type VARCHAR(50) NOT NULL,
    previous_assigned_to UUID,
    new_assigned_to UUID
);

-- Função para gerar código do ticket
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TRIGGER AS $$
DECLARE
    year TEXT;
    sequence_number INT;
    new_code TEXT;
BEGIN
    year := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    WITH sequence_numbers AS (
        SELECT COUNT(*) + 1 as next_number
        FROM tickets
        WHERE codigo LIKE year || '-%'
    )
    SELECT next_number INTO sequence_number FROM sequence_numbers;
    
    new_code := year || '-' || LPAD(sequence_number::TEXT, 4, '0');
    NEW.codigo := new_code;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar código do equipamento
CREATE OR REPLACE FUNCTION generate_equipment_code()
RETURNS TRIGGER AS $$
DECLARE
    year TEXT;
    sequence_number INT;
    new_code TEXT;
BEGIN
    year := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    WITH sequence_numbers AS (
        SELECT COUNT(*) + 1 as next_number
        FROM equipamentos
        WHERE codigo LIKE 'EQ-' || year || '-%'
    )
    SELECT next_number INTO sequence_number FROM sequence_numbers;
    
    new_code := 'EQ-' || year || '-' || LPAD(sequence_number::TEXT, 4, '0');
    NEW.codigo := new_code;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER set_ticket_code
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION generate_ticket_code();

CREATE TRIGGER set_equipment_code
    BEFORE INSERT ON equipamentos
    FOR EACH ROW
    EXECUTE FUNCTION generate_equipment_code();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipamentos_updated_at
    BEFORE UPDATE ON equipamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
