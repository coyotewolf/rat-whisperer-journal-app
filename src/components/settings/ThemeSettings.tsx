
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Palette, Check, Sun, Moon, Smartphone } from "lucide-react";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useToast } from "@/hooks/use-toast";

interface ThemeSettingsProps {
  onBack: () => void;
}

const ThemeSettings = ({ onBack }: ThemeSettingsProps) => {
  const { settings, updateSetting } = useAppSettings();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const themes = [
    {
      id: "light",
      name: "Light",
      icon: Sun,
      description: "Clean and bright interface",
      preview: "bg-white border-gray-200",
      colors: ["bg-orange-500", "bg-blue-500", "bg-green-500"]
    },
    {
      id: "dark",
      name: "Dark",
      icon: Moon,
      description: "Easy on the eyes",
      preview: "bg-gray-900 border-gray-700",
      colors: ["bg-orange-400", "bg-blue-400", "bg-green-400"]
    },
    {
      id: "sakura",
      name: "Sakura Pink",
      icon: Palette,
      description: "Soft and cute pink theme",
      preview: "bg-pink-50 border-pink-200",
      colors: ["bg-pink-500", "bg-rose-500", "bg-purple-500"]
    },
    {
      id: "system",
      name: "System",
      icon: Smartphone,
      description: "Follow device settings",
      preview: "bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300",
      colors: ["bg-gray-500", "bg-gray-600", "bg-gray-700"]
    }
  ];

  const saveTheme = async (themeId: string) => {
    setLoading(true);
    try {
      updateSetting('theme', themeId);
      toast({
        title: "Success",
        description: "Theme setting saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theme setting",
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
            <Palette className="h-5 w-5" />
            Theme Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            return (
              <div
                key={theme.id}
                onClick={() => saveTheme(theme.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                  settings.theme === theme.id
                    ? "border-orange-300 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme.preview}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{theme.name}</div>
                      <div className="text-sm text-gray-600">{theme.description}</div>
                    </div>
                  </div>
                  {settings.theme === theme.id && (
                    <Check className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                
                {/* Theme preview */}
                <div className={`h-16 rounded-md ${theme.preview} p-3 flex items-center justify-between`}>
                  <div className="flex gap-2">
                    {theme.colors.map((color, index) => (
                      <div key={index} className={`w-4 h-4 rounded-full ${color}`}></div>
                    ))}
                  </div>
                  <div className="text-xs opacity-70">Preview</div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeSettings;
