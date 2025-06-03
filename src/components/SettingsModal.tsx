
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Globe, Type, Palette, LogIn, LogOut, ListChecks } from "lucide-react"; // Added ListChecks
import { useAuth } from "@/hooks/useAuth";
import AccountSettings from "./settings/AccountSettings";
import LanguageSettings from "./settings/LanguageSettings";
import FontSettings from "./settings/FontSettings";
import ThemeSettings from "./settings/ThemeSettings";
import TaskSuggestionSettings from "./settings/TaskSuggestionSettings"; // Import TaskSuggestionSettings

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSection = 'main' | 'account' | 'language' | 'fonts' | 'themes' | 'taskSuggestions';

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [currentSection, setCurrentSection] = useState<SettingsSection>('main');
  const { user } = useAuth();

  const settingsSections = [
    {
      id: 'account' as const,
      icon: user ? LogOut : LogIn,
      title: user ? "Account" : "Sign In",
      description: user ? "Manage your account settings" : "Sign in to sync your data",
      color: "bg-blue-100 text-blue-700"
    },
    {
      id: 'language' as const,
      icon: Globe,
      title: "Language",
      description: "Change app language",
      color: "bg-green-100 text-green-700"
    },
    {
      id: 'fonts' as const,
      icon: Type,
      title: "Font Settings",
      description: "Adjust font size and style",
      color: "bg-purple-100 text-purple-700"
    },
    {
      id: 'themes' as const,
      icon: Palette,
      title: "Themes",
      description: "Customize app appearance",
      color: "bg-pink-100 text-pink-700"
    },
    {
      id: 'taskSuggestions' as const,
      icon: ListChecks,
      title: "Task Suggestions",
      description: "Manage quick task suggestions",
      color: "bg-orange-100 text-orange-700"
    }
  ];

  const renderContent = () => {
    switch (currentSection) {
      case 'account':
        return <AccountSettings onBack={() => setCurrentSection('main')} />;
      case 'language':
        return <LanguageSettings onBack={() => setCurrentSection('main')} />;
      case 'fonts':
        return <FontSettings onBack={() => setCurrentSection('main')} />;
      case 'themes':
        return <ThemeSettings onBack={() => setCurrentSection('main')} />;
      case 'taskSuggestions':
        return <TaskSuggestionSettings />; // No onBack needed if it's self-contained or uses Dialog for sub-actions
      default:
        return (
          <div className="grid grid-cols-1 gap-3 mt-4">
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentSection === 'main' ? 'Settings' : settingsSections.find(s => s.id === currentSection)?.title}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
        {currentSection === 'main' && (
          <Button variant="outline" onClick={onClose} className="mt-4">
            Close
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
