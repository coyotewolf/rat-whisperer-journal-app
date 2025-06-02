
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LogEntry {
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
  const [logs, setLogs] = useState<LogEntry[]>([]);
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
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLogContent = (log: LogEntry) => {
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
        return <p className="text-sm">Weight: {log.content.weight}g</p>;
      case 'health':
        return (
          <div>
            <p className="text-sm font-medium">Status: {log.content.status}</p>
            {log.content.notes && <p className="text-sm mt-1">{log.content.notes}</p>}
          </div>
        );
      case 'medication':
        return (
          <div>
            <p className="text-sm font-medium">{log.content.medication}</p>
            <p className="text-sm">Dose: {log.content.dose}</p>
            {log.content.notes && <p className="text-sm mt-1">{log.content.notes}</p>}
          </div>
        );
      case 'feeding':
        return (
          <div>
            <p className="text-sm font-medium">{log.content.food}</p>
            <p className="text-sm">Amount: {log.content.amount}</p>
            {log.content.notes && <p className="text-sm mt-1">{log.content.notes}</p>}
          </div>
        );
      case 'environment':
        return (
          <div>
            <p className="text-sm font-medium">Temperature: {log.content.temperature}°C</p>
            <p className="text-sm">Humidity: {log.content.humidity}%</p>
            {log.content.notes && <p className="text-sm mt-1">{log.content.notes}</p>}
          </div>
        );
      default:
        return <p className="text-sm">{JSON.stringify(log.content)}</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ratName} - Logs</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {loading ? (
            <p>Loading logs...</p>
          ) : logs.length === 0 ? (
            <p>No logs found for {ratName}.</p>
          ) : (
            logs.map((log) => (
              <Card key={log.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm capitalize">{log.type}</CardTitle>
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
