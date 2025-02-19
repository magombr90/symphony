import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, SystemUser, TicketHistory } from "@/types/ticket";
import { startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";

export function useTickets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateRange>();
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: tickets, refetch } = useQuery({
    queryKey: ["tickets", searchTerm, statusFilter, dateFilter],
    queryFn: async () => {
      let query = supabase
        .from("tickets")
        .select(`
          *,
          client:clients(id, razao_social),
          assigned_user:system_users!tickets_assigned_to_fkey(id, name)
        `);

      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        const { data: clientsData } = await supabase
          .from("clients")
          .select("id")
          .ilike("razao_social", searchPattern);

        const { data: usersData } = await supabase
          .from("system_users")
          .select("id")
          .ilike("name", searchPattern);

        const clientIds = clientsData?.map(c => c.id) || [];
        const userIds = usersData?.map(u => u.id) || [];

        query = query.or(`
          codigo.ilike.${searchPattern},
          client_id.in.(${clientIds.join(',')}),
          assigned_to.in.(${userIds.join(',')})
        `);
      }

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      if (dateFilter?.from) {
        query = query.gte("created_at", startOfDay(dateFilter.from).toISOString());
        
        if (dateFilter.to) {
          query = query.lte("created_at", endOfDay(dateFilter.to).toISOString());
        }
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data as Ticket[];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: systemUsers } = useQuery({
    queryKey: ["system-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_users")
        .select("*")
        .eq("active", true);
      if (error) throw error;
      return data as SystemUser[];
    },
  });

  const { data: ticketHistory } = useQuery({
    queryKey: ["ticket-history", selectedTicketDetails?.id],
    enabled: !!selectedTicketDetails?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_history")
        .select(`
          *,
          created_by_user:system_users!ticket_history_created_by_fkey(name)
        `)
        .eq("ticket_id", selectedTicketDetails?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TicketHistory[];
    },
  });

  const handleFaturarTicket = async (ticketId: string) => {
    const { error } = await supabase
      .from("tickets")
      .update({
        faturado: true,
        status: "FATURADO",
      })
      .eq("id", ticketId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao faturar ticket",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Ticket faturado com sucesso!",
    });
    refetch();
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    if (newStatus === "CANCELADO" || newStatus === "CONCLUIDO") {
      setEditingTicket({
        ...(tickets?.find((t) => t.id === ticketId) as Ticket),
        status: newStatus,
      });
      setShowReasonDialog(true);
      return;
    }

    await updateTicketStatus(ticketId, newStatus);
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string, reasonText?: string) => {
    try {
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (updateError) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar status",
          description: updateError.message,
        });
        return;
      }

      if (reasonText) {
        const historyData = {
          ticket_id: ticketId,
          status: newStatus,
          reason: reasonText,
          created_by: systemUsers?.[0]?.id,
        };

        const { error: historyError } = await supabase
          .from("ticket_history")
          .insert([historyData]);

        if (historyError) {
          toast({
            variant: "destructive",
            title: "Erro ao registrar histórico",
            description: historyError.message,
          });
          return;
        }
      }

      toast({
        title: "Status atualizado com sucesso!",
      });

      setShowReasonDialog(false);
      setReason("");
      setEditingTicket(null);
      refetch();
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar ticket",
        description: "Ocorreu um erro ao atualizar o ticket. Tente novamente.",
      });
    }
  };

  const handleAssignTicket = async (ticketId: string, newUserId: string) => {
    const ticket = tickets?.find((t) => t.id === ticketId);
    if (!ticket) return;

    try {
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ assigned_to: newUserId })
        .eq("id", ticketId);

      if (updateError) throw updateError;

      const historyData = {
        ticket_id: ticketId,
        action_type: 'USER_ASSIGNMENT',
        previous_assigned_to: ticket.assigned_to,
        new_assigned_to: newUserId,
        created_by: systemUsers?.[0]?.id,
        status: ticket.status
      };

      const { error: historyError } = await supabase
        .from("ticket_history")
        .insert([historyData]);

      if (historyError) throw historyError;

      toast({
        title: "Ticket reatribuído com sucesso!",
      });

      setShowAssignDialog(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      console.error("Erro ao reatribuir ticket:", error);
      toast({
        variant: "destructive",
        title: "Erro ao reatribuir ticket",
        description: "Ocorreu um erro ao reatribuir o ticket. Tente novamente.",
      });
    }
  };

  return {
    tickets,
    clients,
    systemUsers,
    ticketHistory,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    selectedTicketDetails,
    setSelectedTicketDetails,
    editingTicket,
    showReasonDialog,
    setShowReasonDialog,
    reason,
    setReason,
    showAssignDialog,
    setShowAssignDialog,
    selectedUser,
    setSelectedUser,
    handleStatusChange,
    handleAssignTicket,
    updateTicketStatus,
    refetch,
  };
}
