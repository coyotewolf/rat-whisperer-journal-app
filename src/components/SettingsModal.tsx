
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Globe, Type, Palette, LogIn, LogOut, ListChecks, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal"; // Import AuthModal
import AccountSettings from "./settings/AccountSettings"; // Import AccountSettings
import LanguageSettings from "./settings/LanguageSettings";
import FontSettings from "./settings/FontSettings";
import ThemeSettings from "./settings/ThemeSettings";
import TaskSuggestionSettings from "./settings/TaskSuggestionSettings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSection = 'main' | 'account' | 'language' | 'fonts' | 'themes' | 'taskSuggestions';

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { t } = useTranslation();
  const [currentSection, setCurrentSection] = useState<SettingsSection>('main');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // State for AuthModal
  const { user, signOut } = useAuth();

  // Reset to main section when modal opens (not when it closes)
  useEffect(() => {
    if (isOpen) {
      setCurrentSection('main');
    }
  }, [isOpen]);

  const handleClose = () => {
    // Don't reset state here - let it reset when modal reopens
    onClose();
  };

  const handleBackToMain = () => {
    setCurrentSection('main');
  };

  const settingsSections = [
    {
      id: 'language' as const,
      icon: Globe,
      title: t("Language"),
      description: t("Change app language"),
      color: "bg-green-100 text-green-700"
    },
    {
      id: 'fonts' as const,
      icon: Type,
      title: t("Font Settings"),
      description: t("Adjust font size and style"),
      color: "bg-purple-100 text-purple-700"
    },
    {
      id: 'themes' as const,
      icon: Palette,
      title: t("Themes"),
      description: t("Customize app appearance"),
      color: "bg-pink-100 text-pink-700"
    },
    {
      id: 'taskSuggestions' as const,
      icon: ListChecks,
      title: t("Task Suggestions"),
      description: t("Manage quick task suggestions"),
      color: "bg-orange-100 text-orange-700"
    }
  ];

  const renderContent = () => {
    switch (currentSection) {
      case 'language':
        return <LanguageSettings onBack={handleBackToMain} />;
      case 'fonts':
        return <FontSettings onBack={handleBackToMain} />;
      case 'themes':
        return <ThemeSettings onBack={handleBackToMain} />;
      case 'taskSuggestions':
        return <TaskSuggestionSettings onBack={handleBackToMain} />;
      case 'account':
        return <AccountSettings onBack={handleBackToMain} />;
      default:
        return (
          <div className="grid grid-cols-1 gap-3 mt-4">
            {/* Account Card */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setCurrentSection('account')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`inline-flex p-2 rounded-lg bg-blue-100 text-blue-700`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{t("Account")}</p>
                    <p className="text-xs text-gray-600">{t("Manage your account settings")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Settings Sections */}
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentSection(section.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex p-2 rounded-lg ${section.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{section.title}</p>
                        <p className="text-xs text-gray-600">{section.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className={`flex-1 ${currentSection === 'main' ? 'text-center' : 'text-left'}`}>
                {currentSection === 'main' ? t('Settings') : settingsSections.find(s => s.id === currentSection)?.title}
              </DialogTitle>
              {currentSection === 'main' && <div className="w-10"></div>} {/* Placeholder for main section */}
            </div>
          </DialogHeader>
          {renderContent()}
          {currentSection === 'main' && (
            <Button variant="ghost" onClick={handleClose} className="mt-4 text-gray-500 hover:text-gray-700">
              {t("Close")}
            </Button>
          )}
        </DialogContent>
      </Dialog>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default SettingsModal;
