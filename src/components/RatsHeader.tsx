import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

interface RatsHeaderProps {
  onAddRat: () => void;
}

const RatsHeader = ({ onAddRat }: RatsHeaderProps) => {
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
              {t("My Rats")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("Manage your furry family")}</p>
          </div>
        </div>
        <Button 
          onClick={onAddRat}
          variant="default"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("Add Rat")}
        </Button>
      </div>
    </div>
  );
};

export default RatsHeader;