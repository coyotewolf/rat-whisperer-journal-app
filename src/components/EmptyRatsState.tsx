import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

interface EmptyRatsStateProps {
  onAddRat: () => void;
}

const EmptyRatsState = ({ onAddRat }: EmptyRatsStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
        <Sparkles className="h-12 w-12 text-primary-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{t("No rats yet")}</h3>
      <p className="text-muted-foreground mb-4">{t("Add your first furry friend to get started!")}</p>
      <Button
        onClick={onAddRat}
        variant="default"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t("Add Your First Rat")}
      </Button>
    </div>
  );
};

export default EmptyRatsState;