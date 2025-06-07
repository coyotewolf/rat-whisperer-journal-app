import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Scale, Thermometer, Pill, Utensils, ArrowLeft } from "lucide-react";
import LogEntryModal from "@/components/LogEntryModal";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogCreated?: (newLog: any) => void;
}

const QuickLogModal = ({ isOpen, onClose, onLogCreated }: QuickLogModalProps) => {
  const [logEntryModalOpen, setLogEntryModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedLogType, setSelectedLogType] = useState("");
  const [isQuickLogVisible, setIsQuickLogVisible] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const logTypes = [
    { type: "behavior", label: t("Behavior"), icon: Activity, color: "from-blue-500 to-cyan-500" },
    { type: "health", label: t("Health Check"), icon: Heart, color: "from-red-500 to-pink-500" },
    { type: "weight", label: t("Weight"), icon: Scale, color: "from-green-500 to-emerald-500" },
    { type: "environment", label: t("Environment"), icon: Thermometer, color: "from-orange-500 to-amber-500" },
    { type: "medication", label: t("Medication"), icon: Pill, color: "from-purple-500 to-violet-500" },
    { type: "feeding", label: t("Feeding"), icon: Utensils, color: "from-yellow-500 to-orange-500" },
  ];

  const handleLogTypeClick = (logType: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedLogType(logType);
    setLogEntryModalOpen(true);
    setIsQuickLogVisible(false); // Hide QuickLogModal content
  };

  // Called when LogEntryModal's overlay/Esc is triggered, or after successful log addition
  const handleLogEntryOverlayOrSubmitClose = () => {
    setLogEntryModalOpen(false); // Close child modal state
    setIsQuickLogVisible(true);  // Ensure parent content is ready for next time
    onClose();                   // Close parent modal (QuickLogModal's main onClose prop)
    navigate("/");               // Navigate home
  };

  // Called when LogEntryModal's internal back button is clicked
  const handleLogEntryBackNavigation = () => {
    setLogEntryModalOpen(false);
    setIsQuickLogVisible(true); // Show QuickLogModal content again
  };

  // This is for QuickLogModal's own Dialog (wrapper)
  const handleQuickLogDialogClose = (open: boolean) => {
    if (!open) {
      // If QuickLogModal's overlay is clicked or Esc is pressed
      if (logEntryModalOpen) {
        // If child (LogEntryModal) was open, close everything and navigate
        handleLogEntryOverlayOrSubmitClose();
      } else {
        // Only QuickLogModal was open and is now closing.
        onClose(); // Call the original onClose from QuickLogModal's parent component
      }
    }
  };

  useEffect(() => {
    // When QuickLogModal is told to close (e.g., its `isOpen` prop becomes false),
    // ensure child modal is also closed and visibility is reset.
    if (!isOpen) {
      setLogEntryModalOpen(false);
      setIsQuickLogVisible(true);
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleQuickLogDialogClose}>
        {isOpen && isQuickLogVisible && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose} // This closes QuickLogModal directly if its own back button is clicked
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <DialogTitle className="flex-1 text-center text-foreground">{t("Quick Log Entry")}</DialogTitle>
              <div className="w-10"></div> {/* Placeholder to balance the back button */}
            </div>
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
          )}
      </Dialog>

      <LogEntryModal
        isOpen={logEntryModalOpen}
        onClose={handleLogEntryOverlayOrSubmitClose} // For overlay/Esc/submit on LogEntryModal
        onBack={handleLogEntryBackNavigation}       // For internal back button on LogEntryModal
        logType={selectedLogType}
        onLogAdded={onLogCreated}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};

export default QuickLogModal;
