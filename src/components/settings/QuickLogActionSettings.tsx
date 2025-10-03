import { useTranslation } from "react-i18next";
import { useQuickLogActions } from "@/hooks/useQuickLogActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Trash2, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface QuickLogActionSettingsProps {
  onBack: () => void;
}

const QuickLogActionSettings = ({ onBack }: QuickLogActionSettingsProps) => {
  const { t } = useTranslation();
  const { allActions, isLoading, updateAction, deleteAction } = useQuickLogActions();
  const [localActions, setLocalActions] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (allActions) {
      setLocalActions(allActions);
      setHasChanges(false);
    }
  }, [allActions]);

  const handleLocalUpdate = (id: string, updates: any) => {
    setLocalActions(prev => 
      prev.map(action => 
        action.id === id ? { ...action, ...updates } : action
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      for (const action of localActions) {
        const original = allActions?.find(a => a.id === action.id);
        if (original && JSON.stringify(original) !== JSON.stringify(action)) {
          await new Promise<void>((resolve, reject) => {
            updateAction(
              { id: action.id, updates: action },
              {
                onSuccess: () => resolve(),
                onError: (error) => reject(error)
              }
            );
          });
        }
      }
      setHasChanges(false);
      toast.success(t("Settings saved successfully"));
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t("Failed to save settings"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="-ml-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Back to Settings")}
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {t("Save")}
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-medium">{t("Quick Log Actions")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("Manage your quick log action buttons")}
        </p>
      </div>

      <div className="space-y-3">
        {localActions?.map((action) => (
          <Card key={action.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={action.enabled}
                    onCheckedChange={(enabled) =>
                      handleLocalUpdate(action.id, { enabled })
                    }
                  />
                  <Label className="text-base font-medium">
                    {action.name}
                  </Label>
                </div>

                <div className="space-y-3 ml-11">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: action.color }}
                    />
                    <Input
                      type="text"
                      value={action.name}
                      onChange={(e) =>
                        handleLocalUpdate(action.id, { name: e.target.value })
                      }
                      className="flex-1"
                      disabled={!action.enabled}
                      placeholder={t("Action name")}
                    />
                  </div>

                  {/* Default values based on log type and action name */}
                  {action.log_type === "feeding" && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        {t("Default Values")}
                      </Label>
                      <Input
                        type="text"
                        placeholder={t("Food")}
                        value={action.default_values?.food || ""}
                        onChange={(e) =>
                          handleLocalUpdate(action.id, {
                            default_values: {
                              ...action.default_values,
                              food: e.target.value,
                            },
                          })
                        }
                        disabled={!action.enabled}
                      />
                      <Input
                        type="text"
                        placeholder={t("Amount")}
                        value={action.default_values?.amount || ""}
                        onChange={(e) =>
                          handleLocalUpdate(action.id, {
                            default_values: {
                              ...action.default_values,
                              amount: e.target.value,
                            },
                          })
                        }
                        disabled={!action.enabled}
                      />
                    </div>
                  )}

                  {action.log_type === "environment" && action.name.toLowerCase() === "water" && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        {t("Default Values")}
                      </Label>
                      <Input
                        type="text"
                        placeholder={t("Amount")}
                        value={action.default_values?.amount || ""}
                        onChange={(e) =>
                          handleLocalUpdate(action.id, {
                            default_values: {
                              ...action.default_values,
                              amount: e.target.value,
                            },
                          })
                        }
                        disabled={!action.enabled}
                      />
                    </div>
                  )}

                  <Textarea
                    placeholder={t("Default notes")}
                    value={action.default_values?.notes || ""}
                    onChange={(e) =>
                      handleLocalUpdate(action.id, {
                        default_values: {
                          ...action.default_values,
                          notes: e.target.value,
                        },
                      })
                    }
                    disabled={!action.enabled}
                    className="min-h-[60px]"
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteAction(action.id)}
                className="text-destructive hover:text-destructive/90 shrink-0"
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
