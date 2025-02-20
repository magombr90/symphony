
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
});

interface TicketPDFProps {
  ticket: Ticket;
}

export function TicketPDF({ ticket }: TicketPDFProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Formulário de Atendimento - Nº {ticket.codigo}</Text>
        </View>

        <View style={styles.clientInfo}>
          <Text style={styles.sectionTitle}>Dados do Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Razão Social:</Text>
            <Text style={styles.value}>{ticket.client.razao_social}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Atendimento</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{ticket.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data Agendada:</Text>
            <Text style={styles.value}>{formatDate(ticket.scheduled_for)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Responsável:</Text>
            <Text style={styles.value}>{ticket.assigned_user?.name || "Não atribuído"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Descrição:</Text>
            <Text style={styles.value}>{ticket.description}</Text>
          </View>
        </View>

        {ticket.equipamentos && ticket.equipamentos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipamentos Retirados</Text>
            {ticket.equipamentos.map((equip, index) => (
              <View key={index} style={styles.equipment}>
                <View style={styles.row}>
                  <Text style={styles.label}>Código:</Text>
                  <Text style={styles.value}>{equip.codigo}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Equipamento:</Text>
                  <Text style={styles.value}>{equip.equipamento}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Nº Série:</Text>
                  <Text style={styles.value}>{equip.numero_serie || "-"}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Condição:</Text>
                  <Text style={styles.value}>{equip.condicao}</Text>
                </View>
                {equip.observacoes && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Observações:</Text>
                    <Text style={styles.value}>{equip.observacoes}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
