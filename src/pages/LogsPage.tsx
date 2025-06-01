
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Activity, Heart, Thermometer, Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const LogsPage = () => {
  const [logs] = useState([
    {
      id: 1,
      type: "behavior",
      rats: ["Pepper", "Salt"],
      behavior: "Grooming",
      timestamp: "2024-06-01T10:30:00",
      notes: "Pepper grooming Salt for 5 minutes",
    },
    {
      id: 2,
      type: "health",
      rats: ["Pepper"],
      weight: 250,
      symptoms: [],
      timestamp: "2024-06-01T09:15:00",
      notes: "Weekly weigh-in",
    },
    {
      id: 3,
      type: "environment",
      temperature: 22,
      humidity: 65,
      timestamp: "2024-06-01T08:00:00",
      notes: "Cage cleaning completed",
    },
    {
      id: 4,
      type: "behavior",
      rats: ["Salt", "Pepper"],
      behavior: "Chasing",
      timestamp: "2024-05-31T19:45:00",
      notes: "Playful chase around the cage",
    },
  ]);

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
        return "border-blue-200 bg-blue-50";
      case "health":
        return "border-red-200 bg-red-50";
      case "environment":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const behaviorLogs = logs.filter(log => log.type === "behavior");
  const healthLogs = logs.filter(log => log.type === "health");
  const environmentLogs = logs.filter(log => log.type === "environment");

  const LogCard = ({ log }: { log: any }) => {
    const { date, time } = formatDateTime(log.timestamp);
    
    return (
      <Card className={`${getLogColor(log.type)} border`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getLogIcon(log.type)}
              <span className="font-medium capitalize">{log.type}</span>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>{date}</div>
              <div>{time}</div>
            </div>
          </div>
          
          {log.rats && (
            <div className="flex flex-wrap gap-1 mb-2">
              {log.rats.map((rat: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {rat}
                </Badge>
              ))}
            </div>
          )}
          
          {log.behavior && (
            <p className="text-sm font-medium text-gray-800 mb-1">
              Behavior: {log.behavior}
            </p>
          )}
          
          {log.weight && (
            <p className="text-sm font-medium text-gray-800 mb-1">
              Weight: {log.weight}g
            </p>
          )}
          
          {log.temperature && (
            <p className="text-sm font-medium text-gray-800 mb-1">
              Temperature: {log.temperature}°C
            </p>
          )}
          
          {log.notes && (
            <p className="text-sm text-gray-600 mt-2">{log.notes}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
            <p className="text-sm text-gray-600">Track your rats' daily activities</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            New Log
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3">
            {logs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </TabsContent>
          
          <TabsContent value="behavior" className="space-y-3">
            {behaviorLogs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </TabsContent>
          
          <TabsContent value="health" className="space-y-3">
            {healthLogs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </TabsContent>
          
          <TabsContent value="environment" className="space-y-3">
            {environmentLogs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default LogsPage;
