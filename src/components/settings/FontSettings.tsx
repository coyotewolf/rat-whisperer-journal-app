
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Type, Minus, Plus } from "lucide-react";

interface FontSettingsProps {
  onBack: () => void;
}

const FontSettings = ({ onBack }: FontSettingsProps) => {
  const [fontSize, setFontSize] = useState(16);
  const [selectedFont, setSelectedFont] = useState("system");

  const fontOptions = [
    { id: "system", name: "System Default", preview: "The quick brown fox jumps over the lazy dog" },
    { id: "inter", name: "Inter", preview: "The quick brown fox jumps over the lazy dog" },
    { id: "roboto", name: "Roboto", preview: "The quick brown fox jumps over the lazy dog" },
    { id: "opensans", name: "Open Sans", preview: "The quick brown fox jumps over the lazy dog" },
    { id: "lato", name: "Lato", preview: "The quick brown fox jumps over the lazy dog" },
    { id: "montserrat", name: "Montserrat", preview: "The quick brown fox jumps over the lazy dog" },
  ];

  const adjustFontSize = (delta: number) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + delta)));
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-4 p-0 h-auto">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Settings
      </Button>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Font Size
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustFontSize(-1)}
              disabled={fontSize <= 12}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 text-center">
              <div className="text-lg font-medium">{fontSize}px</div>
              <div 
                className="text-gray-600 mt-2"
                style={{ fontSize: `${fontSize}px` }}
              >
                Sample text preview
              </div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustFontSize(1)}
              disabled={fontSize >= 24}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Font Family */}
      <Card>
        <CardHeader>
          <CardTitle>Font Family</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {fontOptions.map((font) => (
            <div
              key={font.id}
              onClick={() => setSelectedFont(font.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                selectedFont === font.id
                  ? "bg-orange-100 border-orange-300"
                  : "bg-gray-50 hover:bg-gray-100 border-transparent"
              }`}
            >
              <div className="font-medium mb-1">{font.name}</div>
              <div 
                className="text-sm text-gray-600"
                style={{ 
                  fontFamily: font.id === 'system' ? 'system-ui' : font.name,
                  fontSize: `${fontSize}px`
                }}
              >
                {font.preview}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full bg-orange-500 hover:bg-orange-600">
        Apply Font Settings
      </Button>
    </div>
  );
};

export default FontSettings;
