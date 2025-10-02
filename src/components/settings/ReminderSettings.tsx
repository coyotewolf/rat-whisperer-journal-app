import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Save } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ReminderSetting {
  id: string;
  type: string;
  enabled: boolean;
  frequency_days: number;
  priority: 'low' | 'medium' | 'high';
  custom_message: string | null;
}

const ReminderSettings = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<ReminderSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reminderTypes = [
    { value: 'feeding', label: 'Feeding' },
    { value: 'water', label: 'Water Change' },
    { value: 'cage_cleaning', label: 'Cage Cleaning' },
    { value: 'litter_cleaning', label: 'Litter Cleaning' },
    { value: 'weight_check', label: 'Weight Check' },
    { value: 'health_check', label: 'Health Check' },
    { value: 'medication', label: 'Medication' }
  ];

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.id)
        .order('type');

      if (error) throw error;
      setSettings((data || []) as ReminderSetting[]);
    } catch (error: any) {
      console.error('Error fetching reminder settings:', error);
      toast({
        title: t('Error'),
        description: t('Failed to load reminder settings'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      for (const setting of settings) {
        const { error } = await supabase
          .from('reminder_settings')
          .upsert({
            id: setting.id,
            user_id: user.id,
            type: setting.type,
            enabled: setting.enabled,
            frequency_days: setting.frequency_days,
            priority: setting.priority,
            custom_message: setting.custom_message
          });

        if (error) throw error;
      }

      toast({
        title: t('Settings Saved'),
        description: t('Reminder settings updated successfully'),
      });
    } catch (error: any) {
      console.error('Error saving reminder settings:', error);
      toast({
        title: t('Error'),
        description: t('Failed to save reminder settings'),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (index: number, field: keyof ReminderSetting, value: any) => {
    const newSettings = [...settings];
    newSettings[index] = { ...newSettings[index], [field]: value };
    setSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('Loading settings...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← {t('Back')}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{t('Smart Reminder Settings')}</h3>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? t('Saving...') : t('Save All')}
        </Button>
      </div>

      <div className="space-y-4">
        {settings.map((setting, index) => (
          <Card key={setting.id} className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {t(reminderTypes.find(rt => rt.value === setting.type)?.label || setting.type)}
                </CardTitle>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={(checked) => updateSetting(index, 'enabled', checked)}
                />
              </div>
            </CardHeader>
            
            {setting.enabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('Frequency (Days)')}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={setting.frequency_days}
                      onChange={(e) => updateSetting(index, 'frequency_days', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('Priority')}</Label>
                    <Select
                      value={setting.priority}
                      onValueChange={(value) => updateSetting(index, 'priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('Low')}</SelectItem>
                        <SelectItem value="medium">{t('Medium')}</SelectItem>
                        <SelectItem value="high">{t('High')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('Custom Message (Optional)')}</Label>
                  <Textarea
                    value={setting.custom_message || ''}
                    onChange={(e) => updateSetting(index, 'custom_message', e.target.value || null)}
                    placeholder={t('Enter a custom reminder message...')}
                    rows={2}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReminderSettings;
