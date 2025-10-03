import { useTranslation } from "react-i18next";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

interface ReminderSettingsProps {
  onBack: () => void;
}

const ReminderSettings = ({ onBack }: ReminderSettingsProps) => {
  const { t } = useTranslation();
  const { settings, isLoading, updateSetting } = useReminderSettings();

  const getReminderTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      feeding: t("Feeding Reminder"),
      water: t("Water Change Reminder"),
      cage_cleaning: t("Cage Cleaning Reminder"),
      litter_cleaning: t("Litter Cleaning Reminder"),
      weight_check: t("Weight Check Reminder"),
      health_check: t("Health Check Reminder"),
      medication: t("Medication Reminder"),
    };
    return labels[type] || type;
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
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-2 -ml-2 text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("Back to Settings")}
      </Button>

      <div>
        <h3 className="text-lg font-medium">{t("Reminder Settings")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("Customize when you receive reminders for various care activities")}
        </p>
      </div>

      <div className="space-y-4">
        {settings?.map((setting) => (
          <div
            key={setting.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={(enabled) =>
                    updateSetting({ id: setting.id, updates: { enabled } })
                  }
                />
                <Label className="text-base font-medium cursor-pointer">
                  {getReminderTypeLabel(setting.type)}
                </Label>
              </div>
              <div className="flex items-center gap-2 ml-11">
                <Label className="text-sm text-muted-foreground">
                  {t("Remind after")}:
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={setting.frequency_days}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0 && value <= 365) {
                      updateSetting({
                        id: setting.id,
                        updates: { frequency_days: value },
                      });
                    }
                  }}
                  className="w-20 h-8"
                  disabled={!setting.enabled}
                />
                <span className="text-sm text-muted-foreground">{t("days")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReminderSettings;
