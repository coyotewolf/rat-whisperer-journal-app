
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Activity, Heart, Thermometer, Plus, Sparkles, Pencil } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import LogSearchFilter from "@/components/LogSearchFilter";
import EditLogModal from "@/components/EditLogModal";
import { useLogEntries } from "@/hooks/useLogEntries";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';

const LogsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { logs, loading, updateLog, deleteLog } = useLogEntries();
  
  const [filteredLogs, setFilteredLogs] = useState(logs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any | null>(null);

  // Update filtered logs when logs change
  useEffect(() => {
    setFilteredLogs(logs);
  }, [logs]);

  // Get all unique hashtags from logs
  const availableHashtags = Array.from(
    new Set(logs.flatMap(log => log.hashtags || []))
  );

  useEffect(() => {
    let filtered = logs;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.ratNames && log.ratNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        log.behavior?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by hashtags
    if (selectedHashtags.length > 0) {
      filtered = filtered.filter(log =>
        log.hashtags?.some(hashtag => selectedHashtags.includes(hashtag))
      );
    }

    setFilteredLogs(filtered);
  }, [searchQuery, selectedHashtags, logs]);

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "behavior":
        return <Activity className="h-4 w-4" />;
      case "health":
        return <Heart className="h-4 w-4" />;
      case "environment":
        return <Thermometer className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "behavior":
        return "border-blue-300/30 bg-blue-500/10";
      case "health":
        return "border-red-300/30 bg-red-500/10";
      case "environment":
        return "border-green-300/30 bg-green-500/10";
      default:
        return "border-gray-300/30 bg-gray-500/10";
    }
  };

  const behaviorLogs = filteredLogs.filter(log => log.type === "behavior");
  const healthLogs = filteredLogs.filter(log => log.type === "health");
  const environmentLogs = filteredLogs.filter(log => log.type === "environment");

  const handleEditLog = (logToEdit: any) => {
    setEditingLog(logToEdit);
    setIsEditModalOpen(true);
  };

  const handleUpdateLog = async (updatedLog: any) => {
    try {
      await updateLog(updatedLog.id, updatedLog);
      setIsEditModalOpen(false);
      setEditingLog(null);
      console.log("Log updated in Supabase:", updatedLog);
    } catch (error) {
      console.error("Failed to update log:", error);
    }
  };

  const handleDeleteLog = async (deletedLogId: string) => {
    try {
      await deleteLog(deletedLogId);
      setIsEditModalOpen(false);
      setEditingLog(null);
      console.log("Log deleted from Supabase:", deletedLogId);
    } catch (error) {
      console.error("Failed to delete log:", error);
    }
  };

  const LogCard = ({ log }: { log: any }) => {
    const { date, time } = formatDateTime(log.timestamp);
    
    return (
      <Card className={`${getLogColor(log.type)} backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 text-white">
              {getLogIcon(log.type)}
              <span className="font-medium capitalize">{t(log.type)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right text-sm text-purple-100/80">
                <div>{date}</div>
                <div>{time}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-cyan-300 h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditLog(log);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {log.ratNames && log.ratNames.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {log.ratNames.map((ratName: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs border-white/20 text-white backdrop-blur-sm">
                  {ratName}
                </Badge>
              ))}
            </div>
          )}
          
          {log.behavior && (
            <p className="text-sm font-medium text-white mb-1">
              {t("Behavior")}: {t(log.behavior)}
            </p>
          )}
          
          {log.weight && (
            <p className="text-sm font-medium text-white mb-1">
              {t("Weight")}: {log.weight}g
            </p>
          )}
          
          {log.temperature && (
            <p className="text-sm font-medium text-white mb-1">
              {t("Temperature")}: {log.temperature}°C
            </p>
          )}
          
          {log.notes && (
            <p className="text-sm text-purple-100/90 mt-2">{t(log.notes)}</p>
          )}

          {log.hashtags && log.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {log.hashtags.map((hashtag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs bg-orange-500/20 text-orange-100">
                  #{t(hashtag)}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pb-20 relative overflow-hidden">
      {/* ... keep existing code (animated background and header) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Header */}
      <div className="relative backdrop-blur-md bg-white/10 border-b border-white/20 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                {t("Activity Logs")}
              </h1>
              <p className="text-sm text-cyan-100/80">{t("Track your rats' daily activities")}</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg transform hover:scale-105 transition-all duration-300">
            <Plus className="h-4 w-4 mr-2" />
            {t("New Log")}
          </Button>
        </div>
      </div>

      <div className="relative p-4">
        <LogSearchFilter
          onSearch={setSearchQuery}
          onHashtagFilter={setSelectedHashtags}
          availableHashtags={availableHashtags}
        />

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 backdrop-blur-md bg-white/10 border-white/20">
            <TabsTrigger value="all" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              {t("All")} ({filteredLogs.length})
            </TabsTrigger>
            <TabsTrigger value="behavior" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              {t("Behavior")} ({behaviorLogs.length})
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              {t("Health")} ({healthLogs.length})
            </TabsTrigger>
            <TabsTrigger value="environment" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              {t("Environment")} ({environmentLogs.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-white">{t("Loading logs...")}</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-white">
                {searchQuery || selectedHashtags.length > 0 ? t("No logs match your filters") : t("No logs found")}
              </div>
            ) : (
              filteredLogs.map((log) => <LogCard key={log.id} log={log} />)
            )}
          </TabsContent>
          
          <TabsContent value="behavior" className="space-y-3">
            {behaviorLogs.length === 0 ? (
              <div className="text-center py-8 text-white">{t("No behavior logs found")}</div>
            ) : (
              behaviorLogs.map((log) => <LogCard key={log.id} log={log} />)
            )}
          </TabsContent>
          
          <TabsContent value="health" className="space-y-3">
            {healthLogs.length === 0 ? (
              <div className="text-center py-8 text-white">{t("No health logs found")}</div>
            ) : (
              healthLogs.map((log) => <LogCard key={log.id} log={log} />)
            )}
          </TabsContent>
          
          <TabsContent value="environment" className="space-y-3">
            {environmentLogs.length === 0 ? (
              <div className="text-center py-8 text-white">{t("No environment logs found")}</div>
            ) : (
              environmentLogs.map((log) => <LogCard key={log.id} log={log} />)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {isEditModalOpen && editingLog && (
        <EditLogModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingLog(null);
          }}
          logToEdit={editingLog}
          onLogUpdated={handleUpdateLog}
          onLogDeleted={handleDeleteLog}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default LogsPage;
