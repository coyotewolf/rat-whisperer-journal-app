import { useState } from "react";
import { Plus, Utensils, Droplet, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface QuickLogFABProps {
  onQuickLog: (type: string, tag: string) => void;
}

const QuickLogFAB = ({ onQuickLog }: QuickLogFABProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const quickActions = [
    { icon: Utensils, label: t("Feed"), tag: "feeding", color: "bg-green-500 hover:bg-green-600" },
    { icon: Droplet, label: t("Water"), tag: "water change", color: "bg-blue-500 hover:bg-blue-600" },
    { icon: Trash2, label: t("Clean"), tag: "cage clean", color: "bg-orange-500 hover:bg-orange-600" },
  ];

  const handleQuickLog = (tag: string) => {
    onQuickLog("behavior", tag);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-3 mb-3"
          >
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.tag}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    onClick={() => handleQuickLog(action.tag)}
                    className={`${action.color} text-white shadow-lg rounded-full h-12 px-4 flex items-center gap-2`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{action.label}</span>
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
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-primary hover:bg-primary/90"
        } text-white shadow-lg rounded-full h-14 w-14 p-0 transition-all duration-200`}
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