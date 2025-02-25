
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
    return