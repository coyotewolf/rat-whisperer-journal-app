import { useTranslation } from "react-i18next";
import { useQuickLogActions } from "@/hooks/useQuickLogActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface QuickLogActionSettingsProps {
  onBack: () => void;
}

const QuickLogActionSettings = ({ onBack }: QuickLogActionSettingsProps) => {
  const { t } = useTranslation();
  const { allActions, isLoading, updateAction, deleteAction } = useQuickLogActions();

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
        {allActions?.map((action) => (
          <Card key={action.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-4">
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
                        updateAction({
                          id: action.id,
                          updates: { name: e.target.value },
                        })
                      }
                      className="flex-1"
                      disabled={!action.enabled}
                      placeholder={t("Action name")}
                    />
                  </div>

                  {/* Default values based on log type */}
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
                          updateAction({
                            id: action.id,
                            updates: {
                              default_values: {
                                ...action.default_values,
                                food: e.target.value,
                              },
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
                          updateAction({
                            id: action.id,
                            updates: {
                              default_values: {
                                ...action.default_values,
                                amount: e.target.value,
                              },
                            },
                          })
                        }
                        disabled={!action.enabled}
                      />
                    </div>
                  )}

                  {action.log_type === "environment" && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        {t("Default Values")}
                      </Label>
                      <Input
                        type="number"
                        placeholder={t("Temperature (°C)")}
                        value={action.default_values?.temperature || ""}
                        onChange={(e) =>
                          updateAction({
                            id: action.id,
                            updates: {
                              default_values: {
                                ...action.default_values,
                                temperature: e.target.value,
                              },
                            },
                          })
                        }
                        disabled={!action.enabled}
                      />
                      <Input
                        type="number"
                        placeholder={t("Humidity (%)")}
                        value={action.default_values?.humidity || ""}
                        onChange={(e) =>
                          updateAction({
                            id: action.id,
                            updates: {
                              default_values: {
                                ...action.default_values,
                                humidity: e.target.value,
                              },
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
                      updateAction({
                        id: action.id,
                        updates: {
                          default_values: {
                            ...action.default_values,
                            notes: e.target.value,
                          },
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
