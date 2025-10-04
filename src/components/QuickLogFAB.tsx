import { useState } from "react";
import { Plus, Utensils, Droplet, Trash2, Sparkles, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuickLogActions } from "@/hooks/useQuickLogActions";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface QuickLogFABProps {
  onLogAdded?: () => void;
  onOpenSettings?: () => void;
  onOpenQuickLogModal?: (logType: string, defaultValues?: Record<string, any>) => void;
}

const iconMap: { [key: string]: any } = {
  utensils: Utensils,
  droplet: Droplet,
  trash2: Trash2,
  sparkles: Sparkles,
  toilet: Trash2,
};

const QuickLogFAB = ({ onLogAdded, onOpenSettings, onOpenQuickLogModal }: QuickLogFABProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const { enabledActions, isLoading } = useQuickLogActions();
  const queryClient = useQueryClient();

  // Fetch active rats
  const { data: rats } = useQuery({
    queryKey: ["rats", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("rats")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (!user) return null;

  const handleQuickLog = async (logType: string, actionName: string, defaultValues?: Record<string, any>) => {
    try {
      if (!rats || rats.length === 0) {
        toast.error(t("Please add at least one rat first"));
        setIsOpen(false);
        return;
      }

      // Check if default values are required but missing
      const needsDefaultValues = (logType === "feeding" || (logType === "environment" && actionName.toLowerCase().includes("water")));
      
      if (needsDefaultValues && (!defaultValues || Object.keys(defaultValues).length === 0 || 
          (logType === "feeding" && (!defaultValues.food || !defaultValues.amount)) ||
          (logType === "environment" && actionName.toLowerCase().includes("water") && !defaultValues.amount))) {
        
        // Show toast with action button
        const actionLabel = logType === "feeding" ? t("Set Feeding Defaults") : t("Set Water Defaults");
        
        toast.error(
          t("Please set default values in Quick Log Actions settings first"),
          {
            action: onOpenSettings ? {
              label: actionLabel,
              onClick: () => {
                setIsOpen(false);
                onOpenSettings();
              }
            } : undefined,
            duration: 5000,
          }
        );
        return;
      }

      // Get all active rat IDs
      const ratIds = rats.map(rat => rat.id);

      // Prepare log entry data
      const logEntry = {
        user_id: user.id,
        type: logType,
        rat_ids: ratIds,
        content: {
          timestamp: new Date().toISOString(),
          ...(defaultValues || {}),
        },
      };

      // Insert log entry
      const { error } = await supabase
        .from("log_entries")
        .insert([logEntry]);

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["log-entries"] });
      queryClient.invalidateQueries({ queryKey: ["health-alerts"] });

      toast.success(t("Log added successfully"));
      setIsOpen(false);
      
      if (onLogAdded) {
        onLogAdded();
      }
    } catch (error) {
      console.error("Error adding quick log:", error);
      toast.error(t("Failed to add log"));
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <AnimatePresence>
        {isOpen && !isLoading && enabledActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-3 mb-3"
          >
            {enabledActions.map((action, index) => {
              const Icon = iconMap[action.icon_name] || Utensils;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    onClick={() => handleQuickLog(action.log_type, action.name, action.default_values)}
                    style={{ backgroundColor: action.color }}
                    className="shadow-lg rounded-full h-12 px-4 flex items-center gap-2 transition-all text-white hover:opacity-90"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{t(action.name)}</span>
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen 
            ? "bg-destructive hover:bg-destructive/90" 
            : "bg-primary hover:bg-primary/90"
        } text-primary-foreground shadow-lg rounded-full h-14 w-14 p-0 transition-all duration-200`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};

export default QuickLogFAB;