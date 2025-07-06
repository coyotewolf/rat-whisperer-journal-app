import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Activity, Heart, Thermometer, Plus, Sparkles, Pencil, Scale, Pill, Utensils } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import LogSearchFilter from "@/components/LogSearchFilter";
import EditLogModal from "@/components/EditLogModal";
import LogDetailModal from "@/components/LogDetailModal";
import { useLogEntries } from "@/hooks/useLogEntries";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';
import { getCategoryHierarchy, getPriorityClasses } from "@/utils/categoryHierarchy";

const LogsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { logs, loading, updateLog, deleteLog } = useLogEntries();
  
  const [filteredLogs, setFilteredLogs] = useState(logs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any | null>(null);
  const [selectedLogEntry, setSelectedLogEntry] = useState<any | null>(null);
  const [isLogDetailOpen, setIsLogDetailOpen] = useState(false);

  useEffect(() => {
    setFilteredLogs(logs);
  }, [logs]);

  const availableHashtags = Array.from(
    new Set(logs.flatMap(log => log.hashtags || []))
  );

  useEffect(() => {
    let filtered = logs;

    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.ratNames && log.ratNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        log.behavior?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
      case "weight":
        return <Scale className="h-4 w-4" />;
      case "environment":
        return <Thermometer className="h-4 w-4" />;
      case "medication":
        return <Pill className="h-4 w-4" />;
      case "feeding":
        return <Utensils className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getLogColorClasses = (type: string) => {
    switch (type?.toLowerCase()) {
      case "behavior":
        return "border-[hsl(217,70%,65%)] bg-[hsl(217,70%,75%)] text-slate-800";
      case "health":
      case "health check":
        return "border-[hsl(262,60%,72%)] bg-[hsl(262,60%,82%)] text-slate-800";
      case "weight":
        return "border-[hsl(145,50%,65%)] bg-[hsl(145,50%,75%)] text-slate-800";
      case "environment":
        return "border-[hsl(30,70%,70%)] bg-[hsl(30,70%,80%)] text-slate-800";
      case "medication":
        return "border-[hsl(0,70%,70%)] bg-[hsl(0,70%,80%)] text-slate-800";
      case "feeding":
        return "border-[hsl(45,75%,70%)] bg-[hsl(45,75%,80%)] text-slate-800";
      default:
        return "bg-background/50 border-border text-card-foreground";
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

  const handleLogCardClick = (log: any) => {
    setSelectedLogEntry(log);
    setIsLogDetailOpen(true);
  };

  const handleEditFromLogDetail = (log: any) => {
    setIsLogDetailOpen(false);
    handleEditLog(log);
  };

  const renderLogContent = (log: any) => {
    const hierarchy = getCategoryHierarchy(log.type);
    const { date, time } = formatDateTime(log.timestamp);
    
    switch (log.type) {
      case 'health':
        return (
          <div className={hierarchy.spacing.internal}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getLogIcon(log.type)}
                <span className={`${hierarchy.visualWeight.titleSize} capitalize`}>{t(log.type)}</span>
              </div>
              <div className="text-right">
                <div className={hierarchy.visualWeight.timeSize}>{date}</div>
                <div className={hierarchy.visualWeight.timeSize}>{time}</div>
              </div>
            </div>
            
            {log.ratNames && log.ratNames.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {log.ratNames.map((ratName: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {ratName}
                  </Badge>
                ))}
              </div>
            )}
            
            {log.behavior && (
              <p className={`${hierarchy.visualWeight.statusSize} text-card-foreground mb-2`}>
                {t("Behavior")}: {t(log.behavior)}
              </p>
            )}
            
            {log.symptoms && log.symptoms.length > 0 && (
              <div className="mb-2">
                <p className={`${hierarchy.visualWeight.statusSize} text-card-foreground mb-1`}>
                  {t("Symptoms")}:
                </p>
                <div className="flex flex-wrap gap-1">
                  {log.symptoms.map((symptom: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {t(symptom)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {log.notes && (
              <p className={`${hierarchy.visualWeight.timeSize} text-muted-foreground mt-2`}>
                {t(log.notes)}
              </p>
            )}
          </div>
        );

      case 'weight':
        return (
          <div className={hierarchy.spacing.internal}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getLogIcon(log.type)}
                <span className={`${hierarchy.visualWeight.titleSize} capitalize`}>{t(log.type)}</span>
              </div>
              <div className="text-right">
                <div className={hierarchy.visualWeight.timeSize}>{date}</div>
                <div className={hierarchy.visualWeight.timeSize}>{time}</div>
              </div>
            </div>
            
            {log.ratNames && log.ratNames.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {log.ratNames.map((ratName: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {ratName}
                  </Badge>
                ))}
              </div>
            )}
            
            {log.weight && (
              <div className="mb-2">
                <span className={`${hierarchy.visualWeight.valueSize} text-primary`}>
                  {log.weight}g
                </span>
              </div>
            )}
            
            {log.notes && (
              <p className={`${hierarchy.visualWeight.timeSize} text-muted-foreground mt-2`}>
                {t(log.notes)}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className={hierarchy.spacing.internal}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 text-card-foreground">
                {getLogIcon(log.type)}
                <span className={`${hierarchy.visualWeight.titleSize} capitalize`}>{t(log.type)}</span>
              </div>
              <div className="text-right">
                <div className={hierarchy.visualWeight.timeSize}>{date}</div>
                <div className={hierarchy.visualWeight.timeSize}>{time}</div>
              </div>
            </div>
            
            {log.ratNames && log.ratNames.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {log.ratNames.map((ratName: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {ratName}
                  </Badge>
                ))}
              </div>
            )}
            
            {log.behavior && (
              <p className={`${hierarchy.visualWeight.statusSize} text-card-foreground mb-1`}>
                {t("Behavior")}: {t(log.behavior)}
              </p>
            )}
            
            {log.weight && (
              <p className={`${hierarchy.visualWeight.statusSize} text-card-foreground mb-1`}>
                {t("Weight")}: {log.weight}g
              </p>
            )}
            
            {log.temperature && (
              <p className={`${hierarchy.visualWeight.statusSize} text-card-foreground mb-1`}>
                {t("Temperature")}: {log.temperature}°C
              </p>
            )}
            
            {log.notes && (
              <p className={`${hierarchy.visualWeight.timeSize} text-muted-foreground mt-2`}>
                {t(log.notes)}
              </p>
            )}

            {log.hashtags && log.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {log.hashtags.map((hashtag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{t(hashtag)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  const LogCard = ({ log }: { log: any }) => {
    const hierarchy = getCategoryHierarchy(log.type);
    const priorityClasses = getPriorityClasses(hierarchy.priority);
    
    return (
      <Card
        className={`${getLogColorClasses(log.type)} ${priorityClasses} shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer ${hierarchy.spacing.external}`}
        onClick={() => handleLogCardClick(log)}
      >
        <CardContent className="p-4">
          {renderLogContent(log)}
          <div className="flex justify-end mt-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleEditLog(log);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative">
      <div className="relative bg-card text-card-foreground border-b border-border p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary shadow-lg">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {t("Activity Logs")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("Track your rats' daily activities")}</p>
            </div>
          </div>
          <Button variant="default">
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
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-card border border-border rounded-md">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
              {t("All")} ({filteredLogs.length})
            </TabsTrigger>
            <TabsTrigger value="behavior" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
              {t("Behavior")} ({behaviorLogs.length})
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
              {t("Health")} ({healthLogs.length})
            </TabsTrigger>
            <TabsTrigger value="environment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
              {t("Environment")} ({environmentLogs.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">{t("Loading logs...")}</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || selectedHashtags.length > 0 ? t("No logs match your filters") : t("No logs found")}
              </div>
            ) : (
              filteredLogs.map((log) => <LogCard key={log.id} log={log} />)
            )}
          </TabsContent>
          
          <TabsContent value="behavior" className="space-y-3">
            {behaviorLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t("No behavior logs found")}</div>
            ) : (
              behaviorLogs.map((log) => <LogCard key={log.id} log={log} />)
            )}
          </TabsContent>
          
          <TabsContent value="health" className="space-y-3">
            {healthLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t("No health logs found")}</div>
            ) : (
              healthLogs.map((log) => <LogCard key={log.id} log={log} />)
            )}
          </TabsContent>
          
          <TabsContent value="environment" className="space-y-3">
            {environmentLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t("No environment logs found")}</div>
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

      <LogDetailModal
        isOpen={isLogDetailOpen}
        onClose={() => setIsLogDetailOpen(false)}
        logEntry={selectedLogEntry}
        onEdit={handleEditFromLogDetail}
      />

      <BottomNav />
    </div>
  );
};

export default LogsPage;
