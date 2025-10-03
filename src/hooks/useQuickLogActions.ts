import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuickLogAction {
  id: string;
  user_id: string;
  name: string;
  icon_name: string;
  color: string;
  log_type: string;
  enabled: boolean;
  display_order: number;
  default_values?: Record<string, any>;
}

export const useQuickLogActions = () => {
  const queryClient = useQueryClient();

  // Query for FAB display (only enabled)
  const { data: enabledActions, isLoading: isLoadingEnabled } = useQuery({
    queryKey: ["quick-log-actions", "enabled"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quick_log_actions" as any)
        .select("*")
        .eq("enabled", true)
        .order("display_order");

      if (error) throw error;
      return (data || []) as unknown as QuickLogAction[];
    },
  });

  // Query for settings page (all actions)
  const { data: allActions, isLoading: isLoadingAll } = useQuery({
    queryKey: ["quick-log-actions", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quick_log_actions" as any)
        .select("*")
        .order("display_order");

      if (error) throw error;
      return (data || []) as unknown as QuickLogAction[];
    },
  });

  const invalidateAllQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["quick-log-actions", "enabled"] });
    queryClient.invalidateQueries({ queryKey: ["quick-log-actions", "all"] });
  };

  const updateAction = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<QuickLogAction> }) => {
      const { data, error } = await supabase
        .from("quick_log_actions" as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateAllQueries();
      toast.success("快速操作已更新");
    },
    onError: (error) => {
      console.error("Error updating quick log action:", error);
      toast.error("更新快速操作時發生錯誤");
    },
  });

  const createAction = useMutation({
    mutationFn: async (actionData: Omit<QuickLogAction, "id" | "user_id">) => {
      const { data, error } = await supabase
        .from("quick_log_actions" as any)
        .insert([actionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateAllQueries();
      toast.success("快速操作已新增");
    },
    onError: (error) => {
      console.error("Error creating quick log action:", error);
      toast.error("新增快速操作時發生錯誤");
    },
  });

  const deleteAction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quick_log_actions" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAllQueries();
      toast.success("快速操作已刪除");
    },
    onError: (error) => {
      console.error("Error deleting quick log action:", error);
      toast.error("刪除快速操作時發生錯誤");
    },
  });

  return {
    enabledActions,
    allActions,
    isLoading: isLoadingEnabled || isLoadingAll,
    updateAction: updateAction.mutate,
    createAction: createAction.mutate,
    deleteAction: deleteAction.mutate,
  };
};
