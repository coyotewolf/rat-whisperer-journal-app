import { useTranslation } from "react-i18next";
import { useQuickLogActions } from "@/hooks/useQuickLogActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickLogActionSettingsProps {
  onBack: () => void;
}

const QuickLogActionSettings = ({ onBack }: QuickLogActionSettingsProps) => {
  const { t } = useTranslation();
  const { actions, isLoading, updateAction, deleteAction } = useQuickLogActions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-2 -ml-2 text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("Back to Settings")}
      </Button>

      <div>
        <h3 className="text-lg font-medium">{t("Quick Log Actions")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("Manage your quick log action buttons")}
        </p>
      </div>

      <div className="space-y-3">
        {actions?.map((action, index) => (
          <Card key={action.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={action.enabled}
                    onCheckedChange={(enabled) =>
                      updateAction({ id: action.id, updates: { enabled } })
                    }
                  />
                  <Label className="text-base font-medium">
                    {action.name}
                  </Label>
                </div>

                <div className="flex items-center gap-2 ml-11">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: action.color }}
                  />
                  <Input
                    type="text"
                    value={action.name}
                    onChange={(e) =>
                      updateAction({
                        id: action.id,
                        updates: { name: e.target.value },
                      })
                    }
                    className="flex-1"
                    disabled={!action.enabled}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteAction(action.id)}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickLogActionSettings;
