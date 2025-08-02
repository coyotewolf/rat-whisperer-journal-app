import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getHealthStatusEmoji } from "@/utils/cardStyleUtils";

// Simplified interface to avoid type complexity
interface RatLogEntry {
  id: string;
  type: string;
  content: any;
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
  const [logs, setLogs] = useState<RatLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const formatLogContent = (log: RatLogEntry) => {
    const content = log.content || {};
    
    switch (log.type) {
      case 'behavior':
        return (
          <div>
            {content.tags && Array.isArray(content.tags) && (
              <div className="flex flex-wrap gap-1 mb-2">
                {content.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {content.notes && <p className="text-sm">{content.notes}</p>}
          </div>
        );
      case 'weight':
        return <p className="text-sm">{t("Weight")}: {content.weight}g</p>;
      case 'health':
        return (
          <div>
            <p className="text-sm font-medium">
              {t("Status")}: {t(content.status || '')}
              {getHealthStatusEmoji(content.status) && (
                <span className="ml-1">{getHealthStatusEmoji(content.status)}</span>
              )}
            </p>
            {content.notes && <p className="text-sm mt-1">{content.notes}</p>}
          </div>
        );
      case 'medication':
        return (
          <div>
            <p className="text-sm font-medium">{content.medication}</p>
            <p className="text-sm">{t("Dose")}: {content.dose}</p>
            {content.notes && <p className="text-sm mt-1">{content.notes}</p>}
          </div>
        );
      case 'feeding':
        return (
          <div>
            <p className="text-sm font-medium">{content.food}</p>
            <p className="text-sm">{t("Amount")}: {content.amount}</p>
            {content.notes && <p className="text-sm mt-1">{content.notes}</p>}
          </div>
        );
      case 'environment':
        return (
          <div>
            <p className="text-sm font-medium">{t("Temperature")}: {content.temperature}°C</p>
            <p className="text-sm">{t("Humidity")}: {content.humidity}%</p>
            {content.notes && <p className="text-sm mt-1">{content.notes}</p>}
          </div>
        );
      default:
        return <p className="text-sm">{JSON.stringify(content)}</p>;
    }
  };

  useEffect(() => {
    if (ratId && user?.id && isOpen) {
      fetchLogs();
    }
  }, [ratId, user?.id, isOpen]);

  const fetchLogs = async () => {
    if (!ratId || !user) return;

    setLoading(true);
    try {
      // Use contains for array field and split query completely
      const baseQuery = supabase.from('log_entries');
      const selectQuery = baseQuery.select('id, type, content, created_at');
      const userQuery = selectQuery.eq('user_id', user.id);
      const ratQuery = userQuery.contains('rat_ids', [ratId]);
      const typeQuery = ratQuery.in('type', logTypes);
      const finalQuery = typeQuery.order('created_at', { ascending: false });
      
      const { data, error } = await finalQuery;

      if (error) throw error;
      
      // Simple transformation without complex type inference
      const transformedLogs: RatLogEntry[] = (data || []).map(log => ({
        id: log.id,
        type: log.type,
        content: log.content || {},
        created_at: log.created_at
      }));
      
      setLogs(transformedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
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
