
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { Ticket } from "@/types/ticket";

// Registrar fonte para caracteres especiais
Font.register({
  family: "Open Sans",
  src: "https://fonts.gstatic.com/s/opensans/v28/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVQUwaEQbjB_mQ.woff"
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Open Sans",
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: 'center',
  },
  clientInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    backgroundColor: '#e5e5e5',
    padding: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "30%",
    fontSize: 12,
    fontWeight: "bold",
  },
  value: {
    width: "70%",
    fontSize: 12,
  },
  equipment: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderBottom: 1,
    borderColor: '#e0e0e0',
  },
  historyItem: {
    marginTop: 8,
    padding: 8,
    borderBottom: 1,
    borderColor: '#e0e0e0',
  },
  historyDate: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  historyText: {
    fontSize: 11,
  },
  historyReason: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 3,
    color: '#444444',
  },
});

interface TicketPDFProps {
  ticket: Ticket;
  history?: any[];
}

export function TicketPDF({ ticket, history = [] }: TicketPDFProps) {
  const formatDate = (date: string) => {
    if (!date) return "-";
    const formattedDate = new Date(date).toLocaleDateString('pt-BR');
    return formattedDate;
  };

  const formatDateTime = (date: string) => {
    if (!date) return "-";
    const formattedDate = new Date(date).toLocaleDateString('pt-BR');
    const formattedTime = new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate} ${formattedTime}`;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      "PENDENTE": "Pendente",
      "EM_ANDAMENTO": "Em Andamento",
      "CONCLUIDO": "Concluído",
      "CANCELADO": "Cancelado",
      "FATURADO": "Faturado",
      "RETIRADO": "Retirado",
      "ENTREGUE": "Entregue",
    };
    return statusMap[status] || status;
  };

  const getHistoryText = (item: any) => {
    if (item.action_type === 'USER_ASSIGNMENT') {
      const previousUser = item.previous_assigned_to_user?.name || "Nenhum usuário";
      const newUser = item.new_assigned_to_user?.name || "Nenhum usuário";
      return `Ticket reatribuído de ${previousUser} para ${newUser}`;
    } else if (item.action_type === 'EQUIPMENT_STATUS') {
      return `Equipamento ${item.equipment_codigo} marcado como ${getStatusLabel(item.equipment_status)}`;
    } else {
      return `Status alterado para ${getStatusLabel(item.status)}`;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Ordem de Serviço - {ticket.codigo}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{getStatusLabel(ticket.status)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de Abertura:</Text>
            <Text style={styles.value}>{formatDate(ticket.created_at)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Agendado para:</Text>
            <Text style={styles.value}>{formatDate(ticket.scheduled_for)}</Text>
          </View>
        </View>

        