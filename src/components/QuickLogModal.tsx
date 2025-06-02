
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Scale, Thermometer, Pill, Utensils } from "lucide-react";
import LogEntryModal from "@/components/LogEntryModal";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickLogModal = ({ isOpen, onClose }: QuickLogModalProps) => {
  const [logEntryModalOpen, setLogEntryModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedLogType, setSelectedLogType] = useState("");
  const { user } = useAuth();

  const logTypes = [
    { type: "behavior", label: "Behavior", icon: Activity, color: "from-blue-500 to-cyan-500" },
    { type: "health", label: "Health Check", icon: Heart, color: "from-red-500 to-pink-500" },
    { type: "weight", label: "Weight", icon: Scale, color: "from-green-500 to-emerald-500" },
    { type: "environment", label: "Environment", icon: Thermometer, color: "from-orange-500 to-amber-500" },
    { type: "medication", label: "Medication", icon: Pill, color: "from-purple-500 to-violet-500" },
    { type: "feeding", label: "Feeding", icon: Utensils, color: "from-yellow-500 to-orange-500" },
  ];

  const handleLogTypeClick = (logType: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedLogType(logType);
    setLogEntryModalOpen(true);
  };

  const handleLogAdded = () => {
    // Optionally refresh data or show success message
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-white">Quick Log Entry</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            {logTypes.map((logType) => {
              const Icon = logType.icon;
              return (
                <Button
                  key={logType.type}
                  onClick={() => handleLogTypeClick(logType.type)}
                  className={`h-20 bg-gradient-to-r ${logType.color} hover:scale-105 transition-all duration-200 shadow-lg`}
                >
                  <div className="text-center">
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">{logType.label}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <LogEntryModal
        isOpen={logEntryModalOpen}
        onClose={() => setLogEntryModalOpen(false)}
        logType={selectedLogType}
        onLogAdded={handleLogAdded}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};

export default QuickLogModal;
