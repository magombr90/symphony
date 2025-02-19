
import { supabase } from "@/integrations/supabase/client";

export const ticketService = {
  async updateStatus(ticketId: string, newStatus: string) {
    const { error } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);
    
    if (error) throw error;
  },

  async addHistoryEntry(ticketId: string, status: string, reason: string, createdBy: string) {
    const { error } = await supabase
      .from("ticket_history")
      .insert({
        ticket_id: ticketId,
        status,
        reason,
        created_by: createdBy,
      });
    
    if (error) throw error;
  },

  async faturarTicket(ticketId: string) {
    const { error } = await supabase
      .from("tickets")
      .update({ 
        faturado: true,
        faturado_at: new Date().toISOString()
      })
      .eq("id", ticketId);
    
    if (error) throw error;
  }
};
