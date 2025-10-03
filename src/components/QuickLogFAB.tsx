import { useState } from "react";
import { Plus, Utensils, Droplet, Trash2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuickLogActions } from "@/hooks/useQuickLogActions";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface QuickLogFABProps {
  onQuickLog: (action: { type: string; tag: string; defaultValues?: Record<string, any> }) => void;
}

const iconMap: { [key: string]: any } = {
  utensils: Utensils,
  droplet: Droplet,
  trash2: Trash2,
  sparkles: Sparkles,
  toilet: Trash2,
};

const QuickLogFAB = ({ onQuickLog }: QuickLogFABProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const { enabledActions, isLoading } = useQuickLogActions();

  if (!user) return null;

  const handleQuickLog = (logType: string, tag: string, defaultValues?: Record<string, any>) => {
    onQuickLog({ type: logType, tag, defaultValues });
    setIsOpen(false);
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
                    onClick={() => handleQuickLog(action.log_type, action.name.toLowerCase(), action.default_values)}
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