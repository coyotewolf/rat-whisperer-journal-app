import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Simple interface to avoid type recursion issues
interface SimpleLogEntry {
  id: string;
  type: string;
  content: any; // Using any to avoid Json type complications
  created_at: string;
}

interface RatLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ratId: string | null;
  ratName: string;
  logTypes: string[];
}

const RatLogsModal = ({ isOpen, onClose, ratId, ratName, logTypes }: RatLogsModalProps) => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<SimpleLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (ratId && user && isOpen) {
      fetchLogs();
    }
  }, [ratId, user, isOpen]);

  const fetchLogs = async () => {
    if (!ratId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('log_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('rat_id', ratId)
        .in('type', logTypes)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to our simple interface
      const transformedLogs: SimpleLogEntry[] = (data || []).map(log => ({
        id: log.id,
        type: log.type,
        content: log.content,
        created_at: log.created_at
      }));
      
      setLogs(transformedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLogContent = (log: SimpleLogEntry) => {
    switch (log.type) {
      case 'behavior':
        return (
          <div>
            {log.content.tags && (
              <div className="flex flex-wrap gap-1 mb-2">
                {log.content.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {log.content.notes && <p className="text-sm">{log.content.notes}</p>}
          </div>
        );
      case 'weight':
        return <p className="text-sm">{t("Weight")}: {log.content.weight}g</p>;
      case 'health':
        return (
          <div>
            <p className="text-sm font-medium">{t("Status")}: {t(log.content.status)}</p>
            {log.content.notes && <p className="text-sm mt-1">{log.content.notes}</p>}
          </div>
        );
      case 'medication':
        return (
          <div>
            <p className="text-sm font-medium">{log.content.medication}</p>
            <p className="text-sm">{t("Dose")}: {log.content.dose}</p>
            {log.content.notes && <p className="text-sm mt-1">{log.content.notes}</p>}
          </div>
        );
      case 'feeding':
        return (
          <div>
            <p className="text-sm font-medium">{log.content.food}</p>
            <p className="text-sm">{t("Amount")}: {log.content.amount}</p>
            {log.content.notes && <p className="text-sm mt-1">{log.content.notes}</p>}
          </div>
        );
      case 'environment':
        return (
          <div>
            <p className="text-sm font-medium">{t("Temperature")}: {log.content.temperature}°C</p>
            <p className="text-sm">{t("Humidity")}: {log.content.humidity}%</p>
            {log.content.notes && <p className="text-sm mt-1">{log.content.notes}</p>}
          </div>
        );
      default:
        return <p className="text-sm">{JSON.stringify(log.content)}</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto backdrop-blur-md bg-white/80">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1 text-center">{t("{{ratName}} - Logs", { ratName })}</DialogTitle>
            <div className="w-10"></div> {/* Placeholder to balance the back button */}
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {loading ? (
            <p>{t("Loading logs...")}</p>
          ) : logs.length === 0 ? (
            <p>{t("No logs found for {{ratName}}.", { ratName })}</p>
          ) : (
            logs.map((log) => (
              <Card key={log.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm capitalize">{t(log.type)}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {new Date(log.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {formatLogContent(log)}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatLogsModal;
