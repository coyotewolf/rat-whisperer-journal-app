import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReminderSetting {
  id: string;
  user_id: string;
  type: string;
  enabled: boolean;
  frequency_days: number;
  priority: string;
  custom_message: string | null;
}

export const useReminderSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["reminder-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminder_settings" as any)
        .select("*")
        .order("type");

      if (error) throw error;
      return (data || []) as unknown as ReminderSetting[];
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ReminderSetting> }) => {
      const { data, error } = await supabase
        .from("reminder_settings" as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminder-settings"] });
      toast.success("提醒設定已更新");
    },
    onError: (error) => {
      console.error("Error updating reminder setting:", error);
      toast.error("更新提醒設定時發生錯誤");
    },
  });

  return {
    settings,
    isLoading,
    updateSetting: updateSetting.mutate,
  };
};
