
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Globe, Type, Palette, LogIn, LogOut, ListChecks, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal"; // Import AuthModal
import LanguageSettings from "./settings/LanguageSettings";
import FontSettings from "./settings/FontSettings";
import ThemeSettings from "./settings/ThemeSettings";
import TaskSuggestionSettings from "./settings/TaskSuggestionSettings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsSection = 'main' | 'language' | 'fonts' | 'themes' | 'taskSuggestions';

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [currentSection, setCurrentSection] = useState<SettingsSection>('main');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // State for AuthModal
  const { user, signOut } = useAuth();

  const settingsSections = [
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
      case 'language':
        return <LanguageSettings onBack={() => setCurrentSection('main')} />;
      case 'fonts':
        return <FontSettings onBack={() => setCurrentSection('main')} />;
      case 'themes':
        return <ThemeSettings onBack={() => setCurrentSection('main')} />;
      case 'taskSuggestions':
        return <TaskSuggestionSettings />;
      default:
        return (
          <div className="grid grid-cols-1 gap-3 mt-4">
            {/* Account/Sign In Card */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => user ? signOut() : setIsAuthModalOpen(true)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`inline-flex p-2 rounded-lg bg-blue-100 text-blue-700`}>
                    {user ? <LogOut className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{user ? "Sign Out" : "Sign In"}</p>
                    <p className="text-xs text-gray-600">{user ? "Sign out of your account" : "Sign in to sync your data"}</p>
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
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              {currentSection !== 'main' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentSection('main')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <DialogTitle className={`flex-1 ${currentSection === 'main' ? 'text-center' : 'text-left'}`}>
                {currentSection === 'main' ? 'Settings' : settingsSections.find(s => s.id === currentSection)?.title}
              </DialogTitle>
              {currentSection === 'main' && <div className="w-10"></div>} {/* Placeholder for main section */}
            </div>
          </DialogHeader>
          {renderContent()}
          {currentSection === 'main' && (
            <Button variant="ghost" onClick={onClose} className="mt-4 text-gray-500 hover:text-gray-700">
              Close
            </Button>
          )}
        </DialogContent>
      </Dialog>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default SettingsModal;
