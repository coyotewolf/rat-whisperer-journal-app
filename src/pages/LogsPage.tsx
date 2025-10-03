
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Activity, Heart, Thermometer, Plus, Sparkles, Pencil, Scale, Pill, Utensils, Trash2, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import LogSearchFilter from "@/components/LogSearchFilter";
import EditLogModal from "@/components/EditLogModal";
import LogDetailModal from "@/components/LogDetailModal"; // Import LogDetailModal
import QuickLogModal from "@/components/QuickLogModal";
import { useLogEntries } from "@/hooks/useLogEntries";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';
import { getHealthStatusEmoji } from "@/utils/cardStyleUtils";
import { toast } from "sonner";

const LogsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { logs, loading, addLog, updateLog, deleteLog } = useLogEntries();
  
  const [filteredLogs, setFilteredLogs] = useState(logs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any | null>(null);
  const [selectedLogEntry, setSelectedLogEntry] = useState<any | null>(null); // State for LogDetailModal
  const [isLogDetailOpen, setIsLogDetailOpen] = useState(false); // State for LogDetailModal
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false); // State for QuickLogModal
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());

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
        return "border-[hsl(262,60%,72%)] bg-[hsl(262,60%,82%)] text-slate-800"; // Medication's original color
      case "weight":
        return "border-[hsl(145,50%,65%)] bg-[hsl(145,50%,75%)] text-slate-800";
      case "environment":
        return "border-[hsl(30,70%,70%)] bg-[hsl(30,70%,80%)] text-slate-800";
      case "medication":
        return "border-[hsl(0,70%,70%)] bg-[hsl(0,70%,80%)] text-slate-800"; // Health's original color
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

  const toggleLogSelection = (logId: string) => {
    setSelectedLogIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedLogIds.size === 0) return;
    
    try {
      const deletePromises = Array.from(selectedLogIds).map(id => deleteLog(id));
      await Promise.all(deletePromises);
      toast.success(t("Selected logs deleted successfully"));
      setSelectedLogIds(new Set());
      setIsMultiSelectMode(false);
    } catch (error) {
      console.error("Failed to delete logs:", error);
      toast.error(t("Failed to delete logs"));
    }
  };

  const handleCancelMultiSelect = () => {
    setIsMultiSelectMode(false);
    setSelectedLogIds(new Set());
  };

  const LogCard = ({ log }: { log: any }) => {
    const { date, time } = formatDateTime(log.timestamp);
    const isFromSurvey = typeof log.notes === 'string' && (log.notes.includes('每日調查') || log.notes.toLowerCase().includes('daily survey'));
    const isSelected = selectedLogIds.has(log.id);
    
    return (
      <Card
        className={`${isFromSurvey ? 'border-primary/40 bg-primary/10' : getLogColorClasses(log.type)} shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={() => {
          if (isMultiSelectMode) {
            toggleLogSelection(log.id);
          } else {
            handleLogCardClick(log);
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 text-card-foreground">
            {isMultiSelectMode && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleLogSelection(log.id)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {getLogIcon(log.type)}
            <span className="font-medium capitalize">{t(log.type)}</span>
            {isFromSurvey && (
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">🤖 {t('AI Survey')}</Badge>
            )}
          </div>
            <div className="flex items-center gap-2">
              <div className="text-right text-sm text-muted-foreground">
                <div>{date}</div>
                <div>{time}</div>
              </div>
              {!isMultiSelectMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditLog(log);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
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
            <p className="text-sm font-medium text-card-foreground mb-1">
              {t("Behavior")}: {t(log.behavior)}
            </p>
          )}
          
          {log.weight && (
            <p className="text-sm font-medium text-card-foreground mb-1">
              {t("Weight")}: {log.weight}g
            </p>
          )}
          
          {log.status && (
            <p className="text-sm font-medium text-card-foreground mb-1 flex items-center gap-1">
              {t("Status")}: {t(log.status)}
              {getHealthStatusEmoji(log.status) && (
                <span>{getHealthStatusEmoji(log.status)}</span>
              )}
            </p>
          )}
          
          {log.temperature && (
            <p className="text-sm font-medium text-card-foreground mb-1">
              {t("Temperature")}: {log.temperature}°C
            </p>
          )}
          
          {log.notes && (
            <p className="text-sm text-muted-foreground mt-2">{t(log.notes)}</p>
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
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative">
      {/* Header */}
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
          <div className="flex items-center gap-2">
            {isMultiSelectMode ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCancelMultiSelect}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("Cancel")}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedLogIds.size === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("Delete")} ({selectedLogIds.size})
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsMultiSelectMode(true)}
                >
                  {t("Select")}
                </Button>
                <Button variant="default" onClick={() => setIsQuickLogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("New Log")}
                </Button>
              </>
            )}
          </div>
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

      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onLogCreated={addLog}
      />

      <BottomNav />
    </div>
  );
};

export default LogsPage;
