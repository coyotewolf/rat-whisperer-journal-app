
import { Button } from "@/components/ui/button";
import { Sparkles, Settings } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface IndexHeaderProps {
  onSettingsClick: () => void;
}

const IndexHeader = ({ onSettingsClick }: IndexHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative bg-card text-card-foreground border-b border-border p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary shadow-lg">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {t("RatTracker")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("Your pet care companion")}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onSettingsClick}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default IndexHeader;
