
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Globe, Check } from "lucide-react";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useToast } from "@/hooks/use-toast";

interface LanguageSettingsProps {
  onBack: () => void;
}

const LanguageSettings = ({ onBack }: LanguageSettingsProps) => {
  const { settings, updateSetting } = useAppSettings();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "pt", name: "Português", flag: "🇧🇷" },
  ];

  const saveLanguage = async (languageCode: string) => {
    setLoading(true);
    try {
      updateSetting('language', languageCode);
      toast({
        title: "Success",
        description: "Language setting saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save language setting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-4 p-0 h-auto">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Settings
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {languages.map((language) => (
            <div
              key={language.code}
              onClick={() => saveLanguage(language.code)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                settings.language === language.code
                  ? "bg-orange-100 border-2 border-orange-300"
                  : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </div>
              {settings.language === language.code && (
                <Check className="h-5 w-5 text-orange-600" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSettings;
